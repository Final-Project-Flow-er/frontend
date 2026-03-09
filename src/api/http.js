export async function request(url, options = {}) {
  const token = sessionStorage.getItem('accessToken')
  const headers = { ...(options.headers || {}) }
  if (token) headers['Authorization'] = `Bearer ${token}`
  const res = await fetch(url, { ...options, headers })
  const json = await res.json()
  if (!res.ok || !json.success) throw new Error(json.message || `요청 실패 (${res.status})`)
  return json.data
}
