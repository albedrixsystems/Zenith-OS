import { useState, useEffect } from 'react'
import { Upload, Search, Download, Eye, FileText, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'
import { Layout } from '../../components/layout/Layout'
import { EmptyState, Modal, Skeleton } from '../../components/ui/index'
import { formatFileSize, formatDate, getFileIcon } from '../../lib/utils'
import api from '../../lib/api'
import { useToast } from '../../context/ToastContext'
import { useLanguage } from '../../context/LanguageContext'

export default function PortalFilesPage() {
  const toast = useToast()
  const { t } = useLanguage()

  const [files, setFiles] = useState<any[]>([])
  const [projectsList, setProjectsList] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showUpload, setShowUpload] = useState(false)
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [selectedProjectId, setSelectedProjectId] = useState('')
  const [customUploadName, setCustomUploadName] = useState('')
  const [uploadDescription, setUploadDescription] = useState('')

  const [showView, setShowView] = useState(false)
  const [viewFile, setViewFile] = useState<any>(null)

  const [sortField, setSortField] = useState<'name' | 'size' | 'createdAt' | null>(null)
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')

  const resetUploadState = () => {
    setShowUpload(false)
    setUploadFile(null)
    setSelectedProjectId('')
    setCustomUploadName('')
    setUploadDescription('')
  }

  const fetchFiles = () => {
    api.get('/files')
      .then(res => {
        setFiles(res.data || [])
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
      setProjectsList(res.data.projects || [])
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
    formData.append('conflictAction', 'version') // Default to versioning for client safety

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

  const handleSort = (field: 'name' | 'size' | 'createdAt') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const sortedFiles = [...files].sort((a, b) => {
    if (!sortField) return 0
    let fieldA = a[sortField]
    let fieldB = b[sortField]
    if (sortField === 'name') {
      fieldA = fieldA.toLowerCase()
      fieldB = fieldB.toLowerCase()
    }
    if (fieldA < fieldB) return sortDirection === 'asc' ? -1 : 1
    if (fieldA > fieldB) return sortDirection === 'asc' ? 1 : -1
    return 0
  })

  const filteredFiles = sortedFiles.filter(f =>
    f.name.toLowerCase().includes(search.toLowerCase()) ||
    (f.description && f.description.toLowerCase().includes(search.toLowerCase()))
  )

  const getProjectName = (projId: string) => {
    const p = projectsList.find(proj => proj.id === projId)
    return p ? p.name : 'Unknown Project'
  }

  return (
    <Layout title={t('sharedFiles')}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-navy-900 tracking-tight">{t('sharedFiles')}</h1>
          <p className="text-slate-500 text-sm mt-1">{t('filesDesc')}</p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:flex-none">
            <input
              type="text"
              className="input pl-9"
              placeholder={t('search')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <span className="absolute left-3 top-2.5 text-slate-400">🔍</span>
          </div>

          <button className="btn-primary gap-1.5 flex-shrink-0 cursor-pointer" onClick={() => setShowUpload(true)}>
            <Upload size={15} /> {t('upload')}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="card p-6 space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-none">
              <Skeleton className="h-6 w-1/3" />
              <Skeleton className="h-6 w-20" />
            </div>
          ))}
        </div>
      ) : filteredFiles.length === 0 ? (
        <EmptyState
          title={t('noSharedFiles')}
          description="Files uploaded for your review or client-shared documents will appear here."
          icon={<FileText size={48} />}
        />
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="table-header text-left pl-6 cursor-pointer select-none" onClick={() => handleSort('name')}>
                  <div className="flex items-center gap-1.5">
                    {t('name')}
                    {sortField === 'name' ? (sortDirection === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />) : <ArrowUpDown size={12} />}
                  </div>
                </th>
                <th className="table-header text-left">{t('projects')}</th>
                <th className="table-header text-left cursor-pointer select-none" onClick={() => handleSort('size')}>
                  <div className="flex items-center gap-1.5">
                    Size
                    {sortField === 'size' ? (sortDirection === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />) : <ArrowUpDown size={12} />}
                  </div>
                </th>
                <th className="table-header text-left cursor-pointer select-none" onClick={() => handleSort('createdAt')}>
                  <div className="flex items-center gap-1.5">
                    Uploaded Date
                    {sortField === 'createdAt' ? (sortDirection === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />) : <ArrowUpDown size={12} />}
                  </div>
                </th>
                <th className="table-header text-left">Version</th>
                <th className="table-header text-right pr-6">{t('actions')}</th>
              </tr>
            </thead>
            <tbody>
              {filteredFiles.map(file => (
                <tr key={file.id} className="table-row border-b border-slate-100 last:border-none">
                  <td className="table-cell pl-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="text-xl">{getFileIcon(file.type)}</div>
                      <div>
                        <p className="text-sm font-semibold text-navy-900 line-clamp-1">{file.name}</p>
                        {file.description && <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{file.description}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="table-cell text-sm text-slate-500 font-medium">{getProjectName(file.projectId)}</td>
                  <td className="table-cell text-sm text-slate-500">{formatFileSize(file.size)}</td>
                  <td className="table-cell text-sm text-slate-500">{formatDate(file.createdAt)}</td>
                  <td className="table-cell text-sm text-slate-500 font-medium">v{file.version}</td>
                  <td className="table-cell text-right pr-6">
                    <div className="flex justify-end gap-1.5">
                      <button
                        className="btn-ghost p-1.5 text-slate-400 hover:text-navy-900 cursor-pointer"
                        title={t('view')}
                        onClick={() => { setViewFile(file); setShowView(true); }}
                      >
                        <Eye size={14} />
                      </button>
                      <a
                        href={`http://localhost:5000/api/files/download-raw/${file.id}`}
                        download
                        className="btn-ghost p-1.5 text-slate-400 hover:text-orange-600 cursor-pointer"
                        title={t('download')}
                      >
                        <Download size={14} />
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Upload Modal */}
      <Modal open={showUpload} onClose={resetUploadState} title="Upload Collaborative File" size="sm">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Select Project *</label>
            <select
              className="input text-xs"
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
            >
              <option value="">-- Choose Assigned Project --</option>
              {projectsList.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Custom File Name (Optional)</label>
            <input
              type="text"
              className="input text-xs"
              placeholder="e.g. Design Proposal"
              value={customUploadName}
              onChange={(e) => setCustomUploadName(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Description</label>
            <textarea
              className="input text-xs h-16 resize-none"
              placeholder="Provide a brief context or notes..."
              value={uploadDescription}
              onChange={(e) => setUploadDescription(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Choose File *</label>
            <input
              type="file"
              onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
              className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
            />
          </div>

          <div className="flex gap-2.5 pt-2">
            <button className="flex-1 btn-secondary text-xs cursor-pointer" onClick={resetUploadState}>{t('cancel')}</button>
            <button
              className="flex-1 btn-primary text-xs justify-center cursor-pointer disabled:opacity-50"
              disabled={!uploadFile || !selectedProjectId}
              onClick={handleUpload}
            >
              Upload Document
            </button>
          </div>
        </div>
      </Modal>

      {/* View Detail / Preview Modal */}
      <Modal open={showView} onClose={() => { setShowView(false); setViewFile(null); }} title={viewFile?.name || 'File Preview'} size="md">
        {viewFile && (
          <div className="space-y-4">
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 flex items-center justify-between">
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">File Format</p>
                <p className="text-sm font-semibold text-navy-900 uppercase">{viewFile.type} Document</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Size</p>
                <p className="text-sm font-semibold text-navy-900">{formatFileSize(viewFile.size)}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Version</p>
                <p className="text-sm font-semibold text-navy-900">v{viewFile.version}</p>
              </div>
            </div>

            {viewFile.description && (
              <div>
                <p className="text-xs font-bold text-navy-900 uppercase tracking-wider mb-1">Description/Notes</p>
                <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100/50 leading-relaxed">
                  {viewFile.description}
                </p>
              </div>
            )}

            <div>
              <p className="text-xs font-bold text-navy-900 uppercase tracking-wider mb-1">Associated Project</p>
              <p className="text-xs text-slate-600 font-medium">{getProjectName(viewFile.projectId)}</p>
            </div>

            {/* Simple simulated inline viewer for image types */}
            {['png', 'jpg', 'jpeg'].includes(fileExtension(viewFile.name)) ? (
              <div className="border border-slate-100 rounded-xl overflow-hidden max-h-[300px] bg-slate-100 flex items-center justify-center">
                <img
                  src={`http://localhost:5000/api/files/download-raw/${viewFile.id}`}
                  alt={viewFile.name}
                  className="max-h-[300px] w-auto object-contain"
                />
              </div>
            ) : (
              <div className="bg-slate-50 border border-dashed border-slate-200 rounded-xl p-6 text-center">
                <p className="text-xs text-slate-500 mb-2">Inline previews are supported for images. For other documents, download the file below.</p>
              </div>
            )}

            <div className="flex gap-2.5">
              <button className="flex-1 btn-secondary text-xs cursor-pointer" onClick={() => { setShowView(false); setViewFile(null); }}>{t('close')}</button>
              <a
                href={`http://localhost:5000/api/files/download-raw/${viewFile.id}`}
                download
                className="flex-1 btn-primary text-xs justify-center cursor-pointer"
              >
                <Download size={14} /> Download Document
              </a>
            </div>
          </div>
        )}
      </Modal>
    </Layout>
  )
}

function fileExtension(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() || ''
}
