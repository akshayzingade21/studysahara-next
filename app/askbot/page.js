'use client';

import { useState } from 'react';

const showChatbot = process.env.NEXT_PUBLIC_SHOW_CHATBOT === 'true';

export default function AskBotPage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  const sendMessage = async () => {
    if (!input) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');

    try {
      const res = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input }),
      });

      const data = await res.json();
      const botMessage = { role: 'assistant', content: data.reply };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: '❌ Something went wrong.' },
      ]);
    }
  };

  if (!showChatbot) {
    return (
      <div className="p-4 max-w-xl mx-auto">
        <h1 className="text-xl font-bold text-center mt-20">
          AskBot is temporarily disabled.
        </h1>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h1 className="text-xl font-bold mb-4">Ask StudySahara Anything</h1>
      <div className="border p-4 h-96 overflow-y-scroll rounded">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`mb-2 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}
          >
            <span
              className={
                msg.role === 'user' ? 'text-blue-600' : 'text-green-600'
              }
            >
              {msg.role === 'user' ? 'You' : 'AskBot'}:
            </span>{' '}
            {msg.content}
          </div>
        ))}
      </div>
      <div className="mt-4 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your question..."
          className="border p-2 flex-grow rounded"
        />
        <button
          onClick={sendMessage}
          className="bg-blue-600 text-white px-4 rounded"
        >
          Send
        </button>
      </div>
    </div>
  );
}