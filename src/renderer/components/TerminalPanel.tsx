import React, { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { WebLinksAddon } from 'xterm-addon-web-links';
import { RootState } from '../store';
import { addTerminal, removeTerminal, setActiveTerminal, Terminal as TerminalType } from '../store/features/terminal/terminalSlice';
import { v4 as uuidv4 } from 'uuid';

const TerminalContainer = styled.div`
  background: #1e1e1e;
  border-top: 1px solid #3e3e3e;
  height: 300px;
  display: flex;
  flex-direction: column;
`;

const TerminalHeader = styled.div`
  background: #2d2d30;
  border-bottom: 1px solid #3e3e3e;
  display: flex;
  align-items: center;
  min-height: 35px;
`;

const TerminalTabs = styled.div`
  display: flex;
  flex: 1;
  overflow-x: auto;
`;

const TerminalTab = styled.div<{ active?: boolean }>`
  background: ${props => props.active ? '#1e1e1e' : '#2d2d30'};
  color: ${props => props.active ? '#d4d4d4' : '#969696'};
  padding: 8px 16px;
  border-right: 1px solid #3e3e3e;
  cursor: pointer;
  display: flex;
  align-items: center;
  white-space: nowrap;
  font-size: 13px;
  min-width: 120px;

  &:hover {
    color: #d4d4d4;
    background: ${props => props.active ? '#1e1e1e' : '#383838'};
  }
`;

const TerminalTabLabel = styled.span`
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const TerminalTabClose = styled.div`
  margin-left: 8px;
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 2px;
  opacity: 0.7;
  font-size: 12px;
  
  &:hover {
    background: #424242;
    opacity: 1;
  }
`;

const TerminalActions = styled.div`
  display: flex;
  align-items: center;
  padding: 0 8px;
`;

const TerminalButton = styled.button`
  background: transparent;
  border: none;
  color: #d4d4d4;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 3px;
  font-size: 12px;
  
  &:hover {
    background: #424242;
  }
`;

const TerminalContent = styled.div`
  flex: 1;
  position: relative;
  background: #1e1e1e;
`;

const XTermContainer = styled.div`
  width: 100%;
  height: 100%;
  
  .xterm {
    height: 100%;
    width: 100%;
  }
  
  .xterm-viewport {
    background-color: transparent !important;
  }
  
  .xterm-screen {
    background-color: transparent !important;
  }
`;

interface TerminalInstanceProps {
  terminal: TerminalType;
  active: boolean;
}

const TerminalInstance: React.FC<TerminalInstanceProps> = ({ terminal, active }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<Terminal | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);

  useEffect(() => {
    if (!containerRef.current || xtermRef.current) return;

    // Create xterm instance
    const xterm = new Terminal({
      cursorBlink: true,
      fontFamily: 'Monaco, Menlo, Ubuntu Mono, monospace',
      fontSize: 13,
      theme: {
        background: '#1e1e1e',
        foreground: '#d4d4d4',
        cursor: '#d4d4d4',
        selection: '#264f78',
        black: '#000000',
        red: '#cd3131',
        green: '#0dbc79',
        yellow: '#e5e510',
        blue: '#2472c8',
        magenta: '#bc3fbc',
        cyan: '#11a8cd',
        white: '#e5e5e5',
        brightBlack: '#666666',
        brightRed: '#f14c4c',
        brightGreen: '#23d18b',
        brightYellow: '#f5f543',
        brightBlue: '#3b8eea',
        brightMagenta: '#d670d6',
        brightCyan: '#29b8db',
        brightWhite: '#e5e5e5'
      },
    });

    // Add addons
    const fitAddon = new FitAddon();
    const webLinksAddon = new WebLinksAddon();
    
    xterm.loadAddon(fitAddon);
    xterm.loadAddon(webLinksAddon);

    // Open terminal
    xterm.open(containerRef.current);
    fitAddon.fit();

    // Store references
    xtermRef.current = xterm;
    fitAddonRef.current = fitAddon;

    // Create backend terminal
    if (window.electronAPI) {
      window.electronAPI.createTerminal(terminal.id, terminal.cwd).then((result) => {
        if (!result.success) {
          console.error('Failed to create terminal:', result.error);
        }
      });
    }

    // Handle data input
    xterm.onData((data) => {
      if (window.electronAPI) {
        window.electronAPI.writeToTerminal(terminal.id, data);
      }
    });

    // Handle terminal data from backend
    const handleTerminalData = (event: any, data: { id: string; data: string }) => {
      if (data.id === terminal.id && xtermRef.current) {
        xtermRef.current.write(data.data);
      }
    };

    const handleTerminalExit = (event: any, data: { id: string }) => {
      if (data.id === terminal.id && xtermRef.current) {
        xtermRef.current.write('\r\n\x1b[31mTerminal process exited\x1b[0m\r\n');
      }
    };

    if (window.electronAPI) {
      window.electronAPI.onTerminalData(handleTerminalData);
      window.electronAPI.onTerminalExit(handleTerminalExit);
    }

    // Handle resize
    const handleResize = () => {
      if (fitAddonRef.current && xtermRef.current && active) {
        fitAddonRef.current.fit();
        if (window.electronAPI) {
          window.electronAPI.resizeTerminal(
            terminal.id,
            xtermRef.current.cols,
            xtermRef.current.rows
          );
        }
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (xtermRef.current) {
        xtermRef.current.dispose();
      }
      if (window.electronAPI) {
        window.electronAPI.destroyTerminal(terminal.id);
      }
    };
  }, [terminal.id, terminal.cwd]);

  useEffect(() => {
    // Fit terminal when it becomes active
    if (active && fitAddonRef.current && xtermRef.current) {
      setTimeout(() => {
        fitAddonRef.current?.fit();
        if (window.electronAPI) {
          window.electronAPI.resizeTerminal(
            terminal.id,
            xtermRef.current!.cols,
            xtermRef.current!.rows
          );
        }
      }, 100);
    }
  }, [active, terminal.id]);

  return (
    <XTermContainer
      ref={containerRef}
      style={{ display: active ? 'block' : 'none' }}
    />
  );
};

const TerminalPanel: React.FC = () => {
  const dispatch = useDispatch();
  const { terminals, activeTerminalId } = useSelector((state: RootState) => state.terminal);
  const { rootPath } = useSelector((state: RootState) => state.explorer);

  const handleNewTerminal = () => {
    const id = uuidv4();
    const terminal: TerminalType = {
      id,
      name: `Terminal ${terminals.length + 1}`,
      cwd: rootPath || process.cwd(),
      shell: process.platform === 'win32' ? 'powershell.exe' : 'bash',
      active: true,
    };
    dispatch(addTerminal(terminal));
  };

  const handleTerminalSelect = (id: string) => {
    dispatch(setActiveTerminal(id));
  };

  const handleTerminalClose = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    dispatch(removeTerminal(id));
  };

  const handleSplitTerminal = () => {
    const activeTerminal = terminals.find(t => t.id === activeTerminalId);
    if (activeTerminal) {
      const id = uuidv4();
      const terminal: TerminalType = {
        id,
        name: `Terminal ${terminals.length + 1}`,
        cwd: activeTerminal.cwd,
        shell: activeTerminal.shell,
        active: true,
      };
      dispatch(addTerminal(terminal));
    }
  };

  return (
    <TerminalContainer>
      <TerminalHeader>
        <TerminalTabs>
          {terminals.map((terminal) => (
            <TerminalTab
              key={terminal.id}
              active={terminal.id === activeTerminalId}
              onClick={() => handleTerminalSelect(terminal.id)}
            >
              <TerminalTabLabel>{terminal.name}</TerminalTabLabel>
              <TerminalTabClose onClick={(e) => handleTerminalClose(e, terminal.id)}>
                ×
              </TerminalTabClose>
            </TerminalTab>
          ))}
        </TerminalTabs>
        <TerminalActions>
          <TerminalButton onClick={handleNewTerminal} title="New Terminal">
            +
          </TerminalButton>
          <TerminalButton onClick={handleSplitTerminal} title="Split Terminal">
            ⧉
          </TerminalButton>
        </TerminalActions>
      </TerminalHeader>
      <TerminalContent>
        {terminals.map((terminal) => (
          <TerminalInstance
            key={terminal.id}
            terminal={terminal}
            active={terminal.id === activeTerminalId}
          />
        ))}
      </TerminalContent>
    </TerminalContainer>
  );
};

export default TerminalPanel;
