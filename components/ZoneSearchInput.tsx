'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { Zone, ZoneType, ZONE_TYPE_LABELS } from '@/lib/types'
import { Search, X, Check, ChevronDown, MapPin, Navigation, Globe, Zap } from 'lucide-react'

interface ZoneSearchInputProps {
  zones: Zone[]
  name: string
  placeholder?: string
  label?: string
  onSelect?: (zone: Zone) => void
  defaultValue?: string
}

const TYPE_ICONS: Record<string, React.ReactNode> = {
  dakar_centre: <MapPin className="w-3 h-3" />,
  banlieue: <Navigation className="w-3 h-3" />,
  interieur: <Globe className="w-3 h-3" />
}

const TYPE_COLORS: Record<string, string> = {
  dakar_centre: "from-blue-500 to-indigo-600",
  banlieue: "from-orange-500 to-red-600",
  interieur: "from-emerald-500 to-teal-600"
}

export default function ZoneSearchInput({ 
  zones, 
  name, 
  placeholder = "Rechercher une zone...", 
  label,
  onSelect,
  defaultValue = ''
}: ZoneSearchInputProps) {
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const autoSelectTimer = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (defaultValue && zones.length > 0) {
      const zone = zones.find(z => z.id === defaultValue)
      if (zone) {
        setSelectedZone(zone)
        setQuery(zone.name)
      }
    }
  }, [defaultValue, zones])

  const normalize = (text: string) => 
    text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "")

  const filteredZones = useMemo(() => {
    if (!query || selectedZone?.name === query) return zones
    const normalizedQuery = normalize(query)
    return zones.filter(z => normalize(z.name).includes(normalizedQuery))
  }, [query, zones, selectedZone])

  const groupedZones = useMemo(() => {
    const groups: Record<string, Zone[]> = {
      dakar_centre: [],
      banlieue: [],
      interieur: []
    }
    filteredZones.forEach(z => {
      if (groups[z.type]) groups[z.type].push(z)
    })
    return groups
  }, [filteredZones])

  const flatFilteredZones = useMemo(() => 
    Object.values(groupedZones).flat(), [groupedZones])

  useEffect(() => {
    if (autoSelectTimer.current) clearTimeout(autoSelectTimer.current)
    if (!query || selectedZone) return

    const normalizedQuery = normalize(query)
    
    const exactMatch = zones.find(z => normalize(z.name) === normalizedQuery)
    if (exactMatch) {
      handleSelect(exactMatch)
      return
    }

    if (filteredZones.length === 1) {
      autoSelectTimer.current = setTimeout(() => {
        handleSelect(filteredZones[0])
      }, 500)
      return
    }

    const startingWith = zones.filter(z => normalize(z.name).startsWith(normalizedQuery))
    if (startingWith.length === 1) {
      autoSelectTimer.current = setTimeout(() => {
        handleSelect(startingWith[0])
      }, 800)
    }
  }, [query, zones, filteredZones, selectedZone])

  const handleSelect = (zone: Zone) => {
    setSelectedZone(zone)
    setQuery(zone.name)
    setIsOpen(false)
    if (onSelect) onSelect(zone)
  }

  const handleClear = () => {
    setSelectedZone(null)
    setQuery('')
    setIsOpen(true)
    inputRef.current?.focus()
    if (onSelect) onSelect(null as any)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setIsOpen(true)
      setSelectedIndex(prev => Math.min(prev + 1, flatFilteredZones.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(prev => Math.max(prev - 1, 0))
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault()
      handleSelect(flatFilteredZones[selectedIndex])
    } else if (e.key === 'Escape') {
      setIsOpen(false)
    }
  }

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const highlightMatch = (text: string, highlight: string) => {
    if (!highlight.trim() || selectedZone?.name === text) return text
    const parts = text.split(new RegExp(`(${highlight})`, 'gi'))
    return (
      <span>
        {parts.map((part, i) => 
          normalize(part) === normalize(highlight) ? (
            <span key={i} className="text-orange-500 font-extrabold">{part}</span>
          ) : part
        )}
      </span>
    )
  }

  return (
    <div className="space-y-2" ref={containerRef}>
      {label && (
        <div className="flex items-center justify-between mb-1">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block ml-1">
            {label}
          </label>
          {selectedZone && (
            <span className="text-[9px] font-bold text-green-500 flex items-center gap-1 animate-in fade-in slide-in-from-right-2">
               Validé <Check className="w-3 h-3" />
            </span>
          )}
        </div>
      )}
      
      <div className="relative group">
        {/* Glow Effect on Hover/Focus */}
        <div className={`absolute -inset-0.5 rounded-[1.4rem] bg-gradient-to-r transition-all duration-500 blur-sm opacity-0 group-hover:opacity-10 ${
          selectedZone ? 'from-green-500/50 to-emerald-500/50 opacity-20' : 'from-orange-500/50 to-rose-500/50 group-focus-within:opacity-30'
        }`} />

        <div className={`relative flex items-center transition-all duration-300 rounded-3xl border-2 shadow-sm ${
          selectedZone 
            ? 'border-green-500 bg-white' 
            : isOpen 
              ? 'border-slate-900 bg-white shadow-xl shadow-slate-200/50' 
              : 'border-slate-100 bg-slate-50 hover:bg-white hover:border-slate-200'
        }`}>
          <div className="pl-5">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-500 ${
              selectedZone ? 'bg-green-100 text-green-600 rotate-0' : 'bg-white text-slate-400 shadow-sm'
            }`}>
              {selectedZone ? <MapPin className="w-4 h-4" /> : <Search className="w-4 h-4" />}
            </div>
          </div>
          
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              if (selectedZone) setSelectedZone(null)
              setIsOpen(true)
            }}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="w-full bg-transparent border-none rounded-2xl px-4 py-5 text-sm font-bold text-slate-900 outline-none placeholder:text-slate-300 placeholder:font-medium"
          />

          <div className="pr-3 flex items-center gap-1">
            {query && (
              <button 
                type="button"
                onClick={handleClear}
                className="w-8 h-8 flex items-center justify-center hover:bg-slate-100 rounded-xl transition-colors group/btn"
              >
                <X className="w-4 h-4 text-slate-300 group-hover/btn:text-slate-600 transition-colors" />
              </button>
            )}
            <div className="w-px h-6 bg-slate-100 mx-1" />
            <button 
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className={`w-8 h-8 flex items-center justify-center hover:bg-slate-100 rounded-xl transition-all ${isOpen ? 'rotate-180' : ''}`}
            >
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </button>
          </div>
        </div>

        <input type="hidden" name={name} value={selectedZone?.id || ''} />

        {/* Dropdown Results */}
        {isOpen && flatFilteredZones.length > 0 && (
          <div className="absolute z-50 w-full mt-3 bg-white/95 backdrop-blur-xl rounded-[2rem] border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.1)] overflow-hidden animate-in fade-in zoom-in-95 slide-in-from-top-4 duration-300">
            <div className="max-h-[320px] overflow-y-auto p-3 space-y-5 custom-scrollbar">
              {(Object.entries(groupedZones) as [string, Zone[]][]).map(([type, groupZones]) => {
                if (groupZones.length === 0) return null
                return (
                  <div key={type} className="space-y-2">
                    <div className="px-4 py-1 flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-lg bg-gradient-to-br ${TYPE_COLORS[type]} flex items-center justify-center text-white shadow-sm`}>
                        {TYPE_ICONS[type]}
                      </div>
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.25em]">
                        {ZONE_TYPE_LABELS[type as ZoneType]}
                      </span>
                      <div className="h-px flex-1 bg-slate-50"></div>
                    </div>
                    
                    <div className="grid gap-1">
                      {groupZones.map((zone) => {
                        const isSelected = selectedZone?.id === zone.id
                        const isFocused = flatFilteredZones[selectedIndex]?.id === zone.id
                        return (
                          <button
                            key={zone.id}
                            type="button"
                            onClick={() => handleSelect(zone)}
                            className={`w-full text-left px-4 py-4 rounded-2xl flex items-center justify-between transition-all relative overflow-hidden group/item ${
                              isSelected 
                                ? 'bg-slate-900 text-white shadow-lg' 
                                : isFocused 
                                  ? 'bg-slate-50 border-slate-100' 
                                  : 'hover:bg-slate-50'
                            }`}
                          >
                            <div className="flex items-center gap-3 relative z-10">
                               <div className={`w-2 h-2 rounded-full transition-all duration-500 ${
                                 isSelected ? 'bg-orange-500 scale-150 shadow-[0_0_10px_rgba(249,115,22,0.5)]' : 'bg-slate-200 group-hover/item:bg-orange-300'
                               }`} />
                               <div className="flex flex-col">
                                <span className={`text-sm font-bold tracking-tight ${isSelected ? 'text-white' : 'text-slate-700'}`}>
                                  {highlightMatch(zone.name, query)}
                                </span>
                                <span className={`text-[10px] ${isSelected ? 'text-slate-400' : 'text-slate-400'}`}>
                                  Sénégal
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-3 relative z-10">
                              <div className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all ${
                                isSelected ? 'bg-white/10' : 'bg-orange-50 group-hover/item:bg-orange-100'
                              }`}>
                                <Zap className={`w-3 h-3 ${isSelected ? 'text-orange-400' : 'text-orange-500'}`} />
                                <span className={`text-[11px] font-black ${isSelected ? 'text-white' : 'text-orange-600'}`}>
                                  {zone.tarif_base.toLocaleString('fr-FR')} F
                                </span>
                              </div>
                              {isSelected && <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center animate-in zoom-in duration-300"><Check className="w-3.5 h-3.5 text-white" strokeWidth={4} /></div>}
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }
      `}</style>
    </div>
  )
}
