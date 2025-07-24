'use client';

import { useState, useEffect, useRef } from 'react';
import styles from './ChatWidget.module.css';

const showChatbot = process.env.NEXT_PUBLIC_SHOW_CHATBOT === 'true';
console.log("Show Chatbot?", showChatbot);

export default function ChatWidget() {
    if (!showChatbot) return null;

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [studentId, setStudentId] = useState('S001');
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Auto-scroll to bottom
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');

    try {
      const res = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input, studentId })
      });

      const data = await res.json();
      const botMessage = { role: 'assistant', content: data.reply || '❌ Sorry, something went wrong.' };
      setMessages(prev => [...prev, botMessage]);
    } catch (err) {
      console.error('Chat error:', err);
      setMessages(prev => [...prev, { role: 'assistant', content: '❌ Sorry, something went wrong.' }]);
    }
  };

  return (
    <div className={styles.widgetContainer}>
      <button className={styles.toggleButton} onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? '✖' : '💬'}
      </button>

      {isOpen && (
        <div className={styles.chatWidget}>
          <div className={styles.header}>StudySahara AskBot</div>

          <div className={styles.chatBox}>
            {messages.map((msg, i) => (
              <div key={i} className={msg.role === 'user' ? styles.userMsg : styles.botMsg}>
                {msg.content}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className={styles.studentSelector}>
            <label>Student ID:&nbsp;</label>
            <select value={studentId} onChange={e => setStudentId(e.target.value)}>
              <option value="S001">S001</option>
              <option value="S002">S002</option>
              <option value="S003">S003</option>
            </select>
          </div>

          <div className={styles.inputArea}>
            <input
              type="text"
              value={input}
              placeholder="Type your message..."
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            />
            <button onClick={sendMessage}>Send</button>
          </div>
        </div>
      )}
    </div>
  );
}