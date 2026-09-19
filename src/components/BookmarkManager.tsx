import React, { useState, useEffect } from 'react';
import { Bookmark } from '../types';
import { Bookmark as BookmarkIcon, Star, Trash2, ExternalLink, Plus, X, Globe } from 'lucide-react';

interface BookmarkManagerProps {
  currentUrl: string;
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (url: string) => void;
}

const STORAGE_KEY = 'novabrowser_bookmarks_v1';

const DEFAULT_BOOKMARKS: Bookmark[] = [
  {
    id: 'bm-wiki',
    title: 'Wikipedia Mobile',
    url: 'https://en.m.wikipedia.org',
    createdAt: Date.now() - 300000,
  },
  {
    id: 'bm-ddg',
    title: 'DuckDuckGo HTML',
    url: 'https://duckduckgo.com/html/',
    createdAt: Date.now() - 240000,
  },
  {
    id: 'bm-netsurf',
    title: 'NetSurf Browser Project',
    url: 'https://www.netsurf-browser.org',
    createdAt: Date.now() - 180000,
  },
  {
    id: 'bm-hn',
    title: 'Hacker News',
    url: 'https://news.ycombinator.com',
    createdAt: Date.now() - 120000,
  },
  {
    id: 'bm-npr',
    title: 'NPR Text News',
    url: 'https://text.npr.org',
    createdAt: Date.now() - 60000,
  },
];

export const BookmarkManager: React.FC<BookmarkManagerProps> = ({
  currentUrl,
  isOpen,
  onClose,
  onNavigate,
}) => {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // Fall back to defaults on error
    }
    return DEFAULT_BOOKMARKS;
  });

  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [isAddingCustom, setIsAddingCustom] = useState(false);

  // Sync with localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks));
    } catch {
      // Ignore storage quota limits
    }
  }, [bookmarks]);

  // Set default values when opening the add form
  useEffect(() => {
    if (isOpen) {
      const isHome = !currentUrl || currentUrl.startsWith('about:');
      setNewUrl(isHome ? '' : currentUrl);
      if (!isHome) {
        try {
          const parsed = new URL(currentUrl);
          setNewTitle(parsed.hostname.replace(/^www\./, ''));
        } catch {
          setNewTitle(currentUrl);
        }
      } else {
        setNewTitle('');
      }
    }
  }, [isOpen, currentUrl]);

  if (!isOpen) return null;

  const isCurrentBookmarked = bookmarks.some((b) => b.url.toLowerCase() === currentUrl.toLowerCase());

  const handleToggleCurrentBookmark = () => {
    if (isCurrentBookmarked) {
      setBookmarks((prev) => prev.filter((b) => b.url.toLowerCase() !== currentUrl.toLowerCase()));
    } else {
      let title = 'New Bookmark';
      try {
        const parsed = new URL(currentUrl);
        title = parsed.hostname.replace(/^www\./, '');
      } catch {
        title = currentUrl;
      }
      const newBookmark: Bookmark = {
        id: `bm-${Date.now()}`,
        title,
        url: currentUrl,
        createdAt: Date.now(),
      };
      setBookmarks((prev) => [newBookmark, ...prev]);
    }
  };

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    let targetUrl = newUrl.trim();
    if (!targetUrl) return;

    if (!/^https?:\/\//i.test(targetUrl)) {
      targetUrl = `https://${targetUrl}`;
    }

    const title = newTitle.trim() || targetUrl;
    const newBookmark: Bookmark = {
      id: `bm-${Date.now()}`,
      title,
      url: targetUrl,
      createdAt: Date.now(),
    };

    setBookmarks((prev) => [newBookmark, ...prev]);
    setNewTitle('');
    setNewUrl('');
    setIsAddingCustom(false);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setBookmarks((prev) => prev.filter((b) => b.id !== id));
  };

  const handleSelect = (url: string) => {
    onNavigate(url);
    onClose();
  };

  return (
    <div
      id="bookmark-manager-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4"
      onClick={onClose}
    >
      <div
        id="bookmark-manager-container"
        className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800 bg-zinc-900/90">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <BookmarkIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">Bookmarks</h2>
              <p className="text-xs text-zinc-400">Manage saved pages in local storage</p>
            </div>
          </div>
          <button
            id="btn-close-bookmarks"
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Action: Bookmark Current Page */}
        {currentUrl && !currentUrl.startsWith('about:') && (
          <div className="px-5 py-3 bg-zinc-950/60 border-b border-zinc-800/80 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="text-xs font-medium text-zinc-300 truncate">{currentUrl}</div>
              <div className="text-[11px] text-zinc-500">Currently active page</div>
            </div>
            <button
              id="btn-toggle-active-bookmark"
              type="button"
              onClick={handleToggleCurrentBookmark}
              className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                isCurrentBookmarked
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30'
                  : 'bg-emerald-600 text-white hover:bg-emerald-500'
              }`}
            >
              <Star className={`w-3.5 h-3.5 ${isCurrentBookmarked ? 'fill-amber-300' : ''}`} />
              <span>{isCurrentBookmarked ? 'Saved' : 'Bookmark Page'}</span>
            </button>
          </div>
        )}

        {/* Custom Bookmark Creator Toggle */}
        <div className="p-4 border-b border-zinc-800/60 flex items-center justify-between">
          <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
            Saved Pages ({bookmarks.length})
          </span>
          <button
            id="btn-toggle-add-custom-bookmark"
            type="button"
            onClick={() => setIsAddingCustom((v) => !v)}
            className="inline-flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{isAddingCustom ? 'Cancel' : 'Add custom URL'}</span>
          </button>
        </div>

        {/* Custom Bookmark Form */}
        {isAddingCustom && (
          <form
            id="form-add-bookmark"
            onSubmit={handleAddCustom}
            className="p-4 bg-zinc-950 border-b border-zinc-800 space-y-3"
          >
            <div>
              <label htmlFor="bookmark-title-input" className="block text-[11px] font-medium text-zinc-400 mb-1">
                Bookmark Title
              </label>
              <input
                id="bookmark-title-input"
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. My Favorite Site"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 font-sans"
              />
            </div>
            <div>
              <label htmlFor="bookmark-url-input" className="block text-[11px] font-medium text-zinc-400 mb-1">
                Web Address (URL)
              </label>
              <input
                id="bookmark-url-input"
                type="text"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                placeholder="https://example.com"
                required
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsAddingCustom(false)}
                className="px-3 py-1 rounded-lg text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
              >
                Cancel
              </button>
              <button
                id="btn-submit-add-bookmark"
                type="submit"
                className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors"
              >
                Save Bookmark
              </button>
            </div>
          </form>
        )}

        {/* Bookmarks List */}
        <div id="bookmarks-list" className="flex-1 overflow-y-auto divide-y divide-zinc-800/60 p-2">
          {bookmarks.length === 0 ? (
            <div className="py-12 text-center text-zinc-500 text-xs">
              <BookmarkIcon className="w-8 h-8 mx-auto mb-2 text-zinc-600 stroke-1" />
              No bookmarks saved yet.
            </div>
          ) : (
            bookmarks.map((bm) => (
              <div
                key={bm.id}
                id={`bookmark-item-${bm.id}`}
                onClick={() => handleSelect(bm.url)}
                className="group flex items-center justify-between p-3 rounded-xl hover:bg-zinc-800/60 cursor-pointer transition-all"
              >
                <div className="flex items-center gap-3 min-w-0 pr-3">
                  <div className="p-2 rounded-lg bg-zinc-800 text-zinc-400 group-hover:text-emerald-400 group-hover:bg-zinc-700/60 transition-colors shrink-0">
                    <Globe className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-zinc-200 group-hover:text-white truncate">
                      {bm.title}
                    </div>
                    <div className="text-[11px] font-mono text-zinc-500 truncate">
                      {bm.url}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 shrink-0">
                  <button
                    id={`btn-delete-bookmark-${bm.id}`}
                    type="button"
                    title="Delete bookmark"
                    onClick={(e) => handleDelete(bm.id, e)}
                    className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <ExternalLink className="w-3.5 h-3.5 text-zinc-600 group-hover:text-zinc-400 transition-colors ml-1" />
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-zinc-800 bg-zinc-950/80 flex items-center justify-between text-[11px] text-zinc-500">
          <span>Synced locally with browser storage</span>
          <button
            id="btn-close-modal-bottom"
            onClick={onClose}
            className="px-3 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
