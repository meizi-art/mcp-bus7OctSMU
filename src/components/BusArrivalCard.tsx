import React from 'react';
import { BusServiceArrival, NextBusInfo, BusLoad, BusType } from '../types/bus';
import { calculateMinutesLeft, formatArrivalDisplay } from '../services/busApi';
import { Star, Bus, Accessibility } from 'lucide-react';

interface BusArrivalCardProps {
  service: BusServiceArrival;
  isFavorite: boolean;
  onToggleFavorite: (serviceNo: string) => void;
  onSelectService?: (serviceNo: string) => void;
}

export const BusArrivalCard: React.FC<BusArrivalCardProps> = ({
  service,
  isFavorite,
  onToggleFavorite,
  onSelectService,
}) => {
  const renderTimingPill = (nextBus: NextBusInfo, index: number) => {
    if (!nextBus || !nextBus.EstimatedArrival) {
      return (
        <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-800/60 border border-slate-700/40 text-slate-500 min-w-[72px]">
          <span className="text-xs font-mono font-medium">—</span>
          <span className="text-[10px] opacity-40">No bus</span>
        </div>
      );
    }

    const minutes = calculateMinutesLeft(nextBus.EstimatedArrival);
    const { text, isArr } = formatArrivalDisplay(minutes);

    // Bus Load Color Coding
    // SEA: Seats Available (Green)
    // SDA: Standing Available (Amber/Yellow)
    // LSD: Limited Standing (Red)
    const getLoadStyles = (load: BusLoad) => {
      switch (load) {
        case 'SEA':
          return {
            bg: 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400',
            barBg: 'bg-emerald-400',
            label: 'Seats Avail',
          };
        case 'SDA':
          return {
            bg: 'bg-amber-500/15 border-amber-500/40 text-amber-400',
            barBg: 'bg-amber-400',
            label: 'Standing',
          };
        case 'LSD':
          return {
            bg: 'bg-rose-500/15 border-rose-500/40 text-rose-400',
            barBg: 'bg-rose-400',
            label: 'Crowded',
          };
        default:
          return {
            bg: 'bg-slate-800 border-slate-700 text-slate-300',
            barBg: 'bg-slate-400',
            label: '',
          };
      }
    };

    const loadStyle = getLoadStyles(nextBus.Load);

    const getTypeLabel = (type: BusType) => {
      switch (type) {
        case 'DD':
          return 'Double';
        case 'BD':
          return 'Bendy';
        case 'SD':
        default:
          return 'Single';
      }
    };

    return (
      <div
        className={`flex flex-col items-center justify-center px-3 py-2 rounded-xl border transition-all min-w-[76px] ${
          isArr
            ? 'bg-emerald-600 text-white border-emerald-400 shadow-md shadow-emerald-950/40 animate-pulse'
            : loadStyle.bg
        }`}
      >
        <span
          className={`font-mono font-bold tracking-tight ${
            isArr ? 'text-base font-extrabold text-white' : 'text-base'
          }`}
        >
          {text}
        </span>

        <div className="flex items-center gap-1 mt-0.5 text-[9px] font-mono opacity-80">
          <span>{getTypeLabel(nextBus.Type)}</span>
          {nextBus.Feature === 'WAB' && (
            <span title="Wheelchair Accessible">
              <Accessibility className="w-2.5 h-2.5 inline-block" />
            </span>
          )}
        </div>
      </div>
    );
  };

  const getOperatorBadge = (op: string) => {
    switch (op) {
      case 'SBST':
        return 'bg-purple-950/50 text-purple-300 border-purple-800/40';
      case 'SMRT':
        return 'bg-red-950/50 text-red-300 border-red-800/40';
      case 'TTS':
        return 'bg-emerald-950/50 text-emerald-300 border-emerald-800/40';
      case 'GAS':
        return 'bg-amber-950/50 text-amber-300 border-amber-800/40';
      default:
        return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };

  return (
    <div className="flex items-center justify-between p-3 sm:p-4 rounded-2xl bg-slate-800/70 border border-slate-700/60 hover:border-slate-600 transition-all shadow-sm">
      {/* Service Number & Info */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => onToggleFavorite(service.ServiceNo)}
          className="p-1 text-slate-500 hover:text-amber-400 transition-colors"
          title={isFavorite ? 'Remove from favorites' : 'Save to favorites'}
        >
          <Star
            className={`w-4 h-4 ${
              isFavorite ? 'fill-amber-400 text-amber-400' : 'stroke-current'
            }`}
          />
        </button>

        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl sm:text-2xl font-black font-mono tracking-tight text-white">
              {service.ServiceNo}
            </span>
            <span
              className={`text-[9px] font-mono font-semibold px-1.5 py-0.5 rounded border ${getOperatorBadge(
                service.Operator
              )}`}
            >
              {service.Operator || 'BUS'}
            </span>
          </div>
        </div>
      </div>

      {/* 3 Arrival Timings */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {renderTimingPill(service.NextBus, 1)}
        {renderTimingPill(service.NextBus2, 2)}
        {renderTimingPill(service.NextBus3, 3)}
      </div>
    </div>
  );
};
