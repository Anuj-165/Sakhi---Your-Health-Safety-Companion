import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  AcademicCapIcon, 
  ChatBubbleLeftRightIcon, 
  CalendarDaysIcon,
  MapPinIcon,
  DocumentTextIcon,
  UsersIcon,
  ShieldCheckIcon,
  HeartIcon
} from '@heroicons/react/24/outline';
import BotAnimation from '../components/BotAnimation';

const Home = () => {
  const stats = [
    { label: 'Women Helped', value: '10,000+', icon: UsersIcon },
    { label: 'Health Sessions', value: '50,000+', icon: HeartIcon },
    { label: 'Stories Shared', value: '5,000+', icon: DocumentTextIcon },
    { label: 'Alerts Handled', value: '1,200+', icon: ShieldCheckIcon },
  ];

  const features = [
    {
      title: 'Learn',
      description: 'Access comprehensive women\'s health education',
      icon: AcademicCapIcon,
      link: '/education',
      gradient: 'from-purple-400 to-pink-400',
    },
    {
      title: 'Ask a Question',
      description: 'Chat with our AI health assistant',
      icon: ChatBubbleLeftRightIcon,
      link: '/chatbot',
      gradient: 'from-blue-400 to-teal-400',
    },
    {
      title: 'Track Period',
      description: 'Monitor your menstrual cycle and health',
      icon: CalendarDaysIcon,
      link: '/period-tracker',
      gradient: 'from-pink-400 to-rose-400',
    },
    {
      title: 'Find Chemist',
      description: 'Locate nearby pharmacies and medical stores',
      icon: MapPinIcon,
      link: '/find-chemist',
      gradient: 'from-green-400 to-emerald-400',
    },
    {
      title: 'Share Story',
      description: 'Connect with the community and share experiences',
      icon: DocumentTextIcon,
      link: '/story-alert',
      gradient: 'from-orange-400 to-amber-400',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-primary-gradient py-16 lg:py-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="text-white"
            >
              <h1 className="font-poppins font-bold text-4xl lg:text-6xl mb-6">
                Your <span className="text-accent-gold">Sakhi</span> for 
                Health & Safety
              </h1>
              <p className="text-xl lg:text-2xl mb-8 opacity-90">
                Empowering women through education, health tracking, and community support. 
                Your journey to wellness starts here.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/education">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-full sm:w-auto bg-white text-primary px-8 py-4 rounded-2xl font-semibold text-lg hover:shadow-xl transition-all duration-300"
                  >
                    Start Learning
                  </motion.button>
                </Link>
                <Link to="/chatbot">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-full sm:w-auto border-2 border-white text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:bg-white hover:text-primary transition-all duration-300"
                  >
                    Ask a Question
                  </motion.button>
                </Link>
              </div>
            </motion.div>

            {/* BOT INTRODUCTION CARD */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="flex justify-center lg:justify-end relative"
            >
              {/* Decorative Background Glow */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-white/20 blur-[100px] rounded-full" />
              
              <div className="relative bg-white/10 backdrop-blur-md border border-white/20 p-8 rounded-[3rem] shadow-2xl flex flex-col items-center text-center max-w-sm">
                {/* Speech Bubble */}
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1, duration: 0.5 }}
                  className="absolute -top-12 bg-white text-primary px-6 py-3 rounded-2xl rounded-bl-none shadow-lg font-bold text-sm"
                >
                  "Namaste! I am Sakhi, your personal health companion."
                  <div className="absolute -bottom-2 left-0 w-4 h-4 bg-white rotate-45" />
                </motion.div>

                <BotAnimation size="lg" />
                
                <div className="mt-6 text-white">
                  <h3 className="text-2xl font-bold font-poppins mb-2">Meet Sakhi</h3>
                  <p className="text-sm opacity-80 leading-relaxed">
                    I'm here to help you track your cycle, answer health queries, 
                    and keep you safe. How can I help you today?
                  </p>
                </div>

                <Link to="/chatbot" className="mt-6 w-full">
                  <button className="w-full py-3 bg-accent-gold text-gray-900 rounded-xl font-bold text-sm hover:brightness-110 transition-all">
                    Chat with me
                  </button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="bg-calm-gradient p-4 rounded-2xl inline-block mb-4">
                  <stat.icon className="h-8 w-8 text-primary" />
                </div>
                <div className="font-poppins font-bold text-2xl lg:text-3xl text-gray-800 mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600 font-medium">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h2 className="font-poppins font-bold text-3xl lg:text-4xl text-gray-800 mb-4">
              Everything You Need
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive tools and resources to support your health, education, and safety journey
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                className="group"
              >
                <Link to={feature.link}>
                  <div className="bg-white rounded-2xl shadow-lg p-8 h-full hover:shadow-xl transition-all duration-300">
                    <div className={`bg-gradient-to-br ${feature.gradient} p-4 rounded-2xl inline-block mb-6 group-hover:scale-110 transition-transform duration-300`}>
                      <feature.icon className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="font-poppins font-semibold text-xl text-gray-800 mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-empowerment-gradient">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-white"
          >
            <h2 className="font-poppins font-bold text-3xl lg:text-4xl mb-6">
              Ready to Start Your Journey?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Join thousands of women who trust Sakhi for their health and wellness needs
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/signup">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full sm:w-auto bg-white text-primary px-8 py-4 rounded-2xl font-semibold text-lg hover:shadow-xl transition-all duration-300"
                >
                  Get Started Free
                </motion.button>
              </Link>
              <Link to="/education">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full sm:w-auto border-2 border-white text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:bg-white hover:text-primary transition-all duration-300"
                >
                  Explore Features
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;