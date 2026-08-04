import React from 'react'
import { Building2 } from 'lucide-react'

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-[#262626] bg-[#0A0A0B] py-12 mt-20 text-zinc-400">
      <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#E11D2E] flex items-center justify-center">
            <Building2 className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-white tracking-tight">Smart<span className="text-[#E11D2E]">Space</span></span>
        </div>
        <p className="text-xs text-zinc-500">
          &copy; {new Date().getFullYear()} SmartSpace Inc. All rights reserved. Premium Rental Management Platform.
        </p>
        <div className="flex items-center gap-6 text-xs text-zinc-400">
          <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          <a href="#" className="hover:text-white transition-colors">Support</a>
        </div>
      </div>
    </footer>
  )
}
