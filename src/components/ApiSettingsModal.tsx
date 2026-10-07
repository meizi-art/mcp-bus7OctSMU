import React, { useState } from 'react';
import { ApiConfig } from '../types/bus';
import { getStoredApiConfig, saveApiConfig, fetchBusArrivals } from '../services/busApi';
import { Settings, Key, Globe, CheckCircle2, AlertCircle, X, ExternalLink } from 'lucide-react';

interface ApiSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigUpdated: () => void;
}

export const ApiSettingsModal: React.FC<ApiSettingsModalProps> = ({
  isOpen,
  onClose,
  onConfigUpdated,
}) => {
  const [config, setConfig] = useState<ApiConfig>(getStoredApiConfig());
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'failed'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleSave = () => {
    saveApiConfig(config);
    onConfigUpdated();
    onClose();
  };

  const handleTestConnection = async () => {
    setTestStatus('testing');
    setErrorMessage('');
    try {
      const res = await fetchBusArrivals('09048', config);
      if (res && res.Services) {
        setTestStatus('success');
      } else {
        setTestStatus('failed');
        setErrorMessage('Unexpected response format from API.');
      }
    } catch (err: unknown) {
      setTestStatus('failed');
      setErrorMessage(err instanceof Error ? err.message : 'Failed to connect to LTA API');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="relative w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">LTA DataMall API Connection</h2>
              <p className="text-xs text-slate-400">Configure your Singapore bus arrival data source</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-5">
          {/* Mode Selector */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
              Data Source Mode
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setConfig({ ...config, mode: 'demo' })}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  config.mode === 'demo'
                    ? 'bg-emerald-500/15 border-emerald-500 text-white shadow-sm'
                    : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="text-xs font-bold text-emerald-400 mb-0.5">Demo / Simulated Mode</div>
                <div className="text-[11px] text-slate-400 leading-tight">
                  Instant real-time dynamic timings. Works offline with 0 setup.
                </div>
              </button>

              <button
                type="button"
                onClick={() => setConfig({ ...config, mode: 'live' })}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  config.mode === 'live'
                    ? 'bg-emerald-500/15 border-emerald-500 text-white shadow-sm'
                    : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="text-xs font-bold text-emerald-400 mb-0.5">Live LTA DataMall API</div>
                <div className="text-[11px] text-slate-400 leading-tight">
                  Connect official Land Transport Authority API with your AccountKey.
                </div>
              </button>
            </div>
          </div>

          {/* LTA Account Key Input */}
          {config.mode === 'live' && (
            <div className="space-y-4 pt-2 border-t border-slate-800 animate-in fade-in duration-200">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-emerald-400" />
                    LTA DataMall AccountKey
                  </label>
                  <a
                    href="https://datamall.lta.gov.sg/content/datamall/en/request-api.html"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-emerald-400 hover:underline flex items-center gap-1"
                  >
                    Get Free Key <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>
                <input
                  type="password"
                  value={config.apiKey}
                  onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
                  placeholder="Paste your 32-character AccountKey here"
                  className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white font-mono placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Custom Proxy URL (Optional) */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-slate-400" />
                  Custom Proxy Endpoint (Optional)
                </label>
                <input
                  type="text"
                  value={config.customProxyUrl || ''}
                  onChange={(e) => setConfig({ ...config, customProxyUrl: e.target.value })}
                  placeholder="e.g. /api/lta/BusArrivalv2 or CORS proxy URL"
                  className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white font-mono placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
                <p className="text-[10px] text-slate-500">
                  Leave empty to connect directly to <code>datamall2.mytransport.sg</code>.
                </p>
              </div>

              {/* Test Button */}
              <div className="pt-1 flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={testStatus === 'testing' || !config.apiKey}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 transition-all disabled:opacity-50"
                >
                  {testStatus === 'testing' ? 'Testing API...' : 'Test Connection'}
                </button>

                {testStatus === 'success' && (
                  <span className="text-xs font-medium text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> API Connected Successfully!
                  </span>
                )}
                {testStatus === 'failed' && (
                  <span className="text-xs font-medium text-rose-400 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" /> {errorMessage || 'Failed to connect'}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 p-4 sm:p-5 bg-slate-950 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs font-bold transition-all shadow-md shadow-emerald-950/40"
          >
            Save Configuration
          </button>
        </div>
      </div>
    </div>
  );
};
