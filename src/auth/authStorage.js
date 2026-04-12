const STORAGE_KEY = 'korp.auth.session'

export function getAuthSession() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return null
    }

    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') {
      return null
    }

    return parsed
  } catch {
    return null
  }
}

export function saveAuthSession(session) {
  if (!session || typeof session !== 'object') {
    clearAuthSession()
    return
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
}

export function clearAuthSession() {
  window.localStorage.removeItem(STORAGE_KEY)
}

export function getAuthToken() {
  return getAuthSession()?.token || ''
}
