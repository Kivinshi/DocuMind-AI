'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { 
  FileText, 
  Zap, 
  Lock, 
  BarChart3,
  ArrowRight,
  CheckCircle2
} from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border sticky top-0 z-50 bg-background/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-6 h-6 text-accent" />
            <span className="font-bold text-lg">DocuMind</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/pricing" className="text-foreground/70 hover:text-foreground transition">
              Pricing
            </Link>
            <Link href="/login">
              <Button variant="outline" size="sm">Sign In</Button>
            </Link>
            <Link href="/signup">
              <Button size="sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-block mb-4 px-3 py-1 bg-accent/10 border border-accent/30 rounded-full">
            <span className="text-sm text-accent">AI-Powered Document Analysis</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 text-pretty">
            Understand Your Documents
            <span className="text-accent"> Instantly</span>
          </h1>
          <p className="text-lg text-foreground/70 mb-8 text-pretty max-w-2xl mx-auto">
            DocuMind AI analyzes, extracts, and understands document content using advanced language models. Upload, ask, and get instant insights.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link href="/signup">
              <Button size="lg" className="gap-2">
                Start Free <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/pricing">
              <Button size="lg" variant="outline">
                View Pricing
              </Button>
            </Link>
          </div>
        </div>

        {/* Dashboard Preview */}
        <div className="max-w-5xl mx-auto mt-16">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-accent/20 to-primary/20 rounded-lg blur-3xl -z-10"></div>
            <div className="bg-card border border-border rounded-lg overflow-hidden shadow-2xl">
              <div className="bg-secondary/50 border-b border-border px-4 py-3 flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
              </div>
              <div className="p-8 bg-gradient-to-b from-secondary/30 to-background">
                <div className="grid grid-cols-3 gap-4 mb-6">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-32 bg-secondary/50 rounded-lg border border-border/50 animate-pulse"></div>
                  ))}
                </div>
                <div className="space-y-3">
                  <div className="h-4 bg-secondary/50 rounded w-3/4 animate-pulse"></div>
                  <div className="h-4 bg-secondary/50 rounded w-1/2 animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-secondary/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Powerful Features</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                icon: Zap,
                title: "Instant Analysis",
                description: "Get comprehensive document analysis in seconds using AI"
              },
              {
                icon: Lock,
                title: "Secure & Private",
                description: "Your documents are encrypted and never shared with third parties"
              },
              {
                icon: BarChart3,
                title: "Smart Insights",
                description: "Extract key information, summaries, and actionable insights"
              },
              {
                icon: FileText,
                title: "Multi-Format",
                description: "Support for PDF, Word, Text, and more file formats"
              }
            ].map((feature, index) => (
              <div key={index} className="bg-background border border-border rounded-lg p-6 hover:border-accent/50 transition">
                <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-accent" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-foreground/70">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center bg-gradient-to-r from-accent/10 to-primary/10 border border-accent/30 rounded-lg p-12">
          <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Documents?</h2>
          <p className="text-lg text-foreground/70 mb-8">
            Join thousands of users who are already using DocuMind to extract value from their documents.
          </p>
          <Link href="/signup">
            <Button size="lg" className="gap-2">
              Get Started Free <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-4 sm:px-6 lg:px-8 bg-secondary/50">
        <div className="max-w-7xl mx-auto text-center text-foreground/60">
          <p>&copy; 2024 DocuMind AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
