'use client'

import { Button } from '@/components/ui/button'

export function Sidebar() {
  return (
    <div className="w-16 bg-gray-900 flex flex-col items-center py-3 space-y-6 border-r border-gray-800">
      {/* Logo */}
      <div className="text-white text-2xl font-bold mb-4">S</div>
      
      {/* Navigation */}
      <div className="flex flex-col space-y-8">
        <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white hover:bg-gray-800 rounded">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.55 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
          </svg>
        </Button>
        
        <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white hover:bg-gray-800 rounded">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </Button>
      </div>
    </div>
  )
}