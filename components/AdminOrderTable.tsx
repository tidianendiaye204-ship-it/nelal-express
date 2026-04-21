'use client'

import { useState, useMemo } from 'react'
import { STATUS_LABELS, STATUS_COLORS, type OrderStatus, type Profile } from '@/lib/types'
import { 
  Search, Edit, Trash2
} from 'lucide-react'
import { adminUpdateOrder, adminCancelOrder, assignLivreur } from '@/actions/orders'

export default function AdminOrderTable({ 
  initialOrders, 
  livreurs 
}: { 
  initialOrders: any[], 
  livreurs: Profile[] 
}) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [editingOrder, setEditingOrder] = useState<any | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)
  
  const [editForm, setEditForm] = useState({
    price: 0,
    description: '',
    status: '' as OrderStatus
  })

  const filteredOrders = useMemo(() => {
    return initialOrders.filter(order => {
      const matchesSearch = 
        order.description.toLowerCase().includes(search.toLowerCase()) ||
        order.client?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
        order.id.includes(search)
      const matchesStatus = statusFilter === 'all' || order.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [initialOrders, search, statusFilter])

  const handleEditInit = (order: any) => {
    setEditingOrder(order)
    setEditForm({
      price: order.price,
      description: order.description,
      status: order.status
    })
  }

  const handleSaveEdit = async () => {
    if (!editingOrder) return
    setIsUpdating(true)
    try {
      await adminUpdateOrder(editingOrder.id, editForm)
      setEditingOrder(null)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleCancel = async (orderId: string) => {
    if (confirm('Annuler cette commande ?')) {
      await adminCancelOrder(orderId, 'Annulation admin')
    }
  }

  const handleReassign = async (orderId: string, livreurId: string) => {
    if (livreurId) await assignLivreur(orderId, livreurId)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Rechercher..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-transparent focus:bg-white focus:border-slate-200 rounded-2xl text-xs font-bold outline-none"
          />
        </div>
        <select 
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full md:w-48 bg-slate-50 border border-transparent rounded-2xl px-4 py-3 text-[10px] font-black uppercase tracking-widest outline-none transition-all cursor-pointer"
        >
          <option value="all">Tous les Statuts</option>
          {Object.entries(STATUS_LABELS).map(([val, label]) => (
            <option key={val} value={val}>{label}</option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-50 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                <th className="px-6 py-5">Colis</th>
                <th className="px-6 py-5 text-center">Livreur</th>
                <th className="px-6 py-5 text-center">Statut</th>
                <th className="px-6 py-5 text-right">Prix</th>
                <th className="px-6 py-5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-5">
                    <div className="flex flex-col">
                      <span className="text-slate-900 font-bold text-xs">{order.description}</span>
                      <span className="text-[10px] text-slate-400">{order.client?.full_name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <select 
                      value={order.livreur_id || ''}
                      onChange={(e) => handleReassign(order.id, e.target.value)}
                      className="text-[10px] font-bold bg-slate-50 border-none rounded-lg p-1"
                    >
                      <option value="">—</option>
                      {livreurs.map(l => <option key={l.id} value={l.id}>{l.full_name}</option>)}
                    </select>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <span className={`px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border ${STATUS_COLORS[order.status as keyof typeof STATUS_COLORS]}`}>
                      {STATUS_LABELS[order.status as keyof typeof STATUS_LABELS]}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-right font-display font-black text-xs">
                    {order.price.toLocaleString()} F
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex justify-center gap-1">
                      <button onClick={() => handleEditInit(order)} className="p-2 bg-slate-50 rounded-lg hover:bg-orange-500 hover:text-white transition-all"><Edit className="w-3.5 h-3.5" /></button>
                      <button onClick={() => handleCancel(order.id)} className="p-2 bg-slate-50 rounded-lg hover:bg-red-500 hover:text-white transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {editingOrder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl">
            <h3 className="font-display font-black text-xl uppercase italic mb-6">Modifier Commande</h3>
            <div className="space-y-4">
              <input type="number" value={editForm.price} onChange={e => setEditForm(p => ({ ...p, price: parseInt(e.target.value) }))} className="w-full bg-slate-50 p-4 rounded-2xl text-xs font-bold" />
              <select value={editForm.status} onChange={e => setEditForm(p => ({ ...p, status: e.target.value as OrderStatus }))} className="w-full bg-slate-50 p-4 rounded-2xl text-[10px] font-black uppercase">
                {Object.entries(STATUS_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
            <div className="mt-8 flex gap-2">
              <button onClick={() => setEditingOrder(null)} className="flex-1 py-4 bg-slate-100 rounded-2xl font-black text-xs uppercase">Annuler</button>
              <button onClick={handleSaveEdit} className="flex-1 py-4 bg-orange-500 text-white rounded-2xl font-black text-xs uppercase">{isUpdating ? '...' : 'OK'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
