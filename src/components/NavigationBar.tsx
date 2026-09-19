import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  RotateCw,
  Home,
  Lock,
  Search,
  ExternalLink,
  ShieldCheck,
  Globe,
  Bookmark as BookmarkIcon,
  Settings as SettingsIcon
} from 'lucide-react';

interface NavigationBarProps {
  currentUrl: string;
  canGoBack: boolean;
  canGoForward: boolean;
  isLoading: boolean;
  inputRef?: React.RefObject<HTMLInputElement | null>;
  isBookmarksOpen?: boolean;
  isSettingsOpen?: boolean;
  onToggleBookmarks: () => void;
  onToggleSettings: () => void;
  onNavigate: (url: string) => void;
  onBack: () => void;
  onForward: () => void;
  onRefresh: () => void;
  onHome: () => void;
}

export const NavigationBar: React.FC<NavigationBarProps> = ({
  currentUrl,
  canGoBack,
  canGoForward,
  isLoading,
  inputRef,
  isBookmarksOpen,
  isSettingsOpen,
  onToggleBookmarks,
  onToggleSettings,
  onNavigate,
  onBack,
  onForward,
  onRefresh,
  onHome,
}) => {
  const [inputValue, setInputValue] = useState(currentUrl);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    setInputValue(currentUrl);
  }, [currentUrl]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let target = inputValue.trim();
    if (!target) return;

    // Check if input is a valid URL or search term
    if (!/^https?:\/\//i.test(target)) {
      if (target.includes('.') && !target.includes(' ')) {
        target = `https://${target}`;
      } else {
        target = `https://duckduckgo.com/html/?q=${encodeURIComponent(target)}`;
      }
    }
    onNavigate(target);
  };

  const isSecure = currentUrl.startsWith('https://');

  return (
    <header
      id="browser-navigation-bar"
      className="bg-zinc-900 border-b border-zinc-800 px-3 py-2 flex items-center gap-2 select-none"
    >
      {/* Navigation Controls */}
      <div className="flex items-center gap-1">
        <button
          id="btn-nav-back"
          type="button"
          onClick={onBack}
          disabled={!canGoBack}
          aria-label="Back (LT)"
          title="Back"
          className="p-2 rounded-md text-zinc-300 hover:text-white hover:bg-zinc-800 disabled:opacity-35 disabled:hover:bg-transparent disabled:hover:text-zinc-300 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        <button
          id="btn-nav-forward"
          type="button"
          onClick={onForward}
          disabled={!canGoForward}
          aria-label="Forward (RT)"
          title="Forward"
          className="p-2 rounded-md text-zinc-300 hover:text-white hover:bg-zinc-800 disabled:opacity-35 disabled:hover:bg-transparent disabled:hover:text-zinc-300 transition-colors"
        >
          <ArrowRight className="w-4 h-4" />
        </button>

        <button
          id="btn-nav-refresh"
          type="button"
          onClick={onRefresh}
          aria-label="Reload (X)"
          title="Reload"
          className="p-2 rounded-md text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors"
        >
          <RotateCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-emerald-400' : ''}`} />
        </button>

        <button
          id="btn-nav-home"
          type="button"
          onClick={onHome}
          aria-label="Home"
          title="Start Page"
          className="p-2 rounded-md text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors"
        >
          <Home className="w-4 h-4" />
        </button>
      </div>

      {/* Address Bar Form */}
      <form
        id="browser-address-form"
        onSubmit={handleSubmit}
        className="flex-1 flex items-center min-w-0"
      >
        <div
          className={`flex items-center w-full bg-zinc-950 border rounded-lg px-3 py-1.5 transition-all ${
            isFocused
              ? 'border-emerald-500 ring-1 ring-emerald-500/20 bg-zinc-950'
              : 'border-zinc-800 hover:border-zinc-700'
          }`}
        >
          {/* Security / Protocol Indicator */}
          <div className="flex items-center mr-2 text-zinc-400 shrink-0">
            {isSecure ? (
              <span className="flex items-center gap-1 text-xs text-emerald-400" title="Secure HTTPS Connection">
                <Lock className="w-3.5 h-3.5 text-emerald-400" />
              </span>
            ) : (
              <span className="flex items-center gap-1 text-xs text-zinc-500" title="Web Address">
                <Globe className="w-3.5 h-3.5 text-zinc-500" />
              </span>
            )}
          </div>

          {/* URL Input */}
          <input
            ref={inputRef}
            id="browser-address-input"
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onFocus={() => {
              setIsFocused(true);
            }}
            onBlur={() => setIsFocused(false)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                setInputValue(currentUrl);
                inputRef?.current?.blur();
              }
            }}
            placeholder="Search or enter web address... (Ctrl+L)"
            className="w-full bg-transparent text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none font-mono tracking-tight"
            autoComplete="off"
            spellCheck="false"
          />

          {!isFocused && (
            <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[10px] font-mono text-zinc-500 select-none mr-1">
              Ctrl+L
            </kbd>
          )}

          {/* Submit / Go action */}
          {inputValue !== currentUrl && inputValue.trim().length > 0 && (
            <button
              id="btn-address-go"
              type="submit"
              className="ml-2 px-2 py-0.5 rounded text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shrink-0 transition-colors"
            >
              Go
            </button>
          )}
        </div>
      </form>

      {/* Quick Status / Actions */}
      <div className="flex items-center gap-1 shrink-0">
        <button
          id="btn-nav-bookmarks"
          type="button"
          onClick={onToggleBookmarks}
          title="Bookmarks (Ctrl+B)"
          className={`p-2 rounded-md transition-colors ${
            isBookmarksOpen
              ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30'
              : 'text-zinc-300 hover:text-white hover:bg-zinc-800'
          }`}
        >
          <BookmarkIcon className="w-4 h-4" />
        </button>

        <button
          id="btn-nav-settings"
          type="button"
          onClick={onToggleSettings}
          title="Settings (Ctrl+, or Y)"
          className={`p-2 rounded-md transition-colors ${
            isSettingsOpen
              ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30'
              : 'text-zinc-300 hover:text-white hover:bg-zinc-800'
          }`}
        >
          <SettingsIcon className="w-4 h-4" />
        </button>

        <a
          id="btn-open-external"
          href={currentUrl.startsWith('http') ? currentUrl : undefined}
          target="_blank"
          rel="noopener noreferrer"
          title="Open in new window"
          className={`p-2 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors ${
            !currentUrl.startsWith('http') ? 'pointer-events-none opacity-40' : ''
          }`}
        >
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    </header>
  );
};
