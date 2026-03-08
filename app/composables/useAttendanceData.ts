import { ref } from 'vue'

export interface AttendanceRecord {
  id: string
  studentCode: string
  studentName: string
  classroom: string
  date: string
  status: 'มา' | 'ขาด' | 'ลา' | 'สาย'
  note: string
}

export function useAttendanceData() {
  const records = ref<AttendanceRecord[]>([])

  return { records }
}
