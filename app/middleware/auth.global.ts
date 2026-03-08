export default defineNuxtRouteMiddleware((to) => {
  const authToken = useCookie<string | null>('edu_teacher_token')
  const activeRole = useCookie<string | null>('edu_active_role')

  const isPublic = to.path === '/'
  const isValidSession = Boolean(authToken.value) && activeRole.value === 'teacher'

  if (!isValidSession && !isPublic) {
    authToken.value = null
    activeRole.value = null
    return navigateTo('/')
  }

  if (isValidSession && isPublic) {
    return navigateTo('/teacher')
  }
})
