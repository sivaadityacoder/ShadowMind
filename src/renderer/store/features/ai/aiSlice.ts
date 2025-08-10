import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface ChatMessage {
  id?: string;
  role: 'user' | 'assistant' | 'error' | 'system';
  content: string;
  timestamp: number;
}

export interface AIProvider {
  id: string;
  name: string;
  enabled: boolean;
  authenticated: boolean;
  apiKey?: string;
}

interface AIState {
  providers: {
    chatgpt: AIProvider;
    copilot: AIProvider;
  };
  messages: ChatMessage[];
  chatHistory: ChatMessage[];
  currentInput: string;
  panelVisible: boolean;
  loading: boolean;
  isLoading: boolean;
  error: string | null;
  suggestions: string[];
  autoComplete: boolean;
  isAuthenticated: boolean;
  user: any | null;
}

const initialState: AIState = {
  providers: {
    chatgpt: {
      id: 'chatgpt',
      name: 'ChatGPT',
      enabled: false,
      authenticated: false,
    },
    copilot: {
      id: 'copilot',
      name: 'GitHub Copilot',
      enabled: false,
      authenticated: false,
    },
  },
  messages: [
    {
      role: 'assistant',
      content: 'Welcome to your FREE AI Assistant! Login with your Google account to access ChatGPT directly - no API keys required!',
      timestamp: Date.now()
    }
  ],
  chatHistory: [],
  currentInput: '',
  panelVisible: false,
  loading: false,
  isLoading: false,
  error: null,
  suggestions: [],
  autoComplete: true,
  isAuthenticated: false,
  user: null,
};

const aiSlice = createSlice({
  name: 'ai',
  initialState,
  reducers: {
    setProviderAuthenticated: (state, action: PayloadAction<{ providerId: string; authenticated: boolean; apiKey?: string }>) => {
      const provider = state.providers[action.payload.providerId as keyof typeof state.providers];
      if (provider) {
        provider.authenticated = action.payload.authenticated;
        provider.enabled = action.payload.authenticated;
        if (action.payload.apiKey) {
          provider.apiKey = action.payload.apiKey;
        }
      }
    },
    setProviderEnabled: (state, action: PayloadAction<{ providerId: string; enabled: boolean }>) => {
      const provider = state.providers[action.payload.providerId as keyof typeof state.providers];
      if (provider) {
        provider.enabled = action.payload.enabled;
      }
    },
    addChatMessage: (state, action: PayloadAction<ChatMessage>) => {
      state.chatHistory.push(action.payload);
    },
    addMessage: (state, action: PayloadAction<ChatMessage>) => {
      state.messages.push(action.payload);
    },
    clearChatHistory: (state) => {
      state.chatHistory = [];
    },
    clearMessages: (state) => {
      state.messages = [{
        role: 'assistant',
        content: 'Hello! I\'m your AI assistant powered by ChatGPT. How can I help you today?',
        timestamp: Date.now()
      }];
    },
    setCurrentInput: (state, action: PayloadAction<string>) => {
      state.currentInput = action.payload;
    },
    setPanelVisible: (state, action: PayloadAction<boolean>) => {
      state.panelVisible = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
      state.isLoading = action.payload;
    },
    setIsLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setSuggestions: (state, action: PayloadAction<string[]>) => {
      state.suggestions = action.payload;
    },
    setAutoComplete: (state, action: PayloadAction<boolean>) => {
      state.autoComplete = action.payload;
    },
    setAuthenticated: (state, action: PayloadAction<{ isAuthenticated: boolean; user?: any }>) => {
      state.isAuthenticated = action.payload.isAuthenticated;
      state.user = action.payload.user || null;
      state.providers.chatgpt.authenticated = action.payload.isAuthenticated;
      state.providers.chatgpt.enabled = action.payload.isAuthenticated;
    },
    setApiKey: (state, action: PayloadAction<string>) => {
      // Legacy action - convert to authentication
      state.providers.chatgpt.apiKey = action.payload;
      state.providers.chatgpt.authenticated = true;
      state.providers.chatgpt.enabled = true;
    },
  },
});

export const {
  setProviderAuthenticated,
  setProviderEnabled,
  addChatMessage,
  addMessage,
  clearChatHistory,
  clearMessages,
  setCurrentInput,
  setPanelVisible,
  setLoading,
  setIsLoading,
  setError,
  setSuggestions,
  setAutoComplete,
  setAuthenticated,
  setApiKey,
} = aiSlice.actions;

export default aiSlice.reducer;
