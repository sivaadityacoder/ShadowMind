import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface FileTab {
  id: string;
  name: string;
  path: string;
  content: string;
  isDirty: boolean;
  language: string;
}

interface EditorState {
  tabs: FileTab[];
  activeTabId: string | null;
  splitView: boolean;
  splitTabs: FileTab[];
  activeSplitTabId: string | null;
  findDialogOpen: boolean;
  replaceDialogOpen: boolean;
  searchQuery: string;
  replaceQuery: string;
}

const initialState: EditorState = {
  tabs: [],
  activeTabId: null,
  splitView: false,
  splitTabs: [],
  activeSplitTabId: null,
  findDialogOpen: false,
  replaceDialogOpen: false,
  searchQuery: '',
  replaceQuery: '',
};

const editorSlice = createSlice({
  name: 'editor',
  initialState,
  reducers: {
    addTab: (state, action: PayloadAction<FileTab>) => {
      const existingTab = state.tabs.find(tab => tab.path === action.payload.path);
      if (existingTab) {
        state.activeTabId = existingTab.id;
      } else {
        state.tabs.push(action.payload);
        state.activeTabId = action.payload.id;
      }
    },
    removeTab: (state, action: PayloadAction<string>) => {
      const index = state.tabs.findIndex(tab => tab.id === action.payload);
      if (index !== -1) {
        state.tabs.splice(index, 1);
        if (state.activeTabId === action.payload) {
          state.activeTabId = state.tabs.length > 0 ? state.tabs[Math.max(0, index - 1)].id : null;
        }
      }
    },
    setActiveTab: (state, action: PayloadAction<string>) => {
      state.activeTabId = action.payload;
    },
    updateTabContent: (state, action: PayloadAction<{ id: string; content: string }>) => {
      const tab = state.tabs.find(tab => tab.id === action.payload.id);
      if (tab) {
        tab.content = action.payload.content;
        tab.isDirty = true;
      }
    },
    markTabSaved: (state, action: PayloadAction<string>) => {
      const tab = state.tabs.find(tab => tab.id === action.payload);
      if (tab) {
        tab.isDirty = false;
      }
    },
    setSplitView: (state, action: PayloadAction<boolean>) => {
      state.splitView = action.payload;
    },
    addSplitTab: (state, action: PayloadAction<FileTab>) => {
      const existingTab = state.splitTabs.find(tab => tab.path === action.payload.path);
      if (existingTab) {
        state.activeSplitTabId = existingTab.id;
      } else {
        state.splitTabs.push(action.payload);
        state.activeSplitTabId = action.payload.id;
      }
    },
    removeSplitTab: (state, action: PayloadAction<string>) => {
      const index = state.splitTabs.findIndex(tab => tab.id === action.payload);
      if (index !== -1) {
        state.splitTabs.splice(index, 1);
        if (state.activeSplitTabId === action.payload) {
          state.activeSplitTabId = state.splitTabs.length > 0 ? state.splitTabs[Math.max(0, index - 1)].id : null;
        }
      }
    },
    setActiveSplitTab: (state, action: PayloadAction<string>) => {
      state.activeSplitTabId = action.payload;
    },
    setFindDialogOpen: (state, action: PayloadAction<boolean>) => {
      state.findDialogOpen = action.payload;
    },
    setReplaceDialogOpen: (state, action: PayloadAction<boolean>) => {
      state.replaceDialogOpen = action.payload;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setReplaceQuery: (state, action: PayloadAction<string>) => {
      state.replaceQuery = action.payload;
    },
  },
});

export const {
  addTab,
  removeTab,
  setActiveTab,
  updateTabContent,
  markTabSaved,
  setSplitView,
  addSplitTab,
  removeSplitTab,
  setActiveSplitTab,
  setFindDialogOpen,
  setReplaceDialogOpen,
  setSearchQuery,
  setReplaceQuery,
} = editorSlice.actions;

export default editorSlice.reducer;
