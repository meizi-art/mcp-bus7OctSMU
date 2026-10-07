import React from 'react';
import { BusStop } from '../types/bus';
import { MapPin, Star, RefreshCw, Copy, Check, ExternalLink } from 'lucide-react';

interface BusStopHeaderProps {
  busStop: BusStop;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onRefresh: () => void;
  isLoading: boolean;
  autoRefreshCountdown: number;
}

export const BusStopHeader: React.FC<BusStopHeaderProps> = ({
  busStop,
  isFavorite,
  onToggleFavorite,
  onRefresh,
  isLoading,
  autoRefreshCountdown,
}) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(busStop.BusStopCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-4 sm:p-6 rounded-2xl bg-gradient-to-br from-slate-800/90 to-slate-900 border border-slate-700/70 shadow-lg">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Stop Details */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm sm:text-base font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-lg border border-emerald-500/30">
              {busStop.BusStopCode}
            </span>
            <span className="text-xs font-medium text-slate-400 font-mono">
              {busStop.RoadName}
            </span>
            <button
              onClick={handleCopy}
              className="p-1 text-slate-500 hover:text-slate-300 transition-colors"
              title="Copy Bus Stop Code"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            {busStop.Description}
          </h2>

          <div className="text-xs text-slate-400 flex items-center gap-2 pt-1">
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3 text-emerald-400" />
              Singapore
            </span>
            <span>•</span>
            <span>{busStop.Services?.length || 0} Bus Services Available</span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 self-start sm:self-center">
          {/* Favorite Button */}
          <button
            onClick={onToggleFavorite}
            className={`p-2.5 rounded-xl border transition-all flex items-center gap-1.5 text-xs font-semibold ${
              isFavorite
                ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white hover:bg-slate-700'
            }`}
            title={isFavorite ? 'Remove Bus Stop from Saved' : 'Save Bus Stop'}
          >
            <Star
              className={`w-4 h-4 ${isFavorite ? 'fill-amber-400 text-amber-400' : ''}`}
            />
            <span className="hidden sm:inline">{isFavorite ? 'Saved' : 'Save Stop'}</span>
          </button>

          {/* Refresh Button */}
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="p-2.5 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-semibold text-xs transition-all flex items-center gap-2 shadow-md shadow-emerald-950/40 disabled:opacity-50"
            title="Refresh bus timings now"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
            <span className="text-[10px] font-mono opacity-75 bg-black/20 px-1.5 py-0.5 rounded">
              {autoRefreshCountdown}s
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
