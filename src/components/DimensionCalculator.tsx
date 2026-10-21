import React, { useState } from 'react';
import { 
  Car, 
  TrendingUp, 
  Footprints, 
  Ruler, 
  Copy, 
  Check,
  CheckSquare
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const DimensionCalculator: React.FC = () => {
  const [activeTool, setActiveTool] = useState<'parking' | 'ramp' | 'stairs' | 'cheatsheet' | 'checklist'>('parking');
  const [copied, setCopied] = useState(false);
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  // Parking state
  const [buildingType, setBuildingType] = useState<'commercial' | 'cityhall' | 'office' | 'residential'>('cityhall');
  const [gfa, setGfa] = useState<number>(6500);

  // Ramp state
  const [riseHeight, setRiseHeight] = useState<number>(1.2);

  // Stair state
  const [floorHeight, setFloorHeight] = useState<number>(3.6);
  const [targetRiser, setTargetRiser] = useState<number>(175);

  // Parking calculations (PD 1096)
  const getParkingRatio = () => {
    switch (buildingType) {
      case 'commercial': return 50;
      case 'cityhall': return 125;
      case 'office': return 100;
      case 'residential': return 100;
    }
  };

  const ratio = getParkingRatio();
  const rawSlots = Math.ceil(gfa / ratio);
  const pwdSlots = rawSlots <= 50 ? 1 : 1 + Math.ceil((rawSlots - 50) / 100);
  const regularSlots = Math.max(1, rawSlots - pwdSlots);
  const motorcycleSlots = Math.ceil(rawSlots * 0.2);
  const loadingBays = buildingType === 'commercial' ? Math.max(1, Math.ceil(gfa / 5000)) : 1;
  const approxParkingAreaSqm = Math.round((regularSlots * 25) + (pwdSlots * 35) + (motorcycleSlots * 5) + (loadingBays * 60));

  // Ramp calculations (BP 344)
  const rampSlopeRatio = 12; // 1:12
  const rampLength = Math.round((riseHeight * rampSlopeRatio) * 10) / 10;
  const landingsNeeded = Math.floor(rampLength / 6.0);
  const totalRampLength = Math.round((rampLength + (landingsNeeded * 1.5)) * 10) / 10;

  // Stair calculations (Blondel's Formula)
  const floorHeightMm = floorHeight * 1000;
  const numRisers = Math.round(floorHeightMm / targetRiser);
  const exactRiserMm = Math.round((floorHeightMm / numRisers) * 10) / 10;
  const recommendedTreadMm = Math.round(630 - (2 * exactRiserMm));
  const blondelScore = (2 * exactRiserMm) + recommendedTreadMm;
  const totalStairRunM = Math.round(((numRisers - 1) * (recommendedTreadMm / 1000)) * 100) / 100;

  const handleCopySummary = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    confetti({
      particleCount: 20,
      spread: 40,
      origin: { y: 0.8 },
      colors: ['#2C6E49', '#C85A32'],
    });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="text-[11px] font-mono font-bold tracking-wider px-3 py-1 rounded-full bg-[#2C6E49]/10 text-[#2C6E49] uppercase inline-block">
          Philippine Building Laws Reference
        </span>
        <h2 className="text-2xl md:text-3xl font-bold text-stone-900 tracking-tight">
          Arki Dimension & Code Calculator
        </h2>
        <p className="text-xs md:text-sm text-stone-600 leading-relaxed">
          Quickly compute National Building Code (PD 1096) parking requirements, BP 344 1:12 ramp lengths, and stair riser ergonomics for studio drafting plates.
        </p>

        {/* Tab Selector */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 p-1 rounded-2xl bg-white border border-[#E8E4DC] w-fit mx-auto mt-4 shadow-sm">
          <button
            onClick={() => setActiveTool('parking')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
              activeTool === 'parking'
                ? 'bg-[#2C6E49] text-white font-bold shadow-sm'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <Car className="w-3.5 h-3.5" />
            <span>Parking (PD 1096)</span>
          </button>

          <button
            onClick={() => setActiveTool('ramp')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
              activeTool === 'ramp'
                ? 'bg-[#2C6E49] text-white font-bold shadow-sm'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>PWD Ramp (BP 344)</span>
          </button>

          <button
            onClick={() => setActiveTool('stairs')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
              activeTool === 'stairs'
                ? 'bg-[#2C6E49] text-white font-bold shadow-sm'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <Footprints className="w-3.5 h-3.5" />
            <span>Stair Riser (Blondel)</span>
          </button>

          <button
            onClick={() => setActiveTool('cheatsheet')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
              activeTool === 'cheatsheet'
                ? 'bg-[#2C6E49] text-white font-bold shadow-sm'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <Ruler className="w-3.5 h-3.5" />
            <span>Code Cheatsheet</span>
          </button>

          <button
            onClick={() => setActiveTool('checklist')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
              activeTool === 'checklist'
                ? 'bg-[#2C6E49] text-white font-bold shadow-sm'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span>Plate Defense Checklist</span>
          </button>
        </div>
      </div>

      {/* PARKING CALCULATOR */}
      {activeTool === 'parking' && (
        <div className="bg-white border border-[#E8E4DC] rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1.5">
                  Building Typology (PD 1096 Table VII.4)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'cityhall', label: 'City Hall (1:125 sqm)' },
                    { id: 'commercial', label: 'Commercial Mall (1:50 sqm)' },
                    { id: 'office', label: 'Office Tower (1:100 sqm)' },
                    { id: 'residential', label: 'Condo / Res (1:100 sqm)' },
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setBuildingType(t.id as any)}
                      className={`p-3 rounded-xl border text-xs font-medium text-left transition cursor-pointer ${
                        buildingType === t.id
                          ? 'border-[#2C6E49] bg-emerald-50 text-[#1B4332] font-semibold'
                          : 'border-[#E8E4DC] bg-[#FAF8F5] text-stone-600 hover:border-stone-400'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1.5">
                  Gross Floor Area (GFA)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={gfa}
                    onChange={(e) => setGfa(Math.max(100, Number(e.target.value)))}
                    step="100"
                    className="w-full bg-[#FAF8F5] border border-[#E8E4DC] rounded-xl px-4 py-2.5 text-xs md:text-sm font-mono text-stone-800 focus:outline-none focus:border-[#2C6E49]"
                  />
                  <span className="text-xs text-stone-500 font-mono">sqm</span>
                </div>
              </div>
            </div>

            {/* Results */}
            <div className="bg-[#FAF8F5] p-5 rounded-2xl border border-[#E8E4DC] space-y-4">
              <span className="text-[11px] font-mono font-bold text-[#2C6E49] uppercase block">
                Required Slots (PD 1096 & BP 344)
              </span>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-white p-3.5 rounded-xl border border-[#E8E4DC]">
                  <span className="text-stone-500 text-[11px] block">Standard Cars</span>
                  <div className="text-xl font-bold text-stone-900 font-mono">{rawSlots} slots</div>
                  <span className="text-[10px] text-stone-400 font-mono">(2.50m x 5.00m)</span>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-[#E8E4DC]">
                  <span className="text-stone-500 text-[11px] block">PWD Accessible</span>
                  <div className="text-xl font-bold text-[#2C6E49] font-mono">{pwdSlots} slots</div>
                  <span className="text-[10px] text-stone-400 font-mono">(3.80m x 5.00m)</span>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-[#E8E4DC]">
                  <span className="text-stone-500 text-[11px] block">Motorcycle (20%)</span>
                  <div className="text-xl font-bold text-stone-900 font-mono">{motorcycleSlots} slots</div>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-[#E8E4DC]">
                  <span className="text-stone-500 text-[11px] block">Loading Bays</span>
                  <div className="text-xl font-bold text-stone-900 font-mono">{loadingBays} bay(s)</div>
                </div>
              </div>

              <div className="pt-2 border-t border-[#E8E4DC] flex items-center justify-between text-xs">
                <span className="text-stone-600 font-medium">Estimated Parking Footprint:</span>
                <span className="font-mono font-bold text-stone-900">~{approxParkingAreaSqm.toLocaleString()} sqm</span>
              </div>

              <button
                onClick={() => handleCopySummary(`PARKING COMPUTATION (PD 1096 NBCP & BP 344)
- Typology: ${buildingType.toUpperCase()} | GFA: ${gfa} sqm
- Standard Car Slots: ${regularSlots} (2.50m x 5.00m)
- PWD Accessible Slots: ${pwdSlots} (3.80m x 5.00m)
- Motorcycle Slots: ${motorcycleSlots} (1.50m x 2.50m)
- Truck Loading Bays: ${loadingBays} (3.60m x 12.00m, 4.5m clearance)
- Approx. Lot Footprint: ~${approxParkingAreaSqm} sqm (with 6.0m two-way aisles)`)}
                className="w-full py-2 rounded-xl bg-white border border-[#E8E4DC] hover:bg-stone-50 text-stone-700 font-semibold text-xs transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-[#2C6E49]" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied Specs for Plate Notes!' : 'Copy Summary for Drawing Sheet'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RAMP CALCULATOR */}
      {activeTool === 'ramp' && (
        <div className="bg-white border border-[#E8E4DC] rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1.5">
                  Vertical Height to Climb (in Meters)
                </label>
                <input
                  type="number"
                  value={riseHeight}
                  onChange={(e) => setRiseHeight(Math.max(0.1, Number(e.target.value)))}
                  step="0.1"
                  className="w-full bg-[#FAF8F5] border border-[#E8E4DC] rounded-xl px-4 py-2.5 text-xs md:text-sm font-mono text-stone-800 focus:outline-none focus:border-[#2C6E49]"
                />
              </div>

              <div className="p-4 bg-[#FAF8F5] rounded-2xl border border-[#E8E4DC] text-xs text-stone-600 space-y-1 leading-relaxed">
                <span className="font-bold text-[#2C6E49] block">Batas Pambansa Blg. 344 Rules:</span>
                <p className="m-0 text-[11px] text-stone-600">
                  • Max slope is strictly <strong>1:12 (8.33%)</strong>.<br />
                  • Max run without a rest landing is <strong>6.00 meters</strong>.<br />
                  • Intermediate rest landings must be at least <strong>1.50m x 1.50m</strong> level space.<br />
                  • Dual handrails mounted at <strong>700mm and 900mm</strong>.
                </p>
              </div>
            </div>

            <div className="bg-[#FAF8F5] p-5 rounded-2xl border border-[#E8E4DC] space-y-4">
              <span className="text-[11px] font-mono font-bold text-[#2C6E49] uppercase block">
                Calculated Ramp Dimensions
              </span>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-white p-3.5 rounded-xl border border-[#E8E4DC]">
                  <span className="text-stone-500 text-[11px] block">Ramp Sloped Run</span>
                  <div className="text-xl font-bold text-stone-900 font-mono">{rampLength}m</div>
                  <span className="text-[10px] text-stone-400 font-mono">(1:12 slope)</span>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-[#E8E4DC]">
                  <span className="text-stone-500 text-[11px] block">Landings Needed</span>
                  <div className="text-xl font-bold text-stone-900 font-mono">{landingsNeeded}</div>
                  <span className="text-[10px] text-stone-400 font-mono">(1.5m level)</span>
                </div>
              </div>

              <div className="pt-2 border-t border-[#E8E4DC] flex items-center justify-between text-xs">
                <span className="text-stone-600 font-medium">Total Horizontal Ramp Footprint:</span>
                <span className="font-mono font-bold text-[#2C6E49] text-sm">{totalRampLength} meters</span>
              </div>

              <button
                onClick={() => handleCopySummary(`PWD RAMP SPECIFICATION (BP 344 RULE II)
- Vertical Rise: ${riseHeight} meters
- Sloped Run Length: ${rampLength} meters (at 1:12 / 8.33% slope)
- Rest Landings: ${landingsNeeded} (1.50m x 1.50m each)
- Total Footprint Length: ${totalRampLength} meters
- Minimum Clear Width: 1.20 meters with dual continuous handrails at 0.70m and 0.90m`)}
                className="w-full py-2 rounded-xl bg-white border border-[#E8E4DC] hover:bg-stone-50 text-stone-700 font-semibold text-xs transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-[#2C6E49]" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied Ramp Specs!' : 'Copy Ramp Specs for Drawing Sheet'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STAIR CALCULATOR */}
      {activeTool === 'stairs' && (
        <div className="bg-white border border-[#E8E4DC] rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1.5">
                  Floor-to-Floor Height in Meters
                </label>
                <input
                  type="number"
                  value={floorHeight}
                  onChange={(e) => setFloorHeight(Math.max(1.0, Number(e.target.value)))}
                  step="0.1"
                  className="w-full bg-[#FAF8F5] border border-[#E8E4DC] rounded-xl px-4 py-2.5 text-xs md:text-sm font-mono text-stone-800 focus:outline-none focus:border-[#2C6E49]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1.5">
                  Target Riser Height in mm (Ideal: 150mm - 180mm)
                </label>
                <input
                  type="number"
                  value={targetRiser}
                  onChange={(e) => setTargetRiser(Math.max(120, Number(e.target.value)))}
                  step="5"
                  className="w-full bg-[#FAF8F5] border border-[#E8E4DC] rounded-xl px-4 py-2.5 text-xs md:text-sm font-mono text-stone-800 focus:outline-none focus:border-[#2C6E49]"
                />
              </div>

              <div className="p-4 bg-[#FAF8F5] rounded-2xl border border-[#E8E4DC] text-xs text-stone-600 leading-relaxed">
                <span className="font-bold text-[#2C6E49] block mb-0.5">Blondel's Ergonomic Stair Formula:</span>
                <code>2 × Riser + 1 × Tread = 600mm to 650mm</code> (Ideal is 630mm). Maximum allowable riser in building code is 200mm.
              </div>
            </div>

            <div className="bg-[#FAF8F5] p-5 rounded-2xl border border-[#E8E4DC] space-y-4">
              <span className="text-[11px] font-mono font-bold text-[#2C6E49] uppercase block">
                Calculated Ergonomic Stair Dimensions
              </span>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-white p-3.5 rounded-xl border border-[#E8E4DC]">
                  <span className="text-stone-500 text-[11px] block">Total Risers</span>
                  <div className="text-xl font-bold text-stone-900 font-mono">{numRisers} risers</div>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-[#E8E4DC]">
                  <span className="text-stone-500 text-[11px] block">Exact Riser (R)</span>
                  <div className="text-xl font-bold text-[#2C6E49] font-mono">{exactRiserMm} mm</div>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-[#E8E4DC]">
                  <span className="text-stone-500 text-[11px] block">Tread Depth (T)</span>
                  <div className="text-xl font-bold text-stone-900 font-mono">{recommendedTreadMm} mm</div>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-[#E8E4DC]">
                  <span className="text-stone-500 text-[11px] block">Blondel Formula</span>
                  <div className="text-xl font-bold text-emerald-700 font-mono">{blondelScore} mm</div>
                </div>
              </div>

              <div className="pt-2 border-t border-[#E8E4DC] flex items-center justify-between text-xs">
                <span className="text-stone-600 font-medium">Total Horizontal Run (Treads):</span>
                <span className="font-mono font-bold text-[#2C6E49] text-sm">{totalStairRunM} meters</span>
              </div>

              <button
                onClick={() => handleCopySummary(`STAIRCASE SPECIFICATION (${floorHeight}m Floor-to-Floor)
- Total Number of Risers: ${numRisers} risers
- Exact Riser Height (R): ${exactRiserMm} mm
- Recommended Tread Depth (T): ${recommendedTreadMm} mm
- Total Horizontal Run: ${totalStairRunM} meters (${numRisers - 1} treads)
- Blondel Formula Check: 2(${exactRiserMm}) + ${recommendedTreadMm} = ${blondelScore} mm (PASS)
- Minimum Stair Clear Width: 1.20 meters for commercial/public buildings`)}
                className="w-full py-2 rounded-xl bg-white border border-[#E8E4DC] hover:bg-stone-50 text-stone-700 font-semibold text-xs transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-[#2C6E49]" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied Stair Specs!' : 'Copy Stair Specs for Drawing Sheet'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CODE CHEATSHEET */}
      {activeTool === 'cheatsheet' && (
        <div className="bg-white border border-[#E8E4DC] rounded-3xl p-6 md:p-8 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-stone-900 m-0">
            Philippine Building Code (PD 1096 & BP 344) Dimension Cheatsheet
          </h3>
          <p className="text-xs text-stone-500 m-0">
            Fast reference for drawing sheets, title blocks, and plate defense justification:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs pt-2">
            {[
              {
                title: 'Corridors & Clearances',
                specs: [
                  'Residential Private: 1.20m min',
                  'Commercial & Public: 1.80m to 2.40m',
                  'Dead-End Corridor Limit: Max 6.00m',
                  'Hospital / Bed Corridor: 2.40m clear',
                ],
              },
              {
                title: 'Doors & Clearances (BP 344)',
                specs: [
                  'Main Entrance Door: 1.00m x 2.10m',
                  'Accessible PWD Door: Min 0.80m clear',
                  'Bathroom Doors: Min 0.80m swing',
                  'Door Handles: Lever type at 900mm',
                ],
              },
              {
                title: 'Ceiling Heights (PD 1096 Sec. 805)',
                specs: [
                  'Habitable Room (Natural): 2.70m min',
                  'Artificial Ventilation 1st Floor: 2.70m',
                  'Artificial Ventilation 2nd+: 2.40m min',
                  'Commercial Ground Floor: 4.50m - 6.00m',
                ],
              },
              {
                title: 'Parking Standards (Table VII.5)',
                specs: [
                  'Perpendicular Car: 2.50m x 5.00m',
                  'Parallel Street Parking: 2.15m x 6.00m',
                  'PWD Accessible Stall: 3.80m x 5.00m',
                  'Two-Way Driveway Aisle: 6.00m min',
                ],
              },
              {
                title: 'Life Safety (Fire Code RA 9514)',
                specs: [
                  'Travel Distance (Non-Sprinkler): 45m',
                  'Travel Distance (Sprinklered): 60m',
                  'Fire Truck Access Lane: 6.0m clear',
                  'Fire Truck Clearance: 4.5m overhead',
                ],
              },
              {
                title: 'Open Space & Setbacks',
                specs: [
                  'R-1 Front Setback: 4.50m min',
                  'R-1 Side / Rear Setbacks: 2.00m min',
                  'TOSL (Total Open Space to Lot): 30-50%',
                  'USA (Unpaved Surface Area): Min 15%',
                ],
              },
            ].map((cat, idx) => (
              <div key={idx} className="bg-[#FAF8F5] border border-[#E8E4DC] rounded-2xl p-4">
                <h4 className="text-xs font-bold text-[#2C6E49] mb-2">{cat.title}</h4>
                <ul className="space-y-1 text-stone-700 text-[11px] list-disc list-inside">
                  {cat.specs.map((s, sIdx) => (
                    <li key={sIdx}>{s}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PLATE DEFENSE CHECKLIST */}
      {activeTool === 'checklist' && (
        <div className="bg-white border border-[#E8E4DC] rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#F0ECE1] pb-4">
            <div>
              <h3 className="text-base font-bold text-stone-900 m-0">
                Philippine Architectural Plate Defense Checklist
              </h3>
              <p className="text-xs text-stone-500 m-0 mt-0.5">
                Check off critical building laws and climate features before final studio submission or panel critique:
              </p>
            </div>

            <button
              onClick={() => setCheckedItems({})}
              className="text-xs text-stone-500 hover:text-stone-800 underline cursor-pointer"
            >
              Reset Checklist
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                category: 'PD 1096 • National Building Code',
                items: [
                  { id: 'pd-1', label: 'Mandatory setbacks (front, rear, sides) compliant with zoning classification (Table VIII.2 & VIII.3)' },
                  { id: 'pd-2', label: 'Computed regular car slots (2.50m x 5.00m) with 6.0m two-way driveway aisle' },
                  { id: 'pd-3', label: 'Ceiling clearances: 2.70m min for natural ventilation; 2.40m min for artificial ventilation' },
                  { id: 'pd-4', label: 'Unpaved Surface Area (USA min 15%) and Total Open Space to Lot (TOSL 30-50%) provided' },
                ],
              },
              {
                category: 'BP 344 • Accessibility Law (PWD)',
                items: [
                  { id: 'bp-1', label: 'Entry ramp provided with maximum 1:12 slope and 1.50m level rest landings every 6.0m run' },
                  { id: 'bp-2', label: 'Accessible PWD parking stall (3.80m x 5.00m) located closest to the main public entrance' },
                  { id: 'bp-3', label: 'Accessible unisex toilet stall (1.70m x 1.80m) with outward door swing and grab bars at 800mm' },
                  { id: 'bp-4', label: 'Dual continuous handrails mounted at 700mm and 900mm height with tactile warnings' },
                  { id: 'bp-5', label: 'Door openings at least 800mm clear with lever-type hardware (no round doorknobs)' },
                ],
              },
              {
                category: 'RA 9514 • Revised Fire Code of the Philippines',
                items: [
                  { id: 'ra-1', label: 'At least two remote fire exit stairs provided with fire-rated enclosure' },
                  { id: 'ra-2', label: 'Maximum travel distance does not exceed 45m (non-sprinklered) or 60m (sprinklered)' },
                  { id: 'ra-3', label: 'Fire exit doors open outwards in direction of exit travel with panic release hardware' },
                  { id: 'ra-4', label: '6.0m wide perimeter fire truck access lane with 4.5m clear overhead clearance' },
                ],
              },
              {
                category: 'Tropical Bioclimatic & Passive Cooling',
                items: [
                  { id: 'tr-1', label: 'Long axis oriented East-West to minimize direct solar radiation on broad building facades' },
                  { id: 'tr-2', label: 'Cross-ventilation breezeways channeled to catch Amihan (Northeast) & Habagat (Southwest)' },
                  { id: 'tr-3', label: 'Deep cantilevered roof eaves (1.5m to 2.5m) for tropical monsoon downpour protection' },
                  { id: 'tr-4', label: 'Permeable pavers and retention basins integrated for storm runoff and flood mitigation' },
                ],
              },
            ].map((section, sIdx) => (
              <div key={sIdx} className="bg-[#FAF8F5] border border-[#E8E4DC] rounded-2xl p-5 space-y-3">
                <span className="text-xs font-bold text-[#2C6E49] uppercase font-mono tracking-wider block">
                  {section.category}
                </span>
                <div className="space-y-2">
                  {section.items.map((item) => {
                    const isChecked = !!checkedItems[item.id];
                    return (
                      <label
                        key={item.id}
                        className={`flex items-start gap-2.5 p-2 rounded-xl text-xs transition cursor-pointer select-none ${
                          isChecked ? 'bg-emerald-50/80 text-[#1B4332]' : 'hover:bg-white text-stone-700'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) =>
                            setCheckedItems((prev) => ({ ...prev, [item.id]: e.target.checked }))
                          }
                          className="mt-0.5 rounded text-[#2C6E49] focus:ring-[#2C6E49] cursor-pointer"
                        />
                        <span className={`leading-relaxed ${isChecked ? 'line-through opacity-70' : ''}`}>
                          {item.label}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
