import React from 'react';
import { Accessibility, HelpCircle } from 'lucide-react';

export const BusLegend: React.FC = () => {
  return (
    <div className="p-3.5 rounded-2xl bg-slate-800/40 border border-slate-800 text-slate-400 text-xs flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-1.5 font-medium text-slate-300">
        <HelpCircle className="w-3.5 h-3.5 text-emerald-400" />
        <span>Bus Timing Legend:</span>
      </div>

      <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono">
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" />
          <span className="text-slate-300">Seats Available</span>
        </span>

        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />
          <span className="text-slate-300">Standing</span>
        </span>

        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-400 inline-block" />
          <span className="text-slate-300">Crowded</span>
        </span>

        <span className="flex items-center gap-1">
          <Accessibility className="w-3 h-3 text-slate-400 inline-block" />
          <span className="text-slate-300">Wheelchair (WAB)</span>
        </span>
      </div>
    </div>
  );
};
