import { ref } from 'vue'
import { ensureTeacherSession } from './useTeacherSession'

export interface CourseRow {
  id: string
  name: string
  subject: string
  level: string
  credits: number
  students: number
  semester: string
  room: string
  status: string
}

type BaseResponse<T> = { data: T }

type SubjectAssignmentItem = {
  id: string
  subject_id: string
  teacher_id: string
  classroom_id: string
  academic_year_id: string
  semester_no: number
  max_students: number | null
  is_active: boolean
}

type SubjectItem = { id: string; name: string | null; code: string | null }
type ClassroomItem = { id: string; name: string | null; grade_level: string | null; room_no: string | null }
type AcademicYearItem = { id: string; year: string; term: string | null }
type StudentItem = { id: string }

function normalizeAcademicYear(raw: string) {
  const num = Number(raw)
  if (!Number.isFinite(num)) return raw
  if (num < 2400) return String(num + 543)
  return String(num)
}

export function useCoursesData() {
  const rows = ref<CourseRow[]>([])

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
        const assignmentRes = await $fetch<BaseResponse<SubjectAssignmentItem[]>>(`${config.public.apiBase}/teachers/${teacherID}/subject-assignments?only_active=false`, { headers })
        const assignments = assignmentRes.data || []

        const subjectMap = new Map<string, SubjectItem>()
        const classroomMap = new Map<string, ClassroomItem>()
        const yearMap = new Map<string, AcademicYearItem>()
        const studentCountMap = new Map<string, number>()

        await Promise.all(assignments.map(async (item) => {
          if (item.subject_id && !subjectMap.has(item.subject_id)) {
            try {
              const subjectRes = await $fetch<BaseResponse<SubjectItem>>(`${config.public.apiBase}/teachers-meta/subjects/${item.subject_id}`, { headers })
              if (subjectRes.data) subjectMap.set(item.subject_id, subjectRes.data)
            }
            catch {
              // Keep fallback labels for missing metadata.
            }
          }

          if (item.classroom_id && !classroomMap.has(item.classroom_id)) {
            try {
              const classroomRes = await $fetch<BaseResponse<ClassroomItem>>(`${config.public.apiBase}/teachers-meta/classrooms/${item.classroom_id}`, { headers })
              if (classroomRes.data) classroomMap.set(item.classroom_id, classroomRes.data)
            }
            catch {
              // Keep fallback labels for missing metadata.
            }
          }

          if (item.academic_year_id && !yearMap.has(item.academic_year_id)) {
            try {
              const yearRes = await $fetch<BaseResponse<AcademicYearItem>>(`${config.public.apiBase}/teachers-meta/academic-years/${item.academic_year_id}`, { headers })
              if (yearRes.data) yearMap.set(item.academic_year_id, yearRes.data)
            }
            catch {
              // Keep fallback labels for missing metadata.
            }
          }

          if (item.classroom_id && !studentCountMap.has(item.classroom_id)) {
            try {
              const studentRes = await $fetch<BaseResponse<StudentItem[]>>(`${config.public.apiBase}/students?current_classroom_id=${encodeURIComponent(item.classroom_id)}&only_active=true`, { headers })
              studentCountMap.set(item.classroom_id, (studentRes.data || []).length)
            }
            catch {
              studentCountMap.set(item.classroom_id, 0)
            }
          }
        }))

        rows.value = assignments.map((item) => {
          const subject = subjectMap.get(item.subject_id)
          const classroom = classroomMap.get(item.classroom_id)
          const academicYear = yearMap.get(item.academic_year_id)

          const subjectName = subject?.name?.trim() || subject?.code?.trim() || 'รายวิชา'
          const classroomName = classroom?.name?.trim() || '-'
          const level = classroom?.grade_level?.trim() || '-'
          const room = classroom?.room_no?.trim() || '-'
          const year = academicYear?.year ? normalizeAcademicYear(academicYear.year) : String(new Date().getFullYear() + 543)

          return {
            id: item.id,
            name: `${subjectName} ${classroomName}`.trim(),
            subject: subjectName,
            level,
            credits: 0,
            students: studentCountMap.get(item.classroom_id) ?? 0,
            semester: `${item.semester_no}/${year}`,
            room,
            status: item.is_active ? 'เปิดสอน' : 'ปิดสอน',
          }
        })
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
