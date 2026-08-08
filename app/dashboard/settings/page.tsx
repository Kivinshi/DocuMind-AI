'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { User, Bell, Lock, CreditCard, Trash2 } from 'lucide-react'

export default function SettingsPage() {
  const [email, setEmail] = useState('john@example.com')
  const [fullName, setFullName] = useState('John Doe')
  const [notifications, setNotifications] = useState({
    email: true,
    uploads: true,
    analysis: true
  })

  const handleSave = () => {
    console.log('Settings saved')
  }

  return (
    <div className="p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-foreground/60">Manage your account and preferences</p>
      </div>

      <div className="space-y-6">
        {/* Profile Section */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <User className="w-5 h-5 text-accent" />
            <h2 className="text-xl font-semibold">Profile</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-2 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>

            <Button onClick={handleSave} className="w-full sm:w-auto">
              Save Changes
            </Button>
          </div>
        </div>

        {/* Notifications Section */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <Bell className="w-5 h-5 text-accent" />
            <h2 className="text-xl font-semibold">Notifications</h2>
          </div>

          <div className="space-y-4">
            {[
              { key: 'email', label: 'Email Notifications', description: 'Receive emails about account activity' },
              { key: 'uploads', label: 'Upload Confirmations', description: 'Get notified when documents are uploaded' },
              { key: 'analysis', label: 'Analysis Complete', description: 'Notifications when AI analysis is ready' }
            ].map((setting) => (
              <div key={setting.key} className="flex items-center justify-between py-3 border-b border-border/50 last:border-0">
                <div>
                  <p className="font-medium">{setting.label}</p>
                  <p className="text-sm text-foreground/60">{setting.description}</p>
                </div>
                <input
                  type="checkbox"
                  checked={notifications[setting.key as keyof typeof notifications]}
                  onChange={(e) =>
                    setNotifications({
                      ...notifications,
                      [setting.key]: e.target.checked
                    })
                  }
                  className="w-5 h-5 rounded border-border accent-accent cursor-pointer"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Billing Section */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <CreditCard className="w-5 h-5 text-accent" />
            <h2 className="text-xl font-semibold">Billing</h2>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-secondary/50 rounded-lg">
              <p className="text-sm text-foreground/60 mb-1">Current Plan</p>
              <p className="text-lg font-semibold">Professional - $29/month</p>
              <p className="text-sm text-foreground/60 mt-2">Next billing date: January 15, 2024</p>
            </div>
            <Button variant="outline" className="w-full sm:w-auto">
              Manage Billing
            </Button>
          </div>
        </div>

        {/* Security Section */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <Lock className="w-5 h-5 text-accent" />
            <h2 className="text-xl font-semibold">Security</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Password</label>
              <p className="text-sm text-foreground/60 mb-4">Last changed 3 months ago</p>
              <Button variant="outline">
                Change Password
              </Button>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-destructive/5 border border-destructive/30 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <Trash2 className="w-5 h-5 text-destructive" />
            <h2 className="text-xl font-semibold text-destructive">Danger Zone</h2>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-sm text-foreground/70 mb-4">
                Permanently delete your account and all associated data. This action cannot be undone.
              </p>
              <Button variant="outline" className="text-destructive hover:text-destructive">
                Delete Account
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
