import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bars3Icon, XMarkIcon, HeartIcon } from '@heroicons/react/24/outline';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Education', href: '/education' },
    { name: 'Chatbot', href: '/chatbot' },
    { name: 'Period Tracker', href: '/period-tracker' },
    { name: 'Find Chemist', href: '/find-chemist' },
    { name: 'Share Story', href: '/story-alert' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="bg-primary-gradient p-2 rounded-2xl">
                <HeartIcon className="h-6 w-6 text-white" />
              </div>
              <span className="font-poppins font-bold text-xl text-primary">Sakhi</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`px-3 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                  isActive(item.href)
                    ? 'bg-primary-gradient text-white'
                    : 'text-gray-700 hover:text-primary hover:bg-secondary-lavender/20'
                }`}
              >
                {item.name}
              </Link>
            ))}
            <Link
              to="/login"
              className="ml-4 bg-primary-gradient text-white px-4 py-2 rounded-2xl font-medium hover:scale-105 transition-transform duration-300"
            >
              Login
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-700 hover:text-primary transition-colors duration-300"
            >
              {isOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden pb-4"
          >
            <div className="space-y-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`block px-3 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                    isActive(item.href)
                      ? 'bg-primary-gradient text-white'
                      : 'text-gray-700 hover:text-primary hover:bg-secondary-lavender/20'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
              <Link
                to="/login"
                onClick={() => setIsOpen(false)}
                className="block bg-primary-gradient text-white px-3 py-2 rounded-xl font-medium text-center mt-4"
              >
                Login
              </Link>
            </div>
          </motion.div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;