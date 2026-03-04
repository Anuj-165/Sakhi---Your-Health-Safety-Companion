import React, { useState, useRef, useEffect, useImperativeHandle, forwardRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PaperAirplaneIcon, SpeakerWaveIcon, MicrophoneIcon, StopIcon } from '@heroicons/react/24/outline';
import api from '../api/axios'; // Import the axios instance we discussed earlier

interface Message {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
  audioUrl?: string; // To play the tts_file from backend
}

export interface ChatBoxHandle {
  sendMessage: (text: string) => void;
}

const ChatBox = forwardRef<ChatBoxHandle, {}>((_, ref) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hello! I'm your Sakhi assistant. I'm here to help you with any questions about women's health. How can I help you today?",
      isBot: true,
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Expose sendMessage to parent components (for Popular Topics)
  useImperativeHandle(ref, () => ({
    sendMessage: (text: string) => {
      handleApiCall(text);
    },
  }));

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  /**
   * CORE API LOGIC - TEXT
   */
  const handleApiCall = async (text: string) => {
    if (!text.trim()) return;

    // 1. Add User Message to UI
    const userMsg: Message = {
      id: Date.now().toString(),
      text,
      isBot: false,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    try {
      // 2. Call FastAPI /qa/
      const response = await api.post('/qa/', {
        question: text,
        lang: "en" // You can make this dynamic based on a state
      });

      const { answer, speech_file } = response.data;

      // 3. Add Bot Message to UI
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: answer,
        isBot: true,
        timestamp: new Date(),
        // Assuming backend serves files from /static/
        audioUrl: speech_file ? `http://localhost:8000/static/${speech_file}` : undefined,
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      console.error("Backend Error:", error);
      // Fallback message
      setMessages(prev => [...prev, {
        id: 'err',
        text: "I'm sorry, I'm having trouble connecting to my brain right now. Please try again.",
        isBot: true,
        timestamp: new Date(),
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  /**
   * CORE API LOGIC - SPEECH
   */
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => audioChunksRef.current.push(e.data);
      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/mpeg' });
        await handleSpeechApiCall(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setIsRecording(true);
    } catch (err) {
      alert("Microphone access denied or not supported.");
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  const handleSpeechApiCall = async (audioBlob: Blob) => {
    setIsTyping(true);
    const formData = new FormData();
    formData.append('file', audioBlob, 'voice_query.mp3');

    try {
      const response = await api.post('/qa/speech-question', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const { question_text, answer, speech_file } = response.data;

      // Update UI with transcribed text and bot answer
      setMessages(prev => [
        ...prev, 
        { id: Date.now().toString(), text: question_text, isBot: false, timestamp: new Date() },
        { 
          id: (Date.now()+1).toString(), 
          text: answer, 
          isBot: true, 
          timestamp: new Date(),
          audioUrl: speech_file ? `http://localhost:8000/static/${speech_file}` : undefined
        }
      ]);
    } catch (error) {
      console.error("Speech API Error:", error);
    } finally {
      setIsTyping(false);
    }
  };

  const playAudio = (url: string) => {
    const audio = new Audio(url);
    audio.play();
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-200">
        <AnimatePresence initial={false}>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}
            >
              <div
                className={`max-w-[85%] lg:max-w-md px-4 py-3 rounded-2xl shadow-sm ${
                  message.isBot
                    ? 'bg-gray-100 text-gray-800 rounded-tl-none'
                    : 'bg-indigo-600 text-white rounded-tr-none'
                }`}
              >
                <p className="text-sm leading-relaxed">{message.text}</p>
                <div className={`flex items-center mt-2 ${message.isBot ? 'justify-between' : 'justify-end'}`}>
                  <span className="text-[10px] opacity-60">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {message.isBot && message.audioUrl && (
                    <button
                      onClick={() => playAudio(message.audioUrl!)}
                      className="ml-2 p-1 rounded-full hover:bg-gray-200 transition-colors"
                    >
                      <SpeakerWaveIcon className="h-4 w-4 text-indigo-600" />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-100 px-4 py-4 rounded-2xl rounded-tl-none">
              <div className="flex space-x-1">
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" />
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-gray-100">
        <div className="flex items-center space-x-2 bg-gray-50 p-2 rounded-2xl border border-gray-200 focus-within:ring-2 focus-within:ring-indigo-500 transition-all">
          <button
            onClick={isRecording ? stopRecording : startRecording}
            className={`p-2 rounded-xl transition-colors ${
              isRecording ? 'bg-red-100 text-red-600 animate-pulse' : 'hover:bg-gray-200 text-gray-500'
            }`}
          >
            {isRecording ? <StopIcon className="h-6 w-6" /> : <MicrophoneIcon className="h-6 w-6" />}
          </button>

          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleApiCall(inputText)}
            placeholder={isRecording ? "Listening..." : "Type your health question..."}
            className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-2"
            disabled={isRecording}
          />

          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => handleApiCall(inputText)}
            disabled={!inputText.trim() || isRecording}
            className="bg-indigo-600 text-white p-2 rounded-xl disabled:opacity-30"
          >
            <PaperAirplaneIcon className="h-5 w-5" />
          </motion.button>
        </div>
      </div>
    </div>
  );
});

export default ChatBox;