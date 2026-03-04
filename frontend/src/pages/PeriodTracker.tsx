import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CalendarDaysIcon, 
  HeartIcon, 
  SparklesIcon,
  InformationCircleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import PeriodCalendar from '../components/PeriodCalendar';
import api from '../api/axios';

interface CycleStatus {
  day_of_cycle: number;
  phase: string;
  days_until_next_period: number;
  next_period_date: string;
  tips: string[];
}

const PeriodTracker = () => {
  const [status, setStatus] = useState<CycleStatus | null>(null);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [isInitialUser, setIsInitialUser] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success'>('idle');
  const [firstDate, setFirstDate] = useState('');

  const symptomsList = ['Cramps', 'Bloating', 'Fatigue', 'Headache', 'Cravings', 'Mood Swings'];

  const fetchStatus = async () => {
    try {
      const response = await api.get('/periods/status');
      setStatus(response.data);
      setIsInitialUser(false);
    } catch (err: any) {
      if (err.response?.status === 404) {
        setIsInitialUser(true);
      }
      console.error("Failed to fetch cycle status", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleInitialSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // POST to /predict to create the first record
      await api.post('/periods/predict', { 
        last_period_date: firstDate,
        lang: "en" 
      });
      // Refresh status after successful creation
      await fetchStatus();
    } catch (err) {
      alert("Failed to initialize tracker. Please check date format.");
      setLoading(false);
    }
  };

  const handleSymptomToggle = (symptom: string) => {
    setSelectedSymptoms(prev => 
      prev.includes(symptom) ? prev.filter(s => s !== symptom) : [...prev, symptom]
    );
  };

  const saveSymptoms = async () => {
    setSaveStatus('saving');
    try {
      await api.post('/periods/log', { symptoms: selectedSymptoms });
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (err) {
      setSaveStatus('idle');
      alert("Failed to save symptoms");
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      {/* INITIAL USER OVERLAY */}
      <AnimatePresence>
        {isInitialUser && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
              className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl"
            >
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome!</h2>
              <p className="text-gray-600 mb-6">To start tracking your cycle, please enter the start date of your last period.</p>
              <form onSubmit={handleInitialSetup} className="space-y-4">
                <input 
                  type="date" 
                  required
                  value={firstDate}
                  onChange={(e) => setFirstDate(e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none"
                />
                <button 
                  type="submit"
                  className="w-full bg-primary-gradient text-white py-3 rounded-xl font-bold shadow-lg hover:opacity-90 transition-opacity"
                >
                  Initialize Tracker
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <h1 className="font-poppins font-bold text-4xl text-gray-800 mb-4 tracking-tight">Period Tracker</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto italic">
            "Your body is a complex system; we're just here to help you debug the logs."
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Calendar Section */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-2">
            <PeriodCalendar nextPeriod={status?.next_period_date} />
            
            {/* Phase Visualizer Diagram */}
            <div className="mt-8 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
               <h3 className="font-semibold text-gray-800 mb-4">Cycle Phase Visualizer</h3>
               
               



               <img src="/src/pages/menstrualCycle.jpg" alt="Cycle Diagram" className="w-full rounded-lg shadow-md" />
               <p className="text-xs text-gray-400 mt-2">Diagram showing hormonal fluctuations and uterine lining changes.</p>
            </div>
          </motion.div>

          {/* Sidebar */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            
            {/* Cycle Overview */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border-t-4 border-primary">
              <h3 className="font-poppins font-semibold text-lg text-gray-800 mb-4">Live Status</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-red-50 rounded-xl">
                  <span className="text-gray-700 font-medium">Next Period</span>
                  <span className="text-red-600 font-bold">{status?.days_until_next_period ?? '--'} Days</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                  <span className="text-gray-700 font-medium">Current Phase</span>
                  <span className="capitalize font-semibold text-primary">{status?.phase ?? 'Unknown'}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                  <span className="text-gray-700 font-medium">Day of Cycle</span>
                  <span className="font-semibold">Day {status?.day_of_cycle ?? '--'}</span>
                </div>
              </div>
            </div>

            {/* Log Symptoms */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="font-poppins font-semibold text-lg text-gray-800 mb-4">Log Symptoms</h3>
              <div className="grid grid-cols-2 gap-2">
                {symptomsList.map((s) => (
                  <button
                    key={s}
                    onClick={() => handleSymptomToggle(s)}
                    className={`p-2 text-xs rounded-lg border transition-all ${
                      selectedSymptoms.includes(s) 
                      ? 'bg-primary text-white border-primary shadow-md' 
                      : 'bg-white text-gray-600 border-gray-200'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={saveSymptoms}
                disabled={saveStatus === 'saving' || isInitialUser}
                className="w-full mt-4 bg-primary-gradient text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2"
              >
                {saveStatus === 'success' ? <><CheckCircleIcon className="h-5 w-5"/> Saved</> : 'Sync to Cloud'}
              </motion.button>
            </div>

            {/* Dynamic Insights */}
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-2xl p-6 shadow-xl">
              <div className="flex items-center space-x-2 mb-3">
                <SparklesIcon className="h-6 w-6" />
                <h3 className="font-poppins font-semibold text-lg">Phase Advice</h3>
              </div>
              <ul className="text-sm space-y-2 opacity-90">
                {status?.tips ? status.tips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="mt-1 block h-1 w-1 bg-white rounded-full shrink-0" />
                    {tip}
                  </li>
                )) : <li>Initialize your cycle to see personalized tips.</li>}
              </ul>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default PeriodTracker;