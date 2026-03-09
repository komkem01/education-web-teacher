import { ref } from 'vue'

type BaseResponse<T> = { data: T }

type MeResponse = {
  member_id: string
  school_id: string
  role: string
  roles: string[]
}

type SchoolItem = {
  id: string
  name: string | null
}

type TeacherAddressItem = {
  id: string
  member_id: string
  label: string | null
  address_line: string | null
  is_primary: boolean
  sort_order: number
}

type TeacherItem = {
  id: string
  member_id: string
  gender_id: string | null
  prefix_id: string | null
  teacher_code: string | null
  first_name: string | null
  last_name: string | null
  citizen_id: string | null
  phone: string | null
  current_position: string | null
  current_academic_standing: string | null
  department: string | null
  start_date: string | null
  addresses?: TeacherAddressItem[]
  is_active: boolean
}

export type TeacherSession = {
  memberId: string
  schoolId: string
  schoolName: string | null
  teacher: TeacherItem | null
}

let sessionPromise: Promise<TeacherSession | null> | null = null

function authHeaders() {
  const token = useCookie<string | null>('edu_teacher_token')
  if (!token.value) return undefined
  return { Authorization: `Bearer ${token.value}` }
}

async function apiFetch<T>(path: string, options?: Parameters<typeof $fetch<T>>[1]) {
  const config = useRuntimeConfig()
  return await $fetch<T>(`${config.public.apiBase}${path}`, options)
}

async function loadSession(): Promise<TeacherSession | null> {
  const headers = authHeaders()
  if (!headers) return null

  const me = await apiFetch<BaseResponse<MeResponse>>('/auth/me', { headers })
  const memberId = me.data?.member_id
  const schoolId = me.data?.school_id
  if (!memberId || !schoolId) return null

  const teacherRes = await apiFetch<BaseResponse<TeacherItem[]>>(`/teachers?member_id=${encodeURIComponent(memberId)}&only_active=false`, { headers })
  const teacher = (teacherRes.data || [])[0] || null

  let schoolName: string | null = null
  try {
    const schoolRes = await apiFetch<BaseResponse<SchoolItem>>(`/teachers-meta/schools/${schoolId}`, { headers })
    schoolName = schoolRes.data?.name ?? null
  }
  catch {
    schoolName = null
  }

  return { memberId, schoolId, schoolName, teacher }
}

export async function ensureTeacherSession() {
  const state = useState<TeacherSession | null>('teacher-session', () => null)
  if (state.value) return state.value

  if (!sessionPromise) {
    sessionPromise = loadSession()
      .then((value) => {
        state.value = value
        return value
      })
      .finally(() => {
        sessionPromise = null
      })
  }

  return await sessionPromise
}

export function useTeacherSessionState() {
  return useState<TeacherSession | null>('teacher-session', () => null)
}

export function resetTeacherSessionState() {
  const state = useState<TeacherSession | null>('teacher-session', () => null)
  state.value = null
}
