'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { 
  FileText, 
  LayoutGrid, 
  Settings, 
  LogOut,
  Menu,
  X
} from 'lucide-react'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-card border-r border-border transform transition-transform duration-200 ease-in-out md:static md:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-full flex flex-col">
          <div className="p-6 border-b border-border flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 font-bold text-lg">
              <FileText className="w-6 h-6 text-accent" />
              DocuMind
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="md:hidden p-1 hover:bg-secondary rounded"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto p-4 space-y-2">
            <Link href="/dashboard">
              <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-primary/10 text-accent font-medium">
                <LayoutGrid className="w-5 h-5" />
                Documents
              </div>
            </Link>
            <Link href="/dashboard/settings">
              <div className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-secondary text-foreground/70 hover:text-foreground transition">
                <Settings className="w-5 h-5" />
                Settings
              </div>
            </Link>
          </nav>

          <div className="p-4 border-t border-border space-y-2">
            <div className="px-4 py-3 text-sm">
              <p className="font-medium mb-1">john@example.com</p>
              <p className="text-foreground/60 text-xs">Professional Plan</p>
            </div>
            <Button variant="outline" className="w-full gap-2" size="sm">
              <LogOut className="w-4 h-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="border-b border-border bg-card/50 backdrop-blur-sm">
          <div className="px-6 py-4 flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden p-2 hover:bg-secondary rounded-lg"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex-1"></div>
            <div className="flex items-center gap-4">
              <Button size="sm">Upload Document</Button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
    </div>
  )
}
