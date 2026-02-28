import React from 'react';
import { TrainerState } from '../hooks/useTrainer';

type ScoreScreenProps = Pick<TrainerState,
  | 'sessionStats'
  | 'mistakeStats'
  | 'resetToHome'
  | 'startSession'
>;

export const ScoreScreen: React.FC<ScoreScreenProps> = ({
  sessionStats,
  mistakeStats,
  resetToHome,
  startSession,
}) => {
  const scorePercentage = sessionStats.total > 0 ? Math.round((sessionStats.correct / sessionStats.total) * 100) : 0;
  const topMistakes = Object.entries(mistakeStats).sort((a, b) => (b[1] as number) - (a[1] as number)).slice(0, 3);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4 md:p-8 font-sans flex items-center justify-center transition-colors duration-300">
      <main className="max-w-xl w-full bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-lg text-center border border-slate-200 dark:border-slate-700 animate-in zoom-in-95 duration-300">
        <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-6">Sessie Voltooid! 🎉</h2>
        <div className="mb-8">
          <div className={`text-6xl font-black mb-2 ${scorePercentage >= 80 ? 'text-green-600 dark:text-green-400' : scorePercentage >= 55 ? 'text-blue-600 dark:text-blue-400' : 'text-orange-600 dark:text-orange-400'}`}>{scorePercentage}%</div>
          <p className="text-slate-500 dark:text-slate-400">Je hebt {sessionStats.correct} van de {sessionStats.total} zinsdelen goed benoemd.</p>
        </div>
        {topMistakes.length > 0 && (
          <div className="mb-8 bg-orange-50 dark:bg-orange-900/20 p-4 rounded-xl border border-orange-100 dark:border-orange-800 text-left">
            <h3 className="font-bold text-orange-800 dark:text-orange-200 mb-2">Aandachtspunten:</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-orange-800 dark:text-orange-200">
              {topMistakes.map(([role, count]) => (<li key={role}><span className="font-semibold">{role}</span>: {count}x fout</li>))}
            </ul>
          </div>
        )}
        <div className="flex justify-center gap-4">
          <button onClick={resetToHome} className="px-8 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">Terug naar Home</button>
          <button onClick={startSession} className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg hover:bg-blue-700 transition-colors">Nog een keer</button>
        </div>
      </main>
    </div>
  );
};
