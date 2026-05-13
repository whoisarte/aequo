'use client'

import React, { ReactNode, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

interface PopoverProps {
  isOpen: boolean
  onClose: () => void
  children: ReactNode
  title?: string
  x?: number // X coordinate for positioning - now optional
  y?: number // Y coordinate for positioning - now optional
}

export default function Popover({ isOpen, onClose, children, title, x = 0, y = 0 }: PopoverProps) {
  const popoverRef = useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  useEffect(() => {
    if (!isOpen || !mounted) return

    // Position adjustment to keep popover within viewport
    const adjustPosition = () => {
      if (popoverRef.current) {
        const popoverRect = popoverRef.current.getBoundingClientRect()
        const viewportWidth = window.innerWidth
        const viewportHeight = window.innerHeight

        let newX = x
        let newY = y

        // If x or y are 0 (likely default for centered modal), try to center it
        if (x === 0 && y === 0) {
            newX = (viewportWidth - popoverRect.width) / 2
            newY = (viewportHeight - popoverRect.height) / 2
        } else {
            // Adjust if it overflows right
            if (newX + popoverRect.width > viewportWidth - 20) { // 20px margin
            newX = viewportWidth - popoverRect.width - 20
            }
            // Adjust if it overflows bottom
            if (newY + popoverRect.height > viewportHeight - 20) { // 20px margin
            newY = viewportHeight - popoverRect.height - 20
            }
            // Adjust if it overflows left
            if (newX < 20) {
            newX = 20;
            }
            // Adjust if it overflows top
            if (newY < 20) {
                newY = 20;
            }
        }
        popoverRef.current.style.left = `${newX}px`
        popoverRef.current.style.top = `${newY}px`
      }
    }

    // Give it a moment to render before positioning
    const timeoutId = setTimeout(adjustPosition, 0); 
    
    window.addEventListener('resize', adjustPosition)
    return () => {
        clearTimeout(timeoutId)
        window.removeEventListener('resize', adjustPosition)
    }
  }, [isOpen, mounted, x, y]) // Recalculate if x, y change

  if (!mounted || !isOpen) return null

  const popoverContent = (
    <div
      ref={popoverRef}
      className="fixed z-[9999] rounded-xl shadow-2xl p-4 text-left border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
      style={{
        left: `${x}px`,
        top: `${y}px`,
        maxWidth: '300px',
        minWidth: '250px',
      }}
    >
      {/* Aggressive red overlay for ultimate debugging */}
      <div className="absolute inset-0 bg-red-500 z-[999]" style={{ opacity: 0.9 }}></div>
      <div className="relative z-[1]"> {/* Ensure content is above the red overlay */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition"
          aria-label="Close"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
        {title && (
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3 border-b pb-1 border-gray-200 dark:border-gray-700">
            {title}
          </h3>
        )}
        {children}
      </div>
    </div>
  )

  return createPortal(popoverContent, document.body)
}
