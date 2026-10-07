/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { BusStop, BusArrivalResponse, FavoriteItem } from './types/bus';
import { POPULAR_BUS_STOPS } from './data/busStopsData';
import { fetchBusArrivals, getStoredApiConfig } from './services/busApi';

import { BusStopHeader } from './components/BusStopHeader';
import { BusArrivalCard } from './components/BusArrivalCard';
import { SearchBusStop } from './components/SearchBusStop';
import { PopularStopsView } from './components/PopularStopsView';
import { FavoritesView } from './components/FavoritesView';
import { ApiSettingsModal } from './components/ApiSettingsModal';
import { BusLegend } from './components/BusLegend';

import {
  Bus,
  Star,
  Navigation,
  Key,
  RefreshCw,
  Search,
  Filter,
  CheckCircle2,
  Clock,
} from 'lucide-react';

const STORAGE_KEY_FAVORITES = 'sg_bus_favorites';
const STORAGE_KEY_LAST_STOP = 'sg_bus_last_stop';

export default function App() {
  const [currentBusStop, setCurrentBusStop] = useState<BusStop>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_LAST_STOP);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return POPULAR_BUS_STOPS[0]; // Orchard Stn/Lucky Plaza (09048)
  });

  const [arrivals, setArrivals] = useState<BusArrivalResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [autoRefreshCountdown, setAutoRefreshCountdown] = useState<number>(20);
  const [serviceFilter, setServiceFilter] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'arrivals' | 'favorites' | 'popular'>('arrivals');
  const [isApiModalOpen, setIsApiModalOpen] = useState<boolean>(false);
  const [apiConfig, setApiConfig] = useState(getStoredApiConfig());

  // Favorites state
  const [favorites, setFavorites] = useState<FavoriteItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_FAVORITES);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return [
      { busStopCode: '09048', addedAt: Date.now() },
      { busStopCode: '01012', addedAt: Date.now() },
    ];
  });

  const [favoriteServices, setFavoriteServices] = useState<string[]>(['190', '65']);

  // Load Bus Arrivals for current bus stop
  const loadArrivals = useCallback(async (stopCode: string) => {
    setIsLoading(true);
    try {
      const data = await fetchBusArrivals(stopCode);
      setArrivals(data);
      setLastUpdated(new Date());
      setAutoRefreshCountdown(20);
    } catch (err) {
      console.error('Error fetching arrivals:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch when bus stop changes
  useEffect(() => {
    if (currentBusStop) {
      loadArrivals(currentBusStop.BusStopCode);
      try {
        localStorage.setItem(STORAGE_KEY_LAST_STOP, JSON.stringify(currentBusStop));
      } catch {
        // ignore
      }
    }
  }, [currentBusStop, loadArrivals]);

  // Auto-refresh countdown timer (every 20s)
  useEffect(() => {
    const timer = setInterval(() => {
      setAutoRefreshCountdown((prev) => {
        if (prev <= 1) {
          if (currentBusStop) {
            loadArrivals(currentBusStop.BusStopCode);
          }
          return 20;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentBusStop, loadArrivals]);

  // Toggle favorite bus stop
  const toggleFavoriteStop = (stopCode: string) => {
    setFavorites((prev) => {
      const exists = prev.some((f) => f.busStopCode === stopCode);
      let updated: FavoriteItem[];
      if (exists) {
        updated = prev.filter((f) => f.busStopCode !== stopCode);
      } else {
        updated = [...prev, { busStopCode: stopCode, addedAt: Date.now() }];
      }
      try {
        localStorage.setItem(STORAGE_KEY_FAVORITES, JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  };

  const isCurrentStopFavorite = favorites.some(
    (f) => f.busStopCode === currentBusStop.BusStopCode
  );

  // Toggle favorite bus service
  const toggleFavoriteService = (serviceNo: string) => {
    setFavoriteServices((prev) =>
      prev.includes(serviceNo)
        ? prev.filter((s) => s !== serviceNo)
        : [...prev, serviceNo]
    );
  };

  const handleSelectBusStop = (stop: BusStop) => {
    setCurrentBusStop(stop);
    setActiveTab('arrivals');
    setServiceFilter('');
  };

  // Filtered and sorted services (pinned favorites at top)
  const displayedServices = (arrivals?.Services || []).filter((svc) => {
    if (!serviceFilter) return true;
    return svc.ServiceNo.toLowerCase().startsWith(serviceFilter.toLowerCase());
  }).sort((a, b) => {
    const aFav = favoriteServices.includes(a.ServiceNo);
    const bFav = favoriteServices.includes(b.ServiceNo);
    if (aFav && !bFav) return -1;
    if (!aFav && bFav) return 1;
    // numeric sort
    const aNum = parseInt(a.ServiceNo) || 999;
    const bNum = parseInt(b.ServiceNo) || 999;
    return aNum - bNum;
  });

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col antialiased">
      {/* Top App Bar */}
      <header className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-4 sm:px-6 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-bold shadow-md shadow-emerald-950/50">
              <Bus className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h1 className="text-base font-bold text-white tracking-tight flex items-center gap-1.5">
                SG Bus Arrival
                <span className="text-[10px] font-mono font-medium px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  {apiConfig.mode === 'live' ? 'LIVE LTA' : 'SIMULATION'}
                </span>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* LTA API Key Button */}
            <button
              onClick={() => setIsApiModalOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all"
              title="Connect LTA DataMall API"
            >
              <Key className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Connect API</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 space-y-5">
        {/* Search Bar */}
        <SearchBusStop
          onSelectBusStop={handleSelectBusStop}
          currentBusStopCode={currentBusStop.BusStopCode}
        />

        {/* Tab Navigation */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-800/80 border border-slate-700/60 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('arrivals')}
            className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'arrivals'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Bus className="w-4 h-4" />
            <span>Bus Stop ({currentBusStop.BusStopCode})</span>
          </button>

          <button
            onClick={() => setActiveTab('favorites')}
            className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'favorites'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Star className="w-4 h-4" />
            <span>Saved ({favorites.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('popular')}
            className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'popular'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Navigation className="w-4 h-4" />
            <span>Popular Interchanges</span>
          </button>
        </div>

        {/* Dynamic Tab Content */}
        {activeTab === 'arrivals' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            {/* Bus Stop Header Card */}
            <BusStopHeader
              busStop={currentBusStop}
              isFavorite={isCurrentStopFavorite}
              onToggleFavorite={() => toggleFavoriteStop(currentBusStop.BusStopCode)}
              onRefresh={() => loadArrivals(currentBusStop.BusStopCode)}
              isLoading={isLoading}
              autoRefreshCountdown={autoRefreshCountdown}
            />

            {/* Quick Service Filter if many services */}
            {arrivals && arrivals.Services.length > 4 && (
              <div className="flex items-center justify-between gap-3 px-1">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Filter className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Filter Service:</span>
                </div>
                <div className="flex items-center gap-1 overflow-x-auto pb-1 max-w-xs sm:max-w-md">
                  <button
                    onClick={() => setServiceFilter('')}
                    className={`px-2 py-0.5 rounded-lg text-xs font-mono transition-all ${
                      serviceFilter === ''
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    All ({arrivals.Services.length})
                  </button>
                  {arrivals.Services.map((s) => (
                    <button
                      key={s.ServiceNo}
                      onClick={() =>
                        setServiceFilter(serviceFilter === s.ServiceNo ? '' : s.ServiceNo)
                      }
                      className={`px-2 py-0.5 rounded-lg text-xs font-mono transition-all ${
                        serviceFilter === s.ServiceNo
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {s.ServiceNo}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* List of Bus Service Arrival Timings */}
            <div className="space-y-2.5">
              {displayedServices.length === 0 ? (
                <div className="p-8 rounded-2xl bg-slate-800/40 border border-slate-700/50 text-center text-slate-400 text-xs">
                  {isLoading ? 'Loading live bus timings...' : 'No buses currently in service for this stop.'}
                </div>
              ) : (
                displayedServices.map((service) => (
                  <BusArrivalCard
                    key={service.ServiceNo}
                    service={service}
                    isFavorite={favoriteServices.includes(service.ServiceNo)}
                    onToggleFavorite={toggleFavoriteService}
                  />
                ))
              )}
            </div>

            {/* Timing Legend */}
            <BusLegend />
          </div>
        )}

        {activeTab === 'favorites' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <FavoritesView
              favorites={favorites}
              onSelectBusStop={handleSelectBusStop}
              onRemoveFavorite={toggleFavoriteStop}
              currentBusStopCode={currentBusStop.BusStopCode}
            />
          </div>
        )}

        {activeTab === 'popular' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <PopularStopsView
              onSelectBusStop={handleSelectBusStop}
              currentBusStopCode={currentBusStop.BusStopCode}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto py-4 border-t border-slate-800/80 text-center text-xs text-slate-500">
        <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Singapore Land Transport Authority (LTA) DataMall Compliant</span>
          <button
            onClick={() => setIsApiModalOpen(true)}
            className="text-emerald-400 hover:underline"
          >
            {apiConfig.mode === 'live' ? 'API Key Configured' : 'Connect Real LTA API'}
          </button>
        </div>
      </footer>

      {/* LTA API Settings Modal */}
      <ApiSettingsModal
        isOpen={isApiModalOpen}
        onClose={() => setIsApiModalOpen(false)}
        onConfigUpdated={() => {
          setApiConfig(getStoredApiConfig());
          if (currentBusStop) {
            loadArrivals(currentBusStop.BusStopCode);
          }
        }}
      />
    </div>
  );
}
