import { useState } from 'react'
import { Save, Building2, Mail, Bell, Shield, Palette } from 'lucide-react'
import { Layout } from '../components/layout/Layout'
import { Logo } from '../components/ui/Logo'
import { useToast } from '../context/ToastContext'
import { useLanguage } from '../context/LanguageContext'

const TABS = [
  { id: 'agency', labelKey: 'agencyProfile', icon: Building2 },
  { id: 'email', labelKey: 'emailSettings', icon: Mail },
  { id: 'notifications', labelKey: 'notifications', icon: Bell },
  { id: 'security', labelKey: 'security', icon: Shield },
  { id: 'branding', labelKey: 'brandingConfiguration', icon: Palette },
]

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('agency')
  const toast = useToast()
  const { t } = useLanguage()

  // Branding Settings States
  const [brandName, setBrandName] = useState(() => localStorage.getItem('zenithos_brand_name') || 'ZenithOS')
  const [brandLogo, setBrandLogo] = useState(() => localStorage.getItem('zenithos_brand_logo') || '/favicon.png')
  const [accentTheme, setAccentTheme] = useState(() => localStorage.getItem('zenithos_brand_accent') || 'Orange')
  const [invoiceFooter, setInvoiceFooter] = useState(() => localStorage.getItem('zenithos_invoice_footer') || 'Thank you for choosing Zenith Creative. We look forward to continuing our work together.')
  const [welcomeMessage, setWelcomeMessage] = useState(() => localStorage.getItem('zenithos_welcome_message') || 'Welcome to your Zenith Creative project portal. Here you can track progress, review files, and manage invoices.')

  const handleSaveBranding = () => {
    localStorage.setItem('zenithos_brand_name', brandName)
    localStorage.setItem('zenithos_brand_logo', brandLogo)
    localStorage.setItem('zenithos_brand_accent', accentTheme)
    localStorage.setItem('zenithos_invoice_footer', invoiceFooter)
    localStorage.setItem('zenithos_welcome_message', welcomeMessage)
    
    // Apply accent theme immediately
    import('../lib/theme').then(({ applyAccentTheme }) => {
      applyAccentTheme(accentTheme as any)
    })
    
    toast.success(t('brandingSaved'))
  }

  return (
    <Layout title={t('settings')}>
      <div className="page-header">
        <h1 className="page-title">{t('settings')}</h1>
        <p className="page-subtitle">{t('settingsDescZenithOS')}</p>
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
                {t(tab.labelKey)}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 max-w-xl">
          {activeTab === 'agency' && (
            <div className="card p-6 space-y-5">
              <h2 className="section-title">{t('agencyProfile')}</h2>
              <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
                <div className="flex justify-start">
                  <img
                    src={brandLogo}
                    alt="Company Logo"
                    className="h-16 w-auto relative z-10 object-contain"
                    onError={(e) => {
                       (e.target as HTMLImageElement).src = '/favicon.png'
                    }}
                  />
                </div>
                <div>
                  <p className="font-semibold text-navy-900">{brandName}</p>
                  <p className="text-xs text-slate-500">zenithcreative.in</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">{t('agencyName')}</label>
                  <input className="input" defaultValue="Zenith Creative" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">{t('website')}</label>
                  <input className="input" defaultValue="zenithcreative.in" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">{t('contactEmail')}</label>
                  <input type="email" className="input" defaultValue="hello@zenithcreative.in" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">{t('phone')}</label>
                  <input className="input" defaultValue="+91 98765 43210" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">{t('address')}</label>
                <textarea className="input h-16 resize-none" defaultValue="Zenith Creative Studio, Salem, Tamil Nadu, India" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">{t('gstNumber')}</label>
                <input className="input" placeholder="33ABCDE1234F1Z5" />
              </div>
              <button className="btn-primary">
                <Save size={14} /> {t('saveChanges')}
              </button>
            </div>
          )}

          {activeTab === 'email' && (
            <div className="card p-6 space-y-5">
              <h2 className="section-title">{t('emailSettings')}</h2>
              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-xs font-semibold text-slate-600 mb-1">{t('emailProvider')}</p>
                <p className="text-sm text-slate-500">{t('poweredBy')} <span className="font-semibold text-navy-900">Resend</span></p>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">{t('senderName')}</label>
                <input className="input" defaultValue="Zenith Creative" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">{t('senderEmail')}</label>
                <input type="email" className="input" defaultValue="noreply@zenithcreative.in" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-2">{t('automatedEmails')}</label>
                <div className="space-y-3">
                  {[
                    { key: 'welcomeEmailClient', defaultVal: 'Welcome email on client creation' },
                    { key: 'approvalRequestNotif', defaultVal: 'Approval request notifications' },
                    { key: 'invoiceDeliveryEmails', defaultVal: 'Invoice delivery emails' },
                    { key: 'paymentReceiptEmails', defaultVal: 'Payment receipt emails' },
                    { key: 'deadlineReminders', defaultVal: 'Deadline reminders' }
                  ].map(item => (
                    <label key={item.key} className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" defaultChecked className="w-4 h-4 rounded accent-orange-500" />
                      <span className="text-sm text-slate-700">{t(item.key)}</span>
                    </label>
                  ))}
                </div>
              </div>
              <button className="btn-primary"><Save size={14} /> {t('saveSettings')}</button>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="card p-6 space-y-5">
              <h2 className="section-title">{t('notificationPreferences')}</h2>
              <div className="space-y-4">
                {[
                  { key: 'newClientAdded', descKey: 'newClientAddedDesc' },
                  { key: 'projectAssignedYou', descKey: 'projectAssignedYouDesc' },
                  { key: 'approvalReceived', descKey: 'approvalReceivedDesc' },
                  { key: 'paymentReceived', descKey: 'paymentReceivedDesc' },
                  { key: 'deadlineApproaching', descKey: 'deadlineApproachingDesc' },
                  { key: 'invoiceOverdue', descKey: 'invoiceOverdueDesc' },
                ].map(item => (
                  <div key={item.key} className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100 last:border-0 last:pb-0">
                    <div>
                      <p className="text-sm font-medium text-navy-900">{t(item.key)}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{t(item.descKey)}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <label className="text-xs text-slate-500">{t('email')}</label>
                      <input type="checkbox" defaultChecked className="accent-orange-500" />
                      <label className="text-xs text-slate-500">{t('inApp')}</label>
                      <input type="checkbox" defaultChecked className="accent-orange-500" />
                    </div>
                  </div>
                ))}
              </div>
              <button className="btn-primary"><Save size={14} /> {t('savePreferences')}</button>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="card p-6 space-y-5">
              <h2 className="section-title">{t('securitySettings')}</h2>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">{t('currentPassword')}</label>
                <input type="password" className="input" placeholder="••••••••" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">{t('newPassword')}</label>
                <input type="password" className="input" placeholder="••••••••" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">{t('confirmNewPassword')}</label>
                <input type="password" className="input" placeholder="••••••••" />
              </div>
              <div className="bg-slate-50 rounded-xl p-4 space-y-2">
                <p className="text-xs font-semibold text-slate-600">{t('sessionManagement')}</p>
                <p className="text-xs text-slate-500">{t('sessionManagementDesc')}</p>
              </div>
              <button className="btn-primary"><Save size={14} /> {t('updatePassword')}</button>
            </div>
          )}

          {activeTab === 'branding' && (
            <div className="card p-6 space-y-5">
              <h2 className="section-title">{t('brandingConfiguration')}</h2>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">{t('agencyBrandName')}</label>
                  <input 
                    type="text" 
                    className="input" 
                    value={brandName} 
                    onChange={e => setBrandName(e.target.value)} 
                    placeholder="e.g. Zenith Creative" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">{t('brandAccentTheme')}</label>
                  <select 
                    className="input" 
                    value={accentTheme} 
                    onChange={e => setAccentTheme(e.target.value)}
                  >
                    <option value="Orange">{t('orangeDefault')}</option>
                    <option value="Blue">{t('blueAccent')}</option>
                    <option value="Emerald">{t('emeraldAccent')}</option>
                    <option value="Indigo">{t('indigoAccent')}</option>
                    <option value="Violet">{t('violetAccent')}</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">{t('brandLogoUrl')}</label>
                <input 
                  type="text" 
                  className="input" 
                  value={brandLogo} 
                  onChange={e => setBrandLogo(e.target.value)} 
                  placeholder="https://example.com/logo.png" 
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">{t('invoiceFooterText')}</label>
                <textarea 
                  className="input h-16 resize-none" 
                  value={invoiceFooter} 
                  onChange={e => setInvoiceFooter(e.target.value)} 
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">{t('clientPortalWelcomeMessage')}</label>
                <textarea 
                  className="input h-16 resize-none" 
                  value={welcomeMessage} 
                  onChange={e => setWelcomeMessage(e.target.value)} 
                />
              </div>

              <button 
                type="button" 
                onClick={handleSaveBranding} 
                className="btn-primary flex items-center gap-2 cursor-pointer"
              >
                <Save size={14} /> {t('saveBranding')}
              </button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
