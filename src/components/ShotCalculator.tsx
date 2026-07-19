/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { ShotInputs, Environment, Lie, Hazard, PutInputs } from '../types';
import { Target, Compass, Wind, AlertTriangle, Trees, Droplets, ArrowUpRight, CheckSquare } from 'lucide-react';

interface ShotCalculatorProps {
  environment: Environment;
  setEnvironment: (env: Environment) => void;
  activeTab: 'full' | 'short' | 'putting';
  setActiveTab: (tab: 'full' | 'short' | 'putting') => void;
  shotInputs: ShotInputs;
  setShotInputs: (inputs: ShotInputs) => void;
  putInputs: PutInputs;
  setPutInputs: (inputs: PutInputs) => void;
}

const WIND_DIRECTIONS = [
  { value: 0, label: '12:00 (Straight Headwind)' },
  { value: 45, label: '1:30 (Quartering Headwind Right)' },
  { value: 90, label: '3:00 (Direct Right-to-Left)' },
  { value: 135, label: '4:30 (Quartering Tailwind Right)' },
  { value: 180, label: '6:00 (Straight Tailwind)' },
  { value: 225, label: '7:30 (Quartering Tailwind Left)' },
  { value: 270, label: '9:00 (Direct Left-to-Right)' },
  { value: 315, label: '10:30 (Quartering Headwind Left)' }
];

export default function ShotCalculator({
  environment,
  setEnvironment,
  activeTab,
  setActiveTab,
  shotInputs,
  setShotInputs,
  putInputs,
  setPutInputs
}: ShotCalculatorProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Sync environment changes from header presets into shotInputs
  useEffect(() => {
    setShotInputs({
      ...shotInputs,
      environment: environment
    });
  }, [environment]);

  const handleShotChange = (key: string, value: any) => {
    setShotInputs({
      ...shotInputs,
      [key]: value
    });
  };

  const handleTabChange = (tab: 'full' | 'short' | 'putting') => {
    setActiveTab(tab);
    if (tab === 'short') {
      if (shotInputs.targetDistance > 85 || shotInputs.targetDistance < 2) {
        setShotInputs({
          ...shotInputs,
          targetDistance: 15
        });
      }
    } else if (tab === 'full') {
      if (shotInputs.targetDistance > 320 || shotInputs.targetDistance < 40) {
        setShotInputs({
          ...shotInputs,
          targetDistance: 150
        });
      }
    }
  };

  const handleEnvChange = (key: keyof Environment, value: any) => {
    const updatedEnv = {
      ...environment,
      [key]: value
    };
    setEnvironment(updatedEnv);
    setShotInputs({
      ...shotInputs,
      environment: updatedEnv
    });
  };

  const handleLieChange = (key: keyof Lie, value: any) => {
    setShotInputs({
      ...shotInputs,
      lie: {
        ...shotInputs.lie,
        [key]: value
      }
    });
  };

  const handleHazardChange = (key: keyof Hazard, value: any) => {
    setShotInputs({
      ...shotInputs,
      hazard: {
        ...shotInputs.hazard,
        [key]: value
      }
    });
  };

  const handlePutChange = (key: keyof PutInputs, value: any) => {
    setPutInputs({
      ...putInputs,
      [key]: value
    });
  };

  return (
    <div className="bg-[#1E293B] rounded-2xl border border-slate-700/80 shadow-2xl p-6 flex flex-col gap-6" id="shot-calculator">
      {/* Tab Switcher */}
      <div className="flex bg-[#0F172A] p-1 rounded-xl border border-slate-800">
        <button
          id="tab-full"
          onClick={() => handleTabChange('full')}
          className={`flex-1 py-2.5 px-3 rounded-lg text-xs font-mono uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-1.5 ${
            activeTab === 'full'
              ? 'bg-emerald-500 text-slate-950 font-bold shadow-[0_0_12px_rgba(16,185,129,0.25)]'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <ArrowUpRight className="w-4 h-4" /> Full Shot
        </button>
        <button
          id="tab-short"
          onClick={() => handleTabChange('short')}
          className={`flex-1 py-2.5 px-3 rounded-lg text-xs font-mono uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-1.5 ${
            activeTab === 'short'
              ? 'bg-emerald-500 text-slate-950 font-bold shadow-[0_0_12px_rgba(16,185,129,0.25)]'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Trees className="w-4 h-4" /> Short Game
        </button>
        <button
          id="tab-putting"
          onClick={() => handleTabChange('putting')}
          className={`flex-1 py-2.5 px-3 rounded-lg text-xs font-mono uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-1.5 ${
            activeTab === 'putting'
              ? 'bg-emerald-500 text-slate-950 font-bold shadow-[0_0_12px_rgba(16,185,129,0.25)]'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Compass className="w-4 h-4" /> Putting
        </button>
      </div>

      {/* Main Form Fields */}
      <div className="space-y-6">
        {activeTab !== 'putting' ? (
          /* TEE / APPROACH & SHORT GAME MODE FIELDS */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Target Specs */}
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-slate-700/60 pb-2">
                <h3 className="text-xs font-bold uppercase text-slate-300 tracking-widest flex items-center gap-1.5">
                  <Target className="w-4 h-4 text-emerald-400" /> Target Distance & Slope
                </h3>
                <span className="text-[10px] text-emerald-400 font-mono font-bold tracking-widest">STEP 1</span>
              </div>

              {/* Target Yardage Slider */}
              <div className="bg-[#0F172A] p-4 rounded-xl border border-slate-800">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">DISTANCE TO TARGET</span>
                  <span className="text-xl font-bold font-mono text-white">
                    {shotInputs.targetDistance} <span className="text-xs text-emerald-400 uppercase font-mono">Yards</span>
                  </span>
                </div>
                <input
                  type="range"
                  min={activeTab === 'short' ? 2 : 40}
                  max={activeTab === 'short' ? 85 : 320}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  value={shotInputs.targetDistance}
                  onChange={e => handleShotChange('targetDistance', parseInt(e.target.value))}
                />
                <div className="flex justify-between text-[9px] text-slate-500 font-mono mt-1">
                  <span>{activeTab === 'short' ? '2y' : '40y'}</span>
                  <span>{activeTab === 'short' ? '85y (System Max)' : '320y'}</span>
                </div>
              </div>

              {/* Target Elevation Slider */}
              <div className="bg-[#0F172A] p-4 rounded-xl border border-slate-800">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">TARGET ELEVATION CHANGE</span>
                  <span className={`text-sm font-bold font-mono ${shotInputs.targetElevation > 0 ? 'text-rose-400' : shotInputs.targetElevation < 0 ? 'text-sky-400' : 'text-white'}`}>
                    {shotInputs.targetElevation > 0 ? `+${shotInputs.targetElevation}` : shotInputs.targetElevation} <span className="text-xs text-slate-500">Feet ({shotInputs.targetElevation > 0 ? 'Uphill' : shotInputs.targetElevation < 0 ? 'Downhill' : 'Flat'})</span>
                  </span>
                </div>
                <input
                  type="range"
                  min="-60"
                  max="60"
                  step="5"
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  value={shotInputs.targetElevation}
                  onChange={e => handleShotChange('targetElevation', parseInt(e.target.value))}
                />
                <div className="flex justify-between text-[9px] text-slate-500 font-mono mt-1">
                  <span>-60ft Downhill</span>
                  <span>Flat</span>
                  <span>+60ft Uphill</span>
                </div>
              </div>

              {/* Green Space, Canopy, and Recommendation Bias Options */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">GREEN ROOM</label>
                  <select
                    id="select-room"
                    value={shotInputs.roomToWorkWith}
                    onChange={e => handleShotChange('roomToWorkWith', e.target.value)}
                    className="bg-[#0F172A] hover:bg-[#162035] border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer transition-colors"
                  >
                    <option value="normal">Normal Room</option>
                    <option value="short_sided">Short-Sided (Tight)</option>
                    <option value="plenty">Plenty of Green</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">CANOPY OBSTRUCTION</label>
                  <select
                    id="select-canopy"
                    value={shotInputs.canopyHeight}
                    onChange={e => handleShotChange('canopyHeight', parseInt(e.target.value))}
                    className="bg-[#0F172A] hover:bg-[#162035] border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer transition-colors"
                  >
                    <option value={999}>None (Clear Sky)</option>
                    <option value={60}>60ft High Trees</option>
                    <option value={40}>40ft Mid Trees</option>
                    <option value={25}>25ft Low Branches</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">CADDY BIAS</label>
                  <select
                    id="select-caddy-bias"
                    value={environment.caddyBias ?? 10}
                    onChange={e => handleEnvChange('caddyBias', parseInt(e.target.value))}
                    className="bg-[#0F172A] hover:bg-[#162035] border border-slate-800 rounded-xl p-2.5 text-xs text-emerald-400 font-bold focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer transition-colors"
                  >
                    <option value={15} className="text-slate-300 font-normal">Super Safe (+15y)</option>
                    <option value={10} className="text-emerald-400 font-bold">Safe (+10y Default)</option>
                    <option value={5} className="text-slate-300 font-normal">Play Center (+5y)</option>
                    <option value={0} className="text-slate-300 font-normal">Standard (0y)</option>
                    <option value={-5} className="text-slate-300 font-normal">Aggressive (-5y)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Lie & Wind Specs */}
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-slate-700/60 pb-2">
                <h3 className="text-xs font-bold uppercase text-slate-300 tracking-widest flex items-center gap-1.5">
                  <Wind className="w-4 h-4 text-emerald-400" /> Lie Lie & Wind Angle
                </h3>
                <span className="text-[10px] text-emerald-400 font-mono font-bold tracking-widest">STEP 2</span>
              </div>

              {/* Lie Type selection */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: 'tee', label: 'Tee / Perfect' },
                  { value: 'fairway', label: 'Fairway' },
                  { value: 'first_cut', label: 'First Cut' },
                  { value: 'rough', label: 'Deep Rough' },
                  { value: 'sand', label: 'Bunker/Sand' },
                  { value: 'buried', label: 'Plugged/Buried' }
                ].map(l => (
                  <button
                    key={l.value}
                    id={`btn-lie-${l.value}`}
                    onClick={() => handleLieChange('type', l.value as any)}
                    className={`py-2 px-1 rounded-xl text-[11px] font-mono uppercase tracking-wider transition-all duration-200 border ${
                      shotInputs.lie.type === l.value
                        ? 'bg-emerald-500 border-emerald-500 text-slate-950 font-bold shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                        : 'bg-[#0F172A] border-slate-800 text-slate-400 hover:border-slate-700 hover:text-white'
                    }`}
                  >
                    {l.label.split(' / ')[0]}
                  </button>
                ))}
              </div>

              {/* Slopes sliders */}
              <div className="bg-[#0F172A] p-3.5 rounded-xl border border-slate-800 space-y-3">
                {/* Slope Up/Down */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[9px] font-bold uppercase text-slate-400 tracking-wider">STANCE SLOPE (UP/DOWN)</span>
                    <span className="text-xs font-mono font-bold text-emerald-400">
                      {shotInputs.lie.slopeUpDown > 0 ? `Uphill ${shotInputs.lie.slopeUpDown}°` : shotInputs.lie.slopeUpDown < 0 ? `Downhill ${Math.abs(shotInputs.lie.slopeUpDown)}°` : 'Flat 0°'}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="-15"
                    max="15"
                    step="1"
                    className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                    value={shotInputs.lie.slopeUpDown}
                    onChange={e => handleLieChange('slopeUpDown', parseInt(e.target.value))}
                  />
                </div>

                {/* Slope Left/Right */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[9px] font-bold uppercase text-slate-400 tracking-wider">SIDE-HILL (BALL ABOVE/BELOW)</span>
                    <span className="text-xs font-mono font-bold text-emerald-400">
                      {shotInputs.lie.slopeLeftRight > 0 ? `Ball Above ${shotInputs.lie.slopeLeftRight}°` : shotInputs.lie.slopeLeftRight < 0 ? `Ball Below ${Math.abs(shotInputs.lie.slopeLeftRight)}°` : 'Even 0°'}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="-15"
                    max="15"
                    step="1"
                    className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                    value={shotInputs.lie.slopeLeftRight}
                    onChange={e => handleLieChange('slopeLeftRight', parseInt(e.target.value))}
                  />
                </div>
              </div>

              {/* Wind clock dial system */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center bg-[#0F172A] p-3.5 rounded-xl border border-slate-800">
                <div className="sm:col-span-7 flex flex-col gap-1.5">
                  <span className="text-[9px] font-bold uppercase text-slate-400 tracking-wider block">WIND DIRECTION</span>
                  <select
                    id="select-wind-dir"
                    value={environment.windDirection}
                    onChange={e => handleEnvChange('windDirection', parseInt(e.target.value))}
                    className="bg-[#1E293B] border border-slate-850 rounded-lg p-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer text-slate-200"
                  >
                    {WIND_DIRECTIONS.map(wd => (
                      <option key={wd.value} value={wd.value}>{wd.label}</option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-5 flex flex-col gap-1.5">
                  <span className="text-[9px] font-bold uppercase text-slate-400 tracking-wider flex justify-between">
                    <span>WIND SPEED</span>
                    <span className="font-bold text-emerald-400 font-mono">{environment.windSpeed} mph</span>
                  </span>
                  <input
                    type="range"
                    min="0"
                    max="30"
                    step="2"
                    className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500 mt-2"
                    value={environment.windSpeed}
                    onChange={e => handleEnvChange('windSpeed', parseInt(e.target.value))}
                  />
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* PUTTING MODE FIELDS */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Putting left side: distance and break */}
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-slate-700/60 pb-2">
                <h3 className="text-xs font-bold uppercase text-slate-300 tracking-widest flex items-center gap-1.5">
                  <Compass className="w-4 h-4 text-emerald-400" /> Cup Distance & Break Factors
                </h3>
                <span className="text-[10px] text-emerald-400 font-mono font-bold tracking-widest">PUTTING</span>
              </div>

              {/* Paces slider */}
              <div className="bg-[#0F172A] p-4 rounded-xl border border-slate-800">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">PACES TO THE HOLE</span>
                  <span className="text-xl font-bold font-mono text-white">
                    {putInputs.paces} <span className="text-xs text-emerald-400 uppercase font-mono">Paces ({Math.round(putInputs.paces * 3)} ft)</span>
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="35"
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  value={putInputs.paces}
                  onChange={e => handlePutChange('paces', parseInt(e.target.value))}
                />
                <div className="flex justify-between text-[9px] text-slate-500 font-mono mt-1">
                  <span>1 Pace (3ft)</span>
                  <span>15 Paces (45ft)</span>
                  <span>35 Paces (105ft)</span>
                </div>
              </div>

              {/* Halfway Break Slider */}
              <div className="bg-[#0F172A] p-4 rounded-xl border border-slate-800">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">BREAK AT HALFWAY POINT</span>
                  <span className="text-sm font-bold font-mono text-emerald-400">
                    {putInputs.breakHalfway}% Slope
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="6"
                  step="0.5"
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  value={putInputs.breakHalfway}
                  onChange={e => handlePutChange('breakHalfway', parseFloat(e.target.value))}
                />
                <div className="flex justify-between text-[9px] text-slate-500 font-mono mt-1">
                  <span>0% (Flat)</span>
                  <span>3% (Moderate Break)</span>
                  <span>6% (Heavy Break)</span>
                </div>
              </div>

              {/* 2/3 Way Break Slider */}
              <div className="bg-[#0F172A] p-4 rounded-xl border border-slate-800">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">BREAK AT 2/3 WAY POINT</span>
                  <span className="text-sm font-bold font-mono text-emerald-400">
                    {putInputs.breakTwoThirds}% Slope
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="6"
                  step="0.5"
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  value={putInputs.breakTwoThirds}
                  onChange={e => handlePutChange('breakTwoThirds', parseFloat(e.target.value))}
                />
                <div className="flex justify-between text-[9px] text-slate-500 font-mono mt-1">
                  <span>0%</span>
                  <span>3%</span>
                  <span>6%</span>
                </div>
              </div>
            </div>

            {/* Putting right side: grain, slopes, wetness */}
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-slate-700/60 pb-2">
                <h3 className="text-xs font-bold uppercase text-slate-300 tracking-widest flex items-center gap-1.5">
                  <CheckSquare className="w-4 h-4 text-emerald-400" /> Slope, Grain & Green Speeds
                </h3>
                <span className="text-[10px] text-emerald-400 font-mono font-bold tracking-widest">CONTEXT</span>
              </div>

              {/* Break direction toggles */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">BREAK DIRECTION</span>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 'straight', label: 'Straight' },
                    { value: 'left-to-right', label: 'Left to Right' },
                    { value: 'right-to-left', label: 'Right to Left' }
                  ].map(dir => (
                    <button
                      key={dir.value}
                      id={`btn-break-${dir.value}`}
                      onClick={() => handlePutChange('breakDirection', dir.value as any)}
                      className={`py-2 px-2 border rounded-xl text-xs font-mono uppercase tracking-wider transition-all duration-200 ${
                        putInputs.breakDirection === dir.value
                          ? 'bg-emerald-500 border-emerald-500 text-slate-950 font-bold shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                          : 'bg-[#0F172A] border-slate-800 text-slate-400 hover:border-slate-700 hover:text-white'
                      }`}
                    >
                      {dir.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Slope Grade Up/Down */}
              <div className="bg-[#0F172A] p-3 rounded-xl border border-slate-800 space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[9px] font-bold uppercase text-slate-400 tracking-wider font-mono">SLOPE PROFILE</span>
                    <select
                      id="select-slope-profile"
                      value={putInputs.slopeUpDown}
                      onChange={e => handlePutChange('slopeUpDown', e.target.value)}
                      className="bg-[#1E293B] border border-slate-800 rounded-lg p-1.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer text-slate-200"
                    >
                      <option value="flat">Flat</option>
                      <option value="uphill">Uphill Putt</option>
                      <option value="downhill">Downhill Putt</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[9px] font-bold uppercase text-slate-400 tracking-wider font-mono">SLOPE STEEPNESS</span>
                    <span className="text-xs font-mono font-bold text-emerald-400 mt-1.5 block">
                      {putInputs.slopePercent}% Grade
                    </span>
                  </div>
                </div>

                {putInputs.slopeUpDown !== 'flat' && (
                  <div>
                    <input
                      type="range"
                      min="0.5"
                      max="6"
                      step="0.5"
                      className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                      value={putInputs.slopePercent}
                      onChange={e => handlePutChange('slopePercent', parseFloat(e.target.value))}
                    />
                    <div className="flex justify-between text-[9px] text-slate-500 font-mono mt-0.5">
                      <span>0.5% (Barely)</span>
                      <span>3% (Moderate)</span>
                      <span>6% (Extreme)</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Grain directions */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">GREEN GRAIN DIRECTION</span>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 'neutral', label: 'Neutral' },
                    { value: 'into_you', label: 'Into You' },
                    { value: 'away_from_you', label: 'Down Grain' },
                    { value: 'cross_left', label: 'Grain Left' },
                    { value: 'cross_right', label: 'Grain Right' }
                  ].map(g => (
                    <button
                      key={g.value}
                      id={`btn-grain-${g.value}`}
                      onClick={() => handlePutChange('grainDirection', g.value as any)}
                      className={`py-1.5 px-1 border rounded-lg text-xs font-mono uppercase tracking-wider transition-all duration-200 ${
                        putInputs.grainDirection === g.value
                          ? 'bg-emerald-500 border-emerald-500 text-slate-950 font-bold'
                          : 'bg-[#0F172A] border-slate-800 text-slate-400 hover:border-slate-700 hover:text-white'
                      }`}
                    >
                      {g.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Wet greens toggle */}
              <div className="bg-[#0F172A] p-3 rounded-xl border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs">
                  <Droplets className="w-4 h-4 text-sky-400 shrink-0" />
                  <div>
                    <span className="font-bold text-slate-300 block text-xs">WET / DEWY GREENS</span>
                    <span className="text-[10px] text-slate-500">Slows roll speed & reduces break</span>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    id="checkbox-wet-greens"
                    checked={putInputs.wetGreens}
                    onChange={e => handlePutChange('wetGreens', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-400 after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Hazard & Advanced Conditions Panel Toggle */}
        {activeTab !== 'putting' && (
          <div className="pt-2 border-t border-slate-800">
            <button
              id="btn-toggle-advanced"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 font-bold transition-colors uppercase font-mono tracking-wider"
            >
              <AlertTriangle className="w-3.5 h-3.5" /> {showAdvanced ? 'Hide Course Hazards' : 'Show Course Hazards & Greenside Obstacles'}
            </button>

            {showAdvanced && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 p-4 bg-[#0F172A] rounded-xl border border-slate-800 animate-fade-in">
                {/* Hazard Profile */}
                <div className="space-y-3">
                  <span className="text-[10px] font-bold text-amber-400 block uppercase tracking-widest font-mono">
                    Hazard Settings
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold uppercase text-slate-500">HAZARD TYPE</label>
                      <select
                        id="select-hazard-type"
                        value={shotInputs.hazard.type}
                        onChange={e => handleHazardChange('type', e.target.value as any)}
                        className="bg-[#1E293B] border border-slate-850 rounded-lg p-1.5 text-xs text-slate-200 focus:ring-1 focus:ring-emerald-500 font-semibold cursor-pointer"
                      >
                        <option value="none">None</option>
                        <option value="water">Water Hazard</option>
                        <option value="sand">Sand Trap / Bunker</option>
                        <option value="ob">Out of Bounds</option>
                        <option value="trees">Dense Wood Line</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold uppercase text-slate-500">HAZARD SECTOR</label>
                      <select
                        id="select-hazard-loc"
                        value={shotInputs.hazard.location}
                        onChange={e => handleHazardChange('location', e.target.value as any)}
                        className="bg-[#1E293B] border border-slate-850 rounded-lg p-1.5 text-xs text-slate-200 focus:ring-1 focus:ring-emerald-500 font-semibold cursor-pointer"
                      >
                        <option value="none">No Hazard In Play</option>
                        <option value="front">Front (Guard)</option>
                        <option value="back">Back (Long)</option>
                        <option value="left">Left Flank</option>
                        <option value="right">Right Flank</option>
                      </select>
                    </div>
                  </div>

                  {shotInputs.hazard.type !== 'none' && (
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold uppercase text-slate-500">DISTANCE TO HAZARD</label>
                        <span className="text-xs font-bold text-slate-300 font-mono mt-1">
                          {shotInputs.hazard.distance} Yards
                        </span>
                        <input
                          type="range"
                          min="30"
                          max="280"
                          step="5"
                          className="w-full h-1 bg-slate-800 rounded-lg accent-emerald-500 mt-1"
                          value={shotInputs.hazard.distance}
                          onChange={e => handleHazardChange('distance', parseInt(e.target.value))}
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold uppercase text-slate-500">HAZARD RISK SCALE</label>
                        <select
                          id="select-hazard-size"
                          value={shotInputs.hazard.size}
                          onChange={e => handleHazardChange('size', e.target.value as any)}
                          className="bg-[#1E293B] border border-slate-850 rounded-lg p-1.5 text-xs text-slate-200 font-semibold cursor-pointer"
                        >
                          <option value="small">Small Penalty</option>
                          <option value="medium">Medium Threat</option>
                          <option value="large">Large/Critical Hazard</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>

                {/* Course Setup Variables */}
                <div className="space-y-3 border-t md:border-t-0 md:border-l border-slate-800 md:pl-4">
                  <span className="text-[10px] font-bold text-emerald-400 block uppercase tracking-widest font-mono">
                    Course / Condition Variables
                  </span>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold uppercase text-slate-500 font-mono">STIMPMETER SPEED</label>
                      <select
                        id="select-stimp"
                        value={environment.greenSpeed}
                        onChange={e => handleEnvChange('greenSpeed', parseInt(e.target.value))}
                        className="bg-[#1E293B] border border-slate-850 rounded-lg p-1.5 text-xs text-slate-200 font-semibold cursor-pointer"
                      >
                        <option value={8}>Stimp 8 (Slow Muni)</option>
                        <option value={10}>Stimp 10 (Standard Resort)</option>
                        <option value={11}>Stimp 11 (Fast Club CC)</option>
                        <option value={12}>Stimp 12+ (Tournament Fast)</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold uppercase text-slate-500 font-mono">GROUND FIRMNESS</label>
                      <select
                        id="select-firmness"
                        value={environment.groundFirmness}
                        onChange={e => handleEnvChange('groundFirmness', e.target.value)}
                        className="bg-[#1E293B] border border-[#1E293B] rounded-lg p-1.5 text-xs text-slate-200 font-semibold cursor-pointer"
                      >
                        <option value="soft">Soft / Soggy</option>
                        <option value="normal">Normal Turf</option>
                        <option value="firm">Firm / Baked Out</option>
                      </select>
                    </div>
                  </div>

                  <p className="text-[10px] text-slate-400 leading-relaxed font-serif italic mt-2">
                    * Bunkers and deep rough lies reduce spin rate drastically, resulting in "fliers" that run far past normal distances. Keep these in mind!
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
