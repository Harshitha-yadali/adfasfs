import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bot, Send, X } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export const FloatingChatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showFaq, setShowFaq] = useState(true);
  const [showAllChips, setShowAllChips] = useState(false);

  const GEMINI_KEY = import.meta.env.VITE_GEMINI_API_KEY;

  useEffect(() => {
    console.log("Gemini API Key Loaded:", GEMINI_KEY ? "Loaded" : "Undefined");
  }, [GEMINI_KEY]);

  const toggleOpen = () => {
    if (isOpen) {
      setMessages([]);
      setShowFaq(true);
      setShowAllChips(false);
    }
    setIsOpen((prev) => !prev);
  };

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;
    setShowFaq(false);

    const userMsg = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const systemPrompt = `
You are PrimoBoost AI, the official support assistant for PrimoBoostAI.in.

Your goal:
Sound like a real, friendly customer support chatbot - short sentences, conversational tone, no "Question:" or "Answer:" labels.

Guidelines:
- Never use markdown (**bold**, asterisks, etc.).
- Never use emojis or decorative symbols.
- Keep replies professional and natural, like human chat support.
- Keep each response under 5 lines.
- Use line breaks to make answers easy to read.

If the user asks about:
- "PrimoBoost AI" - explain the platform (AI-powered resume optimization, job matching, interview prep).
- "resume optimization" - explain the feature simply.
- "job listings" - explain that daily jobs are posted and matched with JD-based resumes.
- "pricing", "plans", "subscription", "buy", or "payment" - show clear plan details below.

Pricing (One-time purchase, 50% OFF):
Leader Plan - ₹16,400 - 100 Resume Credits
Achiever Plan - ₹13,200 - 50 Resume Credits
Accelerator Plan - ₹11,600 - 25 Resume Credits
Starter Plan - ₹1,640 - 10 Resume Credits
Kickstart Plan - ₹1,320 - 5 Resume Credits

Each plan includes Resume Optimizations, ATS Score Checks, and Premium Support.

End payment-related answers with:
"For billing or payment issues, email primoboostai@gmail.com with a screenshot. Our team replies within 2 minutes."
`;

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                role: "user",
                parts: [{ text: `${systemPrompt}\n\nUser: ${text}` }],
              },
            ],
          }),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || "Gemini API error");

      const reply =
        data?.candidates?.[0]?.content?.parts?.[0]?.text ||
        "Sorry, I'm having trouble right now. Please try again later.";

      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch (err) {
      console.error("Chat Error:", err);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "There seems to be a connection issue. Please try again or email primoboostai@gmail.com for quick support.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const faqs = [
    "What is PrimoBoost AI?",
    "How do I optimize my resume?",
    "Tell me about job listings.",
    "How do I fix payment issues?",
    "Explain subscription plans.",
    "How to contact support?",
  ];
  const chips = showAllChips ? faqs : faqs.slice(0, 4);

  return (
    <div className="fixed bottom-5 right-4 z-50 flex flex-col items-end gap-3 sm:bottom-7 sm:right-6">
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[1px]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={toggleOpen}
            />
            <motion.div
              key="chat-window"
              className="fixed inset-x-0 bottom-0 z-50 flex justify-center px-3 sm:px-6"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 36 }}
              transition={{ type: "spring", damping: 18, stiffness: 220 }}
            >
              <motion.div className="w-full max-w-[640px] overflow-hidden rounded-t-[22px] bg-white shadow-[0_-18px_50px_rgba(0,0,0,0.18)] dark:bg-gray-900">
                <div className="relative flex h-14 items-center justify-between border-b border-gray-200 px-4 dark:border-gray-800">
                  <div className="absolute left-1/2 top-2 -translate-x-1/2 w-12 h-1.5 rounded-full bg-gray-300 dark:bg-gray-700" />
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-700 dark:bg-gray-800 dark:text-white">
                      <Bot className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold leading-tight text-gray-900 dark:text-gray-100">
                        PrimoBoost AI Assistant
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Quick answers, resume help</p>
                    </div>
                  </div>
                  <button
                    onClick={toggleOpen}
                    className="flex h-11 w-11 items-center justify-center rounded-full text-gray-600 hover:bg-gray-100 transition dark:text-gray-300 dark:hover:bg-gray-800"
                    aria-label="Close chatbot"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="flex min-h-[55vh] h-[60vh] max-h-[70vh] flex-col bg-white dark:bg-gray-900">
                  <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
                    {messages.map((msg, idx) => (
                      <div
                        key={idx}
                        className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed whitespace-pre-line ${
                            msg.role === "user"
                              ? "bg-gradient-to-br from-blue-600 to-indigo-600 text-white"
                              : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                          }`}
                        >
                          {msg.content}
                        </div>
                      </div>
                    ))}
                    {loading && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 animate-pulse">
                        PrimoBoost AI is typing...
                      </p>
                    )}
                  </div>

                  {showFaq && (
                    <div className="border-t border-gray-200 bg-gray-50 px-4 py-3 dark:bg-gray-900 dark:border-gray-800">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">Quick replies</p>
                        {!showAllChips && (
                          <button
                            onClick={() => setShowAllChips(true)}
                            className="text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-neon-cyan-400"
                          >
                            More...
                          </button>
                        )}
                      </div>
                      <div className="flex overflow-x-auto gap-2 pb-1">
                        {chips.map((f) => (
                          <button
                            key={f}
                            onClick={() => sendMessage(f)}
                            className="flex-shrink-0 rounded-2xl bg-blue-100 text-blue-800 px-3 py-2 text-xs font-semibold hover:bg-blue-200 transition dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700"
                          >
                            {f}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <form
                    onSubmit={handleSend}
                    className="flex items-center gap-2 border-t border-gray-200 bg-gray-50 px-3 py-3 dark:border-gray-800 dark:bg-gray-900"
                  >
                    <input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Ask about resumes, jobs, or pricing..."
                      className="flex-1 h-12 rounded-2xl border border-gray-200 bg-white px-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                    />
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow hover:scale-105 transition disabled:opacity-60"
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  </form>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <motion.button
        key="chat-toggle"
        onClick={toggleOpen}
        initial={false}
        animate={{ scale: 1, rotate: isOpen ? 90 : 0 }}
        whileTap={{ scale: 0.9 }}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 via-indigo-500 to-blue-700 text-white shadow-lg hover:shadow-xl focus:outline-none"
        aria-label={isOpen ? "Close chatbot" : "Open chatbot"}
      >
        {isOpen ? <X className="h-6 w-6" /> : <Bot className="h-6 w-6" />}
      </motion.button>
    </div>
  );
};
