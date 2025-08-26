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

// Компонент тренировки
const TrainingScreen = ({ 
  feedback, setFeedback, isTraining, setIsTraining, 
  videoRef, canvasRef, trainingData, setTrainingData 
}) => {
  const [currentExercise, setCurrentExercise] = useState('stance');
  const [sessionTime, setSessionTime] = useState(0);
  const [stressMode, setStressMode] = useState(false);

  const exercises = {
    stance: { name: 'עמידת בסיס', icon: '🛡️', description: 'עמוד יציב עם רגליים ברוחב כתפיים' },
    blocks: { name: 'בלוקים', icon: '✋', description: 'הרם ידיים להגנה על הפנים' },
    punches: { name: 'אגרופים', icon: '👊', description: 'אגרוף ישר עם סיבוב מותן' },
    combos: { name: 'קומבינציות', icon: '⚡', description: 'שילוב של בלוק ואגרוף' }
  };

  useEffect(() => {
    let timer;
    if (isTraining) {
      timer = setInterval(() => {
        setSessionTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isTraining]);

  const generateMockFeedback = (exercise) => {
    const feedbackOptions = {
      stance: {
        tips: ['להרחיב רגליים', 'לכופף ברכיים מעט', 'לחזק מרכז'],
        good: ['עמידה יציבה', 'מרכז כבד נמוך']
      },
      blocks: {
        tips: ['להרים מרפקים', 'לקרב ידיים לגוף', 'לכוון כפות'],
        good: ['הגנה טובה על הפנים', 'זמן תגובה מהיר']
      },
      punches: {
        tips: ['לסובב מותן', 'לשמור על איזון', 'להחזיר יד מהר'],
        good: ['כוח טוב', 'טכניקה נכונה']
      },
      combos: {
        tips: ['לזרום בין תנועות', 'לשמור על קצב', 'לא לרדת בהגנה'],
        good: ['קצב טוב', 'קואורדינציה מעולה']
      }
    };

    const options = feedbackOptions[exercise];
    const shouldGiveTip = Math.random() > 0.6;
    
    return {
      tips: shouldGiveTip ? [options.tips[Math.floor(Math.random() * options.tips.length)]] : [],
      good: Math.random() > 0.3 ? [options.good[Math.floor(Math.random() * options.good.length)]] : []
    };
  };

  const startTraining = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert('המצלמה לא זמינה במכשיר שלך');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user' }, 
        audio: false 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      
      setIsTraining(true);
      setSessionTime(0);
      
      // Simulate feedback
      const feedbackInterval = setInterval(() => {
        const mockFeedback = generateMockFeedback(currentExercise);
        setFeedback(mockFeedback);
        
        setTrainingData(prev => ({
          ...prev,
          [currentExercise]: {
            score: prev[currentExercise].score + (mockFeedback.tips.length === 0 ? 10 : 5),
            attempts: prev[currentExercise].attempts + 1
          }
        }));
      }, 2000);

      // Store interval ID to clear it later
      setIsTraining({ active: true, intervalId: feedbackInterval });
      
    } catch (error) {
      console.error('Camera error:', error);
      alert('לא ניתן לגשת למצלמה. אנא בדוק הרשאות.');
    }
  };

  const stopTraining = () => {
    if (isTraining && isTraining.intervalId) {
      clearInterval(isTraining.intervalId);
    }
    setIsTraining(false);
    
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Camera Area */}
      <div className="lg:col-span-2">
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl overflow-hidden">
          <div className="relative aspect-video bg-black">
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              autoPlay
              muted
              playsInline
            />
            <canvas
              ref={canvasRef}
              className="absolute inset-0 w-full h-full pointer-events-none"
            />
            
            {/* Controls */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-3">
              {!isTraining ? (
                <button
                  onClick={startTraining}
                  className="bg-emerald-500 hover:bg-emerald-600 px-6 py-3 rounded-lg flex items-center gap-2 transition-colors"
                >
                  <Play className="w-5 h-5" />
                  התחל אימון
                </button>
              ) : (
                <button
                  onClick={stopTraining}
                  className="bg-red-500 hover:bg-red-600 px-6 py-3 rounded-lg flex items-center gap-2 transition-colors"
                >
                  <Square className="w-5 h-5" />
                  עצור אימון
                </button>
              )}
            </div>

            {/* Timer */}
            {isTraining && (
              <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-sm px-4 py-2 rounded-lg">
                <div className="text-emerald-400 font-mono">
                  {Math.floor(sessionTime / 60)}:{(sessionTime % 60).toString().padStart(2, '0')}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Control Panel */}
      <div className="space-y-4">
        {/* Exercise Selection */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">תרגיל נוכחי</h3>
          <div className="space-y-2">
            {Object.entries(exercises).map(([key, exercise]) => (
              <button
                key={key}
                onClick={() => setCurrentExercise(key)}
                className={`w-full p-3 rounded-lg text-right transition-colors ${
                  currentExercise === key 
                    ? 'bg-emerald-600 text-white' 
                    : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xl">{exercise.icon}</span>
                  <div>
                    <div className="font-medium">{exercise.name}</div>
                    <div className="text-sm opacity-75">{exercise.description}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Feedback */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">משוב בזמן אמת</h3>
          
          {feedback.tips && feedback.tips.length > 0 && (
            <div className="mb-4">
              <h4 className="text-yellow-400 font-medium mb-2">שיפורים:</h4>
              <ul className="space-y-1">
                {feedback.tips.map((tip, i) => (
                  <li key={i} className="text-yellow-300 text-sm">• {tip}</li>
                ))}
              </ul>
            </div>
          )}
          
          {feedback.good && feedback.good.length > 0 && (
            <div>
              <h4 className="text-emerald-400 font-medium mb-2">מצוין:</h4>
              <ul className="space-y-1">
                {feedback.good.map((good, i) => (
                  <li key={i} className="text-emerald-300 text-sm">✓ {good}</li>
                ))}
              </ul>
            </div>
          )}

          {(!feedback.tips || feedback.tips.length === 0) && (!feedback.good || feedback.good.length === 0) && (
            <p className="text-gray-400 text-sm">התחל אימון כדי לקבל משוב...</p>
          )}
        </div>

        {/* Stress Mode */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">מצב לחץ</h3>
              <p className="text-sm text-gray-400">תרגול תחת סטרס</p>
            </div>
            <button
              onClick={() => setStressMode(!stressMode)}
              className={`w-12 h-6 rounded-full transition-colors relative ${
                stressMode ? 'bg-red-500' : 'bg-gray-600'
              }`}
            >
              <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${
                stressMode ? 'translate-x-6' : 'translate-x-0.5'
              }`} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Компонент прогресса
const ProgressScreen = ({ trainingData, achievements }) => {
  const totalScore = Object.values(trainingData).reduce((sum, data) => sum + data.score, 0);
  const totalAttempts = Object.values(trainingData).reduce((sum, data) => sum + data.attempts, 0);
  const averageAccuracy = totalAttempts > 0 ? Math.round((totalScore / (totalAttempts * 10)) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-2">ההתקדמות שלך</h2>
        <p className="text-gray-400">מעקב אחר השיפור בהגנה עצמית</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 p-6 rounded-xl text-center">
          <div className="text-3xl font-bold">{averageAccuracy}%</div>
          <div className="text-emerald-100">דיוק כללי</div>
        </div>
        <div className="bg-gradient-to-r from-blue-600 to-blue-500 p-6 rounded-xl text-center">
          <div className="text-3xl font-bold">{totalAttempts}</div>
          <div className="text-blue-100">סה"כ תרגילים</div>
        </div>
        <div className="bg-gradient-to-r from-purple-600 to-purple-500 p-6 rounded-xl text-center">
          <div className="text-3xl font-bold">{achievements.length}</div>
          <div className="text-purple-100">הישגים</div>
        </div>
      </div>

      {/* Detailed Progress */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6">
        <h3 className="text-xl font-semibold mb-6">פירוט לפי תחום</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.entries(trainingData).map(([key, data]) => {
            const accuracy = data.attempts > 0 ? Math.round((data.score / (data.attempts * 10)) * 100) : 0;
            const names = {
              stance: 'עמידת בסיס',
              blocks: 'בלוקים', 
              punches: 'אגרופים',
              combos: 'קומבינציות'
            };
            
            return (
              <div key={key} className="bg-gray-700/50 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-medium">{names[key]}</h4>
                  <span className="text-2xl font-bold text-emerald-400">{accuracy}%</span>
                </div>
                <div className="w-full bg-gray-600 rounded-full h-2 mb-2">
                  <div 
                    className="bg-emerald-400 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${accuracy}%` }}
                  />
                </div>
                <div className="text-sm text-gray-400">
                  {data.attempts} ניסיונות • {data.score} נקודות
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Компонент челленджей  
const ChallengesScreen = () => {
  const challenges = [
    {
      id: 1,
      title: 'מאסטר הגנה',
      description: 'השלם 50 בלוקים מושלמים',
      progress: 23,
      target: 50,
      reward: 'תג "שומר"'
    },
    {
      id: 2,
      title: 'מהירות ברק', 
      description: 'זמן תגובה מתחת ל-1.5 שניות',
      progress: 1.8,
      target: 1.5,
      reward: 'תג "ברק"'
    },
    {
      id: 3,
      title: 'חיזוק שבועי',
      description: 'התאמן 5 ימים השבוע',
      progress: 3,
      target: 5,
      reward: '100 נקודות XP'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-2">אתגרים</h2>
        <p className="text-gray-400">השלם אתגרים וזכה בתגים ונקודות</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {challenges.map((challenge) => {
          const progress = challenge.id === 2 
            ? Math.max(0, ((challenge.target - challenge.progress) / challenge.target) * 100)
            : (challenge.progress / challenge.target) * 100;
          
          return (
            <div key={challenge.id} className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-2">{challenge.title}</h3>
                  <p className="text-gray-400 text-sm mb-3">{challenge.description}</p>
                </div>
                <Zap className="w-8 h-8 text-yellow-400 flex-shrink-0 mr-3" />
              </div>
              
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span>התקדמות</span>
                  <span>{challenge.id === 2 ? `${challenge.progress}s` : `${challenge.progress}/${challenge.target}`}</span>
                </div>
                <div className="w-full bg-gray-600 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-emerald-400 to-blue-400 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, progress)}%` }}
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-yellow-400">🏆 {challenge.reward}</span>
                <span className="text-sm text-gray-400">{Math.round(progress)}% הושלם</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Weekly Challenge */}
      <div className="bg-gradient-to-r from-purple-900 to-blue-900 rounded-xl p-8 text-center">
        <Zap className="w-16 h-16 mx-auto mb-4 text-yellow-400" />
        <h3 className="text-2xl font-bold mb-2">אתגר השבוע</h3>
        <p className="text-purple-100 mb-4">תרגול תחת לחץ - השלם 3 תרחישי סטרס</p>
        <div className="bg-black/30 rounded-lg p-4 mb-4">
          <div className="text-3xl font-bold text-yellow-400">2/3</div>
          <div className="text-purple-200">תרחישים הושלמו</div>
        </div>
        <button className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold px-6 py-3 rounded-lg transition-colors">
          התחל אתגר
        </button>
      </div>
    </div>
  );
};

// Компонент профиля
const ProfileScreen = ({ userProfile }) => {
  if (!userProfile) return null;

  const levelProgress = 65;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-24 h-24 bg-gradient-to-r from-emerald-400 to-blue-400 rounded-full mx-auto mb-4 flex items-center justify-center">
          <User className="w-12 h-12 text-white" />
        </div>
        <h2 className="text-2xl font-bold mb-2">הפרופיל שלי</h2>
        <div className="flex items-center justify-center gap-2">
          <span className="text-lg">רמה {userProfile.level}</span>
          <div className="w-32 bg-gray-600 rounded-full h-2">
            <div 
              className="bg-emerald-400 h-2 rounded-full"
              style={{ width: `${levelProgress}%` }}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">פרטים אישיים</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400">רמת ניסיון:</span>
              <span>{userProfile.experience === 'beginner' ? 'מתחיל' : 
                userProfile.experience === 'intermediate' ? 'בינוני' : 'מתקדם'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">מטרה:</span>
              <span>{userProfile.goal === 'confidence' ? 'ביטחון עצמי' : 
                userProfile.goal === 'technique' ? 'שיפור טכניקה' : 'כושר וביטחון'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">תגובה ללחץ:</span>
              <span>{userProfile.stressResponse === 'freeze' ? 'נוטה לקפוא' : 
                userProfile.stressResponse === 'panic' ? 'פאניקה' : 'מרוכז'}</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">הגדרות</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span>התראות יומיות</span>
              <div className="w-12 h-6 bg-emerald-500 rounded-full relative">
                <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 right-0.5" />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span>צלילי משוב</span>
              <div className="w-12 h-6 bg-emerald-500 rounded-full relative">
                <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 right-0.5" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Главный компонент приложения
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

  const renderCurrentScreen = () => {
    if (!userProfile && currentScreen !== 'onboarding') {
      return <OnboardingScreen onComplete={setUserProfile} setScreen={setCurrentScreen} />;
    }

    switch (currentScreen) {
      case 'onboarding':
        return <OnboardingScreen onComplete={setUserProfile} setScreen={setCurrentScreen} />;
      case 'training':
        return (
          <TrainingScreen 
            feedback={feedback} 
            setFeedback={setFeedback}
            isTraining={isTraining}
            setIsTraining={setIsTraining}
            videoRef={videoRef}
            canvasRef={canvasRef}
            trainingData={trainingData}
            setTrainingData={setTrainingData}
          />
        );
      case 'progress':
        return <ProgressScreen trainingData={trainingData} achievements={achievements} />;
      case 'challenges':
        return <ChallengesScreen />;
      case 'profile':
        return <ProfileScreen userProfile={userProfile} />;
      default:
        return <OnboardingScreen onComplete={setUserProfile} setScreen={setCurrentScreen} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white" dir="rtl">
      {/* Header */}
      <header className="bg-black/30 backdrop-blur-sm border-b border-gray-800">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-emerald-400" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">
              GuardAI
            </h1>
          </div>
          
          {userProfile && (
            <nav className="flex gap-2">
              <button
                onClick={() => setCurrentScreen('training')}
                className={`p-2 rounded-lg transition-colors ${
                  currentScreen === 'training' 
                    ? 'bg-emerald-500 text-white' 
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
                title="אימון"
              >
                <Target className="w-5 h-5" />
              </button>
              <button
                onClick={() => setCurrentScreen('progress')}
                className={`p-2 rounded-lg transition-colors ${
                  currentScreen === 'progress' 
                    ? 'bg-emerald-500 text-white' 
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
                title="התקדמות"
              >
                <BarChart3 className="w-5 h-5" />
              </button>
              <button
                onClick={() => setCurrentScreen('challenges')}
                className={`p-2 rounded-lg transition-colors ${
                  currentScreen === 'challenges' 
                    ? 'bg-emerald-500 text-white' 
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
                title="אתגרים"
              >
                <Zap className="w-5 h-5" />
              </button>
              <button
                onClick={() => setCurrentScreen('profile')}
                className={`p-2 rounded-lg transition-colors ${
                  currentScreen === 'profile' 
                    ? 'bg-emerald-500 text-white' 
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
                title="פרופיל"
              >
                <User className="w-5 h-5" />
              </button>
            </nav>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto p-4">
        {renderCurrentScreen()}
      </main>
    </div>
  );
};

export default GuardAI;