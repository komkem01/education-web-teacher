import { ref } from 'vue'

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

export function useCoursesData() {
  const rows = ref<CourseRow[]>([
    { id: 'C001', name: 'คณิตศาสตร์พื้นฐาน ม.3/1', subject: 'คณิตศาสตร์', level: 'ม.3', credits: 1.5, students: 37, semester: '1/2568', room: '301', status: 'เปิดสอน' },
    { id: 'C002', name: 'คณิตศาสตร์พื้นฐาน ม.3/2', subject: 'คณิตศาสตร์', level: 'ม.3', credits: 1.5, students: 35, semester: '1/2568', room: '302', status: 'เปิดสอน' },
    { id: 'C003', name: 'แคลคูลัสเบื้องต้น ม.6', subject: 'คณิตศาสตร์', level: 'ม.6', credits: 1.5, students: 28, semester: '1/2568', room: '601', status: 'เปิดสอน' },
    { id: 'C004', name: 'สถิติและความน่าจะเป็น ม.5', subject: 'คณิตศาสตร์', level: 'ม.5', credits: 1.5, students: 32, semester: '1/2568', room: '501', status: 'รออนุมัติ' },
    { id: 'C005', name: 'คณิตศาสตร์เสริม ม.3', subject: 'คณิตศาสตร์', level: 'ม.3', credits: 1.0, students: 20, semester: '1/2568', room: '303', status: 'ปิดสอน' },
  ])

  return { rows }
}
