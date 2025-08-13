'use client';

import { useState, useEffect, useRef } from 'react';

const showChatbot = process.env.NEXT_PUBLIC_SHOW_CHATBOT === 'true';

export default function AskBotPage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [lastBotQuestion, setLastBotQuestion] = useState('');
  const [isBotTyping, setIsBotTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const [conversationState, setConversationState] = useState({
    country: null,
    offerLetter: null,
    loanType: null,
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isBotTyping]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const trimmedInput = input.trim();
    const isShortReply = ['yes', 'no'].includes(trimmedInput.toLowerCase());
    const formattedInput = isShortReply && lastBotQuestion
      ? `${trimmedInput} (Answer to: ${lastBotQuestion})`
      : trimmedInput;

    const userMessage = { role: 'user', content: trimmedInput };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setIsBotTyping(true);

    try {
      const res = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          history: updatedMessages,
          message: formattedInput,
          state: conversationState,
        }),
      });

      const data = await res.json();
      const botReply = data.reply || '🤖 No response received.';
      const botMessage = { role: 'assistant', content: botReply };

      setTimeout(() => {
        setMessages(prev => [...prev, botMessage]);
        setIsBotTyping(false);

        const lastLine = botReply.trim().split('\n').filter(line => line.trim()).pop();
        if (lastLine && lastLine.endsWith('?')) {
          setLastBotQuestion(lastLine);
        }

        const replyLower = botReply.toLowerCase();

        if (replyLower.includes('received an offer')) {
          setConversationState(prev => ({ ...prev, country: 'USA' }));
        }
        if (replyLower.includes('who is your co-applicant') || replyLower.includes('relation of co-applicant')) {
          setConversationState(prev => ({ ...prev, offerLetter: 'yes' }));
        }
        if (replyLower.includes('fixed deposit') || replyLower.includes('property')) {
          setConversationState(prev => ({ ...prev, loanType: 'with collateral' }));
        }
      }, 1200);

    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: '❌ Something went wrong.' },
      ]);
      setIsBotTyping(false);
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

      <div className="border p-4 h-96 overflow-y-scroll rounded bg-white shadow-sm">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`mb-2 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}
          >
            <span
              className={
                msg.role === 'user' ? 'text-blue-600 font-semibold' : 'text-green-600 font-semibold'
              }
            >
              {msg.role === 'user' ? 'You' : 'AskBot'}:
            </span>{' '}
            {msg.content}
          </div>
        ))}

        {isBotTyping && (
          <div className="text-left text-green-600 font-semibold animate-pulse">
            AskBot: Typing...
          </div>
        )}

        <div ref={messagesEndRef} />
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