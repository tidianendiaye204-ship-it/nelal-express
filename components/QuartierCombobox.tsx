'use client'

import { useState, useEffect, useRef } from 'react'
import { searchQuartiers } from '@/actions/quartiers'
import { Quartier } from '@/lib/types'
import { Search, MapPin, X, Info, Loader2, Check } from 'lucide-react'

interface QuartierComboboxProps {
  label: string
  placeholder: string
  value: Quartier | null
  onChange: (q: Quartier | null) => void
  icon?: React.ReactNode
}

export default function QuartierCombobox({ label, placeholder, value, onChange, icon }: QuartierComboboxProps) {
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [results, setResults] = useState<Quartier[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const autoSelectTimer = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (value) {
      setQuery(value.nom)
    } else if (!query) {
      setQuery('')
    }
  }, [value])

  const normalize = (text: string) => 
    text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "")

  // Auto-selection logic
  useEffect(() => {
    if (autoSelectTimer.current) clearTimeout(autoSelectTimer.current)
    if (!query || value || !isOpen || results.length === 0) return

    const normQuery = normalize(query)
    
    // Match exact
    const exactMatch = results.find(r => normalize(r.nom) === normQuery)
    if (exactMatch) {
      handleSelect(exactMatch)
      return
    }

    // Auto-select if unique and query is significant
    if (results.length === 1 && query.length > 2) {
      autoSelectTimer.current = setTimeout(() => {
        handleSelect(results[0])
      }, 600)
    }
  }, [query, results, value, isOpen])

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (!isOpen || (value && query === value.nom)) return
      setIsSearching(true)
      const { data } = await searchQuartiers(query)
      setResults(data || [])
      setIsSearching(false)
      setHasSearched(true)
    }, query ? 200 : 0)

    return () => clearTimeout(timer)
  }, [query, isOpen, value])

  const handleSelect = (q: Quartier) => {
    setQuery(q.nom)
    onChange(q)
    setIsOpen(false)
  }

  const clearSelection = (e: React.MouseEvent) => {
    e.stopPropagation()
    setQuery('')
    onChange(null)
    setIsOpen(true)
    inputRef.current?.focus()
  }

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1">
        {label}
      </label>
      <div className={`relative flex items-center transition-all duration-300 rounded-2xl border-2 shadow-sm overflow-hidden ${
        value 
          ? 'border-orange-500 bg-white' 
          : isOpen 
            ? 'border-slate-800 bg-white' 
            : 'border-slate-100 bg-slate-50/50 hover:bg-white'
      }`}>
        <div className="pl-4">
          {icon || <MapPin className={`w-4 h-4 ${value ? 'text-orange-500' : 'text-slate-400'}`} />}
        </div>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setIsOpen(true)
            if (value) onChange(null)
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="w-full bg-transparent border-none text-slate-900 px-4 py-4 text-xs font-bold focus:ring-0 outline-none placeholder:text-slate-300"
        />
        <div className="pr-3 flex items-center gap-1">
          {query && !isSearching && (
            <button onClick={clearSelection} className="p-1 hover:bg-slate-100 rounded-lg text-slate-300 hover:text-slate-600 transition-all">
              <X className="w-4 h-4" />
            </button>
          )}
          {isSearching && <Loader2 className="w-4 h-4 text-orange-500 animate-spin mr-1" />}
        </div>
      </div>

      {isOpen && (results.length > 0 || (hasSearched && query)) && (
        <div className="absolute z-[100] w-full mt-2 bg-white rounded-2xl border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.15)] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          <ul className="max-h-60 overflow-y-auto p-1 custom-scrollbar">
            {results.length > 0 ? (
              results.map((q) => {
                const isSelected = value?.id === q.id
                return (
                  <li
                    key={q.id}
                    onClick={() => handleSelect(q)}
                    className={`px-4 py-3 cursor-pointer rounded-xl flex items-center justify-between group transition-all ${
                      isSelected ? 'bg-orange-500 text-white' : 'hover:bg-orange-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                       <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                         isSelected ? 'bg-white/20' : 'bg-slate-50 group-hover:bg-white border border-slate-100'
                       }`}>
                          <MapPin className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                       </div>
                       <div>
                          <p className={`text-xs font-black uppercase tracking-tight ${isSelected ? 'text-white' : 'text-slate-800'}`}>{q.nom}</p>
                          <p className={`text-[9px] font-bold ${isSelected ? 'text-orange-100' : 'text-slate-400'}`}>{q.zone?.name}</p>
                       </div>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-white" strokeWidth={3} />}
                  </li>
                )
              })
            ) : (
              <li className="px-5 py-8 text-center text-slate-400">
                <p className="text-[10px] font-black uppercase tracking-widest">Aucun résultat</p>
              </li>
            )}
          </ul>
          {results.length > 0 && (
            <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 flex justify-between">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{results.length} quartiers trouvés</span>
              <span className="text-[9px] font-black text-orange-500 uppercase tracking-widest animate-pulse">Sélectionnez →</span>
            </div>
          )}
        </div>
      )}

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
      `}</style>
    </div>
  )
}
