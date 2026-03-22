import React, { useState } from "react";
import MainLayout from "../layouts/MainLayout";
import Accordion from "../components/Accordion";
import { X, Send } from "lucide-react";
import chatbotData from "../data/chatbotQA.json";

export default function FAQs() {
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, type: "bot", text: "Hello i am Civi Assistant Bot! 👋 I'm here to help. Do you have any questions about CivicWatch?" }
  ]);
  const [inputValue, setInputValue] = useState("");

  const items = [
    {
      q: "How do I file a complaint?",
      a: "Register and use the File Complaint form. Provide evidence and contact details.",
    },
    {
      q: "Can I upload documents later?",
      a: "Yes, use Upload Evidence and reference your complaint ID.",
    },
    {
      q: "How long does investigation take?",
      a: "Timelines vary by department; check status regularly.",
    },
  ];

  // Find best matching answer from chatbot data
  const findAnswerForQuestion = (userQuestion) => {
    const lowerUserQuestion = userQuestion.toLowerCase().trim();
    
    // Direct or close match
    for (let item of chatbotData) {
      const lowerFaqQuestion = item.question.toLowerCase();
      if (lowerFaqQuestion.includes(lowerUserQuestion) || lowerUserQuestion.includes(lowerFaqQuestion)) {
        return item.answer;
      }
    }

    // Keyword-based matching
    const userWords = lowerUserQuestion.split(" ").filter(word => word.length > 3);
    let bestMatch = null;
    let maxMatches = 0;

    for (let item of chatbotData) {
      const faqWords = item.question.toLowerCase().split(" ");
      let matches = 0;
      
      for (let userWord of userWords) {
        if (faqWords.some(faqWord => faqWord.includes(userWord) || userWord.includes(faqWord))) {
          matches++;
        }
      }
      
      if (matches > maxMatches) {
        maxMatches = matches;
        bestMatch = item.answer;
      }
    }

    if (bestMatch && maxMatches > 0) {
      return bestMatch;
    }

    return null;
  };

  const handleSendMessage = () => {
    if (inputValue.trim() === "") return;

    const userMessage = {
      id: messages.length + 1,
      type: "user",
      text: inputValue
    };

    setMessages([...messages, userMessage]);
    setInputValue("");

    // Bot response
    setTimeout(() => {
      const answer = findAnswerForQuestion(inputValue);
      const botMessage = {
        id: messages.length + 2,
        type: "bot",
        text: answer || "That's a great question! I couldn't find a specific answer, but our support team can help. Check the FAQs above or contact us. 📋"
      };
      setMessages(prev => [...prev, botMessage]);
    }, 500);
  };

  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto relative">
        <h1 className="header-title">FAQs</h1>
        <p className="subtle mt-1">Common questions about the process.</p>

        <div className="mt-6">
          <Accordion items={items} />
        </div>

        {/* Robot - Clickable */}
        <div 
          onClick={() => setChatOpen(true)}
          className="fixed bottom-8 right-8 z-40 hidden md:block cursor-pointer hover:scale-110 transition-transform duration-300"
        >
          <div className="animate-bounce">
            <svg width="56" height="68" viewBox="0 0 120 140" className="drop-shadow-lg hover:drop-shadow-xl transition-all">
              {/* Body */}
              <rect x="30" y="50" width="60" height="70" rx="8" fill="#4F46E5" stroke="#312E81" strokeWidth="2" />
              
              {/* Head */}
              <circle cx="60" cy="30" r="20" fill="#4F46E5" stroke="#312E81" strokeWidth="2" />
              
              {/* Left Eye */}
              <rect x="45" y="20" width="8" height="14" rx="2" fill="#FFD700" stroke="#312E81" strokeWidth="1" />
              <circle cx="49" cy="25" r="2" fill="#312E81" />
              
              {/* Right Eye */}
              <rect x="67" y="20" width="8" height="14" rx="2" fill="#FFD700" stroke="#312E81" strokeWidth="1" />
              <circle cx="71" cy="25" r="2" fill="#312E81" />
              
              {/* Antenna Left */}
              <line x1="45" y1="12" x2="40" y2="2" stroke="#312E81" strokeWidth="2" strokeLinecap="round" />
              <circle cx="40" cy="2" r="3" fill="#FF6B6B" />
              
              {/* Antenna Right */}
              <line x1="75" y1="12" x2="80" y2="2" stroke="#312E81" strokeWidth="2" strokeLinecap="round" />
              <circle cx="80" cy="2" r="3" fill="#FF6B6B" />
              
              {/* Screen Glow */}
              <rect x="35" y="55" width="50" height="40" rx="4" fill="#00D9FF" opacity="0.3" stroke="#00D9FF" strokeWidth="1" />
              
              {/* LED Lights */}
              <circle cx="42" cy="60" r="3" fill="#4ADE80" />
              <circle cx="60" cy="60" r="3" fill="#FBBF24" />
              <circle cx="78" cy="60" r="3" fill="#FF6B6B" />
              
              {/* Left Arm */}
              <g>
                <rect x="15" y="70" width="15" height="12" rx="6" fill="#312E81" />
                <circle cx="15" cy="76" r="5" fill="#FF6B6B" />
              </g>
              
              {/* Right Arm */}
              <g>
                <rect x="90" y="70" width="15" height="12" rx="6" fill="#312E81" />
                <circle cx="105" cy="76" r="5" fill="#FF6B6B" />
              </g>
              
              {/* Left Foot */}
              <rect x="35" y="125" width="14" height="10" rx="2" fill="#312E81" stroke="#312E81" strokeWidth="1" />
              
              {/* Right Foot */}
              <rect x="71" y="125" width="14" height="10" rx="2" fill="#312E81" stroke="#312E81" strokeWidth="1" />
              
              {/* Smile */}
              <path d="M 50 40 Q 60 45 70 40" stroke="#312E81" strokeWidth="2" fill="none" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* Chat Modal */}
        {chatOpen && (
          <div className="fixed bottom-8 right-8 w-96 h-screen md:h-auto md:w-80 md:rounded-lg md:bottom-28 bg-white shadow-2xl flex flex-col z-50 md:max-h-96 border border-gray-200">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4 flex items-center justify-between rounded-t-lg md:rounded-t-lg">
              <div className="flex items-center gap-2">
                <svg width="24" height="24" viewBox="0 0 120 140" className="drop-shadow">
                  <circle cx="60" cy="30" r="15" fill="#FFD700" />
                  <rect x="35" y="50" width="50" height="50" rx="6" fill="#00D9FF" opacity="0.5" />
                </svg>
                <h3 className="font-semibold">Assistant Bot</h3>
              </div>
              <button
                onClick={() => setChatOpen(false)}
                className="hover:bg-white/20 p-1 rounded transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-xs px-4 py-2 rounded-lg ${
                      msg.type === "user"
                        ? "bg-purple-600 text-white rounded-br-none"
                        : "bg-gray-200 text-gray-800 rounded-bl-none"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Input */}
            <div className="border-t border-gray-200 p-3 flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder="Ask me anything..."
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-600"
              />
              <button
                onClick={handleSendMessage}
                className="bg-purple-600 hover:bg-purple-700 text-white p-2 rounded-lg transition-colors"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
