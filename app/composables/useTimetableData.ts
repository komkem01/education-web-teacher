import { ref } from 'vue'
import { ensureTeacherSession } from './useTeacherSession'

export interface TimetableSlot {
  id: string
  day: string
  period: number
  timeStart: string
  timeEnd: string
  courseId: string
  courseName: string
  classroom: string
  room: string
}

type BaseResponse<T> = { data: T }

type SubjectAssignmentItem = {
  id: string
  subject_id: string
  classroom_id: string
}

type SubjectItem = { id: string; name: string | null; code: string | null }
type ClassroomItem = { id: string; name: string | null; room_no: string | null }
type ScheduleItem = {
  id: string
  subject_assignment_id: string
  day_of_week: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday'
  start_time: string | null
  end_time: string | null
  period_no: number | null
}

function toThaiDay(value: ScheduleItem['day_of_week']) {
  if (value === 'monday') return 'จันทร์'
  if (value === 'tuesday') return 'อังคาร'
  if (value === 'wednesday') return 'พุธ'
  if (value === 'thursday') return 'พฤหัส'
  if (value === 'friday') return 'ศุกร์'
  if (value === 'saturday') return 'เสาร์'
  return 'อาทิตย์'
}

export function useTimetableData() {
  const slots = ref<TimetableSlot[]>([])

  if (import.meta.client) {
    ensureTeacherSession().then(async (session) => {
      const teacherID = session?.teacher?.id
      const token = useCookie<string | null>('edu_teacher_token')
      if (!teacherID || !token.value) {
        slots.value = []
        return
      }

      const headers = { Authorization: `Bearer ${token.value}` }
      const config = useRuntimeConfig()

      try {
        const assignmentRes = await $fetch<BaseResponse<SubjectAssignmentItem[]>>(`${config.public.apiBase}/teachers/${teacherID}/subject-assignments?only_active=true`, { headers })
        const assignments = assignmentRes.data || []
        const subjectMap = new Map<string, SubjectItem>()
        const classroomMap = new Map<string, ClassroomItem>()
        const assignmentMap = new Map<string, SubjectAssignmentItem>()

        await Promise.all(assignments.map(async (assignment) => {
          assignmentMap.set(assignment.id, assignment)

          if (assignment.subject_id && !subjectMap.has(assignment.subject_id)) {
            try {
              const subjectRes = await $fetch<BaseResponse<SubjectItem>>(`${config.public.apiBase}/teachers-meta/subjects/${assignment.subject_id}`, { headers })
              if (subjectRes.data) subjectMap.set(assignment.subject_id, subjectRes.data)
            }
            catch {
              // Keep fallback subject labels.
            }
          }

          if (assignment.classroom_id && !classroomMap.has(assignment.classroom_id)) {
            try {
              const classroomRes = await $fetch<BaseResponse<ClassroomItem>>(`${config.public.apiBase}/teachers-meta/classrooms/${assignment.classroom_id}`, { headers })
              if (classroomRes.data) classroomMap.set(assignment.classroom_id, classroomRes.data)
            }
            catch {
              // Keep fallback classroom labels.
            }
          }
        }))

        const timetableSlots: TimetableSlot[] = []
        await Promise.all(assignments.map(async (assignment) => {
          try {
            const scheduleRes = await $fetch<BaseResponse<ScheduleItem[]>>(`${config.public.apiBase}/teachers-meta/schedules?subject_assignment_id=${assignment.id}&only_active=true`, { headers })
            for (const item of (scheduleRes.data || [])) {
              const subject = subjectMap.get(assignment.subject_id)
              const classroom = classroomMap.get(assignment.classroom_id)
              const subjectName = subject?.name?.trim() || subject?.code?.trim() || 'รายวิชา'
              const classroomName = classroom?.name?.trim() || '-'
              timetableSlots.push({
                id: item.id,
                day: toThaiDay(item.day_of_week),
                period: item.period_no || 0,
                timeStart: item.start_time || '-',
                timeEnd: item.end_time || '-',
                courseId: assignment.id,
                courseName: `${subjectName} ${classroomName}`.trim(),
                classroom: classroomName,
                room: classroom?.room_no?.trim() || '-',
              })
            }
          }
          catch {
            // Skip assignment when schedules cannot be loaded.
          }
        }))

        slots.value = timetableSlots.sort((a, b) => a.period - b.period)
      }
      catch {
        slots.value = []
      }
    }).catch(() => {
      slots.value = []
    })
  }

  return { slots }
}
