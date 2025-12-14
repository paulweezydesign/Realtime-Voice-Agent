/**
 * Agency Interface with Conversation Memory
 * Features: Streaming, keyboard shortcuts, code highlighting, conversation history
 */

'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Send, Bot, User, Loader2, CheckCircle2, AlertCircle, Copy, Check,
  MessageSquare, Plus, Trash2, Menu, X
} from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  toolCalls?: Array<{ id: string; name: string; result?: any }>;
  isStreaming?: boolean;
}

interface Thread {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, any>;
}

// Code block component with copy button
function CodeBlock({ code, language = 'typescript' }: { code: string; language?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group my-3">
      <button
        onClick={handleCopy}
        className="absolute top-2 right-2 p-2 bg-slate-700 hover:bg-slate-600 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
        title="Copy code"
      >
        {copied ? (
          <Check className="w-4 h-4 text-green-400" />
        ) : (
          <Copy className="w-4 h-4 text-slate-300" />
        )}
      </button>
      <SyntaxHighlighter
        language={language}
        style={vscDarkPlus}
        customStyle={{
          margin: 0,
          borderRadius: '0.5rem',
          fontSize: '0.875rem',
        }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}

// Parse message content for code blocks
function MessageContent({ content }: { content: string }) {
  const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
  const parts: Array<{ type: 'text' | 'code'; content: string; language?: string }> = [];
  let lastIndex = 0;
  let match;

  while ((match = codeBlockRegex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      parts.push({
        type: 'text',
        content: content.slice(lastIndex, match.index),
      });
    }

    parts.push({
      type: 'code',
      content: match[2].trim(),
      language: match[1] || 'typescript',
    });

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < content.length) {
    parts.push({
      type: 'text',
      content: content.slice(lastIndex),
    });
  }

  if (parts.length === 0) {
    return <p className="whitespace-pre-wrap">{content}</p>;
  }

  return (
    <>
      {parts.map((part, index) => {
        if (part.type === 'code') {
          return <CodeBlock key={index} code={part.content} language={part.language} />;
        }
        return <p key={index} className="whitespace-pre-wrap">{part.content}</p>;
      })}
    </>
  );
}

export default function AgencyInterfaceWithMemory() {
  // User/resource ID - in production this would come from auth
  const resourceId = 'user-default';
  
  // State
  const [threads, setThreads] = useState<Thread[]>([]);
  const [currentThreadId, setCurrentThreadId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loadingThreads, setLoadingThreads] = useState(true);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Load threads on mount
  useEffect(() => {
    loadThreads();
  }, []);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const loadThreads = async () => {
    try {
      setLoadingThreads(true);
      const response = await fetch(`/api/threads?resourceId=${resourceId}`);
      const data = await response.json();
      
      if (data.success) {
        setThreads(data.threads || []);
      }
    } catch (err) {
      console.error('Failed to load threads:', err);
    } finally {
      setLoadingThreads(false);
    }
  };

  const createNewThread = async () => {
    try {
      const response = await fetch('/api/threads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resourceId,
          title: 'New Conversation',
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setThreads((prev) => [data.thread, ...prev]);
        setCurrentThreadId(data.thread.id);
        setMessages([{
          id: '1',
          role: 'assistant',
          content: 'Hello! I\'m the Project Manager of your development agency. How can we help you today?',
          timestamp: new Date(),
        }]);
      }
    } catch (err) {
      console.error('Failed to create thread:', err);
      setError('Failed to create new conversation');
    }
  };

  const deleteThread = async (threadId: string) => {
    try {
      const response = await fetch(`/api/threads?threadId=${threadId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setThreads((prev) => prev.filter((t) => t.id !== threadId));
        if (currentThreadId === threadId) {
          setCurrentThreadId(null);
          setMessages([]);
        }
      }
    } catch (err) {
      console.error('Failed to delete thread:', err);
    }
  };

  const selectThread = (threadId: string) => {
    setCurrentThreadId(threadId);
    // In production, you'd load messages from the thread here
    setMessages([{
      id: '1',
      role: 'assistant',
      content: 'Conversation loaded! Continue where you left off.',
      timestamp: new Date(),
    }]);
  };

  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    e?.preventDefault();
    
    if (!input.trim() || isStreaming) return;

    // Create thread if none exists
    if (!currentThreadId) {
      await createNewThread();
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsStreaming(true);
    setError(null);

    const assistantMessageId = (Date.now() + 1).toString();
    const assistantMessage: Message = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isStreaming: true,
    };

    setMessages((prev) => [...prev, assistantMessage]);
    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch('/api/agency/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage.content,
          threadId: currentThreadId,
          resourceId,
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error('Failed to get response from agency');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No reader available');
      }

      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = JSON.parse(line.slice(6));

            if (data.type === 'text') {
              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === assistantMessageId
                    ? { ...msg, content: msg.content + data.content }
                    : msg
                )
              );
            } else if (data.type === 'toolCalls') {
              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === assistantMessageId
                    ? { ...msg, toolCalls: data.toolCalls }
                    : msg
                )
              );
            } else if (data.type === 'done') {
              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === assistantMessageId
                    ? { ...msg, isStreaming: false }
                    : msg
                )
              );
            } else if (data.type === 'error') {
              throw new Error(data.error);
            }
          }
        }
      }

      // Reload threads to get updated title
      await loadThreads();
      
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        console.log('Stream aborted');
      } else {
        setError(err instanceof Error ? err.message : 'An error occurred');
        console.error('Chat error:', err);
        setMessages((prev) => prev.filter((msg) => msg.id !== assistantMessageId));
      }
    } finally {
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  }, [input, isStreaming, currentThreadId, resourceId]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit]
  );

  const handleCancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  return (
    <div className="flex h-full bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? 'w-80' : 'w-0'
        } transition-all duration-300 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col overflow-hidden`}
      >
        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
          <button
            onClick={createNewThread}
            className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
          >
            <Plus className="w-5 h-5" />
            New Conversation
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {loadingThreads ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
            </div>
          ) : threads.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-8">
              No conversations yet
            </p>
          ) : (
            threads.map((thread) => (
              <div
                key={thread.id}
                className={`group relative p-3 rounded-lg cursor-pointer transition-colors ${
                  currentThreadId === thread.id
                    ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                    : 'hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
                onClick={() => selectThread(thread.id)}
              >
                <div className="flex items-start gap-2">
                  <MessageSquare className="w-4 h-4 mt-1 flex-shrink-0 text-slate-400" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                      {thread.title}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {new Date(thread.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteThread(thread.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 dark:hover:bg-red-900/20 rounded transition-opacity"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              {sidebarOpen ? (
                <X className="w-5 h-5 text-slate-600 dark:text-slate-400" />
              ) : (
                <Menu className="w-5 h-5 text-slate-600 dark:text-slate-400" />
              )}
            </button>
            <div className="p-2 bg-blue-500 rounded-lg">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                Development Agency
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {currentThreadId ? 
                  (isStreaming ? 'Typing...' : 'Ready') : 
                  'Start a new conversation'
                }
              </p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {!currentThreadId ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <Bot className="w-16 h-16 text-slate-300 dark:text-slate-600 mb-4" />
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                Welcome to Your Development Agency
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-md">
                Start a new conversation to work with our team of specialized AI agents
              </p>
              <button
                onClick={createNewThread}
                className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium flex items-center gap-2 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Start New Conversation
              </button>
            </div>
          ) : (
            <>
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${
                    message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                  }`}
                >
                  <div
                    className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      message.role === 'user'
                        ? 'bg-blue-500'
                        : 'bg-gradient-to-br from-purple-500 to-blue-500'
                    }`}
                  >
                    {message.role === 'user' ? (
                      <User className="w-5 h-5 text-white" />
                    ) : (
                      <Bot className="w-5 h-5 text-white" />
                    )}
                  </div>

                  <div
                    className={`flex-1 max-w-3xl ${
                      message.role === 'user' ? 'text-right' : 'text-left'
                    }`}
                  >
                    <div
                      className={`inline-block px-4 py-3 rounded-2xl ${
                        message.role === 'user'
                          ? 'bg-blue-500 text-white'
                          : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      <MessageContent content={message.content} />
                      
                      {message.isStreaming && (
                        <div className="mt-2 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                          <Loader2 className="w-3 h-3 animate-spin" />
                          <span>Generating...</span>
                        </div>
                      )}
                      
                      {message.toolCalls && message.toolCalls.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-600 space-y-2">
                          <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                            Agents Called:
                          </p>
                          {message.toolCalls.map((call) => (
                            <div
                              key={call.id}
                              className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400"
                            >
                              <CheckCircle2 className="w-3 h-3" />
                              <span>{call.name.replace('delegate-to-', '').replace('-', ' ')}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 px-1">
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}

              {error && (
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-red-500">
                    <AlertCircle className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 max-w-3xl">
                    <div className="inline-block px-4 py-3 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                      <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input Form */}
        {currentThreadId && (
          <div className="bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 px-6 py-4">
            <form onSubmit={handleSubmit} className="flex gap-3">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Describe your project or ask for help... (Cmd/Ctrl + Enter to send)"
                className="flex-1 px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 resize-none"
                disabled={isStreaming}
                rows={3}
              />
              <div className="flex flex-col gap-2">
                {isStreaming ? (
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-6 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-medium transition-colors flex items-center gap-2"
                  >
                    <AlertCircle className="w-5 h-5" />
                    <span>Cancel</span>
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={!input.trim()}
                    className="px-6 py-3 rounded-xl bg-blue-500 hover:bg-blue-600 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white font-medium transition-colors flex items-center gap-2 disabled:cursor-not-allowed"
                  >
                    <Send className="w-5 h-5" />
                    <span>Send</span>
                  </button>
                )}
              </div>
            </form>
            
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 text-center">
              ⌨️ Cmd/Ctrl + Enter to send • 💾 Conversations saved automatically
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

