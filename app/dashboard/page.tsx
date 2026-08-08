'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  FileText,
  Upload,
  MoreVertical,
  Trash2,
  Download,
  MessageSquare,
  Clock,
  File
} from 'lucide-react'

const mockDocuments = [
  {
    id: 1,
    name: 'Q4 Financial Report.pdf',
    type: 'PDF',
    size: '2.4 MB',
    uploadedAt: '2 hours ago',
    icon: File
  },
  {
    id: 2,
    name: 'Project Proposal.docx',
    type: 'DOCX',
    size: '1.8 MB',
    uploadedAt: '1 day ago',
    icon: File
  },
  {
    id: 3,
    name: 'Market Analysis.pdf',
    type: 'PDF',
    size: '3.2 MB',
    uploadedAt: '3 days ago',
    icon: File
  },
  {
    id: 4,
    name: 'Contract Agreement.pdf',
    type: 'PDF',
    size: '892 KB',
    uploadedAt: '1 week ago',
    icon: File
  },
  {
    id: 5,
    name: 'Research Paper.pdf',
    type: 'PDF',
    size: '4.1 MB',
    uploadedAt: '2 weeks ago',
    icon: File
  },
  {
    id: 6,
    name: 'Dataset.json',
    type: 'JSON',
    size: '5.6 MB',
    uploadedAt: '3 weeks ago',
    icon: File
  }
]

export default function DashboardPage() {
  const [openMenu, setOpenMenu] = useState<number | null>(null)

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">My Documents</h1>
        <p className="text-foreground/60">Upload and manage your documents for AI analysis</p>
      </div>

      {/* Upload Section */}
      <div className="mb-8 border-2 border-dashed border-accent/30 rounded-lg p-8 text-center hover:border-accent/50 transition cursor-pointer bg-accent/5">
        <Upload className="w-12 h-12 text-accent mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Drag and drop your documents here</h3>
        <p className="text-foreground/60 mb-4">or</p>
        <Button className="gap-2">
          <FileText className="w-4 h-4" />
          Browse Files
        </Button>
        <p className="text-xs text-foreground/50 mt-4">
          Supports PDF, DOCX, TXT, and more. Max 50MB per file.
        </p>
      </div>

      {/* Documents Grid */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Recent Documents ({mockDocuments.length})</h2>
        <div className="grid gap-4">
          {mockDocuments.map((doc) => {
            const IconComponent = doc.icon
            return (
              <div
                key={doc.id}
                className="bg-card border border-border rounded-lg p-4 hover:border-accent/50 transition group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="w-12 h-12 rounded-lg bg-secondary/50 flex items-center justify-center flex-shrink-0">
                      <IconComponent className="w-6 h-6 text-accent" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate">{doc.name}</h3>
                      <div className="flex items-center gap-4 text-sm text-foreground/60 mt-1">
                        <span>{doc.size}</span>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {doc.uploadedAt}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-2 opacity-0 group-hover:opacity-100 transition"
                      onClick={() => {}}
                    >
                      <MessageSquare className="w-4 h-4" />
                      Chat
                    </Button>
                    <div className="relative">
                      <button
                        onClick={() => setOpenMenu(openMenu === doc.id ? null : doc.id)}
                        className="p-2 hover:bg-secondary rounded-lg transition"
                      >
                        <MoreVertical className="w-5 h-5" />
                      </button>
                      {openMenu === doc.id && (
                        <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-lg shadow-lg z-10">
                          <button className="w-full text-left px-4 py-2 hover:bg-secondary flex items-center gap-2 text-sm">
                            <Download className="w-4 h-4" />
                            Download
                          </button>
                          <button className="w-full text-left px-4 py-2 hover:bg-secondary flex items-center gap-2 text-sm border-t border-border text-destructive">
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
