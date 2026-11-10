import { describe, expect, it } from 'vitest'
import { displayTitle, normalizeContent, UNTITLED } from '~/utils/noteContent'

describe('note content', () => {
  it('trims the title and drops empty items', () => {
    const result = normalizeContent({
      title: '  Список  ',
      todos: [
        { id: 'a', text: ' Хлеб ', done: false },
        { id: 'b', text: '   ', done: true },
        { id: 'c', text: '', done: false },
      ],
    })
    expect(result).toEqual({
      title: 'Список',
      todos: [{ id: 'a', text: 'Хлеб', done: false }],
    })
  })

  it('shows a placeholder for an empty title', () => {
    expect(displayTitle('')).toBe(UNTITLED)
    expect(displayTitle('   ')).toBe(UNTITLED)
    expect(displayTitle('Покупки')).toBe('Покупки')
  })
})
