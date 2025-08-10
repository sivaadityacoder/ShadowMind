import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface GitHubState {
  panelVisible: boolean;
  isAuthenticated: boolean;
  user: any | null;
  repositories: any[];
  loading: boolean;
  error: string | null;
}

const initialState: GitHubState = {
  panelVisible: false,
  isAuthenticated: false,
  user: null,
  repositories: [],
  loading: false,
  error: null,
};

const githubSlice = createSlice({
  name: 'github',
  initialState,
  reducers: {
    setPanelVisible: (state, action: PayloadAction<boolean>) => {
      state.panelVisible = action.payload;
    },
    setAuthenticated: (state, action: PayloadAction<boolean>) => {
      state.isAuthenticated = action.payload;
      if (!action.payload) {
        state.user = null;
        state.repositories = [];
      }
    },
    setUser: (state, action: PayloadAction<any>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
    setRepositories: (state, action: PayloadAction<any[]>) => {
      state.repositories = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const {
  setPanelVisible,
  setAuthenticated,
  setUser,
  setRepositories,
  setLoading,
  setError,
} = githubSlice.actions;

export default githubSlice.reducer;
