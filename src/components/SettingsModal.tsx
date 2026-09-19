import React, { useState } from 'react';
import { BrowserSettings } from '../types';
import {
  Settings as SettingsIcon,
  X,
  RotateCcw,
  Trash2,
  Sliders,
  Shield,
  Zap,
  Globe,
  Check
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  settings: BrowserSettings;
  onClose: () => void;
  onUpdateSettings: (newSettings: BrowserSettings) => void;
  onClearBrowserData: () => void;
}

export const SETTINGS_STORAGE_KEY = 'novabrowser_settings_v1';

export const DEFAULT_SETTINGS: BrowserSettings = {
  startupPage: 'about:home',
  customStartupUrl: 'https://duckduckgo.com/html/',
  clearCacheOnExit: true,
  enableImageLoading: true,
  enableJavaScript: false,
  defaultSearchEngine: 'duckduckgo',
};

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  settings,
  onClose,
  onUpdateSettings,
  onClearBrowserData,
}) => {
  const [dataClearedNotice, setDataClearedNotice] = useState(false);

  if (!isOpen) return null;

  const handleStartupTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onUpdateSettings({
      ...settings,
      startupPage: e.target.value,
    });
  };

  const handleCustomUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdateSettings({
      ...settings,
      customStartupUrl: e.target.value,
    });
  };

  const handleToggleClearCache = () => {
    onUpdateSettings({
      ...settings,
      clearCacheOnExit: !settings.clearCacheOnExit,
    });
  };

  const handleToggleImages = () => {
    onUpdateSettings({
      ...settings,
      enableImageLoading: !settings.enableImageLoading,
    });
  };

  const handleToggleJS = () => {
    onUpdateSettings({
      ...settings,
      enableJavaScript: !settings.enableJavaScript,
    });
  };

  const handleSearchEngineChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onUpdateSettings({
      ...settings,
      defaultSearchEngine: e.target.value as 'duckduckgo' | 'google' | 'bing',
    });
  };

  const handleResetDefaults = () => {
    onUpdateSettings(DEFAULT_SETTINGS);
  };

  const handleTriggerClearData = () => {
    onClearBrowserData();
    setDataClearedNotice(true);
    setTimeout(() => {
      setDataClearedNotice(false);
    }, 2500);
  };

  return (
    <div
      id="settings-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 select-none"
      onClick={onClose}
    >
      <div
        id="settings-modal-container"
        className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800 bg-zinc-900/90">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <SettingsIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">Browser Settings</h2>
              <p className="text-xs text-zinc-400">Preferences & 512 MB memory optimizations</p>
            </div>
          </div>
          <button
            id="btn-close-settings"
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Settings Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 text-zinc-200">
          {/* Section: General / Startup */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">
              <Globe className="w-4 h-4 text-emerald-400" />
              <span>Startup & Navigation</span>
            </div>

            <div className="bg-zinc-950 border border-zinc-800/80 rounded-xl p-4 space-y-3">
              <div>
                <label htmlFor="select-startup-page" className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Startup Page
                </label>
                <select
                  id="select-startup-page"
                  value={settings.startupPage}
                  onChange={handleStartupTypeChange}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-emerald-500 font-sans"
                >
                  <option value="about:home">NovaBrowser Start Screen (Default)</option>
                  <option value="about:blank">Blank Page (about:blank)</option>
                  <option value="custom">Custom Web Address</option>
                </select>
              </div>

              {settings.startupPage === 'custom' && (
                <div>
                  <label htmlFor="input-custom-startup-url" className="block text-xs font-medium text-zinc-400 mb-1">
                    Custom Startup URL
                  </label>
                  <input
                    id="input-custom-startup-url"
                    type="text"
                    value={settings.customStartupUrl}
                    onChange={handleCustomUrlChange}
                    placeholder="https://example.com"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-100 font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
              )}

              <div>
                <label htmlFor="select-default-search" className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Default Search Engine
                </label>
                <select
                  id="select-default-search"
                  value={settings.defaultSearchEngine}
                  onChange={handleSearchEngineChange}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-emerald-500 font-sans"
                >
                  <option value="duckduckgo">DuckDuckGo HTML (Low RAM / NetSurf Optimized)</option>
                  <option value="google">Google Search</option>
                  <option value="bing">Bing Search</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section: Memory, Cache & Privacy */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span>Memory, Cache & Privacy</span>
            </div>

            <div className="bg-zinc-950 border border-zinc-800/80 rounded-xl divide-y divide-zinc-800/60">
              {/* Clear Cache on Exit Toggle */}
              <div className="p-4 flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="text-xs font-medium text-zinc-200">Clear Cache on Exit</div>
                  <div className="text-[11px] text-zinc-400 leading-normal">
                    Frees temporary page caches and memory allocations when closing the browser.
                  </div>
                </div>
                <button
                  id="toggle-clear-cache-exit"
                  type="button"
                  role="switch"
                  aria-checked={settings.clearCacheOnExit}
                  onClick={handleToggleClearCache}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    settings.clearCacheOnExit ? 'bg-emerald-600' : 'bg-zinc-800'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                      settings.clearCacheOnExit ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Load Images Toggle */}
              <div className="p-4 flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="text-xs font-medium text-zinc-200">Load Images</div>
                  <div className="text-[11px] text-zinc-400 leading-normal">
                    Disabling image rendering preserves significant unified GDDR3 RAM on Xbox 360.
                  </div>
                </div>
                <button
                  id="toggle-load-images"
                  type="button"
                  role="switch"
                  aria-checked={settings.enableImageLoading}
                  onClick={handleToggleImages}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    settings.enableImageLoading ? 'bg-emerald-600' : 'bg-zinc-800'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                      settings.enableImageLoading ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* JavaScript Engine Execution */}
              <div className="p-4 flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="text-xs font-medium text-zinc-200">JavaScript Execution</div>
                  <div className="text-[11px] text-zinc-400 leading-normal">
                    NetSurf Duktape engine. Keep disabled for maximum stability on low RAM.
                  </div>
                </div>
                <button
                  id="toggle-enable-js"
                  type="button"
                  role="switch"
                  aria-checked={settings.enableJavaScript}
                  onClick={handleToggleJS}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    settings.enableJavaScript ? 'bg-emerald-600' : 'bg-zinc-800'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                      settings.enableJavaScript ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Section: Storage Actions */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">
              <Zap className="w-4 h-4 text-emerald-400" />
              <span>Cache & Data Maintenance</span>
            </div>

            <div className="bg-zinc-950 border border-zinc-800/80 rounded-xl p-4 flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <div className="text-xs font-medium text-zinc-200">Purge Browser Data & Cache</div>
                <div className="text-[11px] text-zinc-500">
                  Clears browsing history, cached resources, and session storage.
                </div>
              </div>

              <button
                id="btn-purge-cache-now"
                type="button"
                onClick={handleTriggerClearData}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-400 text-xs font-medium text-zinc-300 transition-all shrink-0"
              >
                {dataClearedNotice ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Purged!</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Purge Cache</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-zinc-800 bg-zinc-950/80 flex items-center justify-between text-xs">
          <button
            id="btn-reset-settings-defaults"
            type="button"
            onClick={handleResetDefaults}
            className="inline-flex items-center gap-1.5 text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          <button
            id="btn-save-close-settings"
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
