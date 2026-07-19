/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Compass, Thermometer, MapPin, User, Award } from 'lucide-react';
import { Environment } from '../types';

interface CaddyHeaderProps {
  environment: Environment;
  setEnvironment: (env: Environment) => void;
}

export const UPSTATE_LOCATIONS = [
  { name: 'Greer, SC', elevation: 974, description: 'Greer Country Club / Thornblade area' },
  { name: 'Greenville, SC', elevation: 968, description: 'Greenville Country Club / Chanticleer' },
  { name: 'Spartanburg, SC', elevation: 801, description: 'The Country Club of Spartanburg' },
  { name: 'Anderson, SC', elevation: 771, description: 'Cobb\'s Glen / Anderson Country Club' },
  { name: 'Sea Level Baseline', elevation: 0, description: 'Standard Sea Level Reference' }
];

export const SEASON_PRESETS = [
  { name: 'Summer Heat', temp: 90, humidity: 70 },
  { name: 'Spring / Autumn Mild', temp: 72, humidity: 55 },
  { name: 'Winter Cool', temp: 50, humidity: 40 }
];

export default function CaddyHeader({ environment, setEnvironment }: CaddyHeaderProps) {
  const [selectedLoc, setSelectedLoc] = useState('Greer, SC');
  const [selectedSeason, setSelectedSeason] = useState('Summer Heat');

  const handleLocationChange = (locName: string) => {
    setSelectedLoc(locName);
    const loc = UPSTATE_LOCATIONS.find(l => l.name === locName);
    if (loc) {
      setEnvironment({
        ...environment,
        elevation: loc.elevation
      });
    }
  };

  const handleSeasonChange = (seasonName: string) => {
    setSelectedSeason(seasonName);
    const season = SEASON_PRESETS.find(s => s.name === seasonName);
    if (season) {
      setEnvironment({
        ...environment,
        temperature: season.temp,
        humidity: season.humidity
      });
    }
  };

  return (
    <header className="bg-[#1E293B] text-white rounded-2xl p-6 shadow-2xl mb-2 border border-slate-700/80" id="caddy-header">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        {/* Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-500 rounded flex items-center justify-center font-black text-slate-950 italic text-xl shadow-[0_0_15px_rgba(16,185,129,0.4)]">
            PC
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight uppercase italic text-white font-display">
              ProCaddy <span className="text-emerald-400">v2.4</span>
            </h1>
            <p className="text-[10px] text-slate-400 font-mono tracking-widest font-semibold">
              PRO COMPANION ENGINE • UPSTATE SOUTH CAROLINA EDITION
            </p>
          </div>
        </div>

        {/* Player Profile & Ball Info */}
        <div className="flex flex-wrap gap-3">
          <div className="bg-[#0F172A] border border-slate-800 rounded-xl py-2 px-3 flex items-center gap-2 text-xs">
            <User className="w-4 h-4 text-emerald-400 shrink-0" />
            <div>
              <span className="text-slate-500 block font-mono text-[9px] font-bold tracking-wider">GOLFER PROFILE</span>
              <span className="font-semibold text-slate-200">5'11" • 190 lbs • Stiff Flex</span>
            </div>
          </div>
          <div className="bg-[#0F172A] border border-slate-800 rounded-xl py-2 px-3 flex items-center gap-2 text-xs">
            <Award className="w-4 h-4 text-emerald-400 shrink-0" />
            <div>
              <span className="text-slate-500 block font-mono text-[9px] font-bold tracking-wider">BALL PROFILE</span>
              <span className="font-semibold text-emerald-300">Srixon Soft Feel (Opt)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Location Presets Drawer/Bar */}
      <div className="mt-6 pt-6 border-t border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* SC Location Selector */}
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-bold uppercase text-slate-400 font-mono tracking-widest flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-emerald-400" /> UPSTATE LOCATION PRESET
          </label>
          <div className="flex flex-wrap gap-1.5">
            {UPSTATE_LOCATIONS.map(loc => (
              <button
                key={loc.name}
                id={`btn-loc-${loc.name.replace(/\s+/g, '-').replace(/,/g, '')}`}
                onClick={() => handleLocationChange(loc.name)}
                className={`py-1.5 px-3 rounded-lg text-xs font-mono transition-all duration-200 uppercase tracking-wider ${
                  selectedLoc === loc.name
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                    : 'bg-[#0F172A] text-slate-400 hover:text-white border border-slate-800 hover:border-slate-700'
                }`}
                title={loc.description}
              >
                {loc.name.split(',')[0]} ({loc.elevation} ft)
              </button>
            ))}
          </div>
        </div>

        {/* Climate Season Selector */}
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-bold uppercase text-slate-400 font-mono tracking-widest flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-emerald-400" /> CLIMATE SEASON PRESET
          </label>
          <div className="flex flex-wrap gap-1.5">
            {SEASON_PRESETS.map(season => (
              <button
                key={season.name}
                id={`btn-season-${season.name.replace(/\s+/g, '-')}`}
                onClick={() => handleSeasonChange(season.name)}
                className={`py-1.5 px-3 rounded-lg text-xs font-mono transition-all duration-200 uppercase tracking-wider ${
                  selectedSeason === season.name
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                    : 'bg-[#0F172A] text-slate-400 hover:text-white border border-slate-800 hover:border-slate-700'
                }`}
              >
                {season.name.split('/')[0]} ({season.temp}°F, {season.humidity}%)
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}
