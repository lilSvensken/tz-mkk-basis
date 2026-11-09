function getStorage(): Storage | null {
  try {
    return typeof window === 'undefined' ? null : window.localStorage
  }
  catch {
    return null
  }
}

export function readJson(key: string): unknown {
  const storage = getStorage()
  if (!storage) return null

  try {
    const raw = storage.getItem(key)
    return raw === null ? null : JSON.parse(raw)
  }
  catch {
    return null
  }
}

export function writeJson(key: string, value: unknown): boolean {
  const storage = getStorage()
  if (!storage) return false

  try {
    storage.setItem(key, JSON.stringify(value))
    return true
  }
  catch {
    return false
  }
}

export function removeKey(key: string): void {
  try {
    getStorage()?.removeItem(key)
  }
  catch {
    return
  }
}
