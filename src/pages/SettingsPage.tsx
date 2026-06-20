import { useState } from 'react'
import { Save, Building2, Mail, Bell, Shield, Palette } from 'lucide-react'
import { Layout } from '../components/layout/Layout'
import { Logo } from '../components/ui/Logo'

const TABS = [
  { id: 'agency', label: 'Agency Profile', icon: Building2 },
  { id: 'email', label: 'Email Settings', icon: Mail },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'branding', label: 'Branding', icon: Palette },
]

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('agency')

  return (
    <Layout title="Settings">
      <div className="page-header">
        <h1 className="page-title">Settings</h1>
        <p className="page-subtitle">Manage your ZenithOS configuration</p>
      </div>

      <div className="flex gap-6">
        {/* Sidebar tabs */}
        <div className="w-48 flex-shrink-0">
          <nav className="space-y-0.5">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-left transition-all
                  ${activeTab === tab.id
                    ? 'text-orange-600 font-semibold'
                    : 'text-slate-600 hover:bg-slate-100'
                  }`}
                style={activeTab === tab.id ? { background: 'rgba(244,81,30,0.08)' } : undefined}
              >
                <tab.icon size={15} />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 max-w-xl">
          {activeTab === 'agency' && (
            <div className="card p-6 space-y-5">
              <h2 className="section-title">Agency Profile</h2>
              <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
                <div className="flex justify-start">
  <img
    src="/favicon.png"
    alt="Company Logo"
    className="h-16 w-auto relative z-10"
  />
</div>
                <div>
                  <p className="font-semibold text-navy-900">Zenith Creative</p>
                  <p className="text-xs text-slate-500">zenithcreative.in</p>
                  <button className="text-xs text-orange-600 font-semibold mt-1 hover:underline">Change logo</button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">Agency Name</label>
                  <input className="input" defaultValue="Zenith Creative" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">Website</label>
                  <input className="input" defaultValue="zenithcreative.in" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">Contact Email</label>
                  <input type="email" className="input" defaultValue="hello@zenithcreative.in" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">Phone</label>
                  <input className="input" defaultValue="+91 98765 43210" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">Address</label>
                <textarea className="input h-16 resize-none" defaultValue="Zenith Creative Studio, Salem, Tamil Nadu, India" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">GST Number</label>
                <input className="input" placeholder="33ABCDE1234F1Z5" />
              </div>
              <button className="btn-primary">
                <Save size={14} /> Save Changes
              </button>
            </div>
          )}

          {activeTab === 'email' && (
            <div className="card p-6 space-y-5">
              <h2 className="section-title">Email Settings</h2>
              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-xs font-semibold text-slate-600 mb-1">Email Provider</p>
                <p className="text-sm text-slate-500">Powered by <span className="font-semibold text-navy-900">Resend</span></p>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">Sender Name</label>
                <input className="input" defaultValue="Zenith Creative" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">Sender Email</label>
                <input type="email" className="input" defaultValue="noreply@zenithcreative.in" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-2">Automated Emails</label>
                <div className="space-y-3">
                  {['Welcome email on client creation', 'Approval request notifications', 'Invoice delivery emails', 'Payment receipt emails', 'Deadline reminders'].map(item => (
                    <label key={item} className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" defaultChecked className="w-4 h-4 rounded accent-orange-500" />
                      <span className="text-sm text-slate-700">{item}</span>
                    </label>
                  ))}
                </div>
              </div>
              <button className="btn-primary"><Save size={14} /> Save Settings</button>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="card p-6 space-y-5">
              <h2 className="section-title">Notification Preferences</h2>
              <div className="space-y-4">
                {[
                  { label: 'New client added', desc: 'When a new client is created' },
                  { label: 'Project assigned to you', desc: 'When you are added to a project' },
                  { label: 'Approval received', desc: 'When a client responds to an approval request' },
                  { label: 'Payment received', desc: 'When an invoice is paid' },
                  { label: 'Deadline approaching', desc: '3 days before a project deadline' },
                  { label: 'Invoice overdue', desc: 'When an invoice passes its due date' },
                ].map(item => (
                  <div key={item.label} className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100 last:border-0 last:pb-0">
                    <div>
                      <p className="text-sm font-medium text-navy-900">{item.label}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <label className="text-xs text-slate-500">Email</label>
                      <input type="checkbox" defaultChecked className="accent-orange-500" />
                      <label className="text-xs text-slate-500">In-app</label>
                      <input type="checkbox" defaultChecked className="accent-orange-500" />
                    </div>
                  </div>
                ))}
              </div>
              <button className="btn-primary"><Save size={14} /> Save Preferences</button>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="card p-6 space-y-5">
              <h2 className="section-title">Security Settings</h2>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">Current Password</label>
                <input type="password" className="input" placeholder="••••••••" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">New Password</label>
                <input type="password" className="input" placeholder="••••••••" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">Confirm New Password</label>
                <input type="password" className="input" placeholder="••••••••" />
              </div>
              <div className="bg-slate-50 rounded-xl p-4 space-y-2">
                <p className="text-xs font-semibold text-slate-600">Session Management</p>
                <p className="text-xs text-slate-500">JWT tokens expire after 7 days. Refresh tokens are valid for 30 days.</p>
              </div>
              <button className="btn-primary"><Save size={14} /> Update Password</button>
            </div>
          )}

          {activeTab === 'branding' && (
            <div className="card p-6 space-y-5">
              <h2 className="section-title">Branding</h2>
              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-xs font-semibold text-slate-600 mb-3">Current Brand Colors</p>
                <div className="flex gap-3 flex-wrap">
                  {[
                    { label: 'Primary', color: '#F4511E' },
                    { label: 'Secondary', color: '#FF8C42' },
                    { label: 'Navy', color: '#0F172A' },
                    { label: 'Success', color: '#10B981' },
                  ].map(c => (
                    <div key={c.label} className="text-center">
                      <div className="w-10 h-10 rounded-xl mb-1.5 shadow-sm border border-slate-200" style={{ background: c.color }} />
                      <p className="text-xs text-slate-500">{c.label}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">Invoice Footer Text</label>
                <textarea className="input h-16 resize-none" defaultValue="Thank you for choosing Zenith Creative. We look forward to continuing our work together." />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">Client Portal Welcome Message</label>
                <textarea className="input h-16 resize-none" defaultValue="Welcome to your Zenith Creative project portal. Here you can track progress, review files, and manage invoices." />
              </div>
              <button className="btn-primary"><Save size={14} /> Save Branding</button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
