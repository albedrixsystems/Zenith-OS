import { useState, useEffect } from 'react'
import { Settings, Shield, Building, Key } from 'lucide-react'
import { Layout } from '../../components/layout/Layout'
import { Skeleton } from '../../components/ui/index'
import api from '../../lib/api'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { useLanguage } from '../../context/LanguageContext'

export default function PortalProfilePage() {
  const { user } = useAuth()
  const { t } = useLanguage()
  const isViewer = user?.role === 'client_viewer'
  const toast = useToast()

  const [loading, setLoading] = useState(true)
  
  // Company details state
  const [companyName, setCompanyName] = useState('')
  const [contactPerson, setContactPerson] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [industry, setIndustry] = useState('')
  const [gstin, setGstin] = useState('')
  const [pan, setPan] = useState('')

  // Password reset states
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const fetchClientDetails = () => {
    if (!user?.clientId) return
    setLoading(true)
    api.get(`/clients/${user.clientId}`)
      .then(res => {
        const client = res.data
        setCompanyName(client.companyName || '')
        setContactPerson(client.contactPerson || '')
        setPhone(client.phone || '')
        setAddress(client.address || '')
        setIndustry(client.industry || '')
        setGstin(client.gstin || '')
        setPan(client.pan || '')
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setLoading(false)
      })
  }

  useEffect(() => {
    fetchClientDetails()
  }, [user])

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault()
    if (isViewer) return
    
    // Strict GSTIN verification (15-char alphanumeric)
    if (gstin && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(gstin)) {
      toast.error('Invalid GSTIN format (should be 15 characters)')
      return
    }

    // PAN verification (10-char alphanumeric)
    if (pan && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(pan)) {
      toast.error('Invalid PAN format (should be 10 characters)')
      return
    }

    api.put(`/clients/${user?.clientId}`, {
      companyName,
      contactPerson,
      phone,
      address,
      industry,
      gstin,
      pan
    })
      .then(() => {
        toast.success('Company profile updated successfully')
        fetchClientDetails()
      })
      .catch(err => {
        toast.error(err.response?.data?.error || err.message)
      })
  }

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault()
    if (isViewer) return

    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('All password fields are required')
      return
    }

    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match')
      return
    }

    if (newPassword.length < 8) {
      toast.error('New password must be at least 8 characters long')
      return
    }

    api.post('/auth/change-password', { currentPassword, newPassword })
      .then(() => {
        toast.success('Password changed successfully')
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
      })
      .catch(err => {
        toast.error(err.response?.data?.error || err.message)
      })
  }

  return (
    <Layout title="My Profile">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-navy-900 tracking-tight">My Profile Settings</h1>
          <p className="text-slate-500 text-sm mt-1">Manage your company credentials, contact specifics, and login parameters.</p>
        </div>
      </div>

      {loading ? (
        <div className="card p-6 space-y-4">
          <Skeleton className="h-6 w-1/4" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile details */}
          <form onSubmit={handleUpdateProfile} className="lg:col-span-2 space-y-6">
            <div className="card p-6 space-y-4">
              <h3 className="text-sm font-bold text-navy-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                <Building size={16} className="text-orange-500" /> Company Specifications
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Company Name *</label>
                  <input
                    type="text"
                    className="input text-xs"
                    value={companyName}
                    disabled={isViewer}
                    onChange={e => setCompanyName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Person *</label>
                  <input
                    type="text"
                    className="input text-xs"
                    value={contactPerson}
                    disabled={isViewer}
                    onChange={e => setContactPerson(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    className="input text-xs"
                    value={phone}
                    disabled={isViewer}
                    onChange={e => setPhone(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Industry</label>
                  <input
                    type="text"
                    className="input text-xs"
                    value={industry}
                    disabled={isViewer}
                    onChange={e => setIndustry(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Company Address</label>
                <input
                  type="text"
                  className="input text-xs"
                  value={address}
                  disabled={isViewer}
                  onChange={e => setAddress(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-100 pt-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">GSTIN (15-character ID)</label>
                  <input
                    type="text"
                    className="input text-xs uppercase"
                    placeholder="e.g. 07AAAAA1111A1Z1"
                    maxLength={15}
                    value={gstin}
                    disabled={isViewer}
                    onChange={e => setGstin(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">PAN (10-character ID)</label>
                  <input
                    type="text"
                    className="input text-xs uppercase"
                    placeholder="e.g. ABCDE1234F"
                    maxLength={10}
                    value={pan}
                    disabled={isViewer}
                    onChange={e => setPan(e.target.value)}
                  />
                </div>
              </div>

              {!isViewer && (
                <div className="flex justify-end pt-2 border-t border-slate-100">
                  <button type="submit" className="btn-primary text-xs py-2 px-5 cursor-pointer">
                    Save Profile Changes
                  </button>
                </div>
              )}
            </div>
          </form>

          {/* Settings / Password Pane */}
          <div className="lg:col-span-1 space-y-6">
            <form onSubmit={handleChangePassword} className="card p-6 space-y-4">
              <h3 className="text-sm font-bold text-navy-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                <Key size={16} className="text-orange-500" /> Account Security
              </h3>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Current Password *</label>
                <input
                  type="password"
                  className="input text-xs"
                  value={currentPassword}
                  disabled={isViewer}
                  onChange={e => setCurrentPassword(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">New Password *</label>
                <input
                  type="password"
                  className="input text-xs"
                  value={newPassword}
                  disabled={isViewer}
                  onChange={e => setNewPassword(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Confirm New Password *</label>
                <input
                  type="password"
                  className="input text-xs"
                  value={confirmPassword}
                  disabled={isViewer}
                  onChange={e => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              {!isViewer && (
                <div className="flex justify-end pt-2 border-t border-slate-100">
                  <button type="submit" className="btn-primary text-xs py-2 px-5 cursor-pointer">
                    Change Password
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      )}
    </Layout>
  )
}
