'use client'

import { useEffect, useState } from 'react'

export default function CustomCursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [dotPosition, setDotPosition] = useState({ x: 0, y: 0 })
  const [isHovering, setIsHovering] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      setDotPosition({ x: e.clientX, y: e.clientY })
      setIsVisible(true)
      
      // Delay for the larger circle
      setTimeout(() => {
        setPosition({ x: e.clientX, y: e.clientY })
      }, 50)
    }

    const onMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (
        target.tagName === 'A' || 
        target.tagName === 'BUTTON' || 
        target.closest('button') || 
        target.closest('a') ||
        target.classList.contains('group')
      ) {
        setIsHovering(true)
      } else {
        setIsHovering(false)
      }
    }

    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseover', onMouseOver)
    
    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseover', onMouseOver)
    }
  }, [])

  if (!isVisible) return null

  return (
    <>
      {/* The main dot */}
      <div 
        className="fixed top-0 left-0 w-2 h-2 bg-orange-500 rounded-full pointer-events-none z-[9999] transition-transform duration-100 ease-out"
        style={{ transform: `translate(${dotPosition.x - 4}px, ${dotPosition.y - 4}px)` }}
      />
      {/* The trailing circle */}
      <div 
        className={`fixed top-0 left-0 pointer-events-none z-[9998] rounded-full border border-orange-500/30 transition-all duration-300 ease-out ${isHovering ? 'w-12 h-12 -translate-x-6 -translate-y-6 bg-orange-500/5' : 'w-6 h-6 -translate-x-3 -translate-y-3'}`}
        style={{ 
          left: `${position.x}px`, 
          top: `${position.y}px`,
        }}
      />
    </>
  )
}
