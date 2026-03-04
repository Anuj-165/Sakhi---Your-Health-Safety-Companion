import React from 'react';
import { HeartIcon } from '@heroicons/react/24/solid';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="bg-primary-gradient p-2 rounded-2xl">
                <HeartIcon className="h-6 w-6 text-white" />
              </div>
              <span className="font-poppins font-bold text-xl">Sakhi</span>
            </div>
            <p className="text-gray-400 mb-6 max-w-md">
              Empowering women through education, health tracking, and safety resources. 
              Together, we create a supportive community for all women.
            </p>
            <div className="flex space-x-4">
              <div className="w-10 h-10 bg-primary-gradient rounded-full flex items-center justify-center hover:scale-110 transition-transform duration-300 cursor-pointer">
                <span className="text-sm font-bold">f</span>
              </div>
              <div className="w-10 h-10 bg-primary-gradient rounded-full flex items-center justify-center hover:scale-110 transition-transform duration-300 cursor-pointer">
                <span className="text-sm font-bold">t</span>
              </div>
              <div className="w-10 h-10 bg-primary-gradient rounded-full flex items-center justify-center hover:scale-110 transition-transform duration-300 cursor-pointer">
                <span className="text-sm font-bold">i</span>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="font-poppins font-semibold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><a href="/education" className="text-gray-400 hover:text-primary transition-colors duration-300">Education</a></li>
              <li><a href="/period-tracker" className="text-gray-400 hover:text-primary transition-colors duration-300">Period Tracker</a></li>
              <li><a href="/find-chemist" className="text-gray-400 hover:text-primary transition-colors duration-300">Find Chemist</a></li>
              <li><a href="/story-alert" className="text-gray-400 hover:text-primary transition-colors duration-300">Share Your Story</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-poppins font-semibold text-lg mb-4">Support</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-primary transition-colors duration-300">Help Center</a></li>
              <li><a href="#" className="text-gray-400 hover:text-primary transition-colors duration-300">Privacy Policy</a></li>
              <li><a href="#" className="text-gray-400 hover:text-primary transition-colors duration-300">Terms of Service</a></li>
              <li><a href="#" className="text-gray-400 hover:text-primary transition-colors duration-300">Contact Us</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-12 pt-8 text-center">
          <p className="text-gray-400">
            © 2026 Sakhi. Made with <span className="text-primary">❤</span> for women empowerment.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;