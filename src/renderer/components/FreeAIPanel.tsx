import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { addMessage, setIsLoading, setAuthenticated } from '../store/features/ai/aiSlice';

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
  background: linear-gradient(135deg, #4285f4, #34a853);
  border: none;
  border-radius: 6px;
  color: white;
  padding: 8px 16px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;
  
  &:hover:not(:disabled) {
    background: linear-gradient(135deg, #3367d6, #2e7d32);
    transform: translateY(-1px);
  }
  
  &:disabled {
    background: #555;
    cursor: not-allowed;
    transform: none;
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
  gap: 20px;
`;

const LoginPrompt = styled.div`
  color: #cccccc;
  font-size: 14px;
  line-height: 1.6;
  max-width: 300px;
`;

const FreeLabel = styled.div`
  background: linear-gradient(135deg, #4caf50, #2e7d32);
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
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
  max-width: 85%;
  padding: 10px 14px;
  border-radius: 12px;
  background: ${props => props.isUser ? 'linear-gradient(135deg, #0078d4, #106ebe)' : '#2d2d30'};
  color: #cccccc;
  font-size: 13px;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-word;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

const CodeBlock = styled.pre`
  background: #1e1e1e;
  border: 1px solid #333;
  border-radius: 6px;
  padding: 12px;
  margin: 8px 0;
  overflow-x: auto;
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 12px;
  box-shadow: inset 0 1px 3px rgba(0,0,0,0.2);
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
  border-radius: 6px;
  color: #cccccc;
  padding: 10px;
  font-family: inherit;
  font-size: 13px;
  resize: none;
  min-height: 60px;
  max-height: 120px;
  transition: border-color 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: #0078d4;
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
  background: linear-gradient(135deg, #0078d4, #106ebe);
  border: none;
  border-radius: 6px;
  color: white;
  padding: 8px 16px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover:not(:disabled) {
    background: linear-gradient(135deg, #106ebe, #005a9e);
    transform: translateY(-1px);
  }
  
  &:disabled {
    background: #555;
    cursor: not-allowed;
    transform: none;
  }
`;

const QuickActions = styled.div`
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
`;

const QuickActionButton = styled.button`
  background: #2d2d30;
  border: 1px solid #555;
  border-radius: 4px;
  color: #cccccc;
  padding: 6px 10px;
  font-size: 11px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: #383838;
    border-color: #0078d4;
  }
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
  border-top-color: #0078d4;
  animation: spin 1s ease-in-out infinite;
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const FeatureList = styled.div`
  color: #999;
  font-size: 11px;
  line-height: 1.5;
  text-align: left;
  
  li {
    margin: 4px 0;
  }
`;

export const FreeAIPanel: React.FC = () => {
  const dispatch = useDispatch();
  const { messages, isLoading, isAuthenticated, user } = useSelector((state: RootState) => state.ai);
  const [input, setInput] = useState('');
  const [error, setError] = useState('');
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
      dispatch(setAuthenticated({ 
        isAuthenticated: authStatus.isAuthenticated, 
        user: authStatus.user 
      }));
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
        dispatch(setAuthenticated({ 
          isAuthenticated: true, 
          user: result.user 
        }));
        // Add welcome message
        dispatch(addMessage({
          role: 'assistant',
          content: `🎉 Welcome to Vibe Editor's FREE AI Assistant!\n\nYou're now connected via your ChatGPT account - no API keys or costs involved! I'm here to help you with coding, explanations, and building amazing projects.\n\nTry asking me about JavaScript, Python, or any programming topic!`,
          timestamp: Date.now()
        }));
      }
    } catch (error: any) {
      console.error('Google login error:', error);
      setError(error.message || 'Failed to authenticate. Please try again.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await (window as any).electronAPI.chatgptLogout();
      dispatch(setAuthenticated({ 
        isAuthenticated: false, 
        user: null 
      }));
    } catch (error: any) {
      console.error('Logout error:', error);
      setError(error.message || 'Failed to logout');
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;
    
    if (!isAuthenticated) {
      setError('Please login with your Google account first to use the free AI assistant.');
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
      const apiMessages = messages
        .filter(msg => msg.role !== 'error')
        .map(msg => ({
          role: msg.role,
          content: msg.content
        }));

      apiMessages.push({
        role: 'user',
        content: userMessage
      });

      const response = await (window as any).electronAPI.chatgptSendMessage(apiMessages);
      
      if (response && response.choices && response.choices[0]) {
        dispatch(addMessage({
          role: 'assistant',
          content: response.choices[0].message.content,
          timestamp: Date.now()
        }));
      } else {
        throw new Error('Invalid response from ChatGPT');
      }
    } catch (error: any) {
      console.error('ChatGPT error:', error);
      setError(error.message || 'Failed to send message');
      dispatch(addMessage({
        role: 'error',
        content: `Error: ${error.message || 'Failed to send message'}`,
        timestamp: Date.now()
      }));
    } finally {
      dispatch(setIsLoading(false));
    }
  };

  const handleQuickAction = (action: string) => {
    let prompt = '';
    switch (action) {
      case 'explain':
        prompt = 'Please explain how to write clean, maintainable code';
        break;
      case 'example':
        prompt = 'Show me a useful programming example';
        break;
      case 'debug':
        prompt = 'Help me debug common programming issues';
        break;
      case 'tips':
        prompt = 'Give me some programming tips for beginners';
        break;
    }
    setInput(prompt);
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

  if (!isAuthenticated) {
    return (
      <AIContainer>
        <AIHeader>
          <span>🤖 AI Assistant</span>
          <FreeLabel>100% FREE</FreeLabel>
        </AIHeader>
        <LoginContainer>
          <div style={{ fontSize: '48px', marginBottom: '10px' }}>🎉</div>
          <LoginPrompt>
            <strong>Welcome to FREE AI Assistant!</strong>
            <br /><br />
            Login with your existing Google account to access ChatGPT directly in the editor - no API keys or costs required!
          </LoginPrompt>
          
          <FeatureList>
            <strong>✅ What's FREE:</strong>
            <li>• Direct ChatGPT access via Google login</li>
            <li>• Code explanations and examples</li>
            <li>• Programming help and debugging</li>
            <li>• No subscription or API fees</li>
            <li>• Complete privacy protection</li>
          </FeatureList>

          <LoginButton onClick={handleGoogleLogin} disabled={authLoading}>
            {authLoading ? (
              <>
                <LoadingSpinner />
                Connecting...
              </>
            ) : (
              <>
                <span style={{ fontSize: '14px' }}>🔗</span>
                Login with Google Account
              </>
            )}
          </LoginButton>

          {error && <ErrorMessage>{error}</ErrorMessage>}
          
          <div style={{ fontSize: '10px', color: '#666', marginTop: '20px' }}>
            Your account stays secure - we only use it to connect to ChatGPT
          </div>
        </LoginContainer>
      </AIContainer>
    );
  }

  return (
    <AIContainer>
      <AIHeader>
        <span>🤖 AI Assistant</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FreeLabel>FREE</FreeLabel>
          {user && (
            <UserInfo>
              <UserAvatar src={user.picture} alt="User" />
              <span>{user.name}</span>
              <LogoutButton onClick={handleLogout}>Logout</LogoutButton>
            </UserInfo>
          )}
        </div>
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
            💡 Explain Code
          </QuickActionButton>
          <QuickActionButton onClick={() => handleQuickAction('example')}>
            📝 Show Example
          </QuickActionButton>
          <QuickActionButton onClick={() => handleQuickAction('debug')}>
            🐛 Debug Help
          </QuickActionButton>
          <QuickActionButton onClick={() => handleQuickAction('tips')}>
            🎯 Pro Tips
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
          placeholder="Ask your FREE AI assistant anything about coding... (Ctrl+Enter to send)"
        />
        
        <ButtonContainer>
          <SendButton onClick={handleSendMessage} disabled={isLoading || !input.trim()}>
            {isLoading ? <LoadingSpinner /> : '🚀 Send'}
          </SendButton>
          <span style={{ fontSize: '11px', color: '#999' }}>
            Powered by your ChatGPT account - 100% FREE!
          </span>
        </ButtonContainer>
      </InputContainer>
    </AIContainer>
  );
};
