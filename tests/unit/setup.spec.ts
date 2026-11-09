import { describe, expect, it } from 'vitest'

describe('test environment', () => {
  it('has DOM storage available', () => {
    localStorage.setItem('probe', '1')
    expect(localStorage.getItem('probe')).toBe('1')
  })
})
