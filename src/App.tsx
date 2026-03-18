import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { 
  MapPin, 
  Mountain, 
  Waves, 
  Wind, 
  Trees, 
  Search, 
  Send, 
  User, 
  Bot, 
  Compass,
  ChevronRight,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { createChatSession, sendMessageToChat } from './services/geminiService';
import { fetchAttractions, areaCodes, Attraction } from './services/tourApiService';
import { Chat } from '@google/genai';

interface Message {
  id: string;
  role: 'user' | 'bot';
  content: string;
}

const topographyOptions = [
  { id: '해안', name: '해안', icon: Waves, description: '바다, 해변, 절벽' },
  { id: '산지', name: '산지', icon: Mountain, description: '산, 능선, 숲' },
  { id: '하천', name: '하천', icon: Wind, description: '강, 계곡, 폭포' },
  { id: '평야', name: '평야', icon: Trees, description: '들판, 넓은 땅' },
  { id: '섬', name: '섬', icon: Compass, description: '바다 위 지역' },
];

export default function App() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'bot',
      content: '안녕! 나는 너의 국토 지형 여행 도우미야. 어느 지역의 지형이 궁금하니? 지역과 지형을 선택해 봐!',
    },
  ]);
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedTopography, setSelectedTopography] = useState('');
  const [attractions, setAttractions] = useState<Attraction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isAttractionsLoading, setIsAttractionsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const chatRef = useRef<Chat | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleRegionSelect = async (region: string) => {
    setSelectedRegion(region);
    setError(null);
    setIsAttractionsLoading(true);
    try {
      const areaCode = areaCodes[region];
      const fetchedAttractions = await fetchAttractions(areaCode);
      setAttractions(fetchedAttractions);
    } catch (err) {
      console.error(err);
      // Don't show error here, just fail silently or log
    } finally {
      setIsAttractionsLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!selectedRegion || !selectedTopography) {
      setError('지역과 지형을 모두 선택해 주세요!');
      return;
    }

    setError(null);
    setIsSearching(true);
    
    try {
      // Use existing attractions if available, otherwise fetch
      let currentAttractions = attractions;
      if (currentAttractions.length === 0) {
        const areaCode = areaCodes[selectedRegion];
        currentAttractions = await fetchAttractions(areaCode);
        setAttractions(currentAttractions);
      }

      const attractionsList = currentAttractions
        .slice(0, 5)
        .map(a => `${a.title} (${a.addr1})`)
        .join(', ');

      // Create a new chat session when a new search is performed
      const chat = createChatSession(selectedRegion, attractionsList, selectedTopography);
      chatRef.current = chat;

      const userMessage = `${selectedRegion}의 ${selectedTopography} 지형에 대해 알려줘!`;
      const newMessages: Message[] = [
        ...messages,
        { id: Date.now().toString(), role: 'user', content: userMessage }
      ];
      setMessages(newMessages);
      
      setIsLoading(true);
      const botResponse = await sendMessageToChat(chat, userMessage);
      
      setMessages(prev => [
        ...prev,
        { id: (Date.now() + 1).toString(), role: 'bot', content: botResponse || '미안해, 답변을 가져오지 못했어.' }
      ]);
    } catch (err) {
      console.error(err);
      setError('정보를 가져오는 중에 문제가 생겼어. 다시 시도해 볼래?');
    } finally {
      setIsSearching(false);
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    const newMessages: Message[] = [
      ...messages,
      { id: Date.now().toString(), role: 'user', content: text }
    ];
    setMessages(newMessages);
    
    setIsLoading(true);
    try {
      if (!chatRef.current) {
        // If no chat session exists, create one with current context
        const attractionsList = attractions.slice(0, 5).map(a => a.title).join(', ');
        chatRef.current = createChatSession(selectedRegion, attractionsList, selectedTopography);
      }
      
      const botResponse = await sendMessageToChat(chatRef.current, text);
      
      setMessages(prev => [
        ...prev,
        { id: (Date.now() + 1).toString(), role: 'bot', content: botResponse || '미안해, 답변을 가져오지 못했어.' }
      ]);
    } catch (err) {
      console.error(err);
      setError('답변을 가져오는 중에 문제가 생겼어.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col p-4 md:p-8 max-w-6xl mx-auto gap-8">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="relative">
          <motion.div
            initial={{ rotate: -10, scale: 0.8 }}
            animate={{ rotate: 0, scale: 1 }}
            className="absolute -top-10 -left-10 text-6xl"
          >
            🗺️
          </motion.div>
          <h1 className="text-5xl md:text-7xl font-jua text-[#4D96FF] tracking-normal mb-2 drop-shadow-sm">
            지형 탐험대
          </h1>
          <p className="text-[#6BCB77] text-2xl font-bold opacity-90">
            우리 땅의 숨겨진 보물을 찾아 떠나는 모험! ✨
          </p>
        </div>
        <div className="flex items-center gap-3 text-xl font-jua text-[#4D96FF] bg-white px-8 py-4 rounded-full border-4 border-[#4D96FF]/20 shadow-xl shadow-[#4D96FF]/5">
          <div className="w-3 h-3 bg-[#6BCB77] rounded-full animate-pulse" />
          <span>탐험 준비 완료!</span>
        </div>
      </header>

      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 min-h-0">
        {/* Left: Controls */}
        <div className="lg:col-span-4 flex flex-col gap-8">
          <section className="kid-card p-8 flex flex-col gap-8">
            <div>
              <label className="flex items-center gap-2 text-2xl font-jua mb-6 text-[#2D3436]">
                <MapPin size={28} className="text-[#4D96FF]" /> 1. 어디로 갈까?
              </label>
              <div className="grid grid-cols-3 gap-3">
                {Object.keys(areaCodes).map((region) => (
                  <button
                    key={region}
                    onClick={() => handleRegionSelect(region)}
                    className={`py-3 px-1 rounded-2xl font-jua text-xl transition-all transform hover:scale-105 active:scale-95 border-4 flex items-center justify-center leading-tight ${
                      selectedRegion === region
                        ? 'bg-[#4D96FF] text-white border-[#4D96FF] shadow-lg shadow-[#4D96FF]/30'
                        : 'bg-white text-[#4D96FF] border-[#4D96FF]/10 hover:border-[#4D96FF]/30'
                    }`}
                  >
                    {region.length === 4 ? (
                      <div className="flex flex-col">
                        <span>{region.slice(0, 2)}</span>
                        <span>{region.slice(2)}</span>
                      </div>
                    ) : (
                      region
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 text-2xl font-jua mb-6 text-[#2D3436]">
                <Mountain size={28} className="text-[#6BCB77]" /> 2. 무엇을 볼까?
              </label>
              <div className="grid grid-cols-1 gap-3">
                {topographyOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setSelectedTopography(option.id)}
                    className={`flex items-center gap-4 p-5 rounded-[2rem] transition-all transform hover:scale-[1.02] active:scale-[0.98] border-4 ${
                      selectedTopography === option.id
                        ? 'bg-[#F0F7FF] border-[#4D96FF] shadow-inner'
                        : 'bg-white border-[#4D96FF]/5 hover:border-[#4D96FF]/20'
                    }`}
                  >
                    <div className={`p-4 rounded-2xl text-3xl ${
                      selectedTopography === option.id ? 'bg-[#4D96FF] text-white' : 'bg-[#F0F7FF] text-[#4D96FF]'
                    }`}>
                      <option.icon size={32} />
                    </div>
                    <div className="text-left">
                      <div className="font-jua text-2xl text-[#2D3436]">{option.name}</div>
                      <div className="text-base text-[#4D96FF] font-bold opacity-80">{option.description}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleSearch}
              disabled={isSearching || !selectedRegion || !selectedTopography}
              className="w-full kid-button-primary flex items-center justify-center gap-3"
            >
              {isSearching ? <Loader2 className="animate-spin" /> : <Search size={24} />}
              탐험 시작!! 🚀
            </button>
          </section>

          {/* Attractions List */}
          <AnimatePresence>
            {(isAttractionsLoading || attractions.length > 0) && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="kid-card p-8 bg-white border-[#DEE2E6]"
              >
                <h3 className="font-jua text-3xl mb-6 flex items-center gap-3 text-[#2D3436]">
                  <Compass size={32} className="text-[#FFD93D]" /> 추천 여행지 ⭐
                </h3>
                
                {isAttractionsLoading ? (
                  <div className="flex flex-col items-center justify-center py-12 gap-4 text-[#4D96FF]">
                    <Loader2 className="animate-spin" size={48} />
                    <div className="font-jua text-2xl">멋진 곳을 찾고 있어요!</div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {attractions.slice(0, 3).map((attraction, idx) => (
                      <motion.div 
                        key={`${attraction.title}-${idx}`} 
                        whileHover={{ scale: 1.02, x: 5 }}
                        className="p-6 bg-[#F0F7FF] rounded-[2rem] border-4 border-[#4D96FF]/10 shadow-sm hover:border-[#4D96FF]/30 transition-all"
                      >
                        <div className="font-jua text-2xl text-[#2D3436]">{attraction.title}</div>
                        <div className="text-lg text-[#4D96FF] mt-1 font-bold opacity-80">{attraction.addr1}</div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.section>
            )}
          </AnimatePresence>
        </div>

        {/* Right: Chat */}
        <div className="lg:col-span-8 flex flex-col min-h-[600px]">
          <div className="kid-card flex-1 flex flex-col overflow-hidden bg-white">
            {/* Chat Header */}
            <div className="p-8 border-b-4 border-[#F0F7FF] flex items-center justify-between bg-[#F0F7FF]/30">
              <div className="flex items-center gap-5">
                <div className="w-20 h-20 bg-[#4D96FF] rounded-[2rem] flex items-center justify-center text-white shadow-xl shadow-[#4D96FF]/20">
                  <Bot size={48} />
                </div>
                <div>
                  <div className="font-jua text-3xl text-[#2D3436]">탐험 대장 봇</div>
                  <div className="text-lg text-[#6BCB77] font-bold flex items-center gap-2">
                    <span className="w-3 h-3 bg-[#6BCB77] rounded-full animate-pulse" />
                    함께 모험을 떠나요! 🎒✨
                  </div>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-8 space-y-10"
            >
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex gap-4 max-w-[90%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${
                      msg.role === 'user' ? 'bg-[#4D96FF] text-white' : 'bg-[#FFD93D] text-[#2D3436]'
                    }`}>
                      {msg.role === 'user' ? <User size={28} /> : <Bot size={28} />}
                    </div>
                    <div className={`p-8 rounded-[2.5rem] text-xl leading-relaxed shadow-sm ${
                      msg.role === 'user' 
                        ? 'bg-[#4D96FF] text-white rounded-tr-none' 
                        : 'bg-[#F0F7FF] text-[#2D3436] rounded-tl-none border-4 border-[#4D96FF]/5'
                    }`}>
                      {msg.role === 'bot' ? (
                        <div className="markdown-body">
                          <ReactMarkdown>{msg.content}</ReactMarkdown>
                        </div>
                      ) : (
                        msg.content
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-[#F0F7FF] p-8 rounded-[2.5rem] rounded-tl-none shadow-sm border-4 border-[#4D96FF]/5">
                    <div className="flex gap-3">
                      <div className="w-3 h-3 bg-[#4D96FF] rounded-full animate-bounce" />
                      <div className="w-3 h-3 bg-[#4D96FF] rounded-full animate-bounce [animation-delay:0.2s]" />
                      <div className="w-3 h-3 bg-[#4D96FF] rounded-full animate-bounce [animation-delay:0.4s]" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-8 bg-white border-t-4 border-[#F0F7FF]">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const input = e.currentTarget.elements.namedItem('message') as HTMLInputElement;
                  handleSendMessage(input.value);
                  input.value = '';
                }}
                className="relative"
              >
                <input
                  name="message"
                  type="text"
                  placeholder="대장님께 무엇이든 물어보세요! 💬"
                  className="kid-input w-full pr-24 py-6 text-xl"
                />
                <button
                  type="submit"
                  disabled={isLoading}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-16 h-16 bg-[#4D96FF] text-white rounded-2xl flex items-center justify-center hover:bg-[#3B82F6] transition-all disabled:opacity-50 shadow-xl shadow-[#4D96FF]/20 active:translate-y-[4px]"
                >
                  <Send size={32} />
                </button>
              </form>
              <p className="text-lg text-center mt-6 text-[#4D96FF] font-jua opacity-60">
                여러분의 호기심은 세상을 바꾸는 힘이에요! 🚀🌟
              </p>
            </div>
          </div>
        </div>
      </main>

      {error && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          className="fixed bottom-12 left-1/2 -translate-x-1/2 bg-[#FF6B6B] text-white px-8 py-4 rounded-full border-4 border-white shadow-2xl flex items-center gap-3 font-jua text-xl z-50"
        >
          <AlertCircle size={28} />
          {error}
        </motion.div>
      )}

      {/* Footer */}
      <footer className="mt-8 text-center text-[#4D96FF] font-jua text-2xl opacity-60">
        <p>© 2026 지형 탐험대 | 우리 땅의 보물을 찾아서! 💎🗺️</p>
      </footer>
    </div>
  );
}
