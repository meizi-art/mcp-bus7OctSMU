import React from 'react';
import { BusStop, FavoriteItem } from '../types/bus';
import { POPULAR_BUS_STOPS } from '../data/busStopsData';
import { Star, Trash2, ArrowRight } from 'lucide-react';

interface FavoritesViewProps {
  favorites: FavoriteItem[];
  onSelectBusStop: (busStop: BusStop) => void;
  onRemoveFavorite: (busStopCode: string) => void;
  currentBusStopCode: string;
}

export const FavoritesView: React.FC<FavoritesViewProps> = ({
  favorites,
  onSelectBusStop,
  onRemoveFavorite,
  currentBusStopCode,
}) => {
  if (favorites.length === 0) {
    return (
      <div className="p-6 rounded-2xl bg-slate-800/40 border border-slate-700/50 text-center space-y-2">
        <Star className="w-8 h-8 text-amber-400/40 mx-auto" />
        <h3 className="text-sm font-semibold text-slate-300">No Saved Bus Stops Yet</h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          Tap the <Star className="w-3.5 h-3.5 inline text-amber-400 fill-amber-400" /> star button on any bus stop to bookmark your frequent home or office stops for fast access.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
          <Star className="w-3.5 h-3.5 fill-amber-400" />
          Saved Bus Stops ({favorites.length})
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {favorites.map((fav) => {
          const stop =
            POPULAR_BUS_STOPS.find((s) => s.BusStopCode === fav.busStopCode) || {
              BusStopCode: fav.busStopCode,
              Description: `Bus Stop ${fav.busStopCode}`,
              RoadName: 'Singapore',
              Latitude: 1.35,
              Longitude: 103.82,
              Services: [],
            };

          const isCurrent = stop.BusStopCode === currentBusStopCode;

          return (
            <div
              key={fav.busStopCode}
              onClick={() => onSelectBusStop(stop)}
              className={`p-3 rounded-2xl border flex items-center justify-between gap-3 transition-all cursor-pointer ${
                isCurrent
                  ? 'bg-amber-500/15 border-amber-500/50 shadow-sm'
                  : 'bg-slate-800/70 border-slate-700/70 hover:border-slate-600 hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 font-mono text-xs font-bold border border-amber-500/20">
                  {stop.BusStopCode}
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-white truncate">
                    {stop.Description}
                  </div>
                  <div className="text-xs text-slate-400 font-mono truncate">
                    {stop.RoadName}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveFavorite(fav.busStopCode);
                  }}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                  title="Remove from favorites"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
