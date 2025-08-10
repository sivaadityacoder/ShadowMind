import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { RootState } from '../store';
import { 
  addChatMessage, 
  setCurrentInput, 
  setLoading, 
  setError,
  ChatMessage as ChatMessageType,
  setProviderAuthenticated
} from '../store/features/ai/aiSlice';
import { v4 as uuidv4 } from 'uuid';

const AIPanelContainer = styled.div`
  background: #252526;
  border-left: 1px solid #3e3e3e;
  width: 400px;
  display: flex;
  flex-direction: column;
  min-height: 0;
`;

const AIPanelHeader = styled.div`
  background: #2d2d30;
  padding: 8px 12px;
  border-bottom: 1px solid #3e3e3e;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  color: #d4d4d4;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ProviderTabs = styled.div`
  display: flex;
  background: #2d2d30;
  border-bottom: 1px solid #3e3e3e;
`;

const ProviderTab = styled.div<{ active?: boolean }>`
  padding: 8px 16px;
  cursor: pointer;
  font-size: 12px;
  color: ${props => props.active ? '#d4d4d4' : '#969696'};
  background: ${props => props.active ? '#252526' : '#2d2d30'};
  border-right: 1px solid #3e3e3e;
  
  &:hover {
    color: #d4d4d4;
    background: ${props => props.active ? '#252526' : '#383838'};
  }
`;

const ChatContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const ChatMessage = styled.div<{ role: 'user' | 'assistant' }>`
  padding: 8px 12px;
  border-radius: 8px;
  max-width: 85%;
  align-self: ${props => props.role === 'user' ? 'flex-end' : 'flex-start'};
  background: ${props => props.role === 'user' ? '#0e639c' : '#2d2d30'};
  color: ${props => props.role === 'user' ? '#ffffff' : '#d4d4d4'};
  font-size: 13px;
  line-height: 1.4;
  word-wrap: break-word;
`;

const ChatTime = styled.div`
  font-size: 10px;
  opacity: 0.7;
  margin-top: 4px;
`;

const InputContainer = styled.div`
  border-top: 1px solid #3e3e3e;
  padding: 12px;
  background: #252526;
`;

const TextArea = styled.textarea`
  width: 100%;
  min-height: 60px;
  max-height: 120px;
  background: #3c3c3c;
  border: 1px solid #464647;
  color: #d4d4d4;
  padding: 8px;
  border-radius: 4px;
  font-family: inherit;
  font-size: 13px;
  resize: vertical;
  outline: none;

  &:focus {
    border-color: #007acc;
  }

  &::placeholder {
    color: #969696;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
`;

const SendButton = styled.button<{ disabled?: boolean }>`
  background: ${props => props.disabled ? '#6c6c6c' : '#0e639c'};
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 3px;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  font-size: 12px;
  font-family: inherit;

  &:hover:not(:disabled) {
    background: #1177bb;
  }
`;

const AuthContainer = styled.div`
  padding: 16px;
  text-align: center;
  color: #969696;
`;

const AuthButton = styled.button`
  background: #0e639c;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 3px;
  cursor: pointer;
  font-size: 12px;
  font-family: inherit;
  margin-top: 8px;

  &:hover {
    background: #1177bb;
  }
`;

const LoadingIndicator = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
  color: #969696;
  font-size: 12px;
`;

const ErrorMessage = styled.div`
  background: #f14c4c;
  color: white;
  padding: 8px 12px;
  border-radius: 4px;
  margin: 8px;
  font-size: 12px;
`;

const AIPanel: React.FC = () => {
  const dispatch = useDispatch();
  const { 
    providers, 
    chatHistory, 
    currentInput, 
    loading, 
    error 
  } = useSelector((state: RootState) => state.ai);
  
  const [activeProvider, setActiveProvider] = useState<'chatgpt' | 'copilot'>('chatgpt');
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);

  const handleSendMessage = async () => {
    if (!currentInput.trim() || loading) return;

    const userMessage: ChatMessageType = {
      id: uuidv4(),
      role: 'user',
      content: currentInput.trim(),
      timestamp: Date.now(),
    };

    dispatch(addChatMessage(userMessage));
    dispatch(setCurrentInput(''));
    dispatch(setLoading(true));
    dispatch(setError(null));

    try {
      // Here you would integrate with the actual AI APIs
      // For now, we'll simulate a response
      setTimeout(() => {
        const assistantMessage: ChatMessageType = {
          id: uuidv4(),
          role: 'assistant',
          content: `I received your message: "${userMessage.content}". This is a placeholder response. In a real implementation, this would connect to ${activeProvider === 'chatgpt' ? 'ChatGPT' : 'GitHub Copilot'} API.`,
          timestamp: Date.now(),
        };
        
        dispatch(addChatMessage(assistantMessage));
        dispatch(setLoading(false));
      }, 2000);
    } catch (err) {
      dispatch(setError('Failed to send message. Please try again.'));
      dispatch(setLoading(false));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleAuth = (providerId: 'chatgpt' | 'copilot') => {
    // In a real implementation, this would open OAuth flow
    // For demo purposes, we'll just mark as authenticated
    dispatch(setProviderAuthenticated({
      providerId,
      authenticated: true,
    }));
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const currentProvider = providers[activeProvider];
  const isAuthenticated = currentProvider.authenticated;

  return (
    <AIPanelContainer>
      <AIPanelHeader>
        AI Assistant
      </AIPanelHeader>
      
      <ProviderTabs>
        <ProviderTab 
          active={activeProvider === 'chatgpt'}
          onClick={() => setActiveProvider('chatgpt')}
        >
          ChatGPT
        </ProviderTab>
        <ProviderTab 
          active={activeProvider === 'copilot'}
          onClick={() => setActiveProvider('copilot')}
        >
          Copilot
        </ProviderTab>
      </ProviderTabs>

      {!isAuthenticated ? (
        <AuthContainer>
          <div>Please authenticate with {currentProvider.name} to start chatting.</div>
          <AuthButton onClick={() => handleAuth(activeProvider)}>
            Connect to {currentProvider.name}
          </AuthButton>
        </AuthContainer>
      ) : (
        <>
          <ChatContainer ref={chatContainerRef}>
            {chatHistory.map((message) => (
              <ChatMessage key={message.id} role={message.role}>
                {message.content}
                <ChatTime>{formatTime(message.timestamp)}</ChatTime>
              </ChatMessage>
            ))}
            {loading && (
              <LoadingIndicator>
                <div>Thinking...</div>
              </LoadingIndicator>
            )}
          </ChatContainer>

          {error && <ErrorMessage>{error}</ErrorMessage>}

          <InputContainer>
            <TextArea
              ref={textAreaRef}
              value={currentInput}
              onChange={(e) => dispatch(setCurrentInput(e.target.value))}
              onKeyDown={handleKeyDown}
              placeholder={`Ask ${currentProvider.name} anything...`}
              disabled={loading}
            />
            <ButtonContainer>
              <div style={{ fontSize: '11px', color: '#969696' }}>
                Press Enter to send, Shift+Enter for new line
              </div>
              <SendButton 
                onClick={handleSendMessage}
                disabled={!currentInput.trim() || loading}
              >
                Send
              </SendButton>
            </ButtonContainer>
          </InputContainer>
        </>
      )}
    </AIPanelContainer>
  );
};

export default AIPanel;
