import { ref } from 'vue'
import { ensureTeacherSession } from './useTeacherSession'

export interface StudentRow {
  id: string
  code: string
  name: string
  classroom: string
  level: string
  status: string
  guardian: string
  phone: string
}

type BaseResponse<T> = { data: T }

type SubjectAssignmentItem = {
  id: string
  classroom_id: string
}

type ClassroomItem = {
  id: string
  name: string | null
  grade_level: string | null
}

type StudentItem = {
  id: string
  student_code: string | null
  first_name: string | null
  last_name: string | null
  current_classroom_id: string | null
  phone: string | null
  is_active: boolean
}

export function useStudentsData() {
  const rows = ref<StudentRow[]>([])

  if (import.meta.client) {
    ensureTeacherSession().then(async (session) => {
      const teacherID = session?.teacher?.id
      const token = useCookie<string | null>('edu_teacher_token')
      if (!teacherID || !token.value) {
        rows.value = []
        return
      }

      const headers = { Authorization: `Bearer ${token.value}` }
      const config = useRuntimeConfig()

      try {
        const assignmentRes = await $fetch<BaseResponse<SubjectAssignmentItem[]>>(`${config.public.apiBase}/teachers/${teacherID}/subject-assignments?only_active=true`, { headers })
        const classroomIDs = [...new Set((assignmentRes.data || []).map(item => item.classroom_id).filter(Boolean))]
        const classroomMap = new Map<string, ClassroomItem>()
        const studentMap = new Map<string, StudentRow>()

        await Promise.all(classroomIDs.map(async (classroomID) => {
          try {
            const classroomRes = await $fetch<BaseResponse<ClassroomItem>>(`${config.public.apiBase}/teachers-meta/classrooms/${classroomID}`, { headers })
            if (classroomRes.data) classroomMap.set(classroomID, classroomRes.data)
          }
          catch {
            // Keep fallback classroom labels.
          }

          try {
            const studentRes = await $fetch<BaseResponse<StudentItem[]>>(`${config.public.apiBase}/students?current_classroom_id=${encodeURIComponent(classroomID)}&only_active=false`, { headers })
            for (const student of (studentRes.data || [])) {
              if (studentMap.has(student.id)) continue
              const classroom = classroomMap.get(student.current_classroom_id || classroomID)
              const firstName = student.first_name?.trim() || ''
              const lastName = student.last_name?.trim() || ''
              studentMap.set(student.id, {
                id: student.id,
                code: student.student_code?.trim() || student.id,
                name: `${firstName} ${lastName}`.trim() || '-',
                classroom: classroom?.name?.trim() || '-',
                level: classroom?.grade_level?.trim() || '-',
                status: student.is_active ? 'ปกติ' : 'ลาพัก',
                guardian: '-',
                phone: student.phone?.trim() || '-',
              })
            }
          }
          catch {
            // Skip classroom that fails to load students.
          }
        }))

        rows.value = [...studentMap.values()].sort((a, b) => a.name.localeCompare(b.name, 'th'))
      }
      catch {
        rows.value = []
      }
    }).catch(() => {
      rows.value = []
    })
  }

  return { rows }
}
