import { useState, useEffect } from 'react'
import { CheckSquare, Calendar, Clock, AlertTriangle } from 'lucide-react'
import { Layout } from '../../components/layout/Layout'
import { EmptyState, Skeleton, PriorityBadge, TaskStatusBadge } from '../../components/ui/index'
import { formatDate } from '../../lib/utils'
import api from '../../lib/api'
import { useLanguage } from '../../context/LanguageContext'

export default function PortalTasksPage() {
  const { t } = useLanguage()
  const [tasks, setTasks] = useState<any[]>([])
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedProjectId, setSelectedProjectId] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')

  const fetchData = async () => {
    try {
      setLoading(true)
      const [projectsRes, tasksRes] = await Promise.all([
        api.get('/projects?limit=100'),
        api.get('/tasks')
      ])
      setProjects(projectsRes.data?.projects || [])
      setTasks(tasksRes.data || [])
    } catch (err) {
      console.error('Failed to load tasks data', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const filteredTasks = tasks.filter(task => {
    const matchProject = selectedProjectId === 'all' || task.projectId === selectedProjectId
    const matchStatus = selectedStatus === 'all' || task.status === selectedStatus
    return matchProject && matchStatus
  })

  const getProjectName = (projectId: string) => {
    const proj = projects.find(p => p.id === projectId)
    return proj ? proj.name : 'Unknown Project'
  }

  return (
    <Layout title={t('tasks')}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-navy-900 tracking-tight">{t('tasks')}</h1>
          <p className="text-slate-500 text-sm mt-1">{t('tasksDesc')}</p>
        </div>

        {/* Filter bars */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex-1 md:flex-none">
            <select
              className="input text-xs py-1.5"
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
            >
              <option value="all">All Projects</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          <div className="flex-1 md:flex-none">
            <select
              className="input text-xs py-1.5"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="review">Review</option>
              <option value="done">Done</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="card p-6 space-y-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="flex items-center justify-between py-2.5 border-b border-slate-100 last:border-0">
              <div className="space-y-1.5 flex-1">
                <Skeleton className="h-4 w-1/3 rounded-md" />
                <Skeleton className="h-3 w-1/4 rounded-md" />
              </div>
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
          ))}
        </div>
      ) : filteredTasks.length === 0 ? (
        <EmptyState
          title="No Tasks Found"
          description="There are no tasks matching your filters."
          icon={<CheckSquare size={48} />}
        />
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="table-header text-left pl-6">{t('tasks')}</th>
                <th className="table-header text-left">{t('projects')}</th>
                <th className="table-header text-left">{t('dueDate')}</th>
                <th className="table-header text-left">{t('priority')}</th>
                <th className="table-header text-left pr-6">{t('status')}</th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks.map(task => (
                <tr key={task.id} className="table-row hover:bg-slate-50/50">
                  <td className="table-cell pl-6 py-4">
                    <div>
                      <p className="text-sm font-semibold text-navy-900">{task.title}</p>
                      {task.description && (
                        <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{task.description}</p>
                      )}
                    </div>
                  </td>
                  <td className="table-cell text-sm text-slate-500 font-medium">{getProjectName(task.projectId)}</td>
                  <td className="table-cell text-sm text-slate-500">
                    {task.dueDate ? (
                      <div className="flex items-center gap-1.5">
                        <Calendar size={13} className="text-slate-400" />
                        <span>{formatDate(task.dueDate)}</span>
                      </div>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="table-cell">
                    <PriorityBadge priority={task.priority} />
                  </td>
                  <td className="table-cell pr-6">
                    <TaskStatusBadge status={task.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Layout>
  )
}
