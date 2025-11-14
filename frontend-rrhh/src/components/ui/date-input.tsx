'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Calendar } from 'lucide-react'
import { Input } from './input'
import { cn } from '@/lib/utils'

interface DateInputProps {
  value: string // yyyy-MM-dd format
  onChange: (value: string) => void
  placeholder?: string
  required?: boolean
  className?: string
  id?: string
}

/**
 * Custom date input that displays dd/MM/yyyy format
 * but uses a hidden HTML5 date picker for selection
 */
export function DateInput({
  value,
  onChange,
  placeholder = 'dd/mm/aaaa',
  required = false,
  className = '',
  id
}: DateInputProps) {
  const [displayValue, setDisplayValue] = useState('')
  const hiddenInputRef = useRef<HTMLInputElement>(null)

  // Convert yyyy-MM-dd to dd/MM/yyyy for display
  useEffect(() => {
    if (value && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
      const [year, month, day] = value.split('-')
      setDisplayValue(`${day}/${month}/${year}`)
    } else {
      setDisplayValue('')
    }
  }, [value])

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let input = e.target.value.replace(/[^\d]/g, '') // Remove non-digits

    // Auto-format as user types
    if (input.length >= 2) {
      input = input.slice(0, 2) + '/' + input.slice(2)
    }
    if (input.length >= 5) {
      input = input.slice(0, 5) + '/' + input.slice(5)
    }
    if (input.length > 10) {
      input = input.slice(0, 10)
    }

    setDisplayValue(input)

    // Parse dd/MM/yyyy to yyyy-MM-dd
    if (input.length === 10) {
      const parts = input.split('/')
      if (parts.length === 3) {
        const day = parseInt(parts[0], 10)
        const month = parseInt(parts[1], 10)
        const year = parseInt(parts[2], 10)

        // Validate date
        if (
          day >= 1 && day <= 31 &&
          month >= 1 && month <= 12 &&
          year >= 1900 && year <= 2100
        ) {
          const isoDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`

          // Check if date is actually valid (e.g., not 31/02/2024)
          const testDate = new Date(year, month - 1, day)
          if (
            testDate.getDate() === day &&
            testDate.getMonth() === month - 1 &&
            testDate.getFullYear() === year
          ) {
            onChange(isoDate)
          }
        }
      }
    } else if (input.length === 0) {
      onChange('')
    }
  }

  const handleHiddenInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // When user selects from calendar picker
    onChange(e.target.value)
  }

  const handleTextClick = () => {
    // When user clicks on the text input, open the calendar picker
    if (hiddenInputRef.current) {
      hiddenInputRef.current.showPicker?.()
    }
  }

  const handleBlur = () => {
    // Validate on blur
    if (displayValue && displayValue.length !== 10) {
      // Invalid format, clear it
      setDisplayValue('')
      onChange('')
    }
  }

  return (
    <div className="relative">
      <Calendar
        className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none z-10"
      />

      {/* Visible input showing dd/MM/yyyy */}
      <Input
        id={id}
        type="text"
        value={displayValue}
        onChange={handleTextChange}
        onClick={handleTextClick}
        onBlur={handleBlur}
        placeholder={placeholder}
        required={required}
        className={cn("pl-10 cursor-pointer", className)}
        maxLength={10}
        autoComplete="off"
      />

      {/* Hidden HTML5 date input for calendar picker */}
      <input
        ref={hiddenInputRef}
        type="date"
        value={value}
        onChange={handleHiddenInputChange}
        className="absolute inset-0 opacity-0 cursor-pointer"
        tabIndex={-1}
        aria-hidden="true"
      />
    </div>
  )
}
