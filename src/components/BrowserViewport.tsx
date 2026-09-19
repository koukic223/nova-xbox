import React, { useState, useRef, useEffect } from 'react';
import {
  Globe,
  ExternalLink,
  Shield,
  Compass,
  Cpu,
  Layers,
  Sparkles,
  Gamepad2
} from 'lucide-react';

interface BrowserViewportProps {
  url: string;
  isLoading: boolean;
  onNavigate: (url: string) => void;
  onLoadStart: () => void;
  onLoadEnd: () => void;
}

export const BrowserViewport: React.FC<BrowserViewportProps> = ({
  url,
  isLoading,
  onNavigate,
  onLoadStart,
  onLoadEnd,
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [iframeError, setIframeError] = useState(false);
  const isStartPage = !url || url === 'about:blank' || url === 'about:home' || url === 'novabrowser://home';

  // Fast preset links for Xbox 360 / NetSurf testing
  const quickLinks = [
    { title: 'Wikipedia', url: 'https://en.m.wikipedia.org', desc: 'Mobile encyclopedia (fast lightweight HTML)' },
    { title: 'DuckDuckGo', url: 'https://duckduckgo.com/html/', desc: 'HTML search engine without JS heavy loads' },
    { title: 'W3C Standards', url: 'https://www.w3.org', desc: 'Web standards specifications' },
    { title: 'NetSurf Project', url: 'https://www.netsurf-browser.org', desc: 'NetSurf 3.11 core engine information' },
    { title: 'Hacker News', url: 'https://news.ycombinator.com', desc: 'Lightweight discussion and tech news' },
    { title: 'NPR Text', url: 'https://text.npr.org', desc: 'Ultra-fast minimal text news portal' },
  ];

  useEffect(() => {
    setIframeError(false);
  }, [url]);

  return (
    <main
      id="browser-viewport-container"
      className="flex-1 flex flex-col relative w-full h-full bg-zinc-950 overflow-hidden"
    >
      {/* Loading Progress Bar */}
      {isLoading && (
        <div
          id="viewport-progress-bar"
          className="absolute top-0 left-0 right-0 h-0.5 bg-emerald-500 animate-pulse z-30"
        />
      )}

      {/* Start Page / NovaBrowser Welcome View */}
      {isStartPage ? (
        <div
          id="viewport-start-page"
          className="flex-1 overflow-y-auto p-6 md:p-10 flex flex-col items-center justify-start text-zinc-100"
        >
          <div className="w-full max-w-4xl flex flex-col items-center gap-8 my-auto">
            {/* Logo / Header */}
            <div className="text-center space-y-2">
              <div className="inline-flex items-center justify-center p-3.5 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-inner mb-2">
                <Compass className="w-9 h-9 text-emerald-400" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-white">NovaBrowser</h1>
              <p className="text-sm text-zinc-400 max-w-lg mx-auto leading-relaxed">
                Lightweight Web Browser for Xbox 360 (RGH/JTAG) powered by the NetSurf 3.11 engine.
              </p>
            </div>

            {/* Quick Access Tiles */}
            <div className="w-full">
              <div className="flex items-center justify-between mb-3 px-1">
                <h2 className="text-xs font-semibold tracking-wider text-zinc-400 uppercase">
                  Quick Access
                </h2>
                <span className="text-xs text-zinc-500 font-mono">NetSurf 3.11 compatible</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {quickLinks.map((link) => (
                  <button
                    key={link.title}
                    id={`quicklink-${link.title.toLowerCase().replace(/\s+/g, '-')}`}
                    onClick={() => onNavigate(link.url)}
                    className="flex flex-col text-left p-4 rounded-xl bg-zinc-900/70 border border-zinc-800/80 hover:border-emerald-500/50 hover:bg-zinc-800/60 transition-all group"
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <span className="font-semibold text-sm text-zinc-200 group-hover:text-emerald-400 transition-colors">
                        {link.title}
                      </span>
                      <ExternalLink className="w-3.5 h-3.5 text-zinc-500 group-hover:text-zinc-300 transition-colors" />
                    </div>
                    <p className="text-xs text-zinc-400 leading-normal">{link.desc}</p>
                    <span className="mt-2 text-[11px] font-mono text-zinc-500 truncate">
                      {link.url}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Engine & Platform Specs */}
            <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
              <div className="p-3.5 rounded-xl bg-zinc-900/40 border border-zinc-800/60 flex items-start gap-3">
                <Cpu className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-medium text-zinc-200">Target Architecture</div>
                  <div className="text-xs text-zinc-400">PowerPC Xenon (Xbox 360)</div>
                </div>
              </div>
              <div className="p-3.5 rounded-xl bg-zinc-900/40 border border-zinc-800/60 flex items-start gap-3">
                <Layers className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-medium text-zinc-200">Layout Engine</div>
                  <div className="text-xs text-zinc-400">NetSurf 3.11 (libdom/libcss)</div>
                </div>
              </div>
              <div className="p-3.5 rounded-xl bg-zinc-900/40 border border-zinc-800/60 flex items-start gap-3">
                <Shield className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-medium text-zinc-200">Executable Target</div>
                  <div className="text-xs text-zinc-400">NovaBrowser.xex</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Active Web Page Viewport */
        <div className="relative flex-1 w-full h-full bg-white">
          <iframe
            ref={iframeRef}
            id="browser-active-frame"
            src={url}
            title="Browser Content Viewport"
            className="w-full h-full border-0"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            onLoad={() => {
              onLoadEnd();
            }}
            onError={() => {
              setIframeError(true);
              onLoadEnd();
            }}
          />

          {/* Embedded Site Overlay Banner if site uses X-Frame-Options */}
          {iframeError && (
            <div
              id="iframe-embed-notice"
              className="absolute inset-0 bg-zinc-950/95 flex flex-col items-center justify-center p-6 text-center text-zinc-100 z-20"
            >
              <div className="max-w-md p-6 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-2xl space-y-4">
                <div className="w-12 h-12 mx-auto rounded-full bg-zinc-800 flex items-center justify-center text-zinc-300">
                  <Globe className="w-6 h-6 text-emerald-400" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-semibold text-white">External Site Protection</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    This domain restricts direct inline frame embedding via security headers (<code className="text-zinc-300 font-mono">X-Frame-Options</code>).
                  </p>
                </div>
                <div className="pt-2 flex flex-col gap-2">
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors"
                  >
                    <span>Open in New Tab</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <button
                    onClick={() => onNavigate('about:home')}
                    className="w-full px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium transition-colors"
                  >
                    Return to NovaBrowser Home
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Viewport Bottom Status Bar */}
      <footer
        id="browser-status-bar"
        className="bg-zinc-900 border-t border-zinc-800/80 px-3 py-1 flex items-center justify-between text-[11px] text-zinc-400 select-none z-10"
      >
        <div className="flex items-center gap-2 truncate">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
          <span className="font-mono text-zinc-300 truncate">
            {isLoading ? 'Connecting...' : url || 'about:home'}
          </span>
        </div>

        <div className="flex items-center gap-3 shrink-0 font-mono text-[10px]">
          <span className="hidden md:inline-flex items-center gap-1 text-zinc-500">
            <span>Alt+←/→</span>
            <span className="text-zinc-600">History</span>
            <span className="text-zinc-700">&bull;</span>
            <span>Ctrl+L</span>
            <span className="text-zinc-600">Address</span>
            <span className="text-zinc-700">&bull;</span>
            <span>Ctrl+B</span>
            <span className="text-zinc-600">Bookmarks</span>
            <span className="text-zinc-700">&bull;</span>
            <span>F5</span>
            <span className="text-zinc-600">Reload</span>
          </span>
          <span className="hidden sm:inline-flex items-center gap-1.5 text-zinc-400 pl-2 border-l border-zinc-800">
            <Gamepad2 className="w-3 h-3 text-zinc-400" />
            <span>(A) Click &middot; (B) Back &middot; (X) Reload &middot; (Y) URL</span>
          </span>
          <span className="text-zinc-500">100%</span>
        </div>
      </footer>
    </main>
  );
};
