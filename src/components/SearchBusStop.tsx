import React, { useState, useRef, useEffect } from 'react';
import { Search, X, MapPin, Bus } from 'lucide-react';
import { BusStop } from '../types/bus';
import { POPULAR_BUS_STOPS } from '../data/busStopsData';

interface SearchBusStopProps {
  onSelectBusStop: (busStop: BusStop) => void;
  currentBusStopCode: string;
}

export const SearchBusStop: React.FC<SearchBusStopProps> = ({
  onSelectBusStop,
  currentBusStopCode,
}) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const results = query.trim()
    ? POPULAR_BUS_STOPS.filter((s) => {
        const q = query.toLowerCase();
        return (
          s.BusStopCode.toLowerCase().includes(q) ||
          s.Description.toLowerCase().includes(q) ||
          s.RoadName.toLowerCase().includes(q) ||
          s.Services.some((svc) => svc.toLowerCase() === q || svc.toLowerCase().startsWith(q))
        );
      })
    : [];

  const handleSelect = (stop: BusStop) => {
    onSelectBusStop(stop);
    setQuery('');
    setIsOpen(false);
  };

  const handleCustomCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = query.trim();
    if (!cleanCode) return;

    // Check if matching in existing list
    const found = POPULAR_BUS_STOPS.find((s) => s.BusStopCode === cleanCode);
    if (found) {
      handleSelect(found);
      return;
    }

    // If custom 5-digit code entered not in preloaded list, create custom bus stop entry
    const customStop: BusStop = {
      BusStopCode: cleanCode,
      RoadName: 'Singapore Road',
      Description: `Bus Stop ${cleanCode}`,
      Latitude: 1.3521,
      Longitude: 103.8198,
      Services: ['7', '14', '65', '106', '190'],
    };
    handleSelect(customStop);
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <form onSubmit={handleCustomCodeSubmit} className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Search bus stop (e.g. 09048), road, or service (e.g. 190)..."
          className="w-full pl-10 pr-10 py-3 rounded-2xl bg-slate-800/90 border border-slate-700 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all shadow-inner"
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setIsOpen(false);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </form>

      {/* Results Dropdown */}
      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 p-2 rounded-2xl bg-slate-800 border border-slate-700 shadow-2xl z-40 max-h-80 overflow-y-auto space-y-1">
          {results.map((stop) => (
            <button
              key={stop.BusStopCode}
              type="button"
              onClick={() => handleSelect(stop)}
              className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-700/70 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-500/15 text-emerald-400 font-mono text-xs font-bold border border-emerald-500/30">
                  {stop.BusStopCode}
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">{stop.Description}</div>
                  <div className="text-xs text-slate-400 font-mono">{stop.RoadName}</div>
                </div>
              </div>

              <div className="hidden sm:flex flex-wrap max-w-xs gap-1 justify-end">
                {stop.Services.slice(0, 5).map((svc) => (
                  <span
                    key={svc}
                    className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-700 text-slate-300"
                  >
                    {svc}
                  </span>
                ))}
                {stop.Services.length > 5 && (
                  <span className="text-[10px] text-slate-400">+{stop.Services.length - 5}</span>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
