import { shallowRef } from 'vue'

export interface ConfirmOptions {
  title: string
  message?: string
  confirmText?: string
  cancelText?: string
  danger?: boolean
}

export interface ConfirmRequest extends ConfirmOptions {
  resolve: (value: boolean) => void
}

const current = shallowRef<ConfirmRequest | null>(null)

function settle(value: boolean) {
  const request = current.value
  if (!request) return
  current.value = null
  request.resolve(value)
}

function confirm(options: ConfirmOptions): Promise<boolean> {
  settle(false)
  return new Promise<boolean>((resolve) => {
    current.value = { ...options, resolve }
  })
}

export function useConfirm() {
  return confirm
}

export function useConfirmState() {
  return { current, settle }
}
