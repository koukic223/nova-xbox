export interface HistoryItem {
  id: string;
  url: string;
  title: string;
  timestamp: number;
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
