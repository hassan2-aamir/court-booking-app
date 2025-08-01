// Debug utility to check authentication state
export const debugAuth = () => {
  if (typeof window !== 'undefined') {
    console.log('=== Authentication Debug ===')
    console.log('access_token:', localStorage.getItem('access_token'))
    console.log('auth-user:', localStorage.getItem('auth-user'))
    
    const token = localStorage.getItem('access_token')
    if (token) {
      // Decode JWT token to check expiry (basic check)
      try {
        const payload = JSON.parse(atob(token.split('.')[1]))
        console.log('Token payload:', payload)
        console.log('Token expires:', new Date(payload.exp * 1000))
        console.log('Current time:', new Date())
        console.log('Token expired:', payload.exp * 1000 < Date.now())
      } catch (e) {
        console.log('Could not decode token:', e)
      }
    } else {
      console.log('No token found')
    }
    console.log('========================')
  }
}
