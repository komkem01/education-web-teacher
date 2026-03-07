import { ref } from 'vue'

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

export function useGradesData() {
  const rows = ref<GradeRecord[]>([
    { id: 'G001', studentCode: '65001', studentName: 'เด็กชายอานนท์ สุขใจ', courseId: 'C001', courseName: 'คณิตศาสตร์พื้นฐาน ม.3/1', classroom: 'ม.3/1', midterm: 42, final: 38, behavior: 15, total: 95, grade: '4', semester: '1/2568' },
    { id: 'G002', studentCode: '65002', studentName: 'เด็กหญิงมาลี ดอกไม้', courseId: 'C001', courseName: 'คณิตศาสตร์พื้นฐาน ม.3/1', classroom: 'ม.3/1', midterm: 35, final: 30, behavior: 14, total: 79, grade: '3', semester: '1/2568' },
    { id: 'G003', studentCode: '65003', studentName: 'เด็กชายวิชัย รักเรียน', courseId: 'C002', courseName: 'คณิตศาสตร์พื้นฐาน ม.3/2', classroom: 'ม.3/2', midterm: 28, final: 22, behavior: 10, total: 60, grade: '2', semester: '1/2568' },
    { id: 'G004', studentCode: '65004', studentName: 'เด็กหญิงสุดา งามดี', courseId: 'C002', courseName: 'คณิตศาสตร์พื้นฐาน ม.3/2', classroom: 'ม.3/2', midterm: 18, final: 15, behavior: 8, total: 41, grade: '1', semester: '1/2568' },
    { id: 'G005', studentCode: '65005', studentName: 'เด็กชายปรีชา เก่งกาจ', courseId: 'C001', courseName: 'คณิตศาสตร์พื้นฐาน ม.3/1', classroom: 'ม.3/1', midterm: null, final: null, behavior: null, total: null, grade: 'มส', semester: '1/2568' },
    { id: 'G006', studentCode: '65006', studentName: 'เด็กหญิงนภา แจ่มใส', courseId: 'C002', courseName: 'คณิตศาสตร์พื้นฐาน ม.3/2', classroom: 'ม.3/2', midterm: 40, final: 36, behavior: 14, total: 90, grade: '4', semester: '1/2568' },
    { id: 'G007', studentCode: '64001', studentName: 'นายธีระ มั่นคง', courseId: 'C003', courseName: 'แคลคูลัสเบื้องต้น ม.6', classroom: 'ม.6/1', midterm: 44, final: 40, behavior: 15, total: 99, grade: '4', semester: '1/2568' },
    { id: 'G008', studentCode: '64002', studentName: 'นางสาวพิมพ์ใจ สดใส', courseId: 'C003', courseName: 'แคลคูลัสเบื้องต้น ม.6', classroom: 'ม.6/1', midterm: 30, final: 28, behavior: 12, total: 70, grade: '2.5', semester: '1/2568' },
  ])

  return { rows }
}
