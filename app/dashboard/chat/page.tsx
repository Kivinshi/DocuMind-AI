'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  FileText,
  Send,
  Copy,
  ThumbsUp,
  ThumbsDown,
  X
} from 'lucide-react'

const mockMessages = [
  {
    id: 1,
    type: 'assistant',
    content: 'Hello! I&apos;ve analyzed your Q4 Financial Report. How can I help you understand it better?'
  },
  {
    id: 2,
    type: 'user',
    content: 'What were the main revenue drivers in Q4?'
  },
  {
    id: 3,
    type: 'assistant',
    content: 'Based on the financial report, the main revenue drivers in Q4 were:\n\n1. **Product Sales**: 45% increase YoY, representing $125M in revenue\n2. **Enterprise Contracts**: New contracts worth $89M signed\n3. **Subscription Services**: Recurring revenue grew 32% to $156M\n\nThe strongest growth came from the enterprise segment, which now represents 58% of total revenue.'
  }
]

export default function ChatPage() {
  const [messages, setMessages] = useState(mockMessages)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    const userMessage = {
      id: messages.length + 1,
      type: 'user' as const,
      content: input
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setLoading(true)

    setTimeout(() => {
      const assistantMessage = {
        id: messages.length + 2,
        type: 'assistant' as const,
        content: 'I&apos;m analyzing your question about the document. This is a demo response - in production, this would come from the AI model.'
      }
      setMessages(prev => [...prev, assistantMessage])
      setLoading(false)
    }, 1000)
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
            <FileText className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h1 className="font-semibold">Q4 Financial Report.pdf</h1>
            <p className="text-sm text-foreground/60">2.4 MB • PDF Document</p>
          </div>
        </div>
        <Button variant="ghost" size="sm">
          <X className="w-5 h-5" />
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-2xl px-4 py-3 rounded-lg ${
                message.type === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-card border border-border'
              }`}
            >
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
              {message.type === 'assistant' && (
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border/30">
                  <button className="p-1 hover:bg-secondary rounded transition" title="Copy">
                    <Copy className="w-4 h-4 text-foreground/60" />
                  </button>
                  <button className="p-1 hover:bg-secondary rounded transition" title="Like">
                    <ThumbsUp className="w-4 h-4 text-foreground/60" />
                  </button>
                  <button className="p-1 hover:bg-secondary rounded transition" title="Dislike">
                    <ThumbsDown className="w-4 h-4 text-foreground/60" />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-card border border-border rounded-lg px-4 py-3">
              <div className="flex gap-2">
                <div className="w-2 h-2 bg-foreground/60 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-foreground/60 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-foreground/60 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-border bg-card/50 backdrop-blur-sm p-6">
        <form onSubmit={handleSend} className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me anything about this document..."
            className="flex-1 px-4 py-3 bg-secondary border border-border rounded-lg text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-accent"
            disabled={loading}
          />
          <Button
            type="submit"
            className="gap-2"
            disabled={loading || !input.trim()}
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
        <p className="text-xs text-foreground/50 mt-2">
          Press Enter to send or click the send button
        </p>
      </div>
    </div>
  )
}
