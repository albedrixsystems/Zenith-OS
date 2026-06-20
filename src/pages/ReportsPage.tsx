import { Download, TrendingUp, Users, FileText, CheckCircle } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'
import { Layout } from '../components/layout/Layout'
import { mockRevenueData, mockClients, mockProjects, mockInvoices } from '../lib/mockData'
import { formatCurrency } from '../lib/utils'

const clientGrowth = [
  { month: 'Jan', clients: 3 },
  { month: 'Feb', clients: 3 },
  { month: 'Mar', clients: 4 },
  { month: 'Apr', clients: 4 },
  { month: 'May', clients: 5 },
  { month: 'Jun', clients: 6 },
]

const projectCompletion = [
  { status: 'Draft', count: 0 },
  { status: 'Active', count: 4 },
  { status: 'Review', count: 1 },
  { status: 'Completed', count: 1 },
]

export default function ReportsPage() {
  return (
    <Layout title="Reports">
      <div className="page-header flex items-center justify-between">
        <div>
          <h1 className="page-title">Reports</h1>
          <p className="page-subtitle">Business performance overview</p>
        </div>
        <button className="btn-primary">
          <Download size={15} /> Export Report
        </button>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Revenue', value: formatCurrency(mockInvoices.reduce((s, i) => s + (i.status === 'paid' ? i.total : 0), 0)), icon: <TrendingUp size={18} className="text-emerald-500" />, bg: 'bg-emerald-50', sub: 'All time collected' },
          { label: 'Total Clients', value: mockClients.length, icon: <Users size={18} style={{ color: '#F4511E' }} />, bg: 'bg-orange-50', sub: `${mockClients.filter(c => c.status === 'active').length} active` },
          { label: 'Projects Delivered', value: mockProjects.filter(p => p.status === 'completed').length, icon: <CheckCircle size={18} className="text-blue-500" />, bg: 'bg-blue-50', sub: 'On time' },
          { label: 'Outstanding Invoices', value: mockInvoices.filter(i => i.status !== 'paid').length, icon: <FileText size={18} className="text-amber-500" />, bg: 'bg-amber-50', sub: formatCurrency(mockInvoices.filter(i => i.status !== 'paid').reduce((s, i) => s + i.total, 0)) },
        ].map(k => (
          <div key={k.label} className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-slate-500">{k.label}</span>
              <div className={`w-9 h-9 rounded-xl ${k.bg} flex items-center justify-center`}>{k.icon}</div>
            </div>
            <p className="text-2xl font-bold text-navy-900">{k.value}</p>
            <p className="text-xs text-slate-400 mt-0.5">{k.sub}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Revenue Bar Chart */}
        <div className="card p-6">
          <h2 className="section-title mb-1">Monthly Revenue</h2>
          <p className="text-xs text-slate-500 mb-5">Billed per month — 2024</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={mockRevenueData} margin={{ top: 0, right: 0, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v: number) => [formatCurrency(v), 'Revenue']} contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: 12 }} />
              <Bar dataKey="revenue" fill="url(#barGrad)" radius={[6, 6, 0, 0]} />
              <defs>
                <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#F4511E" />
                  <stop offset="100%" stopColor="#FF8C42" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Client Growth */}
        <div className="card p-6">
          <h2 className="section-title mb-1">Client Growth</h2>
          <p className="text-xs text-slate-500 mb-5">Cumulative clients — 2024</p>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={clientGrowth} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} domain={[0, 8]} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: 12 }} />
              <Line type="monotone" dataKey="clients" stroke="#4F46E5" strokeWidth={2.5} dot={{ fill: '#4F46E5', r: 4 }} name="Clients" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Client Performance Table */}
      <div className="card overflow-hidden mb-6">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="section-title">Client Performance</h2>
          <button className="btn-ghost text-xs"><Download size={13} /> Export CSV</button>
        </div>
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="table-header text-left">Client</th>
              <th className="table-header text-left">Industry</th>
              <th className="table-header text-left">Projects</th>
              <th className="table-header text-left">Revenue</th>
              <th className="table-header text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {mockClients.filter(c => c.totalRevenue > 0).sort((a, b) => b.totalRevenue - a.totalRevenue).map(client => (
              <tr key={client.id} className="table-row">
                <td className="table-cell text-sm">
                  <div className="font-semibold text-navy-900">{client.companyName}</div>
                  {client.gstin && <div className="text-[10px] text-slate-400 font-normal">GSTIN: {client.gstin}</div>}
                </td>
                <td className="table-cell text-sm text-slate-500">{client.industry}</td>
                <td className="table-cell text-sm text-slate-700">{client.projectCount}</td>
                <td className="table-cell text-sm font-bold text-emerald-600">{formatCurrency(client.totalRevenue)}</td>
                <td className="table-cell">
                  <span className={`badge ${client.status === 'active' ? 'badge-success' : 'badge-default'}`}>
                    {client.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Invoice Status Summary */}
      <div className="card p-6">
        <h2 className="section-title mb-4">Invoice Status Breakdown</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {(['draft', 'sent', 'paid', 'overdue'] as const).map(status => {
            const count = mockInvoices.filter(i => i.status === status).length
            const amount = mockInvoices.filter(i => i.status === status).reduce((s, i) => s + i.total, 0)
            const colors: Record<string, string> = { draft: 'text-slate-600', sent: 'text-blue-600', paid: 'text-emerald-600', overdue: 'text-rose-600' }
            return (
              <div key={status} className="bg-slate-50 rounded-xl p-4 text-center">
                <p className={`text-2xl font-bold capitalize ${colors[status]}`}>{count}</p>
                <p className="text-xs text-slate-500 capitalize mt-0.5">{status}</p>
                <p className="text-xs font-semibold text-slate-600 mt-1">{formatCurrency(amount)}</p>
              </div>
            )
          })}
        </div>
      </div>
    </Layout>
  )
}
