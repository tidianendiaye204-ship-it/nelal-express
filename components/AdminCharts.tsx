'use client'

import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell } from 'recharts'
import { format, parseISO, subDays } from 'date-fns'
import { fr } from 'date-fns/locale'
import { TrendingUp, PieChart as PieChartIcon } from 'lucide-react'

// Data types expected
type OrderStat = {
  price: number
  status: string
  payment_method: string
  created_at: string
}

const COLORS = ['#f97316', '#3b82f6', '#10b981', '#8b5cf6', '#f43f5e', '#eab308']
const STATUS_COLORS: Record<string, string> = {
  en_attente: '#eab308', // yellow
  confirme: '#3b82f6', // blue
  en_cours: '#f97316', // orange
  livre: '#10b981', // green
  livre_partiel: '#14b8a6', // teal
  annule: '#ef4444', // red
}

export default function AdminCharts({ orders }: { orders: OrderStat[] }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // 1. CA par jour (les 7 derniers jours)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = subDays(new Date(), 6 - i)
    return format(d, 'yyyy-MM-dd')
  })

  const revenueByDay = last7Days.map(date => {
    const dayOrders = orders.filter(o => 
      o.created_at.startsWith(date) && 
      (o.status === 'livre' || o.status === 'livre_partiel')
    )
    const total = dayOrders.reduce((sum, o) => sum + (o.price || 0), 0)
    return {
      name: format(parseISO(date), 'EEE', { locale: fr }), // Lundi, Mardi...
      total
    }
  })

  // 2. Répartition par statut
  const statusCounts = orders.reduce((acc, o) => {
    acc[o.status] = (acc[o.status] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const statusData = Object.entries(statusCounts).map(([key, value]) => ({
    name: key.replace('_', ' ').toUpperCase(),
    value,
    originalKey: key
  }))

  if (!mounted) return (
    <div className="grid lg:grid-cols-3 gap-6 opacity-0">
      <div className="lg:col-span-2 h-[400px] bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm" />
      <div className="h-[400px] bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm" />
    </div>
  )

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {/* Chart 1: Revenue by Day */}
      <div className="lg:col-span-2 bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm relative overflow-hidden min-h-[400px]">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center text-orange-500">
            <TrendingUp className="w-5 h-5" />
          </div>
          <h3 className="font-display font-black text-lg uppercase italic tracking-tighter text-slate-900">
            Chiffre d&apos;Affaires <span className="text-slate-400 font-medium text-xs not-italic block">7 derniers jours</span>
          </h3>
        </div>
        <div className="h-[300px] w-full min-h-[300px]">
          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            <BarChart data={revenueByDay} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8', fontWeight: 600 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} tickFormatter={(val) => `${val/1000}k`} />
              <Tooltip 
                cursor={{ fill: '#f8fafc' }}
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                formatter={(value: any) => { return [`${(value || 0).toLocaleString()} FCFA`, 'CA'] as any }}
              />
              <Bar dataKey="total" fill="#f97316" radius={[6, 6, 0, 0]} maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 2: Status Distribution */}
      <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm relative overflow-hidden flex flex-col min-h-[400px]">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-500">
            <PieChartIcon className="w-5 h-5" />
          </div>
          <h3 className="font-display font-black text-lg uppercase italic tracking-tighter text-slate-900">
            Répartition <span className="text-slate-400 font-medium text-xs not-italic block">Toutes les commandes</span>
          </h3>
        </div>
        <div className="flex-1 min-h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.originalKey] || COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                formatter={(value: any) => { return [value || 0, 'Commandes'] as any }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        {/* Custom Legend */}
        <div className="mt-4 grid grid-cols-2 gap-2">
          {statusData.map((entry, index) => (
            <div key={index} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: STATUS_COLORS[entry.originalKey] || COLORS[index % COLORS.length] }} />
              <span className="text-[10px] font-bold text-slate-500 truncate">{entry.name}</span>
              <span className="ml-auto text-xs font-black text-slate-900">{entry.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
