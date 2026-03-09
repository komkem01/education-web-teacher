import { ref } from 'vue'
import { ensureTeacherSession } from './useTeacherSession'

export interface GradeRecord {
  id: string
  studentCode: string
  studentName: string
  courseId: string
  courseName: string
  classroom: string
  midterm: number | null
  final: number | null
  behavior: number | null
  total: number | null
  grade: string
  semester: string
}

type BaseResponse<T> = { data: T }

type SubjectAssignmentItem = {
  id: string
  subject_id: string
  classroom_id: string
  academic_year_id: string
  semester_no: number
}

type SubjectItem = { name: string | null; code: string | null }
type ClassroomItem = { name: string | null }
type AcademicYearItem = { year: string }

type StudentItem = {
  id: string
  student_code: string | null
  first_name: string | null
  last_name: string | null
  current_classroom_id: string | null
}

type EnrollmentItem = {
  id: string
  subject_assignment_id: string
}

type GradeItem = {
  id: string
  name: string | null
}

type GradeRecordItem = {
  id: string
  enrollment_id: string
  grade_item_id: string
  score: number | null
}

function normalizeAcademicYear(raw: string) {
  const num = Number(raw)
  if (!Number.isFinite(num)) return raw
  if (num < 2400) return String(num + 543)
  return String(num)
}

function scoreToGrade(score: number | null) {
  if (score === null) return '-'
  if (score >= 80) return '4'
  if (score >= 75) return '3.5'
  if (score >= 70) return '3'
  if (score >= 65) return '2.5'
  if (score >= 60) return '2'
  if (score >= 55) return '1.5'
  if (score >= 50) return '1'
  return '0'
}

export function useGradesData() {
  const rows = ref<GradeRecord[]>([])

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
        const assignments = assignmentRes.data || []
        const assignmentMap = new Map<string, SubjectAssignmentItem>()
        const subjectMap = new Map<string, SubjectItem>()
        const classroomMap = new Map<string, ClassroomItem>()
        const yearMap = new Map<string, AcademicYearItem>()

        await Promise.all(assignments.map(async (assignment) => {
          assignmentMap.set(assignment.id, assignment)
          if (!subjectMap.has(assignment.subject_id)) {
            try {
              const subjectRes = await $fetch<BaseResponse<SubjectItem>>(`${config.public.apiBase}/teachers-meta/subjects/${assignment.subject_id}`, { headers })
              if (subjectRes.data) subjectMap.set(assignment.subject_id, subjectRes.data)
            }
            catch {}
          }
          if (!classroomMap.has(assignment.classroom_id)) {
            try {
              const classroomRes = await $fetch<BaseResponse<ClassroomItem>>(`${config.public.apiBase}/teachers-meta/classrooms/${assignment.classroom_id}`, { headers })
              if (classroomRes.data) classroomMap.set(assignment.classroom_id, classroomRes.data)
            }
            catch {}
          }
          if (!yearMap.has(assignment.academic_year_id)) {
            try {
              const yearRes = await $fetch<BaseResponse<AcademicYearItem>>(`${config.public.apiBase}/teachers-meta/academic-years/${assignment.academic_year_id}`, { headers })
              if (yearRes.data) yearMap.set(assignment.academic_year_id, yearRes.data)
            }
            catch {}
          }
        }))

        const result: GradeRecord[] = []
        const classrooms = [...new Set(assignments.map(item => item.classroom_id))]

        await Promise.all(classrooms.map(async (classroomID) => {
          let students: StudentItem[] = []
          try {
            const studentRes = await $fetch<BaseResponse<StudentItem[]>>(`${config.public.apiBase}/students?current_classroom_id=${encodeURIComponent(classroomID)}&only_active=true`, { headers })
            students = studentRes.data || []
          }
          catch {
            students = []
          }

          await Promise.all(students.map(async (student) => {
            let enrollments: EnrollmentItem[] = []
            let gradeItems: GradeItem[] = []
            let gradeRecords: GradeRecordItem[] = []

            try {
              const [enrollmentRes, gradeItemRes, gradeRecordRes] = await Promise.all([
                $fetch<BaseResponse<EnrollmentItem[]>>(`${config.public.apiBase}/students/${student.id}/enrollments`, { headers }),
                $fetch<BaseResponse<GradeItem[]>>(`${config.public.apiBase}/students/${student.id}/grade-items`, { headers }),
                $fetch<BaseResponse<GradeRecordItem[]>>(`${config.public.apiBase}/students/${student.id}/grade-records`, { headers }),
              ])
              enrollments = enrollmentRes.data || []
              gradeItems = gradeItemRes.data || []
              gradeRecords = gradeRecordRes.data || []
            }
            catch {
              enrollments = []
              gradeItems = []
              gradeRecords = []
            }

            const enrollmentMap = new Map(enrollments.map(item => [item.id, item]))
            const gradeItemMap = new Map(gradeItems.map(item => [item.id, item]))
            const grouped = new Map<string, { midterm: number | null; final: number | null; behavior: number | null }>()

            for (const record of gradeRecords) {
              const enrollment = enrollmentMap.get(record.enrollment_id)
              if (!enrollment) continue
              const assignment = assignmentMap.get(enrollment.subject_assignment_id)
              if (!assignment) continue

              const key = `${student.id}:${assignment.id}`
              const current = grouped.get(key) || { midterm: null, final: null, behavior: null }
              const itemName = (gradeItemMap.get(record.grade_item_id)?.name || '').toLowerCase()

              if (itemName.includes('mid') || itemName.includes('กลาง')) {
                current.midterm = record.score
              }
              else if (itemName.includes('final') || itemName.includes('ปลาย')) {
                current.final = record.score
              }
              else if (itemName.includes('behavior') || itemName.includes('จิต')) {
                current.behavior = record.score
              }
              else {
                current.behavior = record.score
              }

              grouped.set(key, current)
            }

            for (const [key, value] of grouped.entries()) {
              const assignmentID = key.split(':')[1]
              const assignment = assignmentMap.get(assignmentID)
              if (!assignment) continue

              const subject = subjectMap.get(assignment.subject_id)
              const classroom = classroomMap.get(assignment.classroom_id)
              const year = yearMap.get(assignment.academic_year_id)

              const total = [value.midterm, value.final, value.behavior]
                .filter((v): v is number => typeof v === 'number')
                .reduce((a, b) => a + b, 0)

              result.push({
                id: key,
                studentCode: student.student_code?.trim() || student.id,
                studentName: `${student.first_name || ''} ${student.last_name || ''}`.trim() || '-',
                courseId: assignment.id,
                courseName: `${subject?.name?.trim() || subject?.code?.trim() || 'รายวิชา'} ${classroom?.name?.trim() || ''}`.trim(),
                classroom: classroom?.name?.trim() || '-',
                midterm: value.midterm,
                final: value.final,
                behavior: value.behavior,
                total: total || null,
                grade: scoreToGrade(total || null),
                semester: `${assignment.semester_no}/${year?.year ? normalizeAcademicYear(year.year) : String(new Date().getFullYear() + 543)}`,
              })
            }
          }))
        }))

        rows.value = result.sort((a, b) => a.studentName.localeCompare(b.studentName, 'th'))
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
