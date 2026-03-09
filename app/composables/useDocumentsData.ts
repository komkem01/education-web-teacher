import { ref } from 'vue'
import { ensureTeacherSession } from './useTeacherSession'

export interface DocumentRequest {
  id: string
  type: string
  detail: string
  requestedAt: string
  status: 'รออนุมัติ' | 'กำลังดำเนินการ' | 'พร้อมรับ' | 'รับแล้ว' | 'ยกเลิกแล้ว'
  canceledByRequester?: boolean
  note: string
}

type BaseResponse<T> = { data: T }

type TeacherLeaveLogItem = {
  id: string
  type: 'sick' | 'business' | 'vacation' | 'other'
  reason: string | null
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
}

function toThaiDate(value: string | null | undefined) {
  if (!value) return '-'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return '-'
  return d.toLocaleDateString('th-TH', { timeZone: 'Asia/Bangkok' })
}

function leaveTypeLabel(value: TeacherLeaveLogItem['type']) {
  if (value === 'sick') return 'ใบลาป่วย'
  if (value === 'business') return 'ใบลากิจ'
  if (value === 'vacation') return 'ใบลาพักร้อน'
  return 'เอกสารคำขอทั่วไป'
}

function leaveStatusLabel(value: TeacherLeaveLogItem['status']): DocumentRequest['status'] {
  if (value === 'approved') return 'พร้อมรับ'
  if (value === 'rejected') return 'ยกเลิกแล้ว'
  return 'รออนุมัติ'
}

export function useDocumentsData() {
  const requests = ref<DocumentRequest[]>([])

  if (import.meta.client) {
    ensureTeacherSession().then(async (session) => {
      const teacherID = session?.teacher?.id
      const token = useCookie<string | null>('edu_teacher_token')
      if (!teacherID || !token.value) {
        requests.value = []
        return
      }

      const headers = { Authorization: `Bearer ${token.value}` }
      const config = useRuntimeConfig()

      try {
        const res = await $fetch<BaseResponse<TeacherLeaveLogItem[]>>(`${config.public.apiBase}/teachers/${teacherID}/leave-logs`, { headers })
        const items = res.data || []
        requests.value = items.map((item) => ({
          id: item.id,
          type: leaveTypeLabel(item.type),
          detail: item.reason?.trim() || '-',
          requestedAt: toThaiDate(item.created_at),
          status: leaveStatusLabel(item.status),
          note: item.status === 'rejected' ? 'คำขอถูกปฏิเสธ' : '',
        }))
      }
      catch {
        requests.value = []
      }
    }).catch(() => {
      requests.value = []
    })
  }

  return { requests }
}
