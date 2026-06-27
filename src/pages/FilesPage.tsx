import { useState, useEffect } from 'react'
import { Upload, Search, Download, Eye, Edit, FileText, Image, Archive, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'
import { Layout } from '../components/layout/Layout'
import { Avatar, EmptyState, Modal, Skeleton, ConfirmationModal } from '../components/ui/index'
import { formatFileSize, formatDate, getFileIcon } from '../lib/utils'
import api from '../lib/api'
import { useToast } from '../context/ToastContext'
import { useLanguage } from '../context/LanguageContext'

const FILE_TYPE_COLORS: Record<string, string> = {
  pdf: 'bg-rose-50 text-rose-600',
  png: 'bg-purple-50 text-purple-600',
  jpg: 'bg-purple-50 text-purple-600',
  jpeg: 'bg-purple-50 text-purple-600',
  psd: 'bg-blue-50 text-blue-600',
  ai: 'bg-orange-50 text-orange-600',
  zip: 'bg-slate-100 text-slate-600',
  docx: 'bg-indigo-50 text-indigo-600',
  pptx: 'bg-amber-50 text-amber-600',
}

export default function FilesPage() {
  const toast = useToast()
  const { t } = useLanguage()
  const [search, setSearch] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const [showUpload, setShowUpload] = useState(false)
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [selectedProjectId, setSelectedProjectId] = useState('')
  const [showEdit, setShowEdit] = useState(false)
  const [editFile, setEditFile] = useState<any>(null)
  const [showView, setShowView] = useState(false)
  const [viewFile, setViewFile] = useState<any>(null)
  const [files, setFiles] = useState<any[]>([])
  const [projectsList, setProjectsList] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Sorting and Deletion states
  const [sortField, setSortField] = useState<'name' | 'size' | 'createdAt' | null>(null)
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)

  const [customUploadName, setCustomUploadName] = useState('')
  const [uploadDescription, setUploadDescription] = useState('')
  const [conflictAction, setConflictAction] = useState<'create' | 'version' | 'overwrite'>('create')
  const [hasConflict, setHasConflict] = useState(false)

  const resetUploadState = () => {
    setShowUpload(false)
    setUploadFile(null)
    setSelectedProjectId('')
    setCustomUploadName('')
    setUploadDescription('')
    setConflictAction('create')
    setHasConflict(false)
  }

  // Conflict detection hook
  useEffect(() => {
    if (!uploadFile || !selectedProjectId) {
      setHasConflict(false)
      setConflictAction('create')
      return
    }
    const ext = uploadFile.name.split('.').pop()?.toLowerCase() || ''
    let name = customUploadName.trim() || uploadFile.name
    if (customUploadName && !customUploadName.trim().toLowerCase().endsWith('.' + ext)) {
      name = customUploadName.trim() + '.' + ext
    }

    const duplicateExists = files.some(
      f => f.name.toLowerCase() === name.toLowerCase() &&
           f.projectId === selectedProjectId &&
           !f.deletedAt
    )

    if (duplicateExists) {
      setHasConflict(true)
      setConflictAction('version')
    } else {
      setHasConflict(false)
      setConflictAction('create')
    }
  }, [uploadFile, customUploadName, selectedProjectId, files])

  const fetchFiles = () => {
    api.get('/files')
      .then(res => {
        setFiles(res.data)
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setLoading(false)
      })
  }

  useEffect(() => {
    fetchFiles()
    api.get('/projects?limit=100').then(res => {
      setProjectsList(res.data?.projects || [])
    })
  }, [])

  const handleUpload = () => {
    if (!uploadFile || !selectedProjectId) {
      toast.error(t('pleaseSelectFileAndProject'))
      return
    }
    const formData = new FormData()
    formData.append('files', uploadFile)
    formData.append('projectId', selectedProjectId)
    formData.append('isClientVisible', 'true')
    if (customUploadName.trim()) {
      formData.append('customName', customUploadName.trim())
    }
    if (uploadDescription.trim()) {
      formData.append('description', uploadDescription.trim())
    }
    formData.append('conflictAction', conflictAction)

    api.post('/files/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
      .then(() => {
        fetchFiles()
        resetUploadState()
        toast.success(t('fileUploadedSuccessfully'))
      })
      .catch(err => {
        toast.error(err.response?.data?.error || err.message)
      })
  }

  const handleDeleteFile = (id: string) => {
    setPendingDeleteId(id)
    setConfirmDeleteOpen(true)
  }

  const handleConfirmDelete = () => {
    if (!pendingDeleteId) return
    setLoading(true)
    api.delete(`/files/${pendingDeleteId}`)
      .then(() => {
        fetchFiles()
        toast.success(t('fileDeletedSuccessfully'))
      })
      .catch(err => {
        toast.error(err.response?.data?.error || err.message)
      })
      .finally(() => {
        setLoading(false)
      })
  }

  const handleSort = (field: 'name' | 'size' | 'createdAt') => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const filtered = files.filter(f =>
    f.name.toLowerCase().includes(search.toLowerCase()) ||
    f.uploadedByName?.toLowerCase().includes(search.toLowerCase())
  )

  const sortedFiles = [...filtered].sort((a, b) => {
    if (!sortField) return 0
    let aVal = a[sortField] || ''
    let bVal = b[sortField] || ''
    if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1
    if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1
    return 0
  })

  return (
    <Layout title={t('files')}>
      <div className="page-header flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="page-title">{t('files')}</h1>
          <p className="page-subtitle">{files.length} {t('filesAcrossProjects')}</p>
        </div>
        <button className="btn-primary" onClick={() => setShowUpload(true)}>
          <Upload size={15} /> {t('uploadFiles')}
        </button>
      </div>

      {/* Drop zone */}
      <div
        className={`border-2 border-dashed rounded-2xl p-8 text-center mb-6 transition-all duration-200 cursor-pointer
          ${dragOver ? 'border-orange-400 bg-orange-50' : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'}`}
        onDragOver={e => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={() => setDragOver(false)}
        onClick={() => setShowUpload(true)}
      >
        <div className="w-12 h-12 rounded-2xl mx-auto mb-3 flex items-center justify-center" style={{ background: 'linear-gradient(135deg, rgba(244,81,30,0.1), rgba(255,140,66,0.1))' }}>
          <Upload size={20} style={{ color: '#F4511E' }} />
        </div>
        <p className="text-sm font-semibold text-navy-900 mb-1">{t('dragDropFiles')}</p>
        <p className="text-xs text-slate-500">{t('orBrowse')}</p>
        <p className="text-xs text-slate-400 mt-2">{t('fileTypesSupported')}</p>
      </div>

      {/* Search */}
      <div className="relative max-w-sm mb-6">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder={t('searchFiles')} className="input pl-9 py-2" />
      </div>

      {/* View Modal */}
      {showView && viewFile && (
        <Modal open={true} onClose={() => setShowView(false)} title={t('fileDetails')} size="sm">
          <div className="space-y-3">
            <p><strong>{t('name')}:</strong> {viewFile.name}</p>
            <p><strong>{t('fileType')}:</strong> {viewFile.type}</p>
            <p><strong>{t('fileSize')}:</strong> {formatFileSize(viewFile.size)}</p>
            <p><strong>{t('uploadedBy')}:</strong> {viewFile.uploadedByName}</p>
            <p><strong>{t('version')}:</strong> v{viewFile.version}</p>
            {viewFile.description && <p><strong>{t('description')}:</strong> {viewFile.description}</p>}
            <p><strong>{t('date')}:</strong> {formatDate(viewFile.createdAt)}</p>
            <div className="flex flex-col gap-2 pt-2">
              <button
                className="btn-primary w-full justify-center"
                onClick={() => window.open(viewFile.url, '_blank')}
              >
                <Download size={14} /> {t('download')}
              </button>
              <button
                className="btn-secondary w-full justify-center"
                onClick={() => { setShowView(false); window.location.href = `/files/${viewFile.id}/metadata`; }}
              >
                📄 {t('openMetadata')}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Edit Modal */}
      {showEdit && editFile && (
        <Modal open={true} onClose={() => setShowEdit(false)} title={t('editFile')} size="sm">
          <div className="space-y-4">
            <label className="block text-xs font-medium text-slate-700 mb-1">{t('name')}</label>
            <input className="input" defaultValue={editFile.name} onChange={e => setEditFile({ ...editFile, name: e.target.value })} />
            <div className="flex gap-3 pt-2">
              <button className="btn-secondary flex-1" onClick={() => setShowEdit(false)}>{t('cancel')}</button>
              <button className="btn-primary flex-1" onClick={() => {
                api.put(`/files/${editFile.id}`, { name: editFile.name })
                  .then(() => {
                    fetchFiles()
                    setShowEdit(false)
                    toast.success(t('fileRenamedSuccessfully'))
                  })
                  .catch(err => toast.error(err.response?.data?.error || err.message))
              }}>{t('save')}</button>
            </div>
          </div>
        </Modal>
      )}

      {/* Upload Modal */}
      {showUpload && (
        <Modal open={true} onClose={resetUploadState} title={t('uploadFiles')} size="sm">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">{t('project')} *</label>
              <select className="input text-sm py-2" value={selectedProjectId} onChange={e => setSelectedProjectId(e.target.value)}>
                <option value="">{t('selectProject')}</option>
                {projectsList.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">{t('file')} *</label>
              <input type="file" className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100" onChange={e => setUploadFile(e.target.files?.[0] || null)} />
            </div>

            {uploadFile && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">{t('renameFile')}</label>
                  <input
                    type="text"
                    className="input text-sm py-2"
                    placeholder={t('leaveEmptyOriginalName')}
                    value={customUploadName}
                    onChange={e => setCustomUploadName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">{t('descriptionOptional')}</label>
                  <textarea
                    className="input text-sm py-2 h-16 resize-none"
                    placeholder={t('addBriefDescription')}
                    value={uploadDescription}
                    onChange={e => setUploadDescription(e.target.value)}
                  />
                </div>
              </>
            )}

            {hasConflict && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800 space-y-2">
                <p className="font-semibold flex items-center gap-1">⚠️ {t('fileConflict')}</p>
                <div className="flex flex-col gap-1.5">
                  <label className="flex items-center gap-2 cursor-pointer font-medium">
                    <input
                      type="radio"
                      name="conflictAction"
                      value="version"
                      checked={conflictAction === 'version'}
                      onChange={() => setConflictAction('version')}
                      className="text-orange-600 focus:ring-orange-500 cursor-pointer"
                    />
                    {t('uploadAsNewVersion')}
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer font-medium">
                    <input
                      type="radio"
                      name="conflictAction"
                      value="overwrite"
                      checked={conflictAction === 'overwrite'}
                      onChange={() => setConflictAction('overwrite')}
                      className="text-orange-600 focus:ring-orange-500 cursor-pointer"
                    />
                    {t('overwriteExisting')}
                  </label>
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button className="btn-secondary flex-1" onClick={resetUploadState}>{t('cancel')}</button>
              <button className="btn-primary flex-1 justify-center" onClick={handleUpload}>{t('upload')}</button>
            </div>
          </div>
        </Modal>
      )}

      {loading ? (
        <div className="card p-6 space-y-4">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState icon="📁" title={t('noFilesFound')} description={t('noFilesFoundDesc')} />
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="table-header text-left cursor-pointer hover:bg-slate-100 select-none" onClick={() => handleSort('name')}>
                  <div className="flex items-center gap-1">
                    <span>{t('file')}</span>
                    {sortField === 'name' ? (sortDirection === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />) : <ArrowUpDown size={12} />}
                  </div>
                </th>
                <th className="table-header text-left">{t('project')}</th>
                <th className="table-header text-left">{t('uploadedBy')}</th>
                <th className="table-header text-left cursor-pointer hover:bg-slate-100 select-none" onClick={() => handleSort('size')}>
                  <div className="flex items-center gap-1">
                    <span>{t('fileSize')}</span>
                    {sortField === 'size' ? (sortDirection === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />) : <ArrowUpDown size={12} />}
                  </div>
                </th>
                <th className="table-header text-left">{t('version')}</th>
                <th className="table-header text-left">{t('downloads')}</th>
                <th className="table-header text-left cursor-pointer hover:bg-slate-100 select-none" onClick={() => handleSort('createdAt')}>
                  <div className="flex items-center gap-1">
                    <span>{t('date')}</span>
                    {sortField === 'createdAt' ? (sortDirection === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />) : <ArrowUpDown size={12} />}
                  </div>
                </th>
                <th className="table-header text-left">{t('actions')}</th>
              </tr>
            </thead>
            <tbody>
              {sortedFiles.map(file => (
                <tr key={file.id} className="table-row">
                  <td className="table-cell">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0 ${FILE_TYPE_COLORS[file.type] || 'bg-slate-100 text-slate-600'}`}>
                        {getFileIcon(file.type)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-navy-900 max-w-[180px] truncate">{file.name}</p>
                        <p className="text-xs text-slate-400 uppercase">.{file.type}</p>
                      </div>
                    </div>
                  </td>
                  <td className="table-cell text-sm text-slate-600">
                    {(() => {
                      const proj = projectsList.find(p => p.id === file.projectId);
                      return proj ? proj.name : 'Unknown';
                    })()}
                  </td>
                  <td className="table-cell">
                    <div className="flex items-center gap-2">
                      <Avatar name={file.uploadedByName || 'User'} size="sm" />
                      <span className="text-sm text-slate-600">{(file.uploadedByName || 'User').split(' ')[0]}</span>
                    </div>
                  </td>
                  <td className="table-cell text-sm text-slate-600">{formatFileSize(file.size)}</td>
                  <td className="table-cell"><span className="badge badge-default">v{file.version}</span></td>
                  <td className="table-cell text-sm text-slate-600">{file.downloadCount}</td>
                  <td className="table-cell text-sm text-slate-500">{formatDate(file.createdAt)}</td>
                  <td className="table-cell">
                    <div className="flex items-center gap-1">
                      <button className="btn-ghost p-1.5 text-slate-400 hover:text-navy-900" title={t('view')} onClick={() => { setViewFile(file); setShowView(true); }}>
                        <Eye size={14} />
                      </button>
                      <button className="btn-ghost p-1.5 text-slate-400 hover:text-emerald-600" title={t('edit')} onClick={() => { setEditFile(file); setShowEdit(true); }}>
                        <Edit size={14} />
                      </button>
                      <button className="btn-ghost p-1.5 text-slate-400 hover:text-orange-600" title={t('download')} onClick={() => window.open(file.url, '_blank')}>
                        <Download size={14} />
                      </button>
                      <button className="btn-ghost p-1.5 text-slate-400 hover:text-rose-600" title={t('delete')} onClick={() => handleDeleteFile(file.id)}>
                        <Archive size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <ConfirmationModal
        open={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        title={t('deleteFileTitle')}
        message={t('deleteFileDesc')}
        confirmText={t('delete')}
        cancelText={t('cancel')}
        variant="danger"
      />
    </Layout>
  )
}

