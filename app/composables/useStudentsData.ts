import { ref } from 'vue'

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

export function useStudentsData() {
  const rows = ref<StudentRow[]>([
    { id: 'S001', code: '65001', name: 'เด็กชายอานนท์ สุขใจ', classroom: 'ม.3/1', level: 'ม.3', status: 'ปกติ', guardian: 'นายสมชาย สุขใจ', phone: '081-111-1111' },
    { id: 'S002', code: '65002', name: 'เด็กหญิงมาลี ดอกไม้', classroom: 'ม.3/1', level: 'ม.3', status: 'ปกติ', guardian: 'นางมาลา ดอกไม้', phone: '082-222-2222' },
    { id: 'S003', code: '65003', name: 'เด็กชายวิชัย รักเรียน', classroom: 'ม.3/2', level: 'ม.3', status: 'ปกติ', guardian: 'นายวิโรจน์ รักเรียน', phone: '083-333-3333' },
    { id: 'S004', code: '65004', name: 'เด็กหญิงสุดา งามดี', classroom: 'ม.3/2', level: 'ม.3', status: 'ลาพัก', guardian: 'นางสุภา งามดี', phone: '084-444-4444' },
    { id: 'S005', code: '64001', name: 'นายธีระ มั่นคง', classroom: 'ม.6/1', level: 'ม.6', status: 'ปกติ', guardian: 'นายธีรพงษ์ มั่นคง', phone: '085-555-5555' },
    { id: 'S006', code: '64002', name: 'นางสาวพิมพ์ใจ สดใส', classroom: 'ม.6/1', level: 'ม.6', status: 'ปกติ', guardian: 'นางพิมลรัตน์ สดใส', phone: '086-666-6666' },
    { id: 'S007', code: '65005', name: 'เด็กชายปรีชา เก่งกาจ', classroom: 'ม.3/1', level: 'ม.3', status: 'รออนุมัติ', guardian: 'นายประสิทธิ์ เก่งกาจ', phone: '087-777-7777' },
    { id: 'S008', code: '65006', name: 'เด็กหญิงนภา แจ่มใส', classroom: 'ม.3/2', level: 'ม.3', status: 'ปกติ', guardian: 'นางนวลจันทร์ แจ่มใส', phone: '088-888-8888' },
  ])

  return { rows }
}
