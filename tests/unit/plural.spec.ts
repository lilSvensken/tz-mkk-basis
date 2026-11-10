import { describe, expect, it } from 'vitest'
import { pluralize } from '~/utils/plural'

const forms: [string, string, string] = ['заметка', 'заметки', 'заметок']

describe('pluralize', () => {
  it('picks russian plural forms', () => {
    expect([1, 21, 101].map(n => pluralize(n, forms))).toEqual(['заметка', 'заметка', 'заметка'])
    expect([2, 3, 4, 22].map(n => pluralize(n, forms))).toEqual(['заметки', 'заметки', 'заметки', 'заметки'])
    expect([0, 5, 11, 12, 14, 111].map(n => pluralize(n, forms))).toEqual(Array(6).fill('заметок'))
  })
})
