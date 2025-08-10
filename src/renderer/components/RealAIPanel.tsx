import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { addMessage, setIsLoading } from '../store/features/ai/aiSlice';

const AIContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #1e1e1e;
  border-left: 1px solid #333;
`;

const AIHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background: #252526;
  border-bottom: 1px solid #333;
  font-size: 13px;
  font-weight: 600;
  color: #cccccc;
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  color: #999;
`;

const UserAvatar = styled.img`
  width: 20px;
  height: 20px;
  border-radius: 50%;
`;

const LoginButton = styled.button`
  background: #4285f4;
  border: none;
  border-radius: 4px;
  color: white;
  padding: 6px 12px;
  font-size: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  
  &:hover:not(:disabled) {
    background: #3367d6;
  }
  
  &:disabled {
    background: #555;
    cursor: not-allowed;
  }
`;

const LogoutButton = styled.button`
  background: none;
  border: 1px solid #555;
  border-radius: 3px;
  color: #cccccc;
  padding: 4px 8px;
  font-size: 11px;
  cursor: pointer;
  
  &:hover {
    background: #383838;
  }
`;

const LoginContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  padding: 20px;
  text-align: center;
  gap: 16px;
`;

const LoginPrompt = styled.div`
  color: #cccccc;
  font-size: 14px;
  line-height: 1.5;
`;

const GoogleIcon = styled.span`
  font-size: 14px;
`;

const MessagesContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const Message = styled.div<{ isUser: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: ${props => props.isUser ? 'flex-end' : 'flex-start'};
`;

const MessageBubble = styled.div<{ isUser: boolean }>`
  max-width: 80%;
  padding: 8px 12px;
  border-radius: 8px;
  background: ${props => props.isUser ? '#0e639c' : '#2d2d30'};
  color: #cccccc;
  font-size: 13px;
  line-height: 1.4;
  white-space: pre-wrap;
  word-break: break-word;
`;

const CodeBlock = styled.pre`
  background: #1e1e1e;
  border: 1px solid #333;
  border-radius: 4px;
  padding: 8px;
  margin: 4px 0;
  overflow-x: auto;
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 12px;
`;

const InputContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 12px;
  border-top: 1px solid #333;
  gap: 8px;
`;

const InputArea = styled.textarea`
  background: #3c3c3c;
  border: 1px solid #555;
  border-radius: 4px;
  color: #cccccc;
  padding: 8px;
  font-family: inherit;
  font-size: 13px;
  resize: none;
  min-height: 60px;
  max-height: 120px;
  
  &:focus {
    outline: none;
    border-color: #007acc;
  }
  
  &::placeholder {
    color: #999;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

const SendButton = styled.button`
  background: #0e639c;
  border: none;
  border-radius: 4px;
  color: white;
  padding: 6px 12px;
  font-size: 12px;
  cursor: pointer;
  
  &:hover:not(:disabled) {
    background: #1177bb;
  }
  
  &:disabled {
    background: #555;
    cursor: not-allowed;
  }
`;

const QuickActions = styled.div`
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
`;

const QuickActionButton = styled.button`
  background: #2d2d30;
  border: 1px solid #555;
  border-radius: 3px;
  color: #cccccc;
  padding: 4px 8px;
  font-size: 11px;
  cursor: pointer;
  
  &:hover {
    background: #383838;
  }
`;

const SettingsModal = styled.div<{ isOpen: boolean }>`
  position: absolute;
  top: 40px;
  right: 12px;
  width: 300px;
  background: #252526;
  border: 1px solid #333;
  border-radius: 4px;
  padding: 12px;
  z-index: 1000;
  display: ${props => props.isOpen ? 'block' : 'none'};
`;

const ErrorMessage = styled.div`
  color: #f48771;
  font-size: 12px;
  padding: 8px;
  background: #3c1c1c;
  border-radius: 4px;
  margin: 4px 0;
`;

const LoadingSpinner = styled.div`
  display: inline-block;
  width: 12px;
  height: 12px;
  border: 2px solid #555;
  border-radius: 50%;
  border-top-color: #007acc;
  animation: spin 1s ease-in-out infinite;
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

export const AIPanel: React.FC = () => {
  const dispatch = useDispatch();
  const { messages, isLoading } = useSelector((state: RootState) => state.ai);
  const [input, setInput] = useState('');
  const [error, setError] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const authStatus = await (window as any).electronAPI.chatgptIsAuthenticated();
      setIsAuthenticated(authStatus.isAuthenticated);
      setUser(authStatus.user);
    } catch (error) {
      console.error('Error checking auth status:', error);
    }
  };

  const handleGoogleLogin = async () => {
    setAuthLoading(true);
    setError('');

    try {
      const result = await (window as any).electronAPI.chatgptAuthenticate();
      if (result.success) {
        setIsAuthenticated(true);
        setUser(result.user);
      }
    } catch (error: any) {
      console.error('Google login error:', error);
      setError(error.message || 'Failed to authenticate with Google');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await (window as any).electronAPI.chatgptLogout();
      setIsAuthenticated(false);
      setUser(null);
      // Clear messages when logging out
      // You might want to add a clear messages action to your slice
    } catch (error: any) {
      console.error('Logout error:', error);
      setError(error.message || 'Failed to logout');
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;
    
    if (!apiKey) {
      setError('Please set your OpenAI API key in settings first.');
      setShowSettings(true);
      return;
    }

    const userMessage = input.trim();
    setInput('');
    setError('');

    // Add user message
    dispatch(addMessage({
      role: 'user',
      content: userMessage,
      timestamp: Date.now()
    }));

    dispatch(setIsLoading(true));

    try {
      // Prepare messages for API
      const apiMessages = messages
        .filter(msg => msg.role !== 'error')
        .map(msg => ({
          role: msg.role,
          content: msg.content
        }));

      // Add current user message
      apiMessages.push({
        role: 'user',
        content: userMessage
      });

      // Send to ChatGPT API
      const response = await (window as any).electronAPI.chatgptSendMessage(apiMessages);
      
      if (response && response.choices && response.choices[0]) {
        dispatch(addMessage({
          role: 'assistant',
          content: response.choices[0].message.content,
          timestamp: Date.now()
        }));
      } else {
        throw new Error('Invalid response from ChatGPT API');
      }
    } catch (error: any) {
      console.error('ChatGPT error:', error);
      setError(error.message || 'Failed to send message to ChatGPT');
      dispatch(addMessage({
        role: 'error',
        content: `Error: ${error.message || 'Failed to send message'}`,
        timestamp: Date.now()
      }));
    } finally {
      dispatch(setIsLoading(false));
    }
  };

  const handleQuickAction = async (action: string) => {
    setError('');
    
    let prompt = '';
    switch (action) {
      case 'explain':
        prompt = 'Please explain the current code selection or file';
        break;
      case 'review':
        prompt = 'Please review this code for potential issues and improvements';
        break;
      case 'optimize':
        prompt = 'Please optimize this code for better performance';
        break;
      case 'test':
        prompt = 'Please generate unit tests for this code';
        break;
    }
    
    setInput(prompt);
  };

  const handleSaveApiKey = async () => {
    if (tempApiKey.trim()) {
      try {
        await (window as any).electronAPI.chatgptSetApiKey(tempApiKey.trim());
        dispatch(setApiKey(tempApiKey.trim()));
        setShowSettings(false);
        setError('');
      } catch (error: any) {
        setError('Failed to save API key: ' + error.message);
      }
    }
  };

  const renderMessage = (message: any) => {
    const isCode = message.content.includes('```');
    
    if (isCode) {
      const parts = message.content.split('```');
      return (
        <div>
          {parts.map((part: string, index: number) => {
            if (index % 2 === 0) {
              return <span key={index}>{part}</span>;
            } else {
              const lines = part.split('\n');
              const language = lines[0];
              const code = lines.slice(1).join('\n');
              return (
                <CodeBlock key={index}>
                  {code}
                </CodeBlock>
              );
            }
          })}
        </div>
      );
    }
    
    return message.content;
  };

  return (
    <AIContainer>
      <AIHeader>
        <span>AI Assistant</span>
        <SettingsButton onClick={() => setShowSettings(!showSettings)}>
          ⚙️
        </SettingsButton>
        <SettingsModal isOpen={showSettings}>
          <div style={{ marginBottom: '8px', fontSize: '12px', fontWeight: 600 }}>
            OpenAI API Settings
          </div>
          <div style={{ fontSize: '11px', color: '#999', marginBottom: '4px' }}>
            API Key:
          </div>
          <SettingsInput
            type="password"
            value={tempApiKey}
            onChange={(e) => setTempApiKey(e.target.value)}
            placeholder="sk-..."
          />
          <div style={{ marginTop: '8px', display: 'flex', gap: '4px' }}>
            <SendButton onClick={handleSaveApiKey}>Save</SendButton>
            <SendButton onClick={() => setShowSettings(false)}>Cancel</SendButton>
          </div>
          <div style={{ fontSize: '10px', color: '#999', marginTop: '8px' }}>
            Get your API key from: https://platform.openai.com/api-keys
          </div>
        </SettingsModal>
      </AIHeader>

      <MessagesContainer>
        {messages.map((message, index) => (
          <Message key={index} isUser={message.role === 'user'}>
            <MessageBubble isUser={message.role === 'user'}>
              {message.role === 'error' ? (
                <ErrorMessage>{message.content}</ErrorMessage>
              ) : (
                renderMessage(message)
              )}
            </MessageBubble>
          </Message>
        ))}
        {isLoading && (
          <Message isUser={false}>
            <MessageBubble isUser={false}>
              <LoadingSpinner /> Thinking...
            </MessageBubble>
          </Message>
        )}
        <div ref={messagesEndRef} />
      </MessagesContainer>

      <InputContainer>
        {error && <ErrorMessage>{error}</ErrorMessage>}
        
        <QuickActions>
          <QuickActionButton onClick={() => handleQuickAction('explain')}>
            Explain Code
          </QuickActionButton>
          <QuickActionButton onClick={() => handleQuickAction('review')}>
            Review Code
          </QuickActionButton>
          <QuickActionButton onClick={() => handleQuickAction('optimize')}>
            Optimize
          </QuickActionButton>
          <QuickActionButton onClick={() => handleQuickAction('test')}>
            Generate Tests
          </QuickActionButton>
        </QuickActions>

        <InputArea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
              handleSendMessage();
            }
          }}
          placeholder="Ask AI anything... (Ctrl+Enter to send)"
        />
        
        <ButtonContainer>
          <SendButton onClick={handleSendMessage} disabled={isLoading || !input.trim()}>
            {isLoading ? <LoadingSpinner /> : 'Send'}
          </SendButton>
          <span style={{ fontSize: '11px', color: '#999' }}>
            Ctrl+Enter to send
          </span>
        </ButtonContainer>
      </InputContainer>
    </AIContainer>
  );
};
