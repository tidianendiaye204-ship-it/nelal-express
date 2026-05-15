'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { Zone, ZoneType, ZONE_TYPE_LABELS } from '@/lib/types'
import { Search, X, Check, ChevronDown } from 'lucide-react'

interface ZoneSearchInputProps {
  zones: Zone[]
  name: string
  placeholder?: string
  label?: string
  onSelect?: (zone: Zone) => void
  defaultValue?: string
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

  // Initialisation avec defaultValue si présente
  useEffect(() => {
    if (defaultValue && zones.length > 0) {
      const zone = zones.find(z => z.id === defaultValue)
      if (zone) {
        setSelectedZone(zone)
        setQuery(zone.name)
      }
    }
  }, [defaultValue, zones])

  // Normalisation pour la recherche
  const normalize = (text: string) => 
    text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "")

  // Filtrage des zones
  const filteredZones = useMemo(() => {
    if (!query || selectedZone?.name === query) return zones
    const normalizedQuery = normalize(query)
    return zones.filter(z => normalize(z.name).includes(normalizedQuery))
  }, [query, zones, selectedZone])

  // Groupement des zones par type
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

  // Flat list pour la navigation clavier
  const flatFilteredZones = useMemo(() => 
    Object.values(groupedZones).flat(), [groupedZones])

  // Gestion de l'auto-sélection intelligente
  useEffect(() => {
    if (autoSelectTimer.current) clearTimeout(autoSelectTimer.current)
    if (!query || selectedZone) return

    const normalizedQuery = normalize(query)
    
    // 1. Correspondance exacte
    const exactMatch = zones.find(z => normalize(z.name) === normalizedQuery)
    if (exactMatch) {
      handleSelect(exactMatch)
      return
    }

    // 2. Un seul résultat -> sélection après 500ms
    if (filteredZones.length === 1) {
      autoSelectTimer.current = setTimeout(() => {
        handleSelect(filteredZones[0])
      }, 500)
      return
    }

    // 3. Un seul résultat qui commence par la saisie -> 800ms
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

  // Navigation clavier
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

  // Fermeture au clic extérieur
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Highlight du texte
  const highlightMatch = (text: string, highlight: string) => {
    if (!highlight.trim()) return text
    const normalizedText = text.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    const normalizedHighlight = highlight.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    const parts = text.split(new RegExp(`(${highlight})`, 'gi'))
    return (
      <span>
        {parts.map((part, i) => 
          normalize(part) === normalize(highlight) ? (
            <mark key={i} className="bg-orange-100 text-orange-600 font-bold p-0">{part}</mark>
          ) : part
        )}
      </span>
    )
  }

  return (
    <div className="space-y-1.5" ref={containerRef}>
      {label && (
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">
          {label}
        </label>
      )}
      
      <div className="relative">
        <div className={`relative flex items-center transition-all duration-300 rounded-2xl border-2 ${
          selectedZone ? 'border-green-500 bg-green-50/30' : isOpen ? 'border-orange-500 bg-white' : 'border-slate-100 bg-slate-50'
        }`}>
          <div className="pl-4">
            <Search className={`w-4 h-4 ${selectedZone ? 'text-green-500' : 'text-slate-400'}`} />
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
            className="w-full bg-transparent border-none rounded-2xl p-4 text-xs font-bold outline-none placeholder:text-slate-300"
          />

          <div className="pr-2 flex items-center gap-1">
            {query && (
              <button 
                type="button"
                onClick={handleClear}
                className="p-2 hover:bg-slate-200 rounded-xl transition-colors"
              >
                <X className="w-3.5 h-3.5 text-slate-400" />
              </button>
            )}
            <button 
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 hover:bg-slate-200 rounded-xl transition-colors"
            >
              <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {selectedZone && (
            <div className="absolute -right-1 -top-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
              <Check className="w-3 h-3 text-white" strokeWidth={4} />
            </div>
          )}
        </div>

        {/* Hidden Input for Form Submission */}
        <input type="hidden" name={name} value={selectedZone?.id || ''} />

        {/* Dropdown Results */}
        {isOpen && flatFilteredZones.length > 0 && (
          <div className="absolute z-50 w-full mt-2 bg-white rounded-3xl border border-slate-100 shadow-2xl shadow-slate-200/50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="max-h-64 overflow-y-auto p-2 space-y-4">
              {(Object.entries(groupedZones) as [string, Zone[]][]).map(([type, groupZones]) => {
                if (groupZones.length === 0) return null
                return (
                  <div key={type} className="space-y-1">
                    <div className="px-3 py-1 flex items-center gap-2">
                      <div className="h-px flex-1 bg-slate-50"></div>
                      <span className="text-[8px] font-black text-slate-300 uppercase tracking-[0.2em]">
                        {ZONE_TYPE_LABELS[type as ZoneType]}
                      </span>
                      <div className="h-px flex-1 bg-slate-50"></div>
                    </div>
                    {groupZones.map((zone) => {
                      const isSelected = selectedZone?.id === zone.id
                      const isFocused = flatFilteredZones[selectedIndex]?.id === zone.id
                      return (
                        <button
                          key={zone.id}
                          type="button"
                          onClick={() => handleSelect(zone)}
                          className={`w-full text-left px-4 py-3 rounded-2xl flex items-center justify-between transition-all group ${
                            isSelected ? 'bg-orange-500 text-white' : isFocused ? 'bg-slate-50' : 'hover:bg-orange-50'
                          }`}
                        >
                          <div className="flex flex-col">
                            <span className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-slate-700'}`}>
                              {highlightMatch(zone.name, query)}
                            </span>
                            <span className={`text-[9px] ${isSelected ? 'text-white/70' : 'text-slate-400'}`}>
                              Sénégal
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={`text-[10px] font-black ${isSelected ? 'text-white/90' : 'text-orange-500 bg-orange-50 px-2 py-1 rounded-lg group-hover:bg-white'}`}>
                              {zone.tarif_base.toLocaleString('fr-FR')} F
                            </span>
                            {isSelected && <Check className="w-4 h-4 text-white" />}
                          </div>
                        </button>
                      )
                    })}
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
