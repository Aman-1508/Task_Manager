import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, Project } from '../types';
import { api } from '../api';
import { 
  Sparkles, 
  X, 
  Send, 
  Bot, 
  User as UserIcon, 
  Flame, 
  ArrowRightLeft, 
  CheckCircle2, 
  ListPlus,
  Loader2,
  TrendingUp
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface ChatbotDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentProject: Project | null;
  onRefreshData: () => Promise<void>;
  initialPrompt?: string | null;
}

export const ChatbotDrawer: React.FC<ChatbotDrawerProps> = ({
  isOpen,
  onClose,
  currentProject,
  onRefreshData,
  initialPrompt,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: `👋 **Hello! I'm your TaskFlow AI Copilot.**\n\nI actively monitor your team's workload to **prevent burnout** and can **decompose complex user stories** into estimated tasks!\n\nHow can I assist you today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [executingActionId, setExecutingActionId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      if (initialPrompt) {
        handleSendMessage(initialPrompt);
      }
    }
  }, [isOpen, initialPrompt]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputValue;
    if (!query.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await api.sendChatMessage(query, currentProject?.id || '');
      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        text: response.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actionType: response.actionType,
        actionData: response.actionData,
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `error-${Date.now()}`,
        sender: 'system',
        text: '❌ Could not reach AI Copilot service. Please try again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  // 1-Click Action: Execute Workload Rebalancing
  const handleExecuteRebalance = async (actionData: any, msgId: string) => {
    try {
      setExecutingActionId(msgId);
      await api.executeRebalance(actionData.reassignments);
      await onRefreshData();

      // Confetti celebration
      try {
        confetti({
          particleCount: 70,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#10B981', '#6366F1', '#3B82F6'],
        });
      } catch (e) {}

      // Confirmation message in chat
      setMessages((prev) => [
        ...prev,
        {
          id: `sys-${Date.now()}`,
          sender: 'assistant',
          text: `🎉 **Workload Rebalanced Successfully!**\n\nAll tasks have been transferred in the database. The team avatar pulses have relaxed back to normal!`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch (err: any) {
      alert('Failed to execute rebalance: ' + err.message);
    } finally {
      setExecutingActionId(null);
    }
  };

  // 1-Click Action: Apply AI Task Breakdown
  const handleApplyBreakdown = async (actionData: any, msgId: string) => {
    try {
      setExecutingActionId(msgId);
      await api.applyTaskBreakdown(actionData.projectId, actionData.tasks);
      await onRefreshData();

      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#6366F1', '#8B5CF6'],
        });
      } catch (e) {}

      setMessages((prev) => [
        ...prev,
        {
          id: `sys-${Date.now()}`,
          sender: 'assistant',
          text: `✅ **Tasks Added to Board!**\n\n${actionData.tasks.length} new decomposed tasks are now ready in your **To-Do** column.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch (err: any) {
      alert('Failed to add tasks: ' + err.message);
    } finally {
      setExecutingActionId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[480px] bg-[#0A0E1A] border-l border-slate-800 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
      
      {/* Header */}
      <div className="p-4 border-b border-slate-800 bg-[#0F1626] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-violet-500/20">
            <Sparkles className="w-4 h-4 text-amber-300" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-xs font-bold text-slate-100">TaskFlow AI Copilot</h3>
              <span className="px-1.5 py-0.2 rounded text-[9px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                Active
              </span>
            </div>
            <p className="text-[10px] text-slate-400">Workload balancer &amp; task breakdown engine</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Suggested Prompt Chips */}
      <div className="px-4 py-2 bg-slate-900/60 border-b border-slate-800/80 flex items-center gap-1.5 overflow-x-auto text-[11px] no-scrollbar">
        <button
          onClick={() => handleSendMessage('Rebalance team workload')}
          className="flex-shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-500/10 hover:bg-red-500/20 text-red-300 border border-red-500/30 transition"
        >
          <Flame className="w-3 h-3 text-red-400" />
          <span>Rebalance Burnout</span>
        </button>
        <button
          onClick={() => handleSendMessage('Break down Stripe Payment integration')}
          className="flex-shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-full bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 transition"
        >
          <ListPlus className="w-3 h-3 text-indigo-400" />
          <span>Breakdown Feature</span>
        </button>
        <button
          onClick={() => handleSendMessage('Give me a standup summary')}
          className="flex-shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
        >
          <TrendingUp className="w-3 h-3 text-slate-400" />
          <span>Standup</span>
        </button>
      </div>

      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          const isSystem = msg.sender === 'system';

          return (
            <div
              key={msg.id}
              className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="w-7 h-7 rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                  isUser
                    ? 'bg-indigo-600 text-white rounded-tr-none'
                    : isSystem
                    ? 'bg-red-950/40 border border-red-500/40 text-red-200'
                    : 'bg-[#131B2E] border border-slate-800 text-slate-200 rounded-tl-none shadow-sm'
                }`}
              >
                {/* Render message text with basic formatting */}
                <div className="whitespace-pre-line space-y-1">
                  {msg.text}
                </div>

                {/* Embedded 1-Click Action: Rebalance */}
                {msg.actionType === 'REBALANCE_SUGGESTION' && msg.actionData && (
                  <div className="mt-3 pt-3 border-t border-slate-800/80">
                    <button
                      onClick={() => handleExecuteRebalance(msg.actionData, msg.id)}
                      disabled={executingActionId === msg.id}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-semibold text-xs shadow-md shadow-red-600/20 transition active:scale-95 disabled:opacity-50"
                    >
                      {executingActionId === msg.id ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Rebalancing Database...</span>
                        </>
                      ) : (
                        <>
                          <ArrowRightLeft className="w-3.5 h-3.5" />
                          <span>Execute Workload Rebalancing Now</span>
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* Embedded 1-Click Action: Apply Task Breakdown */}
                {msg.actionType === 'TASK_BREAKDOWN_PROPOSAL' && msg.actionData && (
                  <div className="mt-3 pt-3 border-t border-slate-800/80">
                    <button
                      onClick={() => handleApplyBreakdown(msg.actionData, msg.id)}
                      disabled={executingActionId === msg.id}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md shadow-indigo-600/25 transition active:scale-95 disabled:opacity-50"
                    >
                      {executingActionId === msg.id ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Adding to Board...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Add All Tasks to To-Do Board</span>
                        </>
                      )}
                    </button>
                  </div>
                )}

                <div className="mt-1 text-[9px] text-slate-500 text-right">
                  {msg.timestamp}
                </div>
              </div>

              {isUser && (
                <div className="w-7 h-7 rounded-lg bg-slate-800 text-slate-300 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <UserIcon className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}

        {isLoading && (
          <div className="flex gap-2.5 items-center text-slate-400 text-xs pl-9">
            <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
            <span>AI Copilot is thinking...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <div className="p-3.5 bg-[#0F1626] border-t border-slate-800">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask AI Copilot (e.g. 'Rebalance workload', 'Break down auth')..."
            className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isLoading}
            className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition disabled:opacity-40"
            title="Send message"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

    </div>
  );
};
