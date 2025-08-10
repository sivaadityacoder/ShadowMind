import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Theme {
  id: string;
  name: string;
  colors: {
    background: string;
    foreground: string;
    accent: string;
    sidebar: string;
    editor: string;
    terminal: string;
    selection: string;
    border: string;
  };
  syntax: {
    keyword: string;
    string: string;
    comment: string;
    number: string;
    function: string;
    variable: string;
  };
}

interface ThemeState {
  currentTheme: string;
  themes: Theme[];
  customThemes: Theme[];
}

const defaultDarkTheme: Theme = {
  id: 'dark',
  name: 'Dark',
  colors: {
    background: '#1e1e1e',
    foreground: '#d4d4d4',
    accent: '#007acc',
    sidebar: '#252526',
    editor: '#1e1e1e',
    terminal: '#1e1e1e',
    selection: '#094771',
    border: '#3e3e3e',
  },
  syntax: {
    keyword: '#569cd6',
    string: '#ce9178',
    comment: '#6a9955',
    number: '#b5cea8',
    function: '#dcdcaa',
    variable: '#9cdcfe',
  },
};

const defaultLightTheme: Theme = {
  id: 'light',
  name: 'Light',
  colors: {
    background: '#ffffff',
    foreground: '#000000',
    accent: '#0066cc',
    sidebar: '#f3f3f3',
    editor: '#ffffff',
    terminal: '#ffffff',
    selection: '#add6ff',
    border: '#e5e5e5',
  },
  syntax: {
    keyword: '#0000ff',
    string: '#a31515',
    comment: '#008000',
    number: '#098658',
    function: '#795e26',
    variable: '#001080',
  },
};

const initialState: ThemeState = {
  currentTheme: 'dark',
  themes: [defaultDarkTheme, defaultLightTheme],
  customThemes: [],
};

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    setCurrentTheme: (state, action: PayloadAction<string>) => {
      state.currentTheme = action.payload;
    },
    addCustomTheme: (state, action: PayloadAction<Theme>) => {
      const existingIndex = state.customThemes.findIndex(theme => theme.id === action.payload.id);
      if (existingIndex !== -1) {
        state.customThemes[existingIndex] = action.payload;
      } else {
        state.customThemes.push(action.payload);
      }
    },
    removeCustomTheme: (state, action: PayloadAction<string>) => {
      state.customThemes = state.customThemes.filter(theme => theme.id !== action.payload);
    },
    updateThemeColors: (state, action: PayloadAction<{ themeId: string; colors: Partial<Theme['colors']> }>) => {
      const allThemes = [...state.themes, ...state.customThemes];
      const theme = allThemes.find(t => t.id === action.payload.themeId);
      if (theme) {
        theme.colors = { ...theme.colors, ...action.payload.colors };
      }
    },
  },
});

export const {
  setCurrentTheme,
  addCustomTheme,
  removeCustomTheme,
  updateThemeColors,
} = themeSlice.actions;

export default themeSlice.reducer;
