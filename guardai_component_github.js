// Скопируйте сюда весь код из артефакта guardai_app
// Это будет основной компонент React

import React, { useState, useRef, useEffect } from 'react';
import { Camera, Play, Square, Award, Target, BarChart3, Settings, User, Zap, Shield } from 'lucide-react';

// Компонент онбординга
const OnboardingScreen = ({ onComplete, setScreen }) => {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});

  const questions = [
    {
      id: 'experience',
      question: 'מה רמת הניסיון שלך בהגנה עצמית?',
      options: [
        { value: 'beginner', label: 'מתחיל - אין ניסיון' },
        { value: 'intermediate', label: 'בינוני - קצת ניסיון' },
        { value: 'advanced', label: 'מתקדם - יש לי בסיס טוב' }
      ]
    },
    {
      id: 'goal',
      question: 'מה המטרה העיקרית שלך?',
      options: [
        { value: 'confidence', label: 'להרגיש בטוח יותר' },
        { value: 'technique', label: 'לשפר טכניקה' },
        { value: 'fitness', label: 'כושר וביטחון עצמי' }
      ]
    },
    {
      id: 'stress',
      question: 'איך אתה מגיב במצבי לחץ?',
      options: [
        { value: 'freeze', label: 'אני נוטה "לקפוא"' },
        { value: 'panic', label: 'אני נכנס לפאניקה' },
        { value: 'focused', label: 'אני נשאר מרוכז' }
      ]
    }
  ];

  const handleAnswer = (answer) => {
    const newAnswers = { ...answers, [questions[step].id]: answer };
    setAnswers(newAnswers);
    
    if (step < questions.length - 1) {
      setStep(step + 1);
    } else {
      const profile = {
        experience: newAnswers.experience,
        goal: newAnswers.goal,
        stressResponse: newAnswers.stress,
        joinDate: new Date().toISOString(),
        level: 1
      };
      onComplete(profile);
      setScreen('training');
    }
  };

  return (
    <div className="max-w-2xl mx-auto text-center">
      <div className="mb-8">
        <Shield className="w-16 h-16 mx-auto mb-4 text-emerald-400" />
        <h2 className="text-3xl font-bold mb-2">ברוכים הבאים ל-GuardAI</h2>
        <p className="text-gray-400">האפליקציה שמאמנת אותך להגנה עצמית בעזרת בינה מלאכותית</p>
      </div>

      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8">
        <div className="mb-6">
          <div className="flex justify-center gap-2 mb-4">
            {questions.map((_, i) => (
              <div key={i} className={`w-3 h-3 rounded-full ${i <= step ? 'bg-emerald-400' : 'bg-gray-600'}`} />
            ))}
          </div>
          <h3 className="text-xl font-semibold mb-6">{questions[step].question}</h3>
        </div>

        <div className="space-y-3">
          {questions[step].options.map((option) => (
            <button
              key={option.value}
              onClick={() => handleAnswer(option.value)}
              className="w-full p-4 bg-gray-700 hover:bg-emerald-600 rounded-lg transition-colors text-right"
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// ... (скопируйте остальные компоненты из артефакта)
// Для краткости я не копирую весь код - используйте код из guardai_app

// Главный компонент
const GuardAI = () => {
  const [currentScreen, setCurrentScreen] = useState('onboarding');
  const [isTraining, setIsTraining] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [trainingData, setTrainingData] = useState({
    stance: { score: 0, attempts: 0 },
    blocks: { score: 0, attempts: 0 },
    punches: { score: 0, attempts: 0 },
    combos: { score: 0, attempts: 0 }
  });
  const [feedback, setFeedback] = useState({ tips: [], good: [] });
  const [achievements, setAchievements] = useState([]);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // ... остальная логика из guardai_app

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white" dir="rtl">
      {/* Header и остальной UI */}
    </div>
  );
};

export default GuardAI;