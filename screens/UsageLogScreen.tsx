import React, { useState, useEffect } from 'react';
import { loadUsageData, clearUsageData, exportUsageDataAsJson } from '../usageData';
import { loadAllSentences } from '../data/sentenceLoader';
import { getCustomSentences } from '../data/customSentenceStore';
import type { SentenceUsageData } from '../types';

const EDITOR_PIN = '1234';
const PIN_SESSION_KEY = 'editor-pin-ok';

type SortField = 'id' | 'attempts' | 'perfectRate' | 'showAnswer' | 'splitErrors' | 'lastAttempted';
type SortDir = 'asc' | 'desc';

interface UsageLogScreenProps {
  onBack: () => void;
}

interface EnrichedUsage {
  sentenceId: number;
  label: string;
  level: number;
  isCustom: boolean;
  usage: SentenceUsageData;
  perfectRate: number;
  totalRoleErrors: number;
}

export const UsageLogScreen: React.FC<UsageLogScreenProps> = ({ onBack }) => {
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);
  const [authenticated, setAuthenticated] = useState(() => sessionStorage.getItem(PIN_SESSION_KEY) === 'true');

  const [enrichedData, setEnrichedData] = useState<EnrichedUsage[]>([]);
  const [sortField, setSortField] = useState<SortField>('attempts');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [filterSource, setFilterSource] = useState<'all' | 'builtin' | 'custom'>('all');
  const [filterLevel, setFilterLevel] = useState<number | null>(null);
  const [showRawData, setShowRawData] = useState(false);

  useEffect(() => {
    if (!authenticated) return;
    const customSentences = getCustomSentences();
    loadAllSentences().then(builtIn => {
      const all = [
        ...builtIn.map(s => ({ ...s, _isCustom: false })),
        ...customSentences.map(s => ({ ...s, _isCustom: true })),
      ];

      const usageStore = loadUsageData();
      const enriched: EnrichedUsage[] = [];

      for (const s of all) {
        const usage = usageStore[s.id];
        if (!usage) continue;
        enriched.push({
          sentenceId: s.id,
          label: s.label,
          level: s.level,
          isCustom: (s as typeof all[number])._isCustom,
          usage,
          perfectRate: usage.attempts > 0 ? (usage.perfectCount / usage.attempts) * 100 : 0,
          totalRoleErrors: Object.values(usage.roleErrors).reduce((a, b) => a + b, 0),
        });
      }

      // Also include usage data for sentences no longer in the set
      for (const [idStr, usage] of Object.entries(usageStore)) {
        const id = Number(idStr);
        if (all.some(s => s.id === id)) continue;
        enriched.push({
          sentenceId: id,
          label: `(Verwijderd) Zin ${id}`,
          level: 0,
          isCustom: false,
          usage,
          perfectRate: usage.attempts > 0 ? (usage.perfectCount / usage.attempts) * 100 : 0,
          totalRoleErrors: Object.values(usage.roleErrors).reduce((a, b) => a + b, 0),
        });
      }

      setEnrichedData(enriched);
    });
  }, [authenticated]);

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === EDITOR_PIN) {
      sessionStorage.setItem(PIN_SESSION_KEY, 'true');
      setAuthenticated(true);
      setPinError(false);
    } else {
      setPinError(true);
    }
  };

  const handleClearData = () => {
    if (confirm('Alle gebruiksdata wissen? Dit kan niet ongedaan worden.')) {
      clearUsageData();
      setEnrichedData([]);
    }
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4">
        <form onSubmit={handlePinSubmit} className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 max-w-sm w-full space-y-4">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white text-center">Gebruiksdata</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 text-center">Voer de pincode in om de gebruiksdata te bekijken.</p>
          <input
            type="password"
            inputMode="numeric"
            maxLength={8}
            value={pinInput}
            onChange={e => { setPinInput(e.target.value); setPinError(false); }}
            className="w-full px-4 py-3 text-center text-2xl tracking-[0.5em] font-bold border-2 border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:border-blue-500 outline-none"
            autoFocus
            placeholder="****"
          />
          {pinError && <p className="text-red-500 text-sm text-center font-medium">Onjuiste pincode</p>}
          <div className="flex gap-3">
            <button type="button" onClick={onBack} className="flex-1 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">Terug</button>
            <button type="submit" className="flex-1 py-2 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors">Open</button>
          </div>
        </form>
      </div>
    );
  }

  // --- Sorting & Filtering ---
  const filtered = enrichedData.filter(d => {
    if (filterSource === 'custom' && !d.isCustom) return false;
    if (filterSource === 'builtin' && d.isCustom) return false;
    if (filterLevel !== null && d.level !== filterLevel) return false;
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    let cmp = 0;
    switch (sortField) {
      case 'id': cmp = a.sentenceId - b.sentenceId; break;
      case 'attempts': cmp = a.usage.attempts - b.usage.attempts; break;
      case 'perfectRate': cmp = a.perfectRate - b.perfectRate; break;
      case 'showAnswer': cmp = a.usage.showAnswerCount - b.usage.showAnswerCount; break;
      case 'splitErrors': cmp = a.usage.splitErrors - b.usage.splitErrors; break;
      case 'lastAttempted': cmp = a.usage.lastAttempted.localeCompare(b.usage.lastAttempted); break;
    }
    return sortDir === 'asc' ? cmp : -cmp;
  });

  const handleSort = (field: SortField) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('desc'); }
  };

  // --- Summary stats ---
  const totalAttempts = enrichedData.reduce((s, d) => s + d.usage.attempts, 0);
  const totalPerfect = enrichedData.reduce((s, d) => s + d.usage.perfectCount, 0);
  const totalShowAnswer = enrichedData.reduce((s, d) => s + d.usage.showAnswerCount, 0);
  const avgPerfectRate = totalAttempts > 0 ? (totalPerfect / totalAttempts) * 100 : 0;

  // Top 5 role errors across all sentences
  const globalRoleErrors: Record<string, number> = {};
  enrichedData.forEach(d => {
    for (const [role, count] of Object.entries(d.usage.roleErrors)) {
      globalRoleErrors[role] = (globalRoleErrors[role] || 0) + count;
    }
  });
  const topRoleErrors = Object.entries(globalRoleErrors)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // Difficult sentences: low perfect rate with >= 3 attempts
  const difficultSentences = enrichedData
    .filter(d => d.usage.attempts >= 3 && d.perfectRate < 40)
    .sort((a, b) => a.perfectRate - b.perfectRate)
    .slice(0, 5);

  const SortArrow = ({ field }: { field: SortField }) => (
    sortField === field ? <span className="ml-1">{sortDir === 'asc' ? '▲' : '▼'}</span> : null
  );

  const usageStore = loadUsageData();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-2 md:p-4 font-sans transition-colors duration-300">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="bg-white dark:bg-slate-800 p-4 md:p-6 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400">
                  Gebruiksdata
                </span>
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                Analyse van leerlingprestaties per zin
              </p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <button onClick={() => exportUsageDataAsJson(usageStore)} className="px-3 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-colors">
                Exporteer JSON
              </button>
              <button onClick={handleClearData} className="px-3 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors">
                Wis data
              </button>
              <button onClick={onBack} className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                Terug
              </button>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{enrichedData.length}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Zinnen met data</div>
          </div>
          <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 text-center">
            <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{totalAttempts}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Totaal pogingen</div>
          </div>
          <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 text-center">
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{avgPerfectRate.toFixed(0)}%</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Gem. slagingspercentage</div>
          </div>
          <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 text-center">
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">{totalShowAnswer}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Antwoord bekeken</div>
          </div>
        </div>

        {/* Insights Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Most Common Role Errors */}
          <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
            <h3 className="font-bold text-slate-700 dark:text-white text-sm mb-3">Meest voorkomende fouten</h3>
            {topRoleErrors.length === 0 ? (
              <p className="text-slate-400 text-sm">Nog geen foutdata beschikbaar.</p>
            ) : (
              <div className="space-y-2">
                {topRoleErrors.map(([role, count]) => {
                  const maxCount = topRoleErrors[0][1];
                  const pct = maxCount > 0 ? (count / maxCount) * 100 : 0;
                  return (
                    <div key={role} className="flex items-center gap-2">
                      <span className="text-xs font-medium text-slate-600 dark:text-slate-300 w-28 truncate">{role}</span>
                      <div className="flex-1 bg-slate-100 dark:bg-slate-700 rounded-full h-4 overflow-hidden">
                        <div className="h-full bg-red-400 dark:bg-red-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-xs font-bold text-slate-600 dark:text-slate-300 w-8 text-right">{count}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Difficult Sentences */}
          <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
            <h3 className="font-bold text-slate-700 dark:text-white text-sm mb-3">Moeilijkste zinnen</h3>
            {difficultSentences.length === 0 ? (
              <p className="text-slate-400 text-sm">Nog niet genoeg data (min. 3 pogingen per zin).</p>
            ) : (
              <div className="space-y-2">
                {difficultSentences.map(d => (
                  <div key={d.sentenceId} className="flex items-center gap-2">
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-300 flex-1 truncate">{d.label}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300 font-bold">
                      {d.perfectRate.toFixed(0)}% goed
                    </span>
                    <span className="text-xs text-slate-400">{d.usage.attempts}×</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
          <div className="flex flex-wrap gap-3 items-center">
            <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Filter:</span>
            <select
              value={filterSource}
              onChange={e => setFilterSource(e.target.value as 'all' | 'builtin' | 'custom')}
              className="text-sm px-2 py-1 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200"
            >
              <option value="all">Alle zinnen</option>
              <option value="builtin">Ingebouwde zinnen</option>
              <option value="custom">Eigen zinnen</option>
            </select>
            <select
              value={filterLevel ?? ''}
              onChange={e => setFilterLevel(e.target.value ? Number(e.target.value) : null)}
              className="text-sm px-2 py-1 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200"
            >
              <option value="">Alle niveaus</option>
              <option value="1">Niveau 1 – Basis</option>
              <option value="2">Niveau 2 – Middel</option>
              <option value="3">Niveau 3 – Hoog</option>
              <option value="4">Niveau 4 – Samengesteld</option>
            </select>
            <span className="text-xs text-slate-400 ml-auto">{sorted.length} zinnen</span>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                <th className="text-left px-3 py-2 text-slate-600 dark:text-slate-300 cursor-pointer select-none" onClick={() => handleSort('id')}>
                  Zin<SortArrow field="id" />
                </th>
                <th className="text-center px-3 py-2 text-slate-600 dark:text-slate-300 cursor-pointer select-none" onClick={() => handleSort('attempts')}>
                  Pogingen<SortArrow field="attempts" />
                </th>
                <th className="text-center px-3 py-2 text-slate-600 dark:text-slate-300 cursor-pointer select-none" onClick={() => handleSort('perfectRate')}>
                  Slagings-%<SortArrow field="perfectRate" />
                </th>
                <th className="text-center px-3 py-2 text-slate-600 dark:text-slate-300 cursor-pointer select-none" onClick={() => handleSort('showAnswer')}>
                  Antwoord<SortArrow field="showAnswer" />
                </th>
                <th className="text-center px-3 py-2 text-slate-600 dark:text-slate-300 cursor-pointer select-none" onClick={() => handleSort('splitErrors')}>
                  Splitfouten<SortArrow field="splitErrors" />
                </th>
                <th className="text-left px-3 py-2 text-slate-600 dark:text-slate-300">Rolfouten</th>
                <th className="text-center px-3 py-2 text-slate-600 dark:text-slate-300 cursor-pointer select-none" onClick={() => handleSort('lastAttempted')}>
                  Laatst<SortArrow field="lastAttempted" />
                </th>
              </tr>
            </thead>
            <tbody>
              {sorted.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-8 text-slate-400">Geen gebruiksdata beschikbaar.</td></tr>
              ) : sorted.map(d => {
                const roleErrorEntries = Object.entries(d.usage.roleErrors)
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 3);
                const rateColor = d.perfectRate >= 70
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : d.perfectRate >= 40
                    ? 'text-amber-600 dark:text-amber-400'
                    : 'text-red-600 dark:text-red-400';
                return (
                  <tr key={d.sentenceId} className="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-slate-700 dark:text-slate-200 truncate max-w-[200px] md:max-w-[300px]">{d.label}</span>
                        {d.isCustom && <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300 font-medium">eigen</span>}
                        {d.usage.flagged && <span className="text-[10px] px-1.5 py-0.5 rounded bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300 font-medium">⚑</span>}
                      </div>
                    </td>
                    <td className="text-center px-3 py-2 font-medium text-slate-700 dark:text-slate-200">{d.usage.attempts}</td>
                    <td className={`text-center px-3 py-2 font-bold ${rateColor}`}>
                      {d.usage.attempts > 0 ? `${d.perfectRate.toFixed(0)}%` : '—'}
                    </td>
                    <td className="text-center px-3 py-2 text-slate-600 dark:text-slate-300">{d.usage.showAnswerCount}</td>
                    <td className="text-center px-3 py-2 text-slate-600 dark:text-slate-300">{d.usage.splitErrors}</td>
                    <td className="px-3 py-2">
                      {roleErrorEntries.length === 0 ? (
                        <span className="text-slate-400 text-xs">—</span>
                      ) : (
                        <div className="flex flex-wrap gap-1">
                          {roleErrorEntries.map(([role, count]) => (
                            <span key={role} className="text-[10px] px-1.5 py-0.5 rounded bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300 font-medium">
                              {role}: {count}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="text-center px-3 py-2 text-xs text-slate-400">
                      {d.usage.lastAttempted ? new Date(d.usage.lastAttempted).toLocaleDateString('nl-NL') : '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Developer Raw Data Toggle */}
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setShowRawData(!showRawData)}
            className="text-xs font-medium text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
          >
            {showRawData ? '▼ Ruwe data verbergen' : '▶ Ruwe data tonen (ontwikkelaar)'}
          </button>
          {showRawData && (
            <pre className="mt-3 p-3 bg-slate-900 text-green-400 rounded-lg text-xs overflow-auto max-h-96 font-mono">
              {JSON.stringify(usageStore, null, 2)}
            </pre>
          )}
        </div>

      </div>
    </div>
  );
};
