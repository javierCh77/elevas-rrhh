"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"

interface StreamingTextProps {
  phrases: string[]
  className?: string
}

export default function StreamingText({ phrases, className = "" }: StreamingTextProps) {
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0)
  const [displayedText, setDisplayedText] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)
  const [isPaused, setIsPaused] = useState(false)

  useEffect(() => {
    if (!phrases.length) return

    const currentPhrase = phrases[currentPhraseIndex]
    
    const timer = setTimeout(() => {
      if (isPaused) {
        setIsPaused(false)
        setIsDeleting(true)
        return
      }

      if (isDeleting) {
        if (displayedText === "") {
          setIsDeleting(false)
          setCurrentPhraseIndex((prev) => (prev + 1) % phrases.length)
        } else {
          setDisplayedText(displayedText.slice(0, -1))
        }
      } else {
        if (displayedText === currentPhrase) {
          setIsPaused(true)
        } else {
          setDisplayedText(currentPhrase.slice(0, displayedText.length + 1))
        }
      }
    }, isDeleting ? 50 : isPaused ? 2000 : 100)

    return () => clearTimeout(timer)
  }, [displayedText, isDeleting, isPaused, currentPhraseIndex, phrases])

  return (
    <span className={className}>
      {displayedText}
      <motion.span
        animate={{ opacity: [1, 0] }}
        transition={{ duration: 0.8, repeat: Infinity, repeatType: "reverse" }}
        className="inline-block ml-1 w-0.5 h-8 bg-current"
      />
    </span>
  )
}