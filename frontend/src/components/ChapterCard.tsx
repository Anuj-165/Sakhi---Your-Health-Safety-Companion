import React from 'react';
import { motion } from 'framer-motion';
import { PlayIcon, BookOpenIcon } from '@heroicons/react/24/outline';

interface ChapterCardProps {
  title: string;
  description: string;
  duration: string;
  image: string;
  completed: boolean;
  onClick: () => void;
}

const ChapterCard: React.FC<ChapterCardProps> = ({
  title,
  description,
  duration,
  image,
  completed,
  onClick
}) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="bg-white rounded-2xl shadow-lg overflow-hidden cursor-pointer group"
      onClick={onClick}
    >
      <div className="relative">
        <img 
          src={image} 
          alt={title}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
        <div className="absolute top-4 right-4">
          {completed ? (
            <div className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
              ✓ Completed
            </div>
          ) : (
            <div className="bg-primary text-white px-2 py-1 rounded-full text-xs font-medium">
              New
            </div>
          )}
        </div>
        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center space-x-2">
              <BookOpenIcon className="h-4 w-4" />
              <span className="text-sm">{duration}</span>
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              className="bg-white/20 backdrop-blur-sm p-2 rounded-full"
            >
              <PlayIcon className="h-5 w-5" />
            </motion.button>
          </div>
        </div>
      </div>
      
      <div className="p-6">
        <h3 className="font-poppins font-semibold text-lg text-gray-800 mb-2">
          {title}
        </h3>
        <p className="text-gray-600 text-sm leading-relaxed">
          {description}
        </p>
      </div>
    </motion.div>
  );
};

export default ChapterCard;