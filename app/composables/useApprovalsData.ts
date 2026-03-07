import { ref } from 'vue'

export interface ApprovalRequest {
  id: string
  type: string
  detail: string
  editTargets?: string[]
  changeSummary?: string
  reason?: string
  submittedAt: string
  status: 'รอดำเนินการ' | 'อนุมัติแล้ว' | 'ปฏิเสธ' | 'ยกเลิกแล้ว'
  approvedBy: string
  priority: 'ด่วนมาก' | 'ด่วน' | 'ปกติ'
  note: string
}

export function useApprovalsData() {
  const rows = ref<ApprovalRequest[]>([
    {
      id: 'APR001',
      type: 'ขอแก้ไขข้อมูลนักเรียน',
      detail: 'แก้ไขข้อมูลนักเรียน: ด.ช.อานนท์ สุขใจ',
      editTargets: ['ที่อยู่', 'เบอร์โทรผู้ปกครอง'],
      changeSummary: 'ที่อยู่ = 99/21 ม.4 ต.หนองบัว, เบอร์โทรผู้ปกครอง = 089-123-4567',
      reason: 'ข้อมูลเดิมติดต่อไม่ได้',
      submittedAt: '05/03/2568',
      status: 'รอดำเนินการ',
      approvedBy: '',
      priority: 'ปกติ',
      note: '',
    },
    {
      id: 'APR002',
      type: 'ขอแก้ไขผลการเรียน',
      detail: 'แก้ไขคะแนนวิชาคณิตศาสตร์ ม.3/1',
      editTargets: ['คะแนนกลางภาค', 'คะแนนปลายภาค'],
      changeSummary: 'คะแนนกลางภาค = 38, คะแนนปลายภาค = 41',
      reason: 'บันทึกคะแนนผิดจากเอกสารต้นทาง',
      submittedAt: '04/03/2568',
      status: 'รอดำเนินการ',
      approvedBy: '',
      priority: 'ด่วน',
      note: '',
    },
    {
      id: 'APR003',
      type: 'ขอแก้ไขข้อมูลรายวิชา',
      detail: 'ปรับข้อมูลรายวิชา วิทยาศาสตร์ ม.2/3',
      editTargets: ['ห้องเรียน'],
      changeSummary: 'ห้องเรียน = 402',
      reason: 'ย้ายอาคารเรียน',
      submittedAt: '01/03/2568',
      status: 'อนุมัติแล้ว',
      approvedBy: 'นางสาวสมใจ รักงาน',
      priority: 'ปกติ',
      note: 'อนุมัติเรียบร้อย',
    },
    {
      id: 'APR004',
      type: 'ขอเอกสาร',
      detail: 'ขอเอกสาร ปพ.5 ภาคเรียน 1/2568',
      submittedAt: '28/02/2568',
      status: 'อนุมัติแล้ว',
      approvedBy: 'นางสาวสมใจ รักงาน',
      priority: 'ปกติ',
      note: 'ดำเนินการแล้ว',
    },
    {
      id: 'APR005',
      type: 'ขอแก้ไขข้อมูลส่วนตัว',
      detail: 'เปลี่ยนเบอร์โทรศัพท์',
      editTargets: ['เบอร์โทรศัพท์'],
      changeSummary: 'เบอร์โทรศัพท์ = 081-456-9988',
      reason: 'เปลี่ยนหมายเลขใหม่',
      submittedAt: '20/02/2568',
      status: 'ปฏิเสธ',
      approvedBy: 'นางสาวสมใจ รักงาน',
      priority: 'ปกติ',
      note: 'ข้อมูลอ้างอิงไม่ครบ',
    },
  ])

  return { rows }
}
