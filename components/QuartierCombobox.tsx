import { useState, useEffect, useRef } from 'react'
import { searchQuartiers } from '@/actions/quartiers'
import { Quartier } from '@/lib/types'
import { Search, MapPin, X, Info, Loader2 } from 'lucide-react'

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
    if (!isOpen) {
      setHasSearched(false)
      return
    }

    const timer = setTimeout(async () => {
      setIsSearching(true)
      const { data } = await searchQuartiers(query)
      if (data) {
        setResults(data)
      } else {
        setResults([])
      }
      setIsSearching(false)
      setHasSearched(true)
    }, query ? 300 : 0) // No debounce for empty query lists

    return () => clearTimeout(timer)
  }, [query, isOpen])

  const clearSelection = (e: React.MouseEvent) => {
    e.stopPropagation()
    setQuery('')
    onChange(null)
    setIsOpen(true)
  }

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
          className="w-full bg-slate-50 border border-slate-100 text-slate-900 rounded-xl pl-11 pr-12 py-4 text-sm font-bold focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all outline-none"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {query && !isSearching && (
            <button 
              onClick={clearSelection}
              className="p-1.5 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          {isSearching ? (
            <Loader2 className="w-4 h-4 text-orange-500 animate-spin mr-1" />
          ) : (
            <Search className="w-4 h-4 text-slate-300 mr-1" />
          )}
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-slate-100 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <ul className="max-h-64 overflow-y-auto p-1 custom-scrollbar">
            {results.length > 0 ? (
              results.map((q) => (
                <li
                  key={q.id}
                  onClick={() => {
                    setQuery(q.nom)
                    onChange(q)
                    setIsOpen(false)
                  }}
                  className="px-4 py-3.5 hover:bg-orange-50 cursor-pointer rounded-xl flex items-center justify-between group transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-50 group-hover:bg-white flex flex-shrink-0 items-center justify-center border border-transparent group-hover:border-orange-100 transition-all">
                      <MapPin className="w-4 h-4 text-slate-400 group-hover:text-orange-500 transition-colors" />
                    </div>
                    <div>
                      <span className="text-sm font-black text-slate-800 group-hover:text-orange-600 transition-colors uppercase tracking-tight">{q.nom}</span>
                      {q.zone && (
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{q.zone.name}</p>
                      )}
                    </div>
                  </div>
                  <X className="w-4 h-4 text-slate-200 group-hover:text-orange-200 opacity-0 group-hover:opacity-100 transition-all -rotate-45" />
                </li>
              ))
            ) : hasSearched && query.length > 0 ? (
              <li className="px-5 py-8 text-center bg-slate-50/50">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-sm border border-slate-100">
                  <Info className="w-6 h-6 text-orange-300" />
                </div>
                <p className="text-xs font-black text-slate-500 uppercase tracking-tight mb-1">Quartier non trouvé</p>
                <p className="text-[10px] text-slate-400 font-medium">Vérifiez l&apos;orthographe ou choisissez le quartier le plus proche.</p>
              </li>
            ) : (
              <li className="px-5 py-8 text-center">
                 <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] animate-pulse">Saisissez un quartier...</p>
              </li>
            )}
          </ul>
          
          {/* Footer d'information */}
          {results.length > 0 && (
            <div className="px-4 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
               <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                 {results.length} quartiers trouvés
               </p>
               <span className="text-[9px] font-black text-orange-500 uppercase tracking-widest opacity-50">Sélectionnez →</span>
            </div>
          )}
        </div>
      )}

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
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
