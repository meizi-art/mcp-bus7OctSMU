import { BusArrivalResponse, BusServiceArrival, NextBusInfo, ApiConfig, BusStop } from '../types/bus';
import { POPULAR_BUS_STOPS } from '../data/busStopsData';

const STORAGE_KEY_API_CONFIG = 'sg_bus_api_config';

export function getStoredApiConfig(): ApiConfig {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_API_CONFIG);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch {
    // fallback
  }
  return {
    mode: 'demo',
    apiKey: '',
    customProxyUrl: '',
  };
}

export function saveApiConfig(config: ApiConfig) {
  try {
    localStorage.setItem(STORAGE_KEY_API_CONFIG, JSON.stringify(config));
  } catch {
    // ignore
  }
}

/**
 * Check backend health & whether LTA_ACCOUNT_KEY is configured on server
 */
export async function checkApiHealth(): Promise<{ status: string; ltaApiConfigured: boolean }> {
  try {
    const res = await fetch('/api/health');
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // fallback
  }
  return { status: 'offline', ltaApiConfigured: false };
}

/**
 * Calculates arrival difference in minutes between now and EstimatedArrival ISO string
 */
export function calculateMinutesLeft(estimatedArrivalIso?: string): number | null {
  if (!estimatedArrivalIso) return null;
  const arrivalTime = new Date(estimatedArrivalIso).getTime();
  if (isNaN(arrivalTime)) return null;

  const now = Date.now();
  const diffMs = arrivalTime - now;
  const diffMins = Math.floor(diffMs / 60000);

  return diffMins;
}

export function formatArrivalDisplay(minutes: number | null): { text: string; isArr: boolean; isLeft: boolean } {
  if (minutes === null) {
    return { text: '—', isArr: false, isLeft: false };
  }
  if (minutes <= 0) {
    return { text: 'Arr', isArr: true, isLeft: false };
  }
  if (minutes === 1) {
    return { text: '1 min', isArr: false, isLeft: false };
  }
  if (minutes > 60) {
    return { text: '>60m', isArr: false, isLeft: false };
  }
  return { text: `${minutes}m`, isArr: false, isLeft: false };
}

/**
 * Generates realistic dynamic mock arrival data for a given bus stop
 */
export function generateMockArrivals(busStopCode: string): BusArrivalResponse {
  const stop = POPULAR_BUS_STOPS.find((s) => s.BusStopCode === busStopCode);
  const serviceNumbers = stop && stop.Services.length > 0 ? stop.Services : ['7', '14', '65', '106', '190'];

  const now = Date.now();

  const services: BusServiceArrival[] = serviceNumbers.map((svcNo, index) => {
    // Pseudo-deterministic variations based on service number and time
    const seed = (svcNo.charCodeAt(0) * 17 + index * 23 + Math.floor(now / 15000)) % 100;
    
    const min1 = (seed % 6); // 0 to 5 minutes
    const min2 = min1 + 5 + ((seed * 3) % 8); // 6 to 18 minutes
    const min3 = min2 + 8 + ((seed * 7) % 12); // 15 to 35 minutes

    const loads: ('SEA' | 'SDA' | 'LSD')[] = ['SEA', 'SEA', 'SDA', 'SDA', 'LSD'];
    const types: ('SD' | 'DD' | 'BD')[] = ['DD', 'SD', 'DD', 'SD', 'BD'];

    const nextBus: NextBusInfo = {
      OriginCode: '01019',
      DestinationCode: '54009',
      EstimatedArrival: new Date(now + min1 * 60000 + 15000).toISOString(),
      Load: loads[(seed + index) % loads.length],
      Feature: 'WAB',
      Type: types[(seed + index) % types.length],
    };

    const nextBus2: NextBusInfo = {
      OriginCode: '01019',
      DestinationCode: '54009',
      EstimatedArrival: new Date(now + min2 * 60000).toISOString(),
      Load: loads[(seed + index + 2) % loads.length],
      Feature: 'WAB',
      Type: types[(seed + index + 1) % types.length],
    };

    const nextBus3: NextBusInfo = {
      OriginCode: '01019',
      DestinationCode: '54009',
      EstimatedArrival: new Date(now + min3 * 60000).toISOString(),
      Load: loads[(seed + index + 3) % loads.length],
      Feature: 'WAB',
      Type: types[(seed + index + 2) % types.length],
    };

    const operators = ['SBST', 'SMRT', 'TTS', 'GAS'];

    return {
      ServiceNo: svcNo,
      Operator: operators[index % operators.length],
      NextBus: nextBus,
      NextBus2: nextBus2,
      NextBus3: nextBus3,
    };
  });

  return {
    BusStopCode: busStopCode,
    Services: services,
  };
}

/**
 * Fetch bus arrivals from /api/bus-arrival (or LTA DataMall directly if custom proxy)
 */
export async function fetchBusArrivals(
  busStopCode: string,
  config: ApiConfig = getStoredApiConfig(),
  serviceNo?: string
): Promise<BusArrivalResponse> {
  // 1. Try server-side API proxy (/api/bus-arrival) first
  try {
    let apiUrl = `/api/bus-arrival?BusStopCode=${encodeURIComponent(busStopCode)}`;
    if (serviceNo) {
      apiUrl += `&ServiceNo=${encodeURIComponent(serviceNo)}`;
    }

    const headers: Record<string, string> = {
      accept: 'application/json',
    };

    if (config.apiKey) {
      headers['x-account-key'] = config.apiKey.trim();
    }

    const res = await fetch(apiUrl, { headers });

    if (res.ok) {
      const data: BusArrivalResponse = await res.json();
      if (data && data.Services && data.Services.length > 0) {
        return data;
      }
    }
  } catch {
    // If backend proxy is not reachable, proceed to direct check or simulation
  }

  // 2. If client configured live mode with custom direct key / custom proxy
  if (config.mode === 'live' && config.apiKey && config.customProxyUrl) {
    try {
      const endpoint = `${config.customProxyUrl.replace(/\/$/, '')}?BusStopCode=${encodeURIComponent(
        busStopCode
      )}${serviceNo ? `&ServiceNo=${encodeURIComponent(serviceNo)}` : ''}`;

      const response = await fetch(endpoint, {
        headers: {
          AccountKey: config.apiKey.trim(),
          accept: 'application/json',
        },
      });

      if (response.ok) {
        const data: BusArrivalResponse = await response.json();
        return data;
      }
    } catch {
      // fallback
    }
  }

  // 3. Fallback to dynamic real-time simulation
  return generateMockArrivals(busStopCode);
}
