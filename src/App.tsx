/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { NavigationBar } from './components/NavigationBar';
import { BrowserViewport } from './components/BrowserViewport';
import { Compass, X, Plus } from 'lucide-react';

export default function App() {
  const [history, setHistory] = useState<string[]>(['about:home']);
  const [historyIndex, setHistoryIndex] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const addressInputRef = useRef<HTMLInputElement>(null);

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

  // Return to home start page
  const handleHome = useCallback(() => {
    if (currentUrl !== 'about:home') {
      handleNavigate('about:home');
    }
  }, [currentUrl, handleNavigate]);

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

        {/* Window controls styling (Xbox/App identity) */}
        <div className="flex items-center gap-1.5 text-xs text-zinc-400 pr-1">
          <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 font-mono text-[10px] text-zinc-300">
            NovaBrowser v0.1 &bull; NetSurf 3.11
          </span>
        </div>
      </header>

      {/* Navigation Toolbar (Address bar + Back, Forward, Refresh) */}
      <NavigationBar
        currentUrl={currentUrl}
        canGoBack={canGoBack}
        canGoForward={canGoForward}
        isLoading={isLoading}
        inputRef={addressInputRef}
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
    </div>
  );
}
