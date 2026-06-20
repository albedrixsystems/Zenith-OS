import { useState } from 'react'
import { Upload, Search, Download, Eye, Edit, FileText, Image, Archive } from 'lucide-react'
import { Layout } from '../components/layout/Layout'
import { Avatar, EmptyState, Modal } from '../components/ui/index'
import { mockFiles, mockProjects, currentUser } from '../lib/mockData'
import { formatFileSize, formatDate, getFileIcon } from '../lib/utils'

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
  const [search, setSearch] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const [showUpload, setShowUpload] = useState(false)
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [showEdit, setShowEdit] = useState(false)
  const [editFile, setEditFile] = useState<any>(null)
  const [showView, setShowView] = useState(false)
  const [viewFile, setViewFile] = useState<any>(null)
  const [showVersionPrompt, setShowVersionPrompt] = useState(false)
  const [pendingFile, setPendingFile] = useState<any>(null)
  const [files, setFiles] = useState(mockFiles)

  const filtered = files.filter(f =>
    f.name.toLowerCase().includes(search.toLowerCase()) ||
    f.uploadedByName.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <Layout title="Files">
      <div className="page-header flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="page-title">Files</h1>
          <p className="page-subtitle">{files.length} files across all projects</p>
        </div>
        <button className="btn-primary" onClick={() => setShowUpload(true)}>
          <Upload size={15} /> Upload Files
        </button>
      </div>

      {/* Drop zone */}
      <div
        className={`border-2 border-dashed rounded-2xl p-8 text-center mb-6 transition-all duration-200 cursor-pointer
          ${dragOver ? 'border-orange-400 bg-orange-50' : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'}`}
        onDragOver={e => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={() => setDragOver(false)}
      >
        <div className="w-12 h-12 rounded-2xl mx-auto mb-3 flex items-center justify-center" style={{ background: 'linear-gradient(135deg, rgba(244,81,30,0.1), rgba(255,140,66,0.1))' }}>
          <Upload size={20} style={{ color: '#F4511E' }} />
        </div>
        <p className="text-sm font-semibold text-navy-900 mb-1">Drag &amp; drop files here</p>
        <p className="text-xs text-slate-500">or <span className="text-orange-600 font-medium cursor-pointer hover:underline">browse to upload</span></p>
        <p className="text-xs text-slate-400 mt-2">PDF, PNG, JPG, PSD, AI, ZIP, DOCX, PPTX supported</p>
      </div>

      {/* Search */}
      <div className="relative max-w-sm mb-6">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search files..." className="input pl-9 py-2" />
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon="📁" title="No files found" description="Upload your first file or adjust your search." />
      ) : (
        <>
          {/* View Modal */}
          {showView && viewFile && (
            <Modal open={true} onClose={() => setShowView(false)} title="File Details" size="sm">
              <div className="space-y-2">
                <p><strong>Name:</strong> {viewFile.name}</p>
                <p><strong>Type:</strong> {viewFile.type}</p>
                <p><strong>Size:</strong> {formatFileSize(viewFile.size)}</p>
                <p><strong>Uploaded By:</strong> {viewFile.uploadedByName}</p>
                <p><strong>Version:</strong> v{viewFile.version}</p>
                <p><strong>Date:</strong> {formatDate(viewFile.createdAt)}</p>
              </div>
            </Modal>
          )}

          {/* Edit Modal */}
          {showEdit && editFile && (
            <Modal open={true} onClose={() => setShowEdit(false)} title="Edit File" size="sm">
              <div className="space-y-4">
                <label className="block text-xs font-medium text-slate-700 mb-1">File Name</label>
                <input className="input" defaultValue={editFile.name} onChange={e => setEditFile({ ...editFile, name: e.target.value })} />
                <div className="flex gap-3 pt-2">
                  <button className="btn-secondary flex-1" onClick={() => setShowEdit(false)}>Cancel</button>
                  <button className="btn-primary flex-1" onClick={() => {
                    setFiles(files.map(f => f.id === editFile.id ? editFile : f))
                    setShowEdit(false)
                  }}>Save</button>
                </div>
              </div>
            </Modal>
          )}

          {/* Upload Modal */}
          {showUpload && (
            <Modal open={true} onClose={() => setShowUpload(false)} title="Upload File" size="sm">
              <div className="space-y-4">
                <input type="file" onChange={e => setUploadFile(e.target.files?.[0] || null)} />
                <div className="flex gap-3 pt-2">
                  <button className="btn-secondary flex-1" onClick={() => setShowUpload(false)}>Cancel</button>
                  <button className="btn-primary flex-1" onClick={async () => {
                    if (!uploadFile) return
                    const existing = files.find(f => f.name === uploadFile.name)
                    if (existing) {
                      setPendingFile({ file: uploadFile, existing })
                      setShowVersionPrompt(true)
                    } else {
                      const newId = `f${files.length + 1}`
                      const newFile = {
                        id: newId,
                        name: uploadFile.name,
                        type: uploadFile.name.split('.').pop() || 'txt',
                        size: uploadFile.size,
                        url: '#',
                        projectId: 'p1',
                        uploadedBy: currentUser.id,
                        uploadedByName: currentUser.name,
                        version: 1,
                        downloadCount: 0,
                        createdAt: new Date().toISOString(),
                      }
                      setFiles([newFile, ...files])
                      setShowUpload(false)
                    }
                  }}>Upload</button>
                </div>
              </div>
            </Modal>
          )}

          {/* Version Prompt */}
          {showVersionPrompt && pendingFile && (
            <Modal open={true} onClose={() => setShowVersionPrompt(false)} title="File Already Exists" size="sm">
              <p className="mb-4">A file with the same name already exists. Choose an action:</p>
              <div className="flex gap-3">
                <button className="btn-secondary flex-1" onClick={() => {
                  const maxVer = Math.max(...files.filter(f => f.name === pendingFile.file.name).map(f => f.version))
                  const newId = `f${files.length + 1}`
                  const newVersionFile = {
                    id: newId,
                    name: pendingFile.file.name,
                    type: pendingFile.file.name.split('.').pop() || 'txt',
                    size: pendingFile.file.size,
                    url: '#',
                    projectId: 'p1',
                    uploadedBy: currentUser.id,
                    uploadedByName: currentUser.name,
                    version: maxVer + 1,
                    downloadCount: 0,
                    createdAt: new Date().toISOString(),
                  }
                  setFiles([newVersionFile, ...files])
                  setShowVersionPrompt(false)
                  setShowUpload(false)
                }}>Upload as New Version</button>
                <button className="btn-primary flex-1" onClick={() => {
                  const existing = pendingFile.existing
                  existing.size = pendingFile.file.size
                  existing.uploadedBy = currentUser.id
                  existing.uploadedByName = currentUser.name
                  existing.createdAt = new Date().toISOString()
                  setFiles(files.map(f => f.id === existing.id ? existing : f))
                  setShowVersionPrompt(false)
                  setShowUpload(false)
                }}>Replace Existing</button>
              </div>
            </Modal>
          )}

          {/* Files Table */}
          <div className="card overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="table-header text-left">File</th>
                  <th className="table-header text-left">Project</th>
                  <th className="table-header text-left">Uploaded By</th>
                  <th className="table-header text-left">Size</th>
                  <th className="table-header text-left">Version</th>
                  <th className="table-header text-left">Downloads</th>
                  <th className="table-header text-left">Date</th>
                  <th className="table-header text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {files.map(file => (
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
                        const proj = mockProjects.find(p => p.id === file.projectId);
                        return proj ? proj.name : 'Unknown';
                      })()}
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center gap-2">
                        <Avatar name={file.uploadedByName} size="sm" />
                        <span className="text-sm text-slate-600">{file.uploadedByName.split(' ')[0]}</span>
                      </div>
                    </td>
                    <td className="table-cell text-sm text-slate-600">{formatFileSize(file.size)}</td>
                    <td className="table-cell"><span className="badge badge-default">v{file.version}</span></td>
                    <td className="table-cell text-sm text-slate-600">{file.downloadCount}</td>
                    <td className="table-cell text-sm text-slate-500">{formatDate(file.createdAt)}</td>
                    <td className="table-cell">
                      <div className="flex items-center gap-1">
                        <button className="btn-ghost p-1.5 text-slate-400 hover:text-navy-900" title="View" onClick={() => { setViewFile(file); setShowView(true); }}>
                          <Eye size={14} />
                        </button>
                        <button className="btn-ghost p-1.5 text-slate-400 hover:text-emerald-600" title="Edit" onClick={() => { setEditFile(file); setShowEdit(true); }}>
                          <Edit size={14} />
                        </button>
                        <button className="btn-ghost p-1.5 text-slate-400 hover:text-orange-600" title="Download">
                          <Download size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </Layout>
  )
}
