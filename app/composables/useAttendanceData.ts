import { ref } from 'vue'
import { ensureTeacherSession } from './useTeacherSession'

export interface AttendanceRecord {
  id: string
  studentCode: string
  studentName: string
  classroom: string
  date: string
  status: 'มา' | 'ขาด' | 'ลา' | 'สาย'
  note: string
}

type BaseResponse<T> = { data: T }

type SubjectAssignmentItem = {
  classroom_id: string
}

type ClassroomItem = {
  id: string
  name: string | null
}

type StudentItem = {
  id: string
  student_code: string | null
  first_name: string | null
  last_name: string | null
  current_classroom_id: string | null
}

type StudentAttendanceLogItem = {
  id: string
  status: 'present' | 'absent' | 'late' | 'sick' | 'business'
  note: string | null
  created_at: string
}

function toThaiAttendanceStatus(value: StudentAttendanceLogItem['status']): AttendanceRecord['status'] {
  if (value === 'present') return 'มา'
  if (value === 'absent') return 'ขาด'
  if (value === 'late') return 'สาย'
  return 'ลา'
}

export function useAttendanceData() {
  const records = ref<AttendanceRecord[]>([])

  if (import.meta.client) {
    ensureTeacherSession().then(async (session) => {
      const teacherID = session?.teacher?.id
      const token = useCookie<string | null>('edu_teacher_token')
      if (!teacherID || !token.value) {
        records.value = []
        return
      }

      const headers = { Authorization: `Bearer ${token.value}` }
      const config = useRuntimeConfig()

      try {
        const assignmentRes = await $fetch<BaseResponse<SubjectAssignmentItem[]>>(`${config.public.apiBase}/teachers/${teacherID}/subject-assignments?only_active=true`, { headers })
        const classroomIDs = [...new Set((assignmentRes.data || []).map(item => item.classroom_id).filter(Boolean))]
        const classroomMap = new Map<string, string>()
        const result: AttendanceRecord[] = []

        await Promise.all(classroomIDs.map(async (classroomID) => {
          if (!classroomMap.has(classroomID)) {
            try {
              const classroomRes = await $fetch<BaseResponse<ClassroomItem>>(`${config.public.apiBase}/teachers-meta/classrooms/${classroomID}`, { headers })
              classroomMap.set(classroomID, classroomRes.data?.name?.trim() || '-')
            }
            catch {
              classroomMap.set(classroomID, '-')
            }
          }

          let students: StudentItem[] = []
          try {
            const studentRes = await $fetch<BaseResponse<StudentItem[]>>(`${config.public.apiBase}/students?current_classroom_id=${encodeURIComponent(classroomID)}&only_active=true`, { headers })
            students = studentRes.data || []
          }
          catch {
            students = []
          }

          await Promise.all(students.map(async (student) => {
            let latestLog: StudentAttendanceLogItem | null = null
            try {
              const attendanceRes = await $fetch<BaseResponse<StudentAttendanceLogItem[]>>(`${config.public.apiBase}/students/${student.id}/attendance-logs`, { headers })
              const logs = (attendanceRes.data || []).slice().sort((a, b) => (a.created_at < b.created_at ? 1 : -1))
              latestLog = logs[0] || null
            }
            catch {
              latestLog = null
            }

            result.push({
              id: student.id,
              studentCode: student.student_code?.trim() || student.id,
              studentName: `${student.first_name || ''} ${student.last_name || ''}`.trim() || '-',
              classroom: classroomMap.get(student.current_classroom_id || classroomID) || '-',
              date: new Date().toISOString().slice(0, 10),
              status: latestLog ? toThaiAttendanceStatus(latestLog.status) : 'มา',
              note: latestLog?.note?.trim() || '',
            })
          }))
        }))

        records.value = result.sort((a, b) => a.studentName.localeCompare(b.studentName, 'th'))
      }
      catch {
        records.value = []
      }
    }).catch(() => {
      records.value = []
    })
  }

  return { records }
}
