'use client';
import { useState, useRef, useEffect } from 'react';

type Message = {
  text: string;
  sender: 'user' | 'ollama' | 'error';
};

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = { text: input, sender: 'user' as const };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      
      const healthCheck = await fetch('http://localhost:11434/api/tags');
      if (!healthCheck.ok) {
        throw new Error('Ollama is not responding. Please check if the service is running.');
      }

      
      let response = await fetch('http://localhost:11434/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'llama2',
          messages: [{ role: 'user', content: input }],
          stream: false,
        }),
      });

      
      if (response.status === 404) {
        response = await fetch('http://localhost:11434/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: 'llama2',
            prompt: input,
            stream: false,
          }),
        });
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `API error: ${response.status}`);
      }

      const data = await response.json();
      const responseText = data.message?.content || data.response || 'Failed to get response';

      setMessages((prev) => [...prev, { text: responseText, sender: 'ollama' }]);

    } catch (error) {
      console.error('Error:', error);
      setMessages((prev) => [...prev, { 
        text: `ERROR: ${error instanceof Error ? error.message : 'Failed to communicate with Ollama'}`,
        sender: 'error' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-orange-900 p-4">
      <header className="py-2 mb-2">
        <h1 className="text-xl font-bold text-center text-orange-100">Chat with Ollama</h1>
      </header>

      <div className="flex-1 overflow-y-auto p-3 bg-orange-800 rounded-lg" style={{ maxHeight: '50vh' }}>
        {messages.length === 0 && (
          <div className="text-orange-200 text-center py-4">
            Type a message to begin...
          </div>
        )}
        
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`p-3 rounded-lg max-w-[80%] my-1 ${
              msg.sender === 'user'
                ? 'bg-orange-600 text-white ml-auto'
                : msg.sender === 'error'
                ? 'bg-red-700 text-orange-100'
                : 'bg-orange-700 text-orange-100'
            }`}
          >
            {msg.text}
          </div>
        ))}
        
        {isLoading && (
          <div className="p-3 rounded-lg bg-orange-700 text-orange-100 max-w-[80%] my-1">
            Processing...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="flex gap-2 mt-3 bg-orange-800 p-2 rounded-lg">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Type your message..."
          className="flex-1 p-2 border border-orange-600 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500 bg-orange-900 text-orange-100 placeholder-orange-400 text-sm"
          disabled={isLoading}
        />
        <button
          onClick={handleSend}
          disabled={isLoading}
          className="bg-orange-600 text-white p-2 rounded-lg hover:bg-orange-500 disabled:bg-orange-800 transition-colors text-sm"
        >
          Send
        </button>
      </div>
    </div>
  );
}