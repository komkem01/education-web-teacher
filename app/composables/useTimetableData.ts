import { ref } from 'vue'

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

export function useTimetableData() {
  const slots = ref<TimetableSlot[]>([
    { id: 'T001', day: 'จันทร์', period: 1, timeStart: '08:30', timeEnd: '09:20', courseId: 'C001', courseName: 'คณิตศาสตร์พื้นฐาน ม.3/1', classroom: 'ม.3/1', room: '301' },
    { id: 'T002', day: 'จันทร์', period: 3, timeStart: '10:10', timeEnd: '11:00', courseId: 'C003', courseName: 'แคลคูลัสเบื้องต้น ม.6', classroom: 'ม.6/1', room: '601' },
    { id: 'T003', day: 'อังคาร', period: 2, timeStart: '09:20', timeEnd: '10:10', courseId: 'C002', courseName: 'คณิตศาสตร์พื้นฐาน ม.3/2', classroom: 'ม.3/2', room: '302' },
    { id: 'T004', day: 'อังคาร', period: 5, timeStart: '13:00', timeEnd: '13:50', courseId: 'C001', courseName: 'คณิตศาสตร์พื้นฐาน ม.3/1', classroom: 'ม.3/1', room: '301' },
    { id: 'T005', day: 'พุธ', period: 1, timeStart: '08:30', timeEnd: '09:20', courseId: 'C003', courseName: 'แคลคูลัสเบื้องต้น ม.6', classroom: 'ม.6/1', room: '601' },
    { id: 'T006', day: 'พฤหัส', period: 4, timeStart: '11:50', timeEnd: '12:40', courseId: 'C002', courseName: 'คณิตศาสตร์พื้นฐาน ม.3/2', classroom: 'ม.3/2', room: '302' },
    { id: 'T007', day: 'ศุกร์', period: 2, timeStart: '09:20', timeEnd: '10:10', courseId: 'C001', courseName: 'คณิตศาสตร์พื้นฐาน ม.3/1', classroom: 'ม.3/1', room: '301' },
    { id: 'T008', day: 'ศุกร์', period: 6, timeStart: '13:50', timeEnd: '14:40', courseId: 'C003', courseName: 'แคลคูลัสเบื้องต้น ม.6', classroom: 'ม.6/1', room: '601' },
  ])

  return { slots }
}
