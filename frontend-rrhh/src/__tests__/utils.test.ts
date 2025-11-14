import { cn, formatDate, formatCurrency, getInitials, generateId } from '@/lib/utils'

describe('Utils', () => {
  describe('cn', () => {
    it('merges class names correctly', () => {
      expect(cn('foo', 'bar')).toBe('foo bar')
      expect(cn('foo', undefined, 'bar')).toBe('foo bar')
      expect(cn('foo', false && 'bar', 'baz')).toBe('foo baz')
    })

    it('handles tailwind class conflicts', () => {
      expect(cn('px-2 px-3')).toBe('px-3')
      expect(cn('text-red-500 text-blue-500')).toBe('text-blue-500')
    })
  })

  describe('formatDate', () => {
    it('formats date objects correctly', () => {
      const date = new Date('2024-01-15T12:00:00Z')
      const formatted = formatDate(date)
      expect(formatted).toMatch(/15.*enero.*2024/)
    })

    it('formats date strings correctly', () => {
      const formatted = formatDate('2024-01-15T12:00:00Z')
      expect(formatted).toMatch(/15.*enero.*2024/)
    })
  })

  describe('formatCurrency', () => {
    it('formats currency correctly', () => {
      expect(formatCurrency(1234.56)).toContain('1234,56')
      expect(formatCurrency(1234.56)).toContain('€')
      expect(formatCurrency(1000)).toContain('1000,00')
      expect(formatCurrency(0)).toContain('0,00')
    })

    it('handles large numbers', () => {
      expect(formatCurrency(1234567.89)).toContain('1.234.567,89')
      expect(formatCurrency(1234567.89)).toContain('€')
    })
  })

  describe('getInitials', () => {
    it('returns correct initials', () => {
      expect(getInitials('John', 'Doe')).toBe('JD')
      expect(getInitials('Ana', 'Rodriguez')).toBe('AR')
      expect(getInitials('carlos', 'martinez')).toBe('CM')
    })

    it('handles single character names', () => {
      expect(getInitials('A', 'B')).toBe('AB')
    })

    it('handles empty strings', () => {
      expect(getInitials('', 'Doe')).toBe('D')
      expect(getInitials('John', '')).toBe('J')
      expect(getInitials('', '')).toBe('')
    })
  })

  describe('generateId', () => {
    it('generates unique IDs', () => {
      const id1 = generateId()
      const id2 = generateId()

      expect(id1).toBeTruthy()
      expect(id2).toBeTruthy()
      expect(id1).not.toBe(id2)
    })

    it('generates IDs of consistent length', () => {
      const id = generateId()
      expect(id.length).toBe(9)
    })

    it('generates alphanumeric IDs', () => {
      const id = generateId()
      expect(id).toMatch(/^[a-z0-9]+$/)
    })
  })
})