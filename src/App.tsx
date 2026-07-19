/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo } from 'react';
import { CLUBS_DATA, SHORT_GAME_MATRIX } from './data/clubs';
import { ShotInputs, PutInputs, Environment } from './types';
import { calculateFullShot, calculateShortGame, calculatePutting } from './utils/caddyEngine';
import CaddyHeader from './components/CaddyHeader';
import ClubStatsPanel from './components/ClubStatsPanel';
import ShotCalculator from './components/ShotCalculator';
import CaddyOutput from './components/CaddyOutput';
import { ShieldCheck, Wind, Sun, Cloud, Thermometer, Info } from 'lucide-react';

export default function App() {
  // State for Clubs and Short Game Matrices (user customizable)
  const [clubs, setClubs] = useState(CLUBS_DATA);
  const [shortGameMatrix, setShortGameMatrix] = useState(SHORT_GAME_MATRIX);

  // Active Tab: Full swing approach, Short Game 5+1x6, or Putting
  const [activeTab, setActiveTab] = useState<'full' | 'short' | 'putting'>('full');

  // Shared SC environment settings
  const [environment, setEnvironment] = useState<Environment>({
    temperature: 90, // summer Greer defaults
    humidity: 70,
    windSpeed: 8,
    windDirection: 90, // Right-to-Left crosswind
    elevation: 974,    // Greer, SC altitude
    groundFirmness: 'normal',
    greenSpeed: 10,
    caddyBias: 10
  });

  // Tee & Approach Inputs
  const [shotInputs, setShotInputs] = useState<ShotInputs>({
    mode: 'full',
    targetDistance: 150,
    targetElevation: 0,
    canopyHeight: 999,
    environment: environment,
    lie: {
      type: 'fairway',
      slopeUpDown: 0,
      slopeLeftRight: 0
    },
    hazard: {
      type: 'none',
      location: 'none',
      size: 'medium',
      distance: 140,
      offset: 10
    },
    roomToWorkWith: 'normal'
  });

  // Putting Inputs
  const [putInputs, setPutInputs] = useState<PutInputs>({
    paces: 5,
    breakHalfway: 1.0,
    breakTwoThirds: 1.5,
    breakDirection: 'left-to-right',
    slopeUpDown: 'flat',
    slopePercent: 1.5,
    grainDirection: 'neutral',
    greenSpeed: 10,
    wetGreens: false
  });

  // Real-time caddy calculations
  const caddyFullRecommendation = useMemo(() => {
    return calculateFullShot(shotInputs, clubs);
  }, [shotInputs, clubs]);

  const caddyShortRecommendation = useMemo(() => {
    // Inject short game flag but keep environment sync
    const inputsWithShort = { ...shotInputs, mode: 'short' as const };
    return calculateShortGame(inputsWithShort, shortGameMatrix);
  }, [shotInputs, shortGameMatrix]);

  const puttingDetails = useMemo(() => {
    return calculatePutting(putInputs);
  }, [putInputs]);

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-200 p-4 sm:p-6 lg:p-8 flex flex-col font-sans selection:bg-emerald-500/20 selection:text-emerald-300">
      <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col gap-6">
        
        {/* Header Block with Upstate SC Presets */}
        <CaddyHeader environment={environment} setEnvironment={setEnvironment} />

        {/* Club Specs & 5+1x6 Customization (Collapsible Drawer) */}
        <ClubStatsPanel
          clubs={clubs}
          setClubs={setClubs}
          shortGameMatrix={shortGameMatrix}
          setShortGameMatrix={setShortGameMatrix}
        />

        {/* Caddy Dashboard Layout - Double Page Yardage Book */}
        <main className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch flex-1" id="caddy-dashboard">
          
          {/* Left Page: Inputs & Calculator */}
          <div className="lg:col-span-7 h-full">
            <ShotCalculator
              environment={environment}
              setEnvironment={setEnvironment}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              shotInputs={shotInputs}
              setShotInputs={setShotInputs}
              putInputs={putInputs}
              setPutInputs={setPutInputs}
            />
          </div>

          {/* Right Page: Caddy Outputs & Recommendations */}
          <div className="lg:col-span-5 h-full">
            <CaddyOutput
              recommendation={activeTab === 'short' ? caddyShortRecommendation : caddyFullRecommendation}
              activeTab={activeTab}
              puttingDetails={puttingDetails}
              shotInputs={shotInputs}
              putInputs={putInputs}
            />
          </div>
        </main>

        {/* Live Caddy Environment Status Bar / HUD */}
        <footer className="bg-[#1E293B] border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row justify-between items-center gap-4 mt-6 text-xs text-slate-400 font-mono shadow-xl" id="caddy-footer">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)] animate-pulse shrink-0"></div>
              <span className="font-bold text-slate-300 uppercase tracking-wider text-[10px]">CADDY LINK ONLINE</span>
            </div>
            <span className="hidden sm:inline text-slate-600">|</span>
            <span className="text-center sm:text-left">
              Live environment: <b className="text-slate-200">{environment.elevation} ft Alt</b> • <b className="text-slate-200">{environment.temperature}°F</b> • <b className="text-slate-200">{environment.humidity}% RH</b>
            </span>
          </div>
          <div className="flex flex-wrap justify-center items-center gap-4">
            <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-slate-500">
              <Sun className="w-3.5 h-3.5 text-amber-500" />
              <span>Standard Pressure</span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-slate-500">
              <Wind className="w-3.5 h-3.5 text-sky-400" />
              <span>Wind {environment.windSpeed} mph @ {environment.windDirection}°</span>
            </div>
            <div className="h-4 w-px bg-slate-800 hidden md:block"></div>
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20 uppercase tracking-widest">
              Greer SC Engine v2.4
            </span>
          </div>
        </footer>

      </div>
    </div>
  );

}
