// 'use client'

// import { useState } from 'react'
// import Link from 'next/link'
// import { Button } from '@/components/ui/button'
// import { FileText, ArrowRight } from 'lucide-react'

// export default function SignupPage() {
//   const [email, setEmail] = useState('')
//   const [password, setPassword] = useState('')
//   const [confirmPassword, setConfirmPassword] = useState('')
//   const [fullName, setFullName] = useState('')
//   const [loading, setLoading] = useState(false)

//   const handleSignup = (e: React.FormEvent) => {
//     e.preventDefault()
//     setLoading(true)
//     setTimeout(() => {
//       setLoading(false)
//     }, 1500)
//   }

//   return (
//     <div className="min-h-screen bg-background flex items-center justify-center px-4">
//       <div className="w-full max-w-md">
//         <div className="mb-8 text-center">
//           <div className="flex items-center justify-center gap-2 mb-4">
//             <FileText className="w-6 h-6 text-accent" />
//             <span className="font-bold text-xl">DocuMind</span>
//           </div>
//           <h1 className="text-2xl font-bold mb-2">Create an account</h1>
//           <p className="text-foreground/60">Get started with DocuMind AI for free</p>
//         </div>

//         <form onSubmit={handleSignup} className="space-y-4">
//           <div>
//             <label className="block text-sm font-medium mb-2">Full Name</label>
//             <input
//               type="text"
//               value={fullName}
//               onChange={(e) => setFullName(e.target.value)}
//               placeholder="John Doe"
//               className="w-full px-4 py-2 bg-card border border-border rounded-lg text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-accent"
//               required
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-medium mb-2">Email</label>
//             <input
//               type="email"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               placeholder="you@example.com"
//               className="w-full px-4 py-2 bg-card border border-border rounded-lg text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-accent"
//               required
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-medium mb-2">Password</label>
//             <input
//               type="password"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               placeholder="••••••••"
//               className="w-full px-4 py-2 bg-card border border-border rounded-lg text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-accent"
//               required
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-medium mb-2">Confirm Password</label>
//             <input
//               type="password"
//               value={confirmPassword}
//               onChange={(e) => setConfirmPassword(e.target.value)}
//               placeholder="••••••••"
//               className="w-full px-4 py-2 bg-card border border-border rounded-lg text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-accent"
//               required
//             />
//           </div>

//           <Button type="submit" className="w-full gap-2" disabled={loading}>
//             {loading ? 'Creating account...' : 'Create account'} <ArrowRight className="w-4 h-4" />
//           </Button>
//         </form>

//         <div className="mt-6 text-center text-sm text-foreground/60">
//           Already have an account?{' '}
//           <Link href="/login" className="text-accent hover:text-accent/80 font-medium">
//             Sign in
//           </Link>
//         </div>

//         <p className="mt-4 text-xs text-foreground/50 text-center">
//           By signing up, you agree to our Terms of Service and Privacy Policy
//         </p>
//       </div>
//     </div>
//   )
// }




'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { FileText, ArrowRight } from 'lucide-react'
import { registerUser } from '@/lib/api'

export default function SignupPage() {
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [fullName, setFullName] = useState('')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    setError('')
    setSuccess('')

    // ---------------------------------------------
    // Validate Full Name
    // ---------------------------------------------

    if (!fullName.trim()) {
      setError('Please enter your full name.')
      return
    }

    // ---------------------------------------------
    // Validate Email
    // ---------------------------------------------

    if (!email.trim()) {
      setError('Please enter your email.')
      return
    }

    // ---------------------------------------------
    // Validate Password
    // ---------------------------------------------

    if (!password) {
      setError('Please enter your password.')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    // ---------------------------------------------
    // Validate Confirm Password
    // ---------------------------------------------

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    try {
      setLoading(true)

      // ---------------------------------------------
      // Call real ASP.NET Core API
      // ---------------------------------------------

      const result = await registerUser({
        email: email.trim(),
        password: password,
      })

      console.log('Registration successful:', result)

      // ---------------------------------------------
      // Success
      // ---------------------------------------------

      setSuccess('Account created successfully!')

      // ---------------------------------------------
      // Redirect to Login
      // ---------------------------------------------

      setTimeout(() => {
        router.push('/login')
      }, 1000)
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'Registration failed. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <FileText className="w-6 h-6 text-accent" />
            <span className="font-bold text-xl">DocuMind</span>
          </div>

          <h1 className="text-2xl font-bold mb-2">
            Create an account
          </h1>

          <p className="text-foreground/60">
            Get started with DocuMind AI for free
          </p>
        </div>

        <form
          onSubmit={handleSignup}
          className="space-y-4"
        >
          <div>
            <label className="block text-sm font-medium mb-2">
              Full Name
            </label>

            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="John Doe"
              className="w-full px-4 py-2 bg-card border border-border rounded-lg text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-accent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-4 py-2 bg-card border border-border rounded-lg text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-accent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2 bg-card border border-border rounded-lg text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-accent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Confirm Password
            </label>

            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2 bg-card border border-border rounded-lg text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-accent"
              required
            />
          </div>

          {/* -----------------------------------------
              Error Message
          ------------------------------------------ */}

          {error && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3">
              <p className="text-sm text-red-500">
                {error}
              </p>
            </div>
          )}

          {/* -----------------------------------------
              Success Message
          ------------------------------------------ */}

          {success && (
            <div className="rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3">
              <p className="text-sm text-green-500">
                {success}
              </p>
            </div>
          )}

          <Button
            type="submit"
            className="w-full gap-2"
            disabled={loading}
          >
            {loading
              ? 'Creating account...'
              : 'Create account'}

            <ArrowRight className="w-4 h-4" />
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-foreground/60">
          Already have an account?{' '}

          <Link
            href="/login"
            className="text-accent hover:text-accent/80 font-medium"
          >
            Sign in
          </Link>
        </div>

        <p className="mt-4 text-xs text-foreground/50 text-center">
          By signing up, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  )
}

