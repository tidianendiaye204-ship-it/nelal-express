'use client'

import { useState, useEffect, useRef } from 'react'
import { searchQuartiers } from '@/actions/quartiers'
import { Quartier } from '@/lib/types'
import { Search, MapPin } from 'lucide-react'

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

  const wrapperRef = useRef<HTMLDivElement>(null)

  // Initialiser l'input si la valeur change de l'extérieur (ex: reset)
  useEffect(() => {
    if (value) {
      setQuery(value.nom)
    } else {
      setQuery('')
    }
  }, [value])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        // Reset query si on clique en dehors et qu'aucun quartier n'est sélectionné
        if (!value && query) {
          setQuery('')
        } else if (value && query !== value.nom) {
          setQuery(value.nom)
        }
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [value, query])

  useEffect(() => {
    if (!isOpen) return

    const timer = setTimeout(async () => {
      setIsSearching(true)
      const { data } = await searchQuartiers(query)
      if (data) {
        setResults(data)
      } else {
        setResults([])
      }
      setIsSearching(false)
    }, 300)

    return () => clearTimeout(timer)
  }, [query, isOpen])

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
        {label}
      </label>
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
          {icon || <MapPin className="w-4 h-4" />}
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setIsOpen(true)
            if (value) onChange(null) // Reset selection if typing
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="w-full bg-slate-50 border border-slate-100 text-slate-900 rounded-xl pl-11 pr-10 py-4 text-sm font-bold focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all outline-none"
        />
        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
          {isSearching ? (
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span>
            </span>
          ) : (
            <Search className="w-4 h-4" />
          )}
        </div>
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-slate-100 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2">
          <ul className="max-h-60 overflow-y-auto p-1">
            {results.map((q) => (
              <li
                key={q.id}
                onClick={() => {
                  setQuery(q.nom)
                  onChange(q)
                  setIsOpen(false)
                }}
                className="px-4 py-3 hover:bg-orange-50 cursor-pointer rounded-xl flex items-center justify-between group transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-50 group-hover:bg-white flex flex-shrink-0 items-center justify-center">
                    <MapPin className="w-4 h-4 text-slate-400 group-hover:text-orange-500 transition-colors" />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-slate-800">{q.nom}</span>
                    {q.zone && (
                      <p className="text-[10px] text-slate-400">{q.zone.name}</p>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
