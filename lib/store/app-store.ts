import { create } from 'zustand';
import type { SearchResults as SearchResultsType } from '@/types/food';

interface AppState {
  displaySearchResults: boolean;
  searchResults: SearchResultsType | null;
  currentQuery: string;
  setDisplaySearchResults: (display: boolean) => void;
  setSearchResults: (results: SearchResultsType) => void;
  setCurrentQuery: (query: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  displaySearchResults: false,
  searchResults: null,
  currentQuery: '',
  setDisplaySearchResults: (display: boolean) => set({ displaySearchResults: display }),
  setSearchResults: (results: SearchResultsType) => set({ searchResults: results }),
  setCurrentQuery: (query: string) => set({ currentQuery: query }),
}));
