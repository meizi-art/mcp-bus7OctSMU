import React from 'react';
import { BusStop } from '../types/bus';
import { POPULAR_BUS_STOPS } from '../data/busStopsData';
import { MapPin, Navigation } from 'lucide-react';

interface PopularStopsViewProps {
  onSelectBusStop: (busStop: BusStop) => void;
  currentBusStopCode: string;
}

export const PopularStopsView: React.FC<PopularStopsViewProps> = ({
  onSelectBusStop,
  currentBusStopCode,
}) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <Navigation className="w-3.5 h-3.5 text-emerald-400" />
          Popular Bus Interchanges & MRT Stops
        </h3>
        <span className="text-[11px] text-slate-500 font-mono">1-Tap View</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
        {POPULAR_BUS_STOPS.slice(0, 8).map((stop) => {
          const isSelected = stop.BusStopCode === currentBusStopCode;
          return (
            <button
              key={stop.BusStopCode}
              onClick={() => onSelectBusStop(stop)}
              className={`p-2.5 rounded-xl border text-left transition-all ${
                isSelected
                  ? 'bg-emerald-600/20 border-emerald-500 text-white shadow-sm'
                  : 'bg-slate-800/60 border-slate-700/60 hover:bg-slate-800 hover:border-slate-600 text-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20">
                  {stop.BusStopCode}
                </span>
                <span className="text-[10px] text-slate-500">
                  {stop.Services.length} svcs
                </span>
              </div>
              <div className="text-xs font-semibold text-white truncate">
                {stop.Description}
              </div>
              <div className="text-[10px] text-slate-400 truncate font-mono">
                {stop.RoadName}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
