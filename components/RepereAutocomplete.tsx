// components/RepereAutocomplete.tsx
'use client'

import { useState, useEffect, useRef } from 'react'
import { searchReperes } from '@/actions/reperes'
import { MapPin, Navigation, Search } from 'lucide-react'

interface RepereAutocompleteProps {
  name: string
  zoneId: string
  placeholder?: string
  defaultValue?: string
  required?: boolean
  className?: string
  icon?: React.ReactNode
  onValueChange?: (val: string) => void
}

export default function RepereAutocomplete({
  name,
  zoneId,
  placeholder = "Repère connu (ex: Derrière la mosquée...)",
  defaultValue = "",
  required = false,
  className,
  icon,
  onValueChange
}: RepereAutocompleteProps) {
  const [query, setQuery] = useState(defaultValue)
  const [results, setResults] = useState<any[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isSearching, setIsSearching] = useState(false)

  // Notify parent of changes
  useEffect(() => {
    onValueChange?.(query)
  }, [query, onValueChange])
  
  const wrapperRef = useRef<HTMLDivElement>(null)

  // Fermer le menu si on clique en dehors
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Debounce effect pour la recherche
  useEffect(() => {
    if (!zoneId || query.trim().length === 0) {
      setResults([])
      setIsOpen(false)
      return
    }

    // Ne pas chercher si on sélectionne juste une option ou si la query est trop courte
    if (query.trim().length < 2) return

    const timer = setTimeout(async () => {
      setIsSearching(true)
      const { data } = await searchReperes(zoneId, query)
      if (data && data.length > 0) {
        setResults(data)
        setIsOpen(true)
      } else {
        setResults([])
        setIsOpen(false)
      }
      setIsSearching(false)
    }, 400) // 400ms debounce

    return () => clearTimeout(timer)
  }, [query, zoneId])

  return (
    <div className="relative w-full" ref={wrapperRef}>
      {/* L'input réel caché qui sera envoyé avec le FormData */}
      <input type="hidden" name={name} value={query} />

      <div className="relative">
        <input
          type="text"
          value={query}
          required={required}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (results.length > 0) setIsOpen(true)
          }}
          placeholder={placeholder}
          disabled={!zoneId}
          autoComplete="off"
          className={`w-full bg-white border border-slate-100 text-slate-700 rounded-xl px-4 py-2.5 text-xs font-medium placeholder:text-slate-400 focus:ring-2 focus:ring-orange-500 transition-all ${!zoneId ? 'opacity-50 cursor-not-allowed bg-slate-50' : ''} ${className}`}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
          {isSearching ? (
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span>
            </span>
          ) : icon ? (
            icon
          ) : (
            <Navigation className="w-3.5 h-3.5" />
          )}
        </div>
      </div>

      {/* Dropdown Suggestions */}
      {isOpen && results.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2">
          <div className="bg-slate-50 px-3 py-1.5 border-b border-slate-100 flex items-center gap-1.5">
            <Search className="w-3 h-3 text-orange-500" />
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Repères fiables trouvés</span>
          </div>
          <ul className="max-h-48 overflow-y-auto">
            {results.map((rep) => (
              <li
                key={rep.id}
                onClick={() => {
                  setQuery(rep.nom_repere)
                  setIsOpen(false)
                }}
                className="px-3 py-2.5 hover:bg-orange-50/50 cursor-pointer border-b border-slate-50 last:border-0 flex items-center justify-between group transition-colors"
              >
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-300 group-hover:text-orange-500 transition-colors" />
                  <span className="text-xs font-bold text-slate-700 group-hover:text-slate-900">{rep.nom_repere}</span>
                </div>
                {rep.nb_livraisons_reussies > 0 && (
                  <span className="bg-green-50 text-green-600 px-1.5 py-0.5 rounded text-[8px] font-black flex items-center gap-1">
                    <span className="w-1 h-1 bg-green-500 rounded-full"></span>
                    {rep.nb_livraisons_reussies} ✓
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
