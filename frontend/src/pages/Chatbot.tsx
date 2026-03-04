import React from 'react';
import { motion } from 'framer-motion';
import ChatBox from '../components/ChatBox';
import BotAnimation from '../components/BotAnimation';

const Chatbot = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="font-poppins font-bold text-4xl text-gray-800 mb-4">
            Ask Your Health Assistant
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Get personalized advice and information about women's health from our AI assistant
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Chat Interface */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2"
          >
            <div className="bg-white rounded-2xl shadow-lg h-[600px] flex flex-col">
              <div className="p-6 border-b border-gray-200">
                <h2 className="font-poppins font-semibold text-xl text-gray-800">
                  Chat with Sakhi Assistant
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Ask me anything about women's health, menstruation, or wellness
                </p>
              </div>
              <div className="flex-1">
                <ChatBox />
              </div>
            </div>
          </motion.div>

          {/* Bot Animation & Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* Bot Display */}
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
              <BotAnimation size="lg" />
              <h3 className="font-poppins font-semibold text-xl text-gray-800 mt-6 mb-3">
                Your Sakhi Assistant
              </h3>
              <p className="text-gray-600 mb-4">
                I'm here 24/7 to answer your questions about women's health and wellness.
              </p>
              <div className="text-sm text-gray-500">
                💬 Available in multiple languages<br />
                🔒 Private and confidential<br />
                📚 Medically accurate information
              </div>
            </div>

            {/* Quick Topics */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="font-poppins font-semibold text-lg text-gray-800 mb-4">
                Popular Topics
              </h3>
              <div className="space-y-3">
                {[
                  'Menstrual cycle questions',
                  'Period pain management',
                  'Contraception options',
                  'Pregnancy symptoms',
                  'Mental health support',
                  'Nutrition advice',
                ].map((topic, index) => (
                  <motion.button
                    key={topic}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full text-left p-3 bg-secondary-lavender/20 rounded-xl hover:bg-secondary-lavender/30 transition-colors duration-300"
                  >
                    <span className="text-sm text-gray-700">{topic}</span>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Safety Notice */}
            <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl p-6 border border-orange-200">
              <h4 className="font-semibold text-gray-800 mb-2">⚠️ Important Notice</h4>
              <p className="text-sm text-gray-700">
                This AI assistant provides general information only. For serious health concerns, 
                please consult with a qualified healthcare professional.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;