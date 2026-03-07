import { ref } from 'vue'

export interface AnnouncementRow {
  id: string
  title: string
  category: string
  publishedAt: string
  author: string
  status: 'เผยแพร่แล้ว' | 'ฉบับร่าง'
  pinned: boolean
  summary: string
}

export function useAnnouncementsData() {
  const rows = ref<AnnouncementRow[]>([
    { id: 'ANN001', title: 'กำหนดการส่งผลการเรียนภาคเรียน 1/2568', category: 'วิชาการ', publishedAt: '06/03/2568', author: 'งานวัดผล', status: 'เผยแพร่แล้ว', pinned: true, summary: 'ครูผู้สอนทุกท่านกรุณาส่งผลการเรียนภายในวันที่ 20 มีนาคม 2568' },
    { id: 'ANN002', title: 'ประชุมคณะครูประจำเดือนมีนาคม', category: 'ทั่วไป', publishedAt: '05/03/2568', author: 'ฝ่ายบริหาร', status: 'เผยแพร่แล้ว', pinned: false, summary: 'ขอเชิญคณะครูเข้าร่วมประชุมวันที่ 10 มีนาคม เวลา 14:00 น.' },
    { id: 'ANN003', title: 'แนวทางการจัดทำแผนการสอน ปีการศึกษา 2568', category: 'วิชาการ', publishedAt: '01/03/2568', author: 'งานวิชาการ', status: 'เผยแพร่แล้ว', pinned: false, summary: 'รายละเอียดการจัดทำแผนการสอนตามหลักสูตรแกนกลาง 2568' },
    { id: 'ANN004', title: 'กิจกรรมวันไหว้ครูปีการศึกษา 2568', category: 'กิจกรรม', publishedAt: '28/02/2568', author: 'ฝ่ายกิจการนักเรียน', status: 'เผยแพร่แล้ว', pinned: false, summary: 'กำหนดจัดงานวันไหว้ครูวันที่ 12 มิถุนายน 2568' },
  ])

  return { rows }
}
