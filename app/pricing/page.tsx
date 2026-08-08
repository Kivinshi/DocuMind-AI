'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { FileText, ArrowRight, CheckCircle2 } from 'lucide-react'

export default function PricingPage() {
  const plans = [
    {
      name: 'Starter',
      price: 'Free',
      description: 'Perfect for getting started',
      features: [
        'Up to 5 documents/month',
        'Basic AI analysis',
        '100MB total storage',
        'Email support',
        'Basic document formats'
      ],
      cta: 'Get Started',
      highlight: false
    },
    {
      name: 'Professional',
      price: '$29',
      period: '/month',
      description: 'For active users and teams',
      features: [
        'Unlimited documents',
        'Advanced AI analysis',
        '100GB total storage',
        'Priority email & chat support',
        'All document formats',
        'Batch processing',
        'Advanced search & filters',
        'Custom workflows'
      ],
      cta: 'Start Free Trial',
      highlight: true
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      description: 'For large-scale deployments',
      features: [
        'Unlimited everything',
        'Advanced AI analysis',
        'Unlimited storage',
        '24/7 phone support',
        'All document formats',
        'Batch processing',
        'API access',
        'Custom integrations',
        'Dedicated account manager'
      ],
      cta: 'Contact Sales',
      highlight: false
    }
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border sticky top-0 z-50 bg-background/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <FileText className="w-6 h-6 text-accent" />
            <span className="font-bold text-lg">DocuMind</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="outline" size="sm">Sign In</Button>
            </Link>
            <Link href="/signup">
              <Button size="sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Header */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-4xl sm:text-5xl font-bold mb-4">Simple, Transparent Pricing</h1>
        <p className="text-xl text-foreground/70 max-w-2xl mx-auto">
          Choose the perfect plan for your document analysis needs. Scale up or down anytime.
        </p>
      </section>

      {/* Pricing Cards */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <div
                key={index}
                className={`rounded-lg border transition-all ${
                  plan.highlight
                    ? 'border-accent bg-gradient-to-b from-accent/10 to-background scale-105 shadow-2xl'
                    : 'border-border bg-card'
                } p-8 flex flex-col`}
              >
                {plan.highlight && (
                  <div className="mb-4 inline-block px-3 py-1 bg-accent/20 border border-accent/40 rounded-full w-fit">
                    <span className="text-xs font-semibold text-accent">MOST POPULAR</span>
                  </div>
                )}
                
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <p className="text-foreground/70 text-sm mb-6">{plan.description}</p>
                
                <div className="mb-6">
                  <div className="text-4xl font-bold">
                    {plan.price}
                    {plan.period && <span className="text-lg text-foreground/60">{plan.period}</span>}
                  </div>
                </div>

                <Button
                  className="w-full mb-8 gap-2"
                  variant={plan.highlight ? 'default' : 'outline'}
                >
                  {plan.cta} <ArrowRight className="w-4 h-4" />
                </Button>

                <div className="space-y-3 flex-1">
                  {plan.features.map((feature, fIndex) => (
                    <div key={fIndex} className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-foreground/80">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-secondary/50">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
          
          <div className="space-y-6">
            {[
              {
                q: 'Can I change my plan anytime?',
                a: 'Yes! You can upgrade, downgrade, or cancel your plan at any time. Changes take effect at the end of your billing cycle.'
              },
              {
                q: 'Do you offer discounts for annual billing?',
                a: 'Yes, we offer 20% discount on annual plans for Professional and Enterprise tiers. Contact our sales team for details.'
              },
              {
                q: 'What payment methods do you accept?',
                a: 'We accept all major credit cards, PayPal, and wire transfers for Enterprise customers.'
              },
              {
                q: 'Is there a free trial?',
                a: 'Yes! All plans include a 14-day free trial. No credit card required to get started with the Starter plan.'
              }
            ].map((faq, index) => (
              <div key={index} className="bg-background border border-border rounded-lg p-6">
                <h3 className="font-semibold mb-2">{faq.q}</h3>
                <p className="text-foreground/70">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center bg-gradient-to-r from-accent/10 to-primary/10 border border-accent/30 rounded-lg p-12">
          <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
          <p className="text-lg text-foreground/70 mb-8">
            Join thousands of users analyzing documents with DocuMind AI
          </p>
          <Link href="/signup">
            <Button size="lg" className="gap-2">
              Start Your Free Plan <ArrowRight className="w-4 h-4" />
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
