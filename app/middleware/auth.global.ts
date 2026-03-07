export default defineNuxtRouteMiddleware((to) => {
  const authToken = useCookie<string | null>('edu_teacher_token')

  const isPublic = to.path === '/'

  if (!authToken.value && !isPublic) {
    return navigateTo('/')
  }

  if (authToken.value && isPublic) {
    return navigateTo('/teacher')
  }
})
