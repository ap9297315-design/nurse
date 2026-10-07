import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  MessageSquare,
  Sparkles,
  Send,
  X,
  Minimize2,
  Maximize2,
  Bot,
  User,
  RotateCcw,
  BookOpen,
  Volume2,
  Copy,
  Check,
  Paperclip,
  FileText,
  Bookmark,
  ExternalLink,
} from 'lucide-react';
import { ChatMessage } from '../types';
import { chatWithGeminiPreceptor, analyzePdfWithGemini } from '../services/geminiService';
import { audioSynth } from '../utils/audioSynthesizer';
import { useTheme } from '../context/ThemeContext';
import { useOwner } from '../context/OwnerContext';

interface AiAssistantChatProps {
  externalPrompt?: string | null;
  onClearExternalPrompt?: () => void;
  onOpenPdfExtractor?: () => void;
}

const QUICK_CLINICAL_PROMPTS = [
  'PPH: The 4 Ts & Step-by-Step Medical Protocol',
  'Pritchard vs Zuspan Regimen for Eclampsia with Antidote',
  'Calculate IV Drip: 1000 mL over 8 hrs (15 gtt/mL)',
  'Neonatal Golden Minute & MR. SOPA Algorithm',
  'Bio-Medical Waste: Disposal of Placenta vs IV Line',
];

export const AiAssistantChat: React.FC<AiAssistantChatProps> = ({
  externalPrompt,
  onClearExternalPrompt,
  onOpenPdfExtractor,
}) => {
  const { addXP } = useTheme();
  const { savePdfNote } = useOwner();

  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        'Hello! I am your 24/7 Clinical Nursing AI Preceptor. You can chat with me about clinical doubts, or click the paperclip 📎 to upload any textbook PDF to extract structured study notes and exam answers directly here!',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Attached PDF file state in chat
  const [attachedPdf, setAttachedPdf] = useState<{
    name: string;
    size: string;
    base64?: string;
    textSnippet?: string;
  } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  // If parent sends an external prompt, trigger it immediately
  useEffect(() => {
    if (externalPrompt) {
      setIsOpen(true);
      setIsMinimized(false);
      handleSendMessage(externalPrompt);
      onClearExternalPrompt?.();
    }
  }, [externalPrompt]);

  const handlePdfSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    const isPdf = file.type === 'application/pdf' || file.name.endsWith('.pdf');

    if (isPdf) {
      reader.readAsDataURL(file);
      reader.onload = () => {
        setAttachedPdf({
          name: file.name,
          size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
          base64: reader.result as string,
        });
        audioSynth.playClick();
      };
    } else {
      reader.readAsText(file);
      reader.onload = () => {
        setAttachedPdf({
          name: file.name,
          size: `${(file.size / 1024).toFixed(1)} KB`,
          textSnippet: (reader.result as string).slice(0, 4000),
        });
        audioSynth.playClick();
      };
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputValue;
    if ((!query.trim() && !attachedPdf) || isLoading) return;

    // If PDF is attached, analyze the PDF with Gemini
    if (attachedPdf) {
      const userText = query.trim() || `Analyze ${attachedPdf.name} and provide clinical study notes & model answers.`;
      const currentAttached = attachedPdf;

      const userMsg: ChatMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: `📎 **Attached Document**: ${currentAttached.name} (${currentAttached.size})\n\n${userText}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, userMsg]);
      setAttachedPdf(null);
      if (!textToSend) setInputValue('');
      setIsLoading(true);
      audioSynth.playClick();

      try {
        const response = await analyzePdfWithGemini({
          pdfBase64: currentAttached.base64,
          textExtraction: currentAttached.textSnippet,
          fileName: currentAttached.name,
          mode: userText.toLowerCase().includes('question') || userText.toLowerCase().includes('exam') ? 'exam-qa' : 'study-notes',
          customQuery: query.trim() || undefined,
        });

        const assistantMsg: ChatMessage = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: response.notes,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        setMessages((prev) => [...prev, assistantMsg]);

        // Automatically save note to user's portal
        savePdfNote({
          fileName: currentAttached.name,
          fileSize: currentAttached.size,
          mode: 'study-notes',
          content: response.notes,
          summary: `Extracted via AI Chat from ${currentAttached.name}`,
          tags: ['AI Assistant Chat', 'Uploaded PDF'],
        });

        audioSynth.playSuccessChime();
        addXP(35);
      } catch (err: any) {
        console.error(err);
        audioSynth.playErrorBuzz();
        const errorMsg: ChatMessage = {
          id: `assistant-err-${Date.now()}`,
          role: 'assistant',
          content: 'Unable to analyze the uploaded PDF. Please try again or open the dedicated PDF Notes Studio.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, errorMsg]);
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // Standard text conversation
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: query.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputValue('');
    setIsLoading(true);
    audioSynth.playClick();

    try {
      const history = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const reply = await chatWithGeminiPreceptor(query.trim(), history);

      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
      audioSynth.playSuccessChime();
      addXP(10);
    } catch (err) {
      console.error(err);
      audioSynth.playErrorBuzz();
      const errorMsg: ChatMessage = {
        id: `assistant-err-${Date.now()}`,
        role: 'assistant',
        content:
          'I apologize, but I encountered an error communicating with the clinical database. Please check your network connection and try again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <>
      {/* Floating Widget Trigger Button (Always On) */}
      {!isOpen && (
        <motion.button
          id="btn-open-ai-preceptor"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          onClick={() => {
            audioSynth.playClick();
            setIsOpen(true);
            setIsMinimized(false);
          }}
          className="fixed bottom-6 right-6 z-50 p-4 rounded-full bg-teal-600 hover:bg-teal-700 text-white shadow-xl flex items-center gap-2.5 transition active:scale-95 group border-2 border-white/20 backdrop-blur"
        >
          <div className="relative">
            <Bot className="w-6 h-6 group-hover:rotate-12 transition-transform" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          </div>
          <span className="text-xs font-bold tracking-wide pr-1">Ask AI Preceptor</span>
        </motion.button>
      )}

      {/* Floating Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="ai-assistant-modal"
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
              height: isMinimized ? '56px' : '560px',
            }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 right-6 z-50 w-[92vw] sm:w-[420px] rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col backdrop-blur-xl"
          >
            {/* Header */}
            <div className="p-3.5 bg-teal-600 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-teal-700/80 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-teal-100" />
                </div>
                <div>
                  <h3 className="text-xs font-bold leading-tight flex items-center gap-1.5">
                    Clinical AI Preceptor
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  </h3>
                  <p className="text-[10px] text-teal-100/80">
                    Always Online • INC Syllabus & Book Grounded
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                {onOpenPdfExtractor && (
                  <button
                    onClick={() => {
                      onOpenPdfExtractor();
                      setIsOpen(false);
                    }}
                    className="px-2 py-1 rounded-lg bg-teal-700/80 hover:bg-teal-800 text-[10px] font-bold text-white flex items-center gap-1 transition mr-1"
                    title="Open Full PDF Notes Studio"
                  >
                    <FileText className="w-3 h-3" />
                    <span>PDF Studio</span>
                  </button>
                )}
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-1 rounded-lg hover:bg-teal-700/80 text-teal-100 transition"
                  title={isMinimized ? 'Expand' : 'Minimize'}
                >
                  {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded-lg hover:bg-teal-700/80 text-teal-100 transition"
                  title="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Chat Body when not minimized */}
            {!isMinimized && (
              <>
                {/* Messages List */}
                <div className="flex-1 p-4 overflow-y-auto space-y-3.5 text-xs">
                  {messages.map((msg) => {
                    const isUser = msg.role === 'user';
                    return (
                      <div
                        key={msg.id}
                        className={`flex items-start gap-2.5 ${isUser ? 'flex-row-reverse' : ''}`}
                      >
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-bold ${
                            isUser
                              ? 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
                              : 'bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300'
                          }`}
                        >
                          {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                        </div>

                        <div
                          className={`max-w-[82%] rounded-2xl p-3 shadow-xs relative group ${
                            isUser
                              ? 'bg-teal-600 text-white rounded-tr-none'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-none border border-slate-200/70 dark:border-slate-700/60'
                          }`}
                        >
                          <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                          <div
                            className={`flex items-center justify-between text-[9px] mt-1.5 ${
                              isUser ? 'text-teal-200' : 'text-slate-400'
                            }`}
                          >
                            <span>{msg.timestamp}</span>
                            <button
                              onClick={() => handleCopyMessage(msg.id, msg.content)}
                              className="opacity-0 group-hover:opacity-100 transition hover:underline flex items-center gap-0.5 ml-2"
                            >
                              {copiedId === msg.id ? (
                                <Check className="w-3 h-3 text-emerald-400" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {isLoading && (
                    <div className="flex items-center gap-2 text-xs text-slate-500 italic p-2">
                      <Sparkles className="w-4 h-4 text-teal-600 animate-spin" />
                      <span>Clinical preceptor analyzing syllabus and reference books...</span>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Quick Prompts Carousel */}
                <div className="px-3 py-2 bg-slate-50 dark:bg-slate-850 border-t border-slate-200 dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                  {QUICK_CLINICAL_PROMPTS.map((prompt, pIdx) => (
                    <button
                      key={pIdx}
                      onClick={() => handleSendMessage(prompt)}
                      className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-teal-400 whitespace-nowrap transition"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>

                {/* Attached PDF indicator if present */}
                {attachedPdf && (
                  <div className="px-3 py-2 bg-teal-50 dark:bg-teal-950/60 border-t border-teal-200 dark:border-teal-800 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-teal-900 dark:text-teal-200 truncate">
                      <FileText className="w-4 h-4 text-teal-600 shrink-0" />
                      <span className="font-semibold truncate max-w-[240px]">{attachedPdf.name}</span>
                      <span className="text-[10px] text-teal-600/80">({attachedPdf.size})</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setAttachedPdf(null)}
                      className="p-1 text-teal-700 hover:text-rose-600 transition"
                      title="Remove attachment"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {/* Input Bar */}
                <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSendMessage();
                    }}
                    className="flex items-center gap-2"
                  >
                    <input
                      ref={pdfInputRef}
                      type="file"
                      accept=".pdf,.doc,.docx,.txt"
                      onChange={handlePdfSelected}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => pdfInputRef.current?.click()}
                      className={`p-2 rounded-xl border transition ${
                        attachedPdf
                          ? 'bg-teal-100 dark:bg-teal-950 border-teal-500 text-teal-600'
                          : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:text-teal-600 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                      title="Upload PDF or clinical document to extract notes & answers"
                    >
                      <Paperclip className="w-4 h-4" />
                    </button>

                    <input
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder={
                        attachedPdf
                          ? 'Press send to extract notes, or specify focus...'
                          : 'Ask clinical doubt, dosage math, or upload PDF...'
                      }
                      className="flex-1 px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                    <button
                      type="submit"
                      disabled={isLoading || (!inputValue.trim() && !attachedPdf)}
                      className="p-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white shadow-sm transition disabled:opacity-50"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
