import { configureStore } from '@reduxjs/toolkit';
import editorReducer from './features/editor/editorSlice';
import terminalReducer from './features/terminal/terminalSlice';
import explorerReducer from './features/explorer/explorerSlice';
import aiReducer from './features/ai/aiSlice';
import themeReducer from './features/theme/themeSlice';
import githubReducer from './features/github/githubSlice';

export const store = configureStore({
  reducer: {
    editor: editorReducer,
    terminal: terminalReducer,
    explorer: explorerReducer,
    ai: aiReducer,
    theme: themeReducer,
    github: githubReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
