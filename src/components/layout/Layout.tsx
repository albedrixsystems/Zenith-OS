import type { ReactNode } from 'react'
import { Sidebar } from './Sidebar'
import { Header } from './Header'

interface LayoutProps {
  children: ReactNode
  title?: string
}

export function Layout({ children, title }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />
      <div className="flex-1 lg:ml-60 flex flex-col min-h-screen">
        <Header title={title} />
        <main className="flex-1 p-6 md:p-8 animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  )
}
