export interface Bookmark {
  id: string;
  title: string;
  url: string;
  createdAt: number;
}

export interface BrowserSettings {
  startupPage: string;
  customStartupUrl: string;
  clearCacheOnExit: boolean;
  enableImageLoading: boolean;
  enableJavaScript: boolean;
  defaultSearchEngine: 'duckduckgo' | 'google' | 'bing';
}

export interface BrowserTab {
  id: string;
  url: string;
  title: string;
  favicon?: string;
  isLoading: boolean;
  canGoBack: boolean;
  canGoForward: boolean;
  history: string[];
  historyIndex: number;
}
