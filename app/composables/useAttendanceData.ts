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
  const today = '08/03/2568'
  const records = ref<AttendanceRecord[]>([
    { id: 'A001', studentCode: '65001', studentName: 'เด็กชายอานนท์ สุขใจ', classroom: 'ม.3/1', date: today, status: 'มา', note: '' },
    { id: 'A002', studentCode: '65002', studentName: 'เด็กหญิงมาลี ดอกไม้', classroom: 'ม.3/1', date: today, status: 'มา', note: '' },
    { id: 'A003', studentCode: '65003', studentName: 'เด็กชายวิชัย รักเรียน', classroom: 'ม.3/2', date: today, status: 'ลา', note: 'ลาป่วย' },
    { id: 'A004', studentCode: '65004', studentName: 'เด็กหญิงสุดา งามดี', classroom: 'ม.3/2', date: today, status: 'สาย', note: 'สาย 10 นาที' },
    { id: 'A005', studentCode: '65005', studentName: 'เด็กชายปรีชา เก่งกาจ', classroom: 'ม.3/1', date: today, status: 'ขาด', note: 'ไม่มาโดยไม่แจ้ง' },
    { id: 'A006', studentCode: '65006', studentName: 'เด็กหญิงนภา แจ่มใส', classroom: 'ม.3/2', date: today, status: 'มา', note: '' },
  ])

  return { records }
}
