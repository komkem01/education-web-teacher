import { ref } from 'vue'

export interface DocumentRequest {
  id: string
  type: string
  detail: string
  requestedAt: string
  status: 'รออนุมัติ' | 'กำลังดำเนินการ' | 'พร้อมรับ' | 'รับแล้ว' | 'ยกเลิกแล้ว'
  canceledByRequester?: boolean
  note: string
}

export function useDocumentsData() {
  const requests = ref<DocumentRequest[]>([
    { id: 'DOC001', type: 'ปพ.5', detail: 'สมุดประจำภาคเรียน 1/2568 รายวิชาคณิตศาสตร์ ม.3/1', requestedAt: '05/03/2568', status: 'กำลังดำเนินการ', note: '' },
    { id: 'DOC002', type: 'หนังสือรับรองการปฏิบัติงาน', detail: 'ฉบับภาษาไทย', requestedAt: '01/03/2568', status: 'พร้อมรับ', note: 'รับได้ที่งานบุคลากร' },
    { id: 'DOC003', type: 'ปพ.5', detail: 'สมุดประจำภาคเรียน 1/2568 รายวิชาแคลคูลัส ม.6', requestedAt: '28/02/2568', status: 'รับแล้ว', note: 'รับเรียบร้อยแล้ว' },
    { id: 'DOC004', type: 'ใบอนุญาตไปราชการ', detail: 'อบรมหลักสูตรครูในศตวรรษที่ 21 วันที่ 15/03/2568', requestedAt: '25/02/2568', status: 'รออนุมัติ', note: '' },
  ])

  return { requests }
}
