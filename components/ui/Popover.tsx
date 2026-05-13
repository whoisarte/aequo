'use client'

import React, { ReactNode, useEffect, useRef } from 'react'

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

  useEffect(() => {
    if (!isOpen) return

    // Position adjustment to keep popover within viewport
    const adjustPosition = () => {
      if (popoverRef.current) {
        const popoverRect = popoverRef.current.getBoundingClientRect()
        const viewportWidth = window.innerWidth
        const viewportHeight = window.innerHeight

        let newX = x
        let newY = y

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

        popoverRef.current.style.left = `${newX}px`
        popoverRef.current.style.top = `${newY}px`
      }
    }

    adjustPosition()
    window.addEventListener('resize', adjustPosition)
    return () => window.removeEventListener('resize', adjustPosition)
  }, [isOpen, x, y])

  if (!isOpen) return null

  return (
    <div
      ref={popoverRef}
      className="fixed z-[9999] rounded-xl shadow-2xl p-4 text-left border border-gray-200 dark:border-gray-700 isolate bg-gray-900"
      style={{
        left: `${x}px`,
        top: `${y}px`,
        maxWidth: '300px',
        minWidth: '250px',
        backgroundColor: 'black !important', // Force black background to debug
        border: '5px solid red !important', // Debug border
        boxShadow: '0 0 20px red !important', // Debug shadow
      }}
    >
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
  )
}
