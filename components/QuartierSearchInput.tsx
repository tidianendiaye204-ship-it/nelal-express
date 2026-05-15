'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { Quartier } from '@/lib/types'
import { Search, X, Check, ChevronDown, MapPin } from 'lucide-react'

interface QuartierSearchInputProps {
  quartiers: Quartier[]
  name: string
  placeholder?: string
  label?: string
  onSelect?: (quartier: Quartier) => void
  defaultValue?: string
}

export default function QuartierSearchInput({ 
  quartiers, 
  name, 
  placeholder = "Rechercher un quartier...", 
  label,
  onSelect,
  defaultValue = ''
}: QuartierSearchInputProps) {
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [selectedQuartier, setSelectedQuartier] = useState<Quartier | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const autoSelectTimer = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (defaultValue && quartiers.length > 0) {
      const q = quartiers.find(item => item.id === defaultValue)
      if (q) {
        setSelectedQuartier(q)
        setQuery(q.nom)
      }
    } else if (!defaultValue) {
      setSelectedQuartier(null)
      setQuery('')
    }
  }, [defaultValue, quartiers])

  const normalize = (text: string) => 
    text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "")

  const filteredQuartiers = useMemo(() => {
    if (!query || selectedQuartier?.nom === query) return quartiers
    const normalizedQuery = normalize(query)
    return quartiers.filter(q => normalize(q.nom).includes(normalizedQuery))
  }, [query, quartiers, selectedQuartier])

  useEffect(() => {
    if (autoSelectTimer.current) clearTimeout(autoSelectTimer.current)
    if (!query || selectedQuartier) return

    const normalizedQuery = normalize(query)
    
    // Auto-sélection si un seul match exact ou unique résultat
    const exactMatch = quartiers.find(q => normalize(q.nom) === normalizedQuery)
    if (exactMatch) {
      handleSelect(exactMatch)
      return
    }

    if (filteredQuartiers.length === 1 && query.length > 2) {
      autoSelectTimer.current = setTimeout(() => {
        handleSelect(filteredQuartiers[0])
      }, 500)
    }
  }, [query, quartiers, filteredQuartiers, selectedQuartier])

  const handleSelect = (quartier: Quartier) => {
    setSelectedQuartier(quartier)
    setQuery(quartier.nom)
    setIsOpen(false)
    if (onSelect) onSelect(quartier)
  }

  const handleClear = () => {
    setSelectedQuartier(null)
    setQuery('')
    setIsOpen(true)
    inputRef.current?.focus()
    if (onSelect) onSelect(null as any)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setIsOpen(true)
      setSelectedIndex(prev => Math.min(prev + 1, filteredQuartiers.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(prev => Math.max(prev - 1, 0))
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault()
      handleSelect(filteredQuartiers[selectedIndex])
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

  return (
    <div className="space-y-2 animate-in fade-in slide-in-from-top-4 duration-500" ref={containerRef}>
      {label && (
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block ml-1">
          {label}
        </label>
      )}
      
      <div className="relative">
        <div className={`relative flex items-center transition-all duration-300 rounded-[1.5rem] border-2 shadow-sm ${
          selectedQuartier ? 'border-orange-500 bg-orange-50/30' : 'border-orange-100 bg-white'
        }`}>
          <div className="pl-4">
            <MapPin className={`w-4 h-4 ${selectedQuartier ? 'text-orange-600' : 'text-orange-300'}`} />
          </div>
          
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              if (selectedQuartier) setSelectedQuartier(null)
              setIsOpen(true)
            }}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="w-full bg-transparent border-none px-4 py-4 text-xs font-bold text-slate-900 outline-none placeholder:text-slate-300"
          />

          {query && (
            <button type="button" onClick={handleClear} className="pr-3 text-slate-300 hover:text-slate-500 transition-colors">
              <X className="w-4 h-4" />
            </button>
          )}
          
          <button type="button" onClick={() => setIsOpen(!isOpen)} className="pr-4 text-slate-400">
            <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>

        <input type="hidden" name={name} value={selectedQuartier?.id || ''} />

        {isOpen && filteredQuartiers.length > 0 && (
          <div className="absolute z-[60] w-full mt-2 bg-white rounded-2xl border border-orange-50 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="max-h-48 overflow-y-auto p-1">
              {filteredQuartiers.map((q, idx) => {
                const isSelected = selectedQuartier?.id === q.id
                const isFocused = selectedIndex === idx
                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => handleSelect(q)}
                    className={`w-full text-left px-4 py-3 rounded-xl flex items-center justify-between transition-all ${
                      isSelected ? 'bg-orange-500 text-white' : isFocused ? 'bg-orange-50' : 'hover:bg-orange-50'
                    }`}
                  >
                    <span className="text-xs font-bold">{q.nom}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
