import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Terminal {
  id: string;
  name: string;
  cwd: string;
  shell: string;
  active: boolean;
}

interface TerminalState {
  terminals: Terminal[];
  activeTerminalId: string | null;
  panelVisible: boolean;
  panelHeight: number;
}

const initialState: TerminalState = {
  terminals: [],
  activeTerminalId: null,
  panelVisible: false,
  panelHeight: 300,
};

const terminalSlice = createSlice({
  name: 'terminal',
  initialState,
  reducers: {
    addTerminal: (state, action: PayloadAction<Terminal>) => {
      state.terminals.push(action.payload);
      state.activeTerminalId = action.payload.id;
      state.panelVisible = true;
    },
    removeTerminal: (state, action: PayloadAction<string>) => {
      const index = state.terminals.findIndex(terminal => terminal.id === action.payload);
      if (index !== -1) {
        state.terminals.splice(index, 1);
        if (state.activeTerminalId === action.payload) {
          state.activeTerminalId = state.terminals.length > 0 ? state.terminals[Math.max(0, index - 1)].id : null;
        }
        if (state.terminals.length === 0) {
          state.panelVisible = false;
        }
      }
    },
    setActiveTerminal: (state, action: PayloadAction<string>) => {
      state.activeTerminalId = action.payload;
    },
    setPanelVisible: (state, action: PayloadAction<boolean>) => {
      state.panelVisible = action.payload;
    },
    setPanelHeight: (state, action: PayloadAction<number>) => {
      state.panelHeight = action.payload;
    },
    updateTerminalName: (state, action: PayloadAction<{ id: string; name: string }>) => {
      const terminal = state.terminals.find(t => t.id === action.payload.id);
      if (terminal) {
        terminal.name = action.payload.name;
      }
    },
  },
});

export const {
  addTerminal,
  removeTerminal,
  setActiveTerminal,
  setPanelVisible,
  setPanelHeight,
  updateTerminalName,
} = terminalSlice.actions;

export default terminalSlice.reducer;
