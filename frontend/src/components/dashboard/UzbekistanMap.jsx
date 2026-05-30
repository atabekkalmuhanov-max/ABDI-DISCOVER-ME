import { useState, useCallback } from 'react'

export const UZBEKISTAN_REGIONS = [
  {
    id: 'tashkent',
    name: 'Tashkent',
    capital: 'Tashkent',
    polygon: '555,28 668,28 655,172 628,198 622,62 555,62',
    cx: 610, cy: 96,
    color: '#3d56f5',
    desc: 'Dynamic capital city blending East and West',
    visitors: '2.4M', rating: 4.8, area: '15,600 km²',
    top: ['Chorsu Bazaar', 'Hazrati Imam Complex', 'State History Museum'],
  },
  {
    id: 'samarkand',
    name: 'Samarkand',
    capital: 'Samarkand',
    polygon: '372,220 468,198 498,298 458,370 375,392',
    cx: 432, cy: 294,
    color: '#10b981',
    desc: 'Jewel of the Silk Road, city of Tamerlane',
    visitors: '1.8M', rating: 4.9, area: '16,400 km²',
    top: ['Registan Square', 'Shah-i-Zinda', 'Gur-e-Amir'],
  },
  {
    id: 'bukhara',
    name: 'Bukhara',
    capital: 'Bukhara',
    polygon: '52,83 210,83 210,170 372,220 375,392 52,392',
    cx: 185, cy: 245,
    color: '#f59e0b',
    desc: 'UNESCO World Heritage holy city',
    visitors: '920K', rating: 4.9, area: '39,400 km²',
    top: ['Kalon Minaret', 'Ark Fortress', 'Lyabi-Hauz'],
  },
  {
    id: 'khorezm',
    name: 'Khorezm',
    capital: 'Urgench',
    polygon: '128,22 210,22 210,88 162,105 128,83',
    cx: 167, cy: 58,
    color: '#06b6d4',
    desc: 'Ancient oasis city on the Silk Road',
    visitors: '485K', rating: 4.7, area: '6,300 km²',
    top: ['Ichan Kala (Khiva)', 'Kalta Minor', 'Tash Hauli Palace'],
  },
  {
    id: 'navoi',
    name: 'Navoi',
    capital: 'Navoi',
    polygon: '210,22 462,28 468,198 372,220 210,170',
    cx: 330, cy: 108,
    color: '#8b5cf6',
    desc: 'Desert landscapes and ancient caravanserais',
    visitors: '320K', rating: 4.5, area: '110,800 km²',
    top: ['Kyzylkum Desert', 'Nurata Mountains', 'Aydarkul Lake'],
  },
  {
    id: 'jizzakh',
    name: 'Jizzakh',
    capital: 'Jizzakh',
    polygon: '462,45 555,45 555,198 468,198',
    cx: 510, cy: 122,
    color: '#0ea5e9',
    desc: 'Gateway between steppe and mountains',
    visitors: '215K', rating: 4.4, area: '20,500 km²',
    top: ['Nuratau Reserve', 'Dustlik Pass', 'Farish Canyon'],
  },
  {
    id: 'sirdaryo',
    name: 'Sirdaryo',
    capital: 'Gulistan',
    polygon: '555,62 622,62 628,198 555,198',
    cx: 591, cy: 130,
    color: '#84cc16',
    desc: 'Green corridor along the Syr Darya river',
    visitors: '142K', rating: 4.3, area: '5,100 km²',
    top: ['Syr Darya River', 'Farish Gorge', 'Kovuk Ruins'],
  },
  {
    id: 'namangan',
    name: 'Namangan',
    capital: 'Namangan',
    polygon: '668,28 748,50 732,140 668,152 652,98',
    cx: 708, cy: 92,
    color: '#ec4899',
    desc: 'Heart of the Fergana Valley, silk traditions',
    visitors: '398K', rating: 4.5, area: '7,900 km²',
    top: ['Abulkasim Madrasa', 'Babur Museum', 'Chust Historical Site'],
  },
  {
    id: 'andijan',
    name: 'Andijan',
    capital: 'Andijan',
    polygon: '732,140 748,50 775,115 775,232 690,232 670,158',
    cx: 737, cy: 168,
    color: '#14b8a6',
    desc: 'Birthplace of Babur, founder of Mughal Empire',
    visitors: '356K', rating: 4.6, area: '4,200 km²',
    top: ['Jome Mosque', 'Babur Park', 'Andijan Museum'],
  },
  {
    id: 'fergana',
    name: 'Fergana',
    capital: 'Fergana',
    polygon: '668,152 732,140 690,232 628,232 628,198 655,172',
    cx: 682, cy: 192,
    color: '#a855f7',
    desc: 'Silk capital and Margilan craft heritage',
    visitors: '525K', rating: 4.7, area: '6,800 km²',
    top: ['Margilan Silk Bazaar', 'Rishtan Ceramics', 'Kuva Ruins'],
  },
  {
    id: 'kashkadarya',
    name: 'Kashkadarya',
    capital: 'Karshi',
    polygon: '375,392 458,370 498,298 555,292 555,455 375,455',
    cx: 467, cy: 390,
    color: '#f97316',
    desc: "Birthplace of Tamerlane, Shakhrisabz UNESCO site",
    visitors: '645K', rating: 4.7, area: '28,400 km²',
    top: ['Shakhrisabz', 'Kok Gumbaz Mosque', 'Dorus-Saodat Complex'],
  },
  {
    id: 'surkhandarya',
    name: 'Surkhandarya',
    capital: 'Termez',
    polygon: '498,298 592,258 655,318 642,455 555,455 555,292',
    cx: 578, cy: 370,
    color: '#ef4444',
    desc: 'Ancient Buddhist heritage on the Afghan border',
    visitors: '285K', rating: 4.6, area: '20,800 km²',
    top: ['Termez Museum', 'Sultan Saodat', 'Fayaz Tepa Buddhist Site'],
  },
]

function RegionTooltip({ region }) {
  if (!region) return null
  const tx = Math.max(68, Math.min(region.cx, 695))
  const ty = region.cy < 80 ? region.cy + 38 : region.cy - 50

  return (
    <g style={{ pointerEvents: 'none' }}>
      <rect x={tx - 64} y={ty - 4} width={128} height={46} rx={9}
        fill="rgba(10,15,35,0.92)" stroke="rgba(255,255,255,0.18)" strokeWidth={1} />
      <text x={tx} y={ty + 11} textAnchor="middle" fill="white" fontSize={10.5} fontWeight="700">
        {region.name}
      </text>
      <text x={tx} y={ty + 24} textAnchor="middle" fill="#94a3b8" fontSize={8.5}>
        {region.capital} · {region.rating}★ · {region.visitors} visitors
      </text>
      <text x={tx} y={ty + 36} textAnchor="middle" fill="#64748b" fontSize={7.5}>
        {region.desc.length > 40 ? region.desc.slice(0, 39) + '…' : region.desc}
      </text>
    </g>
  )
}

export default function UzbekistanMap({ onRegionSelect, selectedId }) {
  const [hoveredId, setHoveredId] = useState(null)

  const handleEnter = useCallback((id) => setHoveredId(id), [])
  const handleLeave = useCallback(() => setHoveredId(null), [])

  const hoveredRegion = UZBEKISTAN_REGIONS.find(r => r.id === hoveredId)

  return (
    <div className="relative w-full select-none">
      <svg
        viewBox="0 0 780 465"
        className="w-full h-auto rounded-xl"
        style={{ filter: 'drop-shadow(0 6px 24px rgba(31,42,184,0.18))' }}
        aria-label="Interactive map of Uzbekistan's 12 regions"
      >
        <defs>
          <linearGradient id="mapBg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#dce8ff" />
            <stop offset="55%" stopColor="#e8efff" />
            <stop offset="100%" stopColor="#f0f5ff" />
          </linearGradient>
          <linearGradient id="seaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#bae6fd" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#7dd3fc" stopOpacity="0.3" />
          </linearGradient>
          <filter id="glow" x="-25%" y="-25%" width="150%" height="150%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="txt">
            <feDropShadow dx="0" dy="1" stdDeviation="1.8" floodOpacity="0.7" floodColor="#000" />
          </filter>
        </defs>

        {/* Background */}
        <rect width="780" height="465" fill="url(#mapBg)" rx="12" />

        {/* Subtle grid */}
        <g stroke="#c7d2fe" strokeWidth="0.4" opacity="0.35">
          {[130, 260, 390, 520, 650].map(x => (
            <line key={`v${x}`} x1={x} y1="0" x2={x} y2="465" strokeDasharray="5,5" />
          ))}
          {[93, 186, 279, 372].map(y => (
            <line key={`h${y}`} x1="0" y1={y} x2="780" y2={y} strokeDasharray="5,5" />
          ))}
        </g>

        {/* Aral Sea (decorative) */}
        <ellipse cx="72" cy="145" rx="50" ry="65" fill="url(#seaGrad)" />
        <text x="72" y="141" fill="#3b82f6" fontSize="8" textAnchor="middle" opacity="0.65" fontStyle="italic">Aral</text>
        <text x="72" y="151" fill="#3b82f6" fontSize="8" textAnchor="middle" opacity="0.65" fontStyle="italic">Sea</text>

        {/* Karakalpakstan label */}
        <text x="82" y="48" fill="#94a3b8" fontSize="9" textAnchor="middle" opacity="0.6" fontStyle="italic">Karakalpakstan</text>
        <text x="82" y="59" fill="#94a3b8" fontSize="7.5" textAnchor="middle" opacity="0.45" fontStyle="italic">(Republic)</text>

        {/* Region polygons */}
        {UZBEKISTAN_REGIONS.map(region => {
          const isHov = hoveredId === region.id
          const isSel = selectedId === region.id
          const active = isHov || isSel

          return (
            <g key={region.id} style={{ cursor: 'pointer' }}>
              <polygon
                points={region.polygon}
                fill={region.color}
                fillOpacity={active ? 0.88 : 0.62}
                stroke="white"
                strokeWidth={isSel ? 2.8 : 1.4}
                strokeLinejoin="round"
                filter={active ? 'url(#glow)' : undefined}
                style={{ transition: 'fill-opacity 0.18s ease' }}
                onMouseEnter={() => handleEnter(region.id)}
                onMouseLeave={handleLeave}
                onClick={() => onRegionSelect(region)}
              />
              {/* Label */}
              <text
                x={region.cx}
                y={region.cy}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="white"
                fontSize={region.name.length > 10 ? 7.5 : region.name.length > 7 ? 8.5 : 9.5}
                fontWeight={active ? '800' : '600'}
                letterSpacing="0.2"
                filter="url(#txt)"
                style={{ pointerEvents: 'none', userSelect: 'none' }}
              >
                {region.name}
              </text>
              {/* Selected pulse ring */}
              {isSel && (
                <circle
                  cx={region.cx}
                  cy={region.cy + 10}
                  r={4}
                  fill="white"
                  opacity={0.9}
                  style={{ pointerEvents: 'none' }}
                />
              )}
            </g>
          )
        })}

        {/* Hover tooltip */}
        <RegionTooltip region={hoveredRegion} />

        {/* Bottom bar */}
        <rect x="0" y="436" width="780" height="29" fill="rgba(10,15,35,0.62)" />
        <text x="14" y="454" fill="rgba(255,255,255,0.82)" fontSize="9.5" fontWeight="500">
          Uzbekistan · 12 Tourism Regions · Click a region to explore
        </text>
        <text x="766" y="454" fill="#64748b" fontSize="9" textAnchor="end">
          Discover Me
        </text>
      </svg>
    </div>
  )
}
