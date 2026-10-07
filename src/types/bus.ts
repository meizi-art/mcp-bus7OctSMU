export type BusLoad = 'SEA' | 'SDA' | 'LSD' | ''; // Seats Available (Green), Standing Available (Yellow), Limited Standing (Red)
export type BusType = 'SD' | 'DD' | 'BD' | ''; // Single Deck, Double Deck, Bendy
export type BusFeature = 'WAB' | ''; // Wheelchair Accessible Bus

export interface NextBusInfo {
  OriginCode: string;
  DestinationCode: string;
  EstimatedArrival: string; // ISO 8601 string, e.g. "2026-10-07T05:04:12+08:00"
  Latitude?: string;
  Longitude?: string;
  VisitNumber?: string;
  Load: BusLoad;
  Feature: BusFeature;
  Type: BusType;
}

export interface BusServiceArrival {
  ServiceNo: string;
  Operator: string; // "SBST" | "SMRT" | "TTS" | "GAS"
  NextBus: NextBusInfo;
  NextBus2: NextBusInfo;
  NextBus3: NextBusInfo;
}

export interface BusStop {
  BusStopCode: string;
  RoadName: string;
  Description: string;
  Latitude: number;
  Longitude: number;
  Services: string[];
}

export interface BusArrivalResponse {
  'odata.metadata'?: string;
  BusStopCode: string;
  Services: BusServiceArrival[];
}

export interface ApiConfig {
  mode: 'demo' | 'live';
  apiKey: string; // LTA DataMall AccountKey
  customProxyUrl?: string;
}

export interface FavoriteItem {
  busStopCode: string;
  serviceNo?: string; // Optional: if pinned a specific service or entire stop
  addedAt: number;
}
