'use client';
import { useState, useRef, useEffect } from 'react';
import {
  ChatContainer,
  Header,
  Title,
  MessagesContainer,
  EmptyState,
  MessageBubble,
  TypingIndicator,
  InputContainer,
  Input,
  Button
} from './styles';

type Message = {
  text: string;
  sender: 'user' | 'ollama' | 'error' | 'typing';
};

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = { text: input, sender: 'user' as const };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    const typingMessage = { text: '', sender: 'typing' as const };
    setMessages((prev) => [...prev, typingMessage]);
    const typingIndex = messages.length;

    timeoutRef.current = setTimeout(() => {
      setMessages(prev => {
        const updated = [...prev];
        if (updated[typingIndex]?.sender === 'typing') {
          updated[typingIndex] = { 
            text: 'Gemma está processando sua resposta...', 
            sender: 'typing' 
          };
        }
        return updated;
      });
    }, 3000);

    try {
      const response = await fetch('http://localhost:11434/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'gemma:7b',
          messages: [{ role: 'user', content: input }],
          stream: true,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `API error: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No reader available');

      let fullResponse = '';
      const decoder = new TextDecoder();
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter(line => line.trim() !== '');

        for (const line of lines) {
          try {
            const parsed = JSON.parse(line);
            const content = parsed.message?.content || parsed.response || '';
            fullResponse += content;
            
            setMessages(prev => {
              const updated = [...prev];
              updated[typingIndex] = { text: fullResponse, sender: 'typing' };
              return updated;
            });
          } catch (e) {
            console.error('Error parsing chunk:', e);
          }
        }
      }

      setMessages(prev => {
        const updated = [...prev];
        updated[typingIndex] = { text: fullResponse, sender: 'ollama' };
        return updated;
      });

    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => {
        const updated = [...prev];
        updated[typingIndex] = { 
          text: `ERROR: ${error instanceof Error ? error.message : 'Failed to communicate with Ollama'}`,
          sender: 'error' 
        };
        return updated;
      });
    } finally {
      clearTimeout(timeoutRef.current);
      setIsLoading(false);
    }
  };

  return (
    <ChatContainer>
      <Header>
        <Title>Chat with Gemma 7B</Title>
      </Header>

      <MessagesContainer>
        {messages.length === 0 && (
          <EmptyState>Type a message to begin...</EmptyState>
        )}
        
        {messages.map((msg, index) => (
          <MessageBubble key={index} sender={msg.sender}>
            {msg.text}
            {msg.sender === 'typing' && <TypingIndicator>|</TypingIndicator>}
          </MessageBubble>
        ))}
        
        <div ref={messagesEndRef} />
      </MessagesContainer>

      <InputContainer>
        <Input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Type your message..."
          disabled={isLoading}
        />
        <Button
          onClick={handleSend}
          disabled={isLoading}
        >
          Send
        </Button>
      </InputContainer>
    </ChatContainer>
  );
}