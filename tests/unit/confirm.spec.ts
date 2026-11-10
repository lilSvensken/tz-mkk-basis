import { afterEach, describe, expect, it } from 'vitest'
import { useConfirm, useConfirmState } from '~/composables/useConfirm'

describe('useConfirm', () => {
  const confirm = useConfirm()
  const { current, settle } = useConfirmState()

  afterEach(() => {
    settle(false)
  })

  it('opens a request and resolves true on confirm', async () => {
    const result = confirm({ title: 'Удалить?' })
    expect(current.value?.title).toBe('Удалить?')
    settle(true)
    await expect(result).resolves.toBe(true)
    expect(current.value).toBeNull()
  })

  it('resolves false on cancel', async () => {
    const result = confirm({ title: 'Удалить?' })
    settle(false)
    await expect(result).resolves.toBe(false)
  })

  it('a new request cancels the previous one', async () => {
    const first = confirm({ title: 'Первый' })
    const second = confirm({ title: 'Второй' })
    await expect(first).resolves.toBe(false)
    expect(current.value?.title).toBe('Второй')
    settle(true)
    await expect(second).resolves.toBe(true)
  })
})
