/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { NavigationBar } from './components/NavigationBar';
import { BrowserViewport } from './components/BrowserViewport';
import { BookmarkManager } from './components/BookmarkManager';
import { SettingsModal, DEFAULT_SETTINGS, SETTINGS_STORAGE_KEY } from './components/SettingsModal';
import { BrowserSettings } from './types';
import { Compass, X, Plus, Settings as SettingsIcon } from 'lucide-react';

export default function App() {
  const [settings, setSettings] = useState<BrowserSettings>(() => {
    try {
      const saved = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (saved) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
      }
    } catch {
      // Fallback
    }
    return DEFAULT_SETTINGS;
  });

  const getInitialStartupUrl = (): string => {
    if (settings.startupPage === 'about:blank') return 'about:blank';
    if (settings.startupPage === 'custom' && settings.customStartupUrl) {
      return settings.customStartupUrl;
    }
    return 'about:home';
  };

  const [history, setHistory] = useState<string[]>([getInitialStartupUrl()]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isBookmarksOpen, setIsBookmarksOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const addressInputRef = useRef<HTMLInputElement>(null);

  // Sync settings with localStorage
  useEffect(() => {
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    } catch {
      // Ignore storage errors
    }
  }, [settings]);

  // Handle Clear Cache on Exit beforeunload simulation
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (settings.clearCacheOnExit) {
        try {
          sessionStorage.clear();
          // Purge transient browser cache markers
          localStorage.removeItem('novabrowser_temp_cache');
        } catch {
          // Ignore
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [settings.clearCacheOnExit]);

  const currentUrl = history[historyIndex] || 'about:home';
  const canGoBack = historyIndex > 0;
  const canGoForward = historyIndex < history.length - 1;

  // Navigate to a new URL
  const handleNavigate = useCallback((newUrl: string) => {
    setIsLoading(true);
    setHistory((prev) => {
      // Discard future history if we navigated from a previous point
      const nextHistory = prev.slice(0, historyIndex + 1);
      return [...nextHistory, newUrl];
    });
    setHistoryIndex((prev) => prev + 1);
  }, [historyIndex]);

  // Back navigation
  const handleBack = useCallback(() => {
    if (canGoBack) {
      setIsLoading(true);
      setHistoryIndex((prev) => prev - 1);
    }
  }, [canGoBack]);

  // Forward navigation
  const handleForward = useCallback(() => {
    if (canGoForward) {
      setIsLoading(true);
      setHistoryIndex((prev) => prev + 1);
    }
  }, [canGoForward]);

  // Reload current URL
  const handleRefresh = useCallback(() => {
    setIsLoading(true);
    // Trigger re-render of current target
    const url = currentUrl;
    setHistory((prev) => [...prev]);
    // Timeout fallback in case external iframe finishes or doesn't fire event
    setTimeout(() => {
      setIsLoading(false);
    }, 800);
  }, [currentUrl]);

  // Return to home start page (using configured startupPage if home)
  const handleHome = useCallback(() => {
    let targetHome = 'about:home';
    if (settings.startupPage === 'about:blank') {
      targetHome = 'about:blank';
    } else if (settings.startupPage === 'custom' && settings.customStartupUrl) {
      targetHome = settings.customStartupUrl;
    }
    if (currentUrl !== targetHome) {
      handleNavigate(targetHome);
    }
  }, [settings.startupPage, settings.customStartupUrl, currentUrl, handleNavigate]);

  // Purge browser data and reset cache
  const handleClearBrowserData = useCallback(() => {
    try {
      sessionStorage.clear();
      localStorage.removeItem('novabrowser_temp_cache');
      localStorage.removeItem('novabrowser_history_v1');
    } catch {
      // Ignore
    }
    setHistory(['about:home']);
    setHistoryIndex(0);
  }, []);

  // Global navigation keyboard shortcut listener
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Alt + Left Arrow: History Back
      if (e.altKey && e.key === 'ArrowLeft') {
        e.preventDefault();
        handleBack();
        return;
      }

      // Alt + Right Arrow: History Forward
      if (e.altKey && e.key === 'ArrowRight') {
        e.preventDefault();
        handleForward();
        return;
      }

      // Ctrl + L or Cmd + L or F6: Focus and select Address Bar
      if (((e.ctrlKey || e.metaKey) && (e.key === 'l' || e.key === 'L')) || e.key === 'F6') {
        e.preventDefault();
        if (addressInputRef.current) {
          addressInputRef.current.focus();
          addressInputRef.current.select();
        }
        return;
      }

      // Ctrl + R or Cmd + R or F5: Reload Page
      if (((e.ctrlKey || e.metaKey) && (e.key === 'r' || e.key === 'R')) || e.key === 'F5') {
        e.preventDefault();
        handleRefresh();
        return;
      }

      // Ctrl + B or Cmd + B: Toggle Bookmarks
      if ((e.ctrlKey || e.metaKey) && (e.key === 'b' || e.key === 'B')) {
        e.preventDefault();
        setIsBookmarksOpen((prev) => !prev);
        return;
      }

      // Ctrl + , (comma) or F10: Toggle Settings
      if ((e.ctrlKey || e.metaKey) && (e.key === ',' || e.key === '<')) {
        e.preventDefault();
        setIsSettingsOpen((prev) => !prev);
        return;
      }

      // Alt + Home: Navigate Home
      if (e.altKey && e.key === 'Home') {
        e.preventDefault();
        handleHome();
        return;
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => {
      window.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, [handleBack, handleForward, handleRefresh, handleHome]);

  const handleLoadStart = useCallback(() => {
    setIsLoading(true);
  }, []);

  const handleLoadEnd = useCallback(() => {
    setIsLoading(false);
  }, []);

  // Format tab title for display
  const getDisplayTitle = () => {
    if (currentUrl === 'about:home') return 'NovaBrowser Start Page';
    try {
      const parsed = new URL(currentUrl);
      return parsed.hostname;
    } catch {
      return currentUrl;
    }
  };

  return (
    <div
      id="browser-window-root"
      className="flex flex-col w-screen h-screen bg-zinc-950 text-zinc-100 overflow-hidden font-sans select-none"
    >
      {/* Top Application Window Bar / Tab Strip */}
      <header
        id="browser-window-header"
        className="bg-zinc-950 border-b border-zinc-900 px-3 pt-2 pb-1 flex items-center justify-between"
      >
        <div className="flex items-center gap-2">
          {/* Active Tab */}
          <div
            id="browser-active-tab"
            className="flex items-center gap-2 px-3 py-1.5 rounded-t-lg bg-zinc-900 border-t border-x border-zinc-800 text-xs font-medium text-zinc-200 shadow-sm max-w-xs truncate"
          >
            <Compass className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="truncate">{getDisplayTitle()}</span>
            <button
              type="button"
              onClick={() => handleNavigate('about:home')}
              title="Close tab"
              className="p-0.5 rounded text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors ml-1"
            >
              <X className="w-3 h-3" />
            </button>
          </div>

          {/* New Tab Button */}
          <button
            type="button"
            onClick={() => handleNavigate('about:home')}
            title="New Tab"
            className="p-1.5 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Window controls styling (Xbox/App identity & Settings Button) */}
        <div className="flex items-center gap-2 text-xs text-zinc-400 pr-1">
          <button
            id="btn-header-settings"
            type="button"
            onClick={() => setIsSettingsOpen((prev) => !prev)}
            title="Browser Settings (Ctrl+,)"
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
              isSettingsOpen
                ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/40'
                : 'bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <SettingsIcon className="w-3.5 h-3.5" />
            <span>Settings</span>
          </button>

          <span className="hidden sm:inline-block px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 font-mono text-[10px] text-zinc-400">
            NovaBrowser v0.1 &bull; NetSurf 3.11
          </span>
        </div>
      </header>

      {/* Navigation Toolbar (Address bar + Back, Forward, Refresh, Bookmarks, Settings) */}
      <NavigationBar
        currentUrl={currentUrl}
        canGoBack={canGoBack}
        canGoForward={canGoForward}
        isLoading={isLoading}
        inputRef={addressInputRef}
        isBookmarksOpen={isBookmarksOpen}
        isSettingsOpen={isSettingsOpen}
        onToggleBookmarks={() => setIsBookmarksOpen((prev) => !prev)}
        onToggleSettings={() => setIsSettingsOpen((prev) => !prev)}
        onNavigate={handleNavigate}
        onBack={handleBack}
        onForward={handleForward}
        onRefresh={handleRefresh}
        onHome={handleHome}
      />

      {/* Main Content Viewport Container */}
      <BrowserViewport
        url={currentUrl}
        isLoading={isLoading}
        onNavigate={handleNavigate}
        onLoadStart={handleLoadStart}
        onLoadEnd={handleLoadEnd}
      />

      {/* Bookmarks Manager Modal */}
      <BookmarkManager
        currentUrl={currentUrl}
        isOpen={isBookmarksOpen}
        onClose={() => setIsBookmarksOpen(false)}
        onNavigate={handleNavigate}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        settings={settings}
        onClose={() => setIsSettingsOpen(false)}
        onUpdateSettings={setSettings}
        onClearBrowserData={handleClearBrowserData}
      />
    </div>
  );
}
