import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, BookOpenIcon, LanguageIcon } from '@heroicons/react/24/outline';
import ChapterCard from '../components/ChapterCard';
import BotAnimation from '../components/BotAnimation';
import api from '../api/axios';
import { cleanOCRText } from '../utils/contentCleaner';

interface BackendChapter {
  chapter: string;
  pages: number;
  chapters: string[];
}

interface EducationData {
  [category: string]: BackendChapter[];
}

const CATEGORY_ASSETS: Record<string, string> = {
  "Sexual Education": "/src/pages/sex_ed.jpeg",
  "Periods": "/src/pages/periods.jpg",
  "Women rights": "/src/pages/women_laws.jpg",
  
};

// Map backend keys to clean Display Names
const CATEGORY_MAP: Record<string, string> = {
  "other1": "Sexual Education 1",
  "other2": "Sexual Education 2",
  "other": "Sexual Education",
  "Other": "Sexual Education",
  "menstrual": "Periods",
  "rights": "Women Rights"
};

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिन्दी' },
  { code: 'mr', label: 'मराठी' },
  { code: 'bn', label: 'বাংলা' },
  { code: 'ta', label: 'தமிழ்' }
];

const Education = () => {
  const [categories, setCategories] = useState<EducationData>({});
  const [loading, setLoading] = useState(true);
  const [selectedChapterContent, setSelectedChapterContent] = useState<any>(null);
  const [isFetchingChapter, setIsFetchingChapter] = useState(false);
  const [lang, setLang] = useState('en'); 
  
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const fetchChapters = async () => {
      setLoading(true);
      try {
        // Passing language to the list endpoint
        const response = await api.get(`/chapter/list?lang=${lang}`);
        setCategories(response.data.chapters);
      } catch (error) {
        console.error("Error fetching chapters:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchChapters();
  }, [lang]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.load();
    }
  }, [selectedChapterContent]);

  const openChapter = async (chapterTitle: string) => {
    setIsFetchingChapter(true);
    try {
      // Passing language to the specific chapter fetch
      const response = await api.post(`/chapter/get-chapter?lang=${lang}`, {
        chapter: chapterTitle,
        lang: lang
      });
      setSelectedChapterContent(response.data);
    } catch (error) {
      console.error("Error fetching chapter content:", error);
    } finally {
      setIsFetchingChapter(false);
    }
  };

  const closeModal = () => setSelectedChapterContent(null);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <BotAnimation size="lg" />
        <p className="ml-4 text-gray-500 font-medium">Loading curriculum...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* HEADER WITH MULTI-LANGUAGE SELECTOR */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-12">
          <div className="text-left">
            <h1 className="font-poppins font-bold text-4xl text-gray-800 mb-2">Educational Resources</h1>
            <p className="text-lg text-gray-600">Medically-backed insights into your health and rights.</p>
          </div>

          <div className="mt-6 md:mt-0 flex flex-wrap gap-2 justify-center bg-white shadow-sm border rounded-2xl p-2">
            {LANGUAGES.map((l) => (
              <button 
                key={l.code}
                onClick={() => setLang(l.code)}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                  lang === l.code ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Chapter Sections */}
        {Object.entries(categories).map(([category, chapters]) => {
          // Remap category names for UI display
          const displayTitle = CATEGORY_MAP[category.toLowerCase()] || category;
          
          // Image lookup based on remapped title (removes numbers for image matching)
          const imageKey = displayTitle.replace(/\s\d+$/, ""); 
          const localImage = CATEGORY_ASSETS[imageKey] || CATEGORY_ASSETS["Default"];

          return (
            <div key={category} className="mb-12">
              <div className="flex items-center space-x-2 mb-6 border-b border-gray-200 pb-2">
                <BookOpenIcon className="h-6 w-6 text-indigo-600" />
                <h2 className="text-2xl font-bold text-gray-800 uppercase tracking-wide">
                  {displayTitle}
                </h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {chapters.map((ch, index) => (
                  <motion.div
                    key={ch.chapter}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <ChapterCard
                      title={ch.chapter}
                      description={`Detailed module covering ${ch.pages} pages of insights.`}
                      duration={`${ch.pages * 5} min`}
                      image={localImage} 
                      completed={false}
                      onClick={() => openChapter(ch.chapter)}
                    />
                  </motion.div>
                ))}
              </div>
            </div>
          );
        })}

        {/* Modal for Chapter Content */}
        <AnimatePresence>
          {selectedChapterContent && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4"
              onClick={closeModal}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[85vh] overflow-hidden flex flex-col"
              >
                <div className="p-6 border-b flex justify-between items-center bg-gray-50">
                  <h2 className="text-2xl font-bold text-gray-800">{selectedChapterContent.chapter}</h2>
                  <button onClick={closeModal} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                    <XMarkIcon className="h-6 w-6 text-gray-600" />
                  </button>
                </div>

                <div className="p-8 overflow-y-auto prose prose-indigo max-w-none">
                  {selectedChapterContent.speech_file && (
                    <div className="mb-6 bg-indigo-50 p-4 rounded-2xl flex items-center space-x-4">
                      <div className="p-3 bg-indigo-600 rounded-full text-white">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-indigo-900">Audio Lesson Available</p>
                        <audio 
                          ref={audioRef}
                          controls 
                          src={`${import.meta.env.VITE_API_BASE_URL}/static/${selectedChapterContent.speech_file}`} 
                          className="mt-2 h-8 w-full" 
                        />
                      </div>
                    </div>
                  )}

                  <div className="whitespace-pre-line text-gray-700 text-lg leading-relaxed">
                    {cleanOCRText(selectedChapterContent.content)}
                  </div>
                </div>

                <div className="p-6 border-t bg-gray-50 flex justify-end">
                  <button onClick={closeModal} className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-200">
                    Done Reading
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Education;