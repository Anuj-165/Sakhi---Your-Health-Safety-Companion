import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ExclamationTriangleIcon, 
  ShieldCheckIcon, 
  LanguageIcon,
  EyeSlashIcon,
  ScaleIcon,
  HandRaisedIcon
} from '@heroicons/react/24/outline';
import api from '../api/axios'; // Your axios instance with auth headers

interface AnalysisResult {
  risky: string;
  risky_probability: number;
  crime_type: string;
  law: string;
  punishment: string;
}

const StoryAlert = () => {
  const [story, setStory] = useState('');
  const [language, setLanguage] = useState('en');
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'Hindi' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
  ];

  // Debounced API call to the ML model
  const analyzeContent = useCallback(async (text: string) => {
    if (text.length < 20) {
      setAnalysis(null);
      return;
    }

    setIsAnalyzing(true);
    try {
      const response = await api.post('/story/analyze-story', {
        story: text,
        lang: language
      });
      setAnalysis(response.data);
    } catch (error) {
      console.error("Analysis failed", error);
    } finally {
      setIsAnalyzing(false);
    }
  }, [language]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (story) analyzeContent(story);
    }, 1000); // 1 second debounce
    return () => clearTimeout(timer);
  }, [story, analyzeContent]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Final submission logic
    console.log('Final Submission:', { story, analysis });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <h1 className="font-poppins font-bold text-4xl text-gray-900 mb-4 tracking-tight">Share Your Story</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Your voice helps build a safer community. Our AI monitors for risk to provide immediate legal and safety support.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Input Area */}
          <div className="lg:col-span-2 space-y-6">
            <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
              <div className="flex flex-col sm:flex-row gap-6 mb-6">
                <div className="flex-1">
                  <label className="text-xs font-bold uppercase text-gray-400 mb-2 block">Detection Language</label>
                  <div className="relative">
                    <LanguageIcon className="h-5 w-5 absolute left-4 top-3.5 text-gray-400" />
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-primary appearance-none"
                    >
                      {languages.map((lang) => <option key={lang.code} value={lang.code}>{lang.name}</option>)}
                    </select>
                  </div>
                </div>
                <div className="flex items-center pt-6">
                  <label className="flex items-center space-x-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={isAnonymous}
                      onChange={(e) => setIsAnonymous(e.target.checked)}
                      className="h-6 w-6 text-primary rounded-lg border-gray-200 focus:ring-primary"
                    />
                    <span className="text-sm font-medium text-gray-600 group-hover:text-primary transition-colors">Post Anonymously</span>
                  </label>
                </div>
              </div>

              <div className="relative">
                <textarea
                  rows={10}
                  value={story}
                  onChange={(e) => setStory(e.target.value)}
                  className="w-full px-6 py-5 bg-gray-50 border-none rounded-3xl focus:ring-2 focus:ring-primary resize-none text-gray-800 placeholder-gray-400"
                  placeholder="Tell us what happened..."
                />
                {isAnalyzing && (
                  <div className="absolute bottom-4 right-6 flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent"></div>
                    <span className="text-xs text-gray-400 font-medium">Analyzing...</span>
                  </div>
                )}
              </div>

              <div className="mt-8">
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className="w-full bg-primary-gradient text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-primary/20"
                >
                  Share to Community
                </motion.button>
              </div>
            </form>

            {/* Legal Protection Card (Backend Result) */}
            <AnimatePresence>
              {analysis?.risky === 'yes' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white rounded-3xl p-8 border-l-8 border-red-500 shadow-2xl overflow-hidden relative"
                >
                  <div className="flex items-start gap-6">
                    <div className="bg-red-100 p-4 rounded-2xl">
                      <ExclamationTriangleIcon className="h-8 w-8 text-red-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">Legal Guidance Detected</h3>
                      <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                        Based on your story, this incident may fall under specific legal protections.
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-gray-50 rounded-2xl">
                          <div className="flex items-center gap-2 mb-1">
                            <ScaleIcon className="h-4 w-4 text-primary" />
                            <span className="text-[10px] font-bold uppercase text-gray-400">Classification</span>
                          </div>
                          <p className="font-bold text-gray-800">{analysis.crime_type}</p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-2xl">
                          <div className="flex items-center gap-2 mb-1">
                            <HandRaisedIcon className="h-4 w-4 text-primary" />
                            <span className="text-[10px] font-bold uppercase text-gray-400">Relevant Law</span>
                          </div>
                          <p className="font-bold text-gray-800">{analysis.law}</p>
                        </div>
                      </div>

                      <div className="mt-4 p-4 bg-red-50 rounded-2xl">
                        <span className="text-[10px] font-bold uppercase text-red-400 block mb-1">Potential Punishment</span>
                        <p className="text-sm text-red-700 font-medium">{analysis.punishment}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <ShieldCheckIcon className="h-5 w-5 text-green-500" />
                Your Privacy
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                We use an <strong>Identity-First Firewall</strong>. Your personal metadata is stripped before being processed by our ML models.
              </p>
            </div>

            <div className="bg-gradient-to-br from-red-500 to-pink-600 rounded-3xl p-6 text-white shadow-xl">
              <h3 className="font-bold text-lg mb-2">Immediate Danger?</h3>
              <p className="text-sm opacity-90 mb-6">If you are currently unsafe, bypass this form and use the panic button.</p>
              <button className="w-full bg-white text-red-600 py-3 rounded-xl font-bold hover:bg-opacity-90 transition-all">
                Call Emergency Services
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoryAlert;