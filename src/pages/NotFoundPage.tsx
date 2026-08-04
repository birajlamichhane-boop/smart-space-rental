import React from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../components/ui/button'
import { Card } from '../components/ui/card'
import { Building2, Home } from 'lucide-react'

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center p-6 relative">
      <div className="ambient-glow top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />

      <Card className="max-w-md w-full text-center p-8 relative z-10 space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-[#E11D2E]/10 border border-[#E11D2E]/20 text-[#E11D2E] flex items-center justify-center mx-auto">
          <Building2 className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h1 className="text-4xl font-extrabold text-white tracking-tight">404</h1>
          <h2 className="text-lg font-semibold text-zinc-300">Space Not Found</h2>
          <p className="text-xs text-zinc-400">
            The page or space route you were looking for does not exist or has been moved.
          </p>
        </div>

        <Link to="/" className="inline-block pt-2">
          <Button className="flex items-center gap-2">
            <Home className="w-4 h-4" /> Back to Homepage
          </Button>
        </Link>
      </Card>
    </div>
  )
}
