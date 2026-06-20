import type { Client, Project, Task, ProjectFile, Approval, Invoice, Payment, Notification, ActivityLog, DashboardStats, RevenueDataPoint } from '../types'

export const mockClients: Client[] = [
  { id: 'c1', companyName: 'Nova Tech Solutions', contactPerson: 'Arjun Sharma', email: 'arjun@novatech.com', phone: '+91 98765 43210', address: 'Bangalore, Karnataka', industry: 'Technology', notes: 'Long-term partner, prefers weekly updates', status: 'active', projectCount: 3, totalRevenue: 485000, createdAt: '2024-01-15T10:00:00Z', updatedAt: '2024-06-01T10:00:00Z', gstin: '29AAACN1234F1Z0' },
  { id: 'c2', companyName: 'Meridian Hospitality', contactPerson: 'Priya Nair', email: 'priya@meridian.in', phone: '+91 87654 32109', address: 'Mumbai, Maharashtra', industry: 'Hospitality', notes: 'High-end brand, premium deliverables', status: 'active', projectCount: 2, totalRevenue: 320000, createdAt: '2024-02-20T10:00:00Z', updatedAt: '2024-06-05T10:00:00Z', gstin: '27AAACM5678B2Z5' },
  { id: 'c3', companyName: 'GreenLeaf Organics', contactPerson: 'Ramesh Kumar', email: 'ramesh@greenleaf.co', phone: '+91 76543 21098', address: 'Chennai, Tamil Nadu', industry: 'FMCG', notes: 'Eco-focused brand guidelines', status: 'active', projectCount: 1, totalRevenue: 95000, createdAt: '2024-03-10T10:00:00Z', updatedAt: '2024-06-10T10:00:00Z', gstin: '33AAACG9012K1Z9' },
  { id: 'c4', companyName: 'Apex Realty Group', contactPerson: 'Suresh Pillai', email: 'suresh@apexrealty.com', phone: '+91 65432 10987', address: 'Hyderabad, Telangana', industry: 'Real Estate', notes: 'Multiple property launches planned', status: 'lead', projectCount: 0, totalRevenue: 0, createdAt: '2024-05-01T10:00:00Z', updatedAt: '2024-06-08T10:00:00Z', gstin: '36AAACA3456N3ZA' },
  { id: 'c5', companyName: 'BlueWave Media', contactPerson: 'Anita Desai', email: 'anita@bluewavemedia.in', phone: '+91 54321 09876', address: 'Pune, Maharashtra', industry: 'Media', notes: 'Social media focus', status: 'inactive', projectCount: 2, totalRevenue: 180000, createdAt: '2023-11-05T10:00:00Z', updatedAt: '2024-03-15T10:00:00Z', gstin: '27AAACB7890C1ZB' },
  { id: 'c6', companyName: 'Stellar EdTech', contactPerson: 'Karthik Rajan', email: 'karthik@stellaredtech.com', phone: '+91 43210 98765', address: 'Coimbatore, Tamil Nadu', industry: 'Education', notes: 'K-12 platform, needs child-safe design', status: 'active', projectCount: 2, totalRevenue: 210000, createdAt: '2024-01-28T10:00:00Z', updatedAt: '2024-06-02T10:00:00Z', gstin: '33AAACS4321A1ZC' },
]

export const mockProjects: Project[] = [
  { id: 'p1', name: 'Brand Identity Redesign', description: 'Complete visual identity overhaul including logo, color system, typography, and brand guidelines document.', clientId: 'c1', clientName: 'Nova Tech Solutions', startDate: '2024-04-01', deadline: '2024-07-15', budget: 180000, status: 'active', progress: 65, teamMembers: ['u1', 'u2'], taskCount: 12, completedTasks: 8, createdAt: '2024-04-01T10:00:00Z', updatedAt: '2024-06-10T10:00:00Z' },
  { id: 'p2', name: 'Website UI/UX Design', description: 'Full product website redesign with new design system, responsive layouts, and interactive prototypes.', clientId: 'c1', clientName: 'Nova Tech Solutions', startDate: '2024-05-01', deadline: '2024-08-30', budget: 220000, status: 'active', progress: 30, teamMembers: ['u1', 'u3'], taskCount: 18, completedTasks: 5, createdAt: '2024-05-01T10:00:00Z', updatedAt: '2024-06-11T10:00:00Z' },
  { id: 'p3', name: 'Hotel Brand Collateral', description: 'Print and digital collateral for Meridian\'s new boutique property launch.', clientId: 'c2', clientName: 'Meridian Hospitality', startDate: '2024-03-15', deadline: '2024-06-30', budget: 150000, status: 'review', progress: 90, teamMembers: ['u2'], taskCount: 8, completedTasks: 7, createdAt: '2024-03-15T10:00:00Z', updatedAt: '2024-06-09T10:00:00Z' },
  { id: 'p4', name: 'Product Packaging Design', description: 'Sustainable packaging design for GreenLeaf\'s new organic range launch.', clientId: 'c3', clientName: 'GreenLeaf Organics', startDate: '2024-05-15', deadline: '2024-07-31', budget: 95000, status: 'active', progress: 45, teamMembers: ['u1', 'u2'], taskCount: 10, completedTasks: 4, createdAt: '2024-05-15T10:00:00Z', updatedAt: '2024-06-08T10:00:00Z' },
  { id: 'p5', name: 'EdTech Platform Branding', description: 'Full brand system for Stellar\'s new K-12 learning platform.', clientId: 'c6', clientName: 'Stellar EdTech', startDate: '2024-02-01', deadline: '2024-05-31', budget: 130000, status: 'completed', progress: 100, teamMembers: ['u3'], taskCount: 15, completedTasks: 15, createdAt: '2024-02-01T10:00:00Z', updatedAt: '2024-05-31T10:00:00Z' },
  { id: 'p6', name: 'Social Media Content Kit', description: 'Monthly content creation for BlueWave\'s Instagram and LinkedIn presence.', clientId: 'c5', clientName: 'BlueWave Media', startDate: '2023-12-01', deadline: '2024-02-28', budget: 60000, status: 'archived', progress: 100, teamMembers: ['u2'], taskCount: 6, completedTasks: 6, createdAt: '2023-12-01T10:00:00Z', updatedAt: '2024-03-01T10:00:00Z' },
]

export const mockTasks: Task[] = [
  { id: 't1', title: 'Logo concept exploration', description: 'Create 3 initial logo directions', projectId: 'p1', dueDate: '2024-04-20', priority: 'high', assignee: 'u1', assigneeName: 'Divya Menon', status: 'done', createdAt: '2024-04-02T10:00:00Z' },
  { id: 't2', title: 'Color palette development', description: 'Define primary, secondary, accent color systems', projectId: 'p1', dueDate: '2024-04-28', priority: 'high', assignee: 'u1', assigneeName: 'Divya Menon', status: 'done', createdAt: '2024-04-05T10:00:00Z' },
  { id: 't3', title: 'Typography selection', description: 'Choose and pair typefaces for brand', projectId: 'p1', dueDate: '2024-05-05', priority: 'medium', assignee: 'u2', assigneeName: 'Rahul Iyer', status: 'done', createdAt: '2024-04-10T10:00:00Z' },
  { id: 't4', title: 'Brand guidelines document', description: 'Compile all brand rules into master PDF', projectId: 'p1', dueDate: '2024-06-30', priority: 'high', assignee: 'u1', assigneeName: 'Divya Menon', status: 'in_progress', createdAt: '2024-05-01T10:00:00Z' },
  { id: 't5', title: 'Business card design', description: 'Design front and back for 3 variants', projectId: 'p1', dueDate: '2024-07-10', priority: 'medium', assignee: 'u2', assigneeName: 'Rahul Iyer', status: 'pending', createdAt: '2024-05-15T10:00:00Z' },
  { id: 't6', title: 'Wireframes — Homepage', description: 'Low-fi wireframes for hero, features, pricing', projectId: 'p2', dueDate: '2024-05-20', priority: 'critical', assignee: 'u1', assigneeName: 'Divya Menon', status: 'done', createdAt: '2024-05-02T10:00:00Z' },
  { id: 't7', title: 'High-fi designs — Homepage', description: 'Pixel-perfect designs in Figma', projectId: 'p2', dueDate: '2024-06-10', priority: 'high', assignee: 'u3', assigneeName: 'Sneha Bhat', status: 'in_progress', createdAt: '2024-05-21T10:00:00Z' },
  { id: 't8', title: 'Mobile responsive layouts', description: 'Adapt all pages for mobile viewports', projectId: 'p2', dueDate: '2024-07-15', priority: 'high', assignee: 'u1', assigneeName: 'Divya Menon', status: 'pending', createdAt: '2024-05-25T10:00:00Z' },
  { id: 't9', title: 'Client brochure final', description: 'Final revisions and print-ready PDF', projectId: 'p3', dueDate: '2024-06-15', priority: 'critical', assignee: 'u2', assigneeName: 'Rahul Iyer', status: 'review', createdAt: '2024-05-01T10:00:00Z' },
  { id: 't10', title: 'Packaging dieline', description: 'Technical dieline for 3 SKU sizes', projectId: 'p4', dueDate: '2024-07-01', priority: 'high', assignee: 'u2', assigneeName: 'Rahul Iyer', status: 'in_progress', createdAt: '2024-06-01T10:00:00Z' },
]

export const mockFiles: ProjectFile[] = [
  { id: 'f1', name: 'NovaLogo_v3_Final.ai', type: 'ai', size: 4200000, url: '#', projectId: 'p1', uploadedBy: 'u1', uploadedByName: 'Divya Menon', version: 3, downloadCount: 5, createdAt: '2024-05-15T10:00:00Z' },
  { id: 'f2', name: 'NovaBrand_Guidelines_v2.pdf', type: 'pdf', size: 12500000, url: '#', projectId: 'p1', uploadedBy: 'u1', uploadedByName: 'Divya Menon', version: 2, downloadCount: 12, createdAt: '2024-05-20T10:00:00Z' },
  { id: 'f3', name: 'ColorSystem_Reference.png', type: 'png', size: 980000, url: '#', projectId: 'p1', uploadedBy: 'u2', uploadedByName: 'Rahul Iyer', version: 1, downloadCount: 8, createdAt: '2024-04-28T10:00:00Z' },
  { id: 'f4', name: 'Website_Wireframes_v1.pdf', type: 'pdf', size: 8100000, url: '#', projectId: 'p2', uploadedBy: 'u3', uploadedByName: 'Sneha Bhat', version: 1, downloadCount: 3, createdAt: '2024-05-22T10:00:00Z' },
  { id: 'f5', name: 'Meridian_Brochure_PrintReady.pdf', type: 'pdf', size: 22000000, url: '#', projectId: 'p3', uploadedBy: 'u2', uploadedByName: 'Rahul Iyer', version: 4, downloadCount: 2, createdAt: '2024-06-08T10:00:00Z' },
  { id: 'f6', name: 'GreenLeaf_Packaging_Concept1.psd', type: 'psd', size: 65000000, url: '#', projectId: 'p4', uploadedBy: 'u1', uploadedByName: 'Divya Menon', version: 1, downloadCount: 1, createdAt: '2024-06-05T10:00:00Z' },
]

export const mockApprovals: Approval[] = [
  { id: 'a1', title: 'Brand Guidelines v2 — Final Approval', description: 'Please review the completed brand guidelines document and approve to proceed to print.', projectId: 'p1', projectName: 'Brand Identity Redesign', clientId: 'c1', clientName: 'Nova Tech Solutions', fileIds: ['f2'], status: 'pending_review', requestedAt: '2024-06-10T09:00:00Z' },
  { id: 'a2', title: 'Hotel Brochure — Print Approval', description: 'Final print-ready brochure for sign-off. Print deadline is June 20.', projectId: 'p3', projectName: 'Hotel Brand Collateral', clientId: 'c2', clientName: 'Meridian Hospitality', fileIds: ['f5'], status: 'pending_review', requestedAt: '2024-06-09T14:00:00Z' },
  { id: 'a3', title: 'Logo Concepts v1 — Direction Selection', description: 'Three logo concepts ready for your review. Please select a direction to proceed.', projectId: 'p1', projectName: 'Brand Identity Redesign', clientId: 'c1', clientName: 'Nova Tech Solutions', fileIds: ['f1'], status: 'approved', comment: 'Love concept 2! Let\'s go with that direction.', requestedAt: '2024-04-22T10:00:00Z', respondedAt: '2024-04-23T16:30:00Z' },
  { id: 'a4', title: 'Packaging Concept 1 Review', description: 'First packaging concept for your feedback.', projectId: 'p4', projectName: 'Product Packaging Design', clientId: 'c3', clientName: 'GreenLeaf Organics', fileIds: ['f6'], status: 'revision_requested', comment: 'The green feels too bright. Can we try a more earthy, muted tone?', requestedAt: '2024-06-06T10:00:00Z', respondedAt: '2024-06-07T11:00:00Z' },
]

export const mockInvoices: Invoice[] = [
  { id: 'i1', invoiceNumber: 'INV-2024-001', clientId: 'c1', clientName: 'Nova Tech Solutions', projectId: 'p1', projectName: 'Brand Identity Redesign', items: [{ description: 'Brand Strategy & Research', quantity: 1, rate: 45000, amount: 45000 }, { description: 'Logo Design (3 concepts)', quantity: 1, rate: 60000, amount: 60000 }, { description: 'Brand Guidelines Document', quantity: 1, rate: 40000, amount: 40000 }], subtotal: 145000, tax: 26100, total: 171100, status: 'paid', dueDate: '2024-05-15', paidAt: '2024-05-12T14:30:00Z', createdAt: '2024-04-30T10:00:00Z' },
  { id: 'i2', invoiceNumber: 'INV-2024-002', clientId: 'c2', clientName: 'Meridian Hospitality', projectId: 'p3', projectName: 'Hotel Brand Collateral', items: [{ description: 'Print Collateral Design', quantity: 1, rate: 80000, amount: 80000 }, { description: 'Digital Assets Package', quantity: 1, rate: 40000, amount: 40000 }], subtotal: 120000, tax: 21600, total: 141600, status: 'sent', dueDate: '2024-06-25', createdAt: '2024-06-05T10:00:00Z' },
  { id: 'i3', invoiceNumber: 'INV-2024-003', clientId: 'c1', clientName: 'Nova Tech Solutions', projectId: 'p2', projectName: 'Website UI/UX Design', items: [{ description: 'UX Research & Wireframing', quantity: 1, rate: 55000, amount: 55000 }], subtotal: 55000, tax: 9900, total: 64900, status: 'overdue', dueDate: '2024-06-01', createdAt: '2024-05-15T10:00:00Z' },
  { id: 'i4', invoiceNumber: 'INV-2024-004', clientId: 'c3', clientName: 'GreenLeaf Organics', projectId: 'p4', projectName: 'Product Packaging Design', items: [{ description: 'Packaging Concept Development', quantity: 1, rate: 45000, amount: 45000 }], subtotal: 45000, tax: 8100, total: 53100, status: 'draft', dueDate: '2024-07-15', createdAt: '2024-06-11T10:00:00Z' },
  { id: 'i5', invoiceNumber: 'INV-2024-005', clientId: 'c6', clientName: 'Stellar EdTech', projectId: 'p5', projectName: 'EdTech Platform Branding', items: [{ description: 'Full Brand Identity System', quantity: 1, rate: 130000, amount: 130000 }], subtotal: 130000, tax: 23400, total: 153400, status: 'paid', dueDate: '2024-06-10', paidAt: '2024-06-08T10:00:00Z', createdAt: '2024-05-31T10:00:00Z' },
]

export const mockPayments: Payment[] = [
  { id: 'pay1', invoiceId: 'i1', invoiceNumber: 'INV-2024-001', clientId: 'c1', clientName: 'Nova Tech Solutions', amount: 171100, method: 'UPI', transactionId: 'TXN8472619048', paidAt: '2024-05-12T14:30:00Z' },
  { id: 'pay2', invoiceId: 'i5', invoiceNumber: 'INV-2024-005', clientId: 'c6', clientName: 'Stellar EdTech', amount: 153400, method: 'Bank Transfer', transactionId: 'TXN9183726450', paidAt: '2024-06-08T10:00:00Z' },
]

export const mockNotifications: Notification[] = [
  { id: 'n1', type: 'approval_requested', title: 'Approval Pending', message: 'Nova Tech Solutions has a pending approval for Brand Guidelines v2.', read: false, createdAt: '2024-06-10T09:05:00Z', link: '/approvals' },
  { id: 'n2', type: 'payment_received', title: 'Payment Received', message: 'Stellar EdTech paid ₹1,53,400 for INV-2024-005.', read: false, createdAt: '2024-06-08T10:02:00Z', link: '/invoices' },
  { id: 'n3', type: 'deadline_approaching', title: 'Deadline Alert', message: 'Hotel Brand Collateral deadline is in 21 days.', read: true, createdAt: '2024-06-09T08:00:00Z', link: '/projects/p3' },
  { id: 'n4', type: 'approval_requested', title: 'Review Requested', message: 'Meridian Hospitality has requested a revision on Packaging Concept 1.', read: true, createdAt: '2024-06-07T11:05:00Z', link: '/approvals' },
  { id: 'n5', type: 'invoice_generated', title: 'Invoice Created', message: 'INV-2024-004 for ₹53,100 has been created for GreenLeaf Organics.', read: true, createdAt: '2024-06-11T10:02:00Z', link: '/invoices' },
]

export const mockActivityLogs: ActivityLog[] = [
  { id: 'al1', action: 'uploaded file', entityType: 'file', entityId: 'f5', entityName: 'Meridian_Brochure_PrintReady.pdf', userId: 'u2', userName: 'Rahul Iyer', createdAt: '2024-06-08T14:30:00Z' },
  { id: 'al2', action: 'sent invoice', entityType: 'invoice', entityId: 'i2', entityName: 'INV-2024-002', userId: 'u1', userName: 'Divya Menon', createdAt: '2024-06-05T10:00:00Z' },
  { id: 'al3', action: 'payment received', entityType: 'payment', entityId: 'pay2', entityName: '₹1,53,400', userId: 'system', userName: 'System', createdAt: '2024-06-08T10:00:00Z' },
  { id: 'al4', action: 'requested approval', entityType: 'approval', entityId: 'a2', entityName: 'Hotel Brochure Print Approval', userId: 'u2', userName: 'Rahul Iyer', createdAt: '2024-06-09T14:00:00Z' },
  { id: 'al5', action: 'created project', entityType: 'project', entityId: 'p4', entityName: 'Product Packaging Design', userId: 'u1', userName: 'Divya Menon', createdAt: '2024-05-15T10:00:00Z' },
  { id: 'al6', action: 'marked task done', entityType: 'task', entityId: 't3', entityName: 'Typography selection', userId: 'u2', userName: 'Rahul Iyer', createdAt: '2024-05-06T16:45:00Z' },
  { id: 'al7', action: 'client approved', entityType: 'approval', entityId: 'a3', entityName: 'Logo Concepts v1', userId: 'c1', userName: 'Arjun Sharma (Client)', createdAt: '2024-04-23T16:30:00Z' },
]

export const mockDashboardStats: DashboardStats = {
  totalClients: 6,
  activeProjects: 4,
  monthlyRevenue: 324500,
  outstandingPayments: 206500,
  pendingApprovals: 2,
  clientGrowth: 20,
  projectGrowth: 12,
  revenueGrowth: 18,
}

export const mockRevenueData: RevenueDataPoint[] = [
  { month: 'Jan', revenue: 185000, collected: 185000 },
  { month: 'Feb', revenue: 210000, collected: 198000 },
  { month: 'Mar', revenue: 175000, collected: 175000 },
  { month: 'Apr', revenue: 290000, collected: 265000 },
  { month: 'May', revenue: 324500, collected: 310000 },
  { month: 'Jun', revenue: 385000, collected: 118900 },
]

export const currentUser = {
  id: 'u1',
  name: 'Divya Menon',
  email: 'divya@zenithcreative.in',
  role: 'super_admin' as const,
  avatar: undefined,
}
