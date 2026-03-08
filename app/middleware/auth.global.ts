export default defineNuxtRouteMiddleware((to) => {
  const authToken = useCookie<string | null>('edu_teacher_token')
  const activeRole = useCookie<string | null>('edu_active_role')
  const config = useRuntimeConfig()

  const isPublic = to.path === '/'
  const isValidSession = Boolean(authToken.value) && activeRole.value === 'teacher'

  async function verifySession() {
    if (!authToken.value || activeRole.value !== 'teacher') return false

    try {
      const res = await $fetch<{ data: { role: string; roles: string[] } }>(`${config.public.apiBase}/auth/me`, {
        headers: {
          Authorization: `Bearer ${authToken.value}`,
        },
      })
      const role = res.data.role
      const roles = res.data.roles ?? []
      return role === 'teacher' || roles.includes('teacher')
    }
    catch {
      return false
    }
  }

  if (!isValidSession && !isPublic) {
    authToken.value = null
    activeRole.value = null
    return navigateTo('/')
  }

  if (isValidSession) {
    return verifySession().then((ok) => {
      if (!ok) {
        authToken.value = null
        activeRole.value = null
        return navigateTo('/')
      }

      if (isPublic) {
        return navigateTo('/teacher')
      }
    })
  }

  if (isValidSession && isPublic) return navigateTo('/teacher')
})
