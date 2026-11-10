import { describe, expect, it } from 'vitest'
import { matchHotkey } from '~/composables/useEditorHotkeys'

function press(init: KeyboardEventInit) {
  return matchHotkey(new KeyboardEvent('keydown', init))
}

describe('editor hotkeys', () => {
  it('ctrl+z is undo, shift+ctrl+z is redo', () => {
    expect(press({ code: 'KeyZ', key: 'z', ctrlKey: true })).toBe('undo')
    expect(press({ code: 'KeyZ', key: 'Z', ctrlKey: true, shiftKey: true })).toBe('redo')
  })

  it('works with cmd on mac', () => {
    expect(press({ code: 'KeyZ', key: 'z', metaKey: true })).toBe('undo')
  })

  it('matches by physical key so the russian layout works', () => {
    expect(press({ code: 'KeyZ', key: 'я', ctrlKey: true })).toBe('undo')
    expect(press({ code: 'KeyZ', key: 'Я', ctrlKey: true, shiftKey: true })).toBe('redo')
  })

  it('ctrl+y is redo and ctrl+s is save', () => {
    expect(press({ code: 'KeyY', key: 'y', ctrlKey: true })).toBe('redo')
    expect(press({ code: 'KeyS', key: 's', ctrlKey: true })).toBe('save')
  })

  it('ignores keys without modifier or with alt', () => {
    expect(press({ code: 'KeyZ', key: 'z' })).toBeNull()
    expect(press({ code: 'KeyZ', key: 'z', ctrlKey: true, altKey: true })).toBeNull()
    expect(press({ code: 'KeyA', key: 'a', ctrlKey: true })).toBeNull()
  })
})
