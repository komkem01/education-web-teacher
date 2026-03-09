import { ref } from 'vue'
import { ensureTeacherSession } from './useTeacherSession'

export interface ApprovalRequest {
  id: string
  type: string
  detail: string
  editTargets?: string[]
  changeSummary?: string
  reason?: string
  submittedAt: string
  status: 'รออนุมัติ' | 'อนุมัติแล้ว' | 'ปฏิเสธ' | 'ยกเลิกแล้ว'
  approvedBy: string
  priority: 'ด่วนมาก' | 'ด่วน' | 'ปกติ'
  note: string
}

type BaseResponse<T> = { data: T }

type ProfileRequestItem = {
  id: string
  requested_data: Record<string, unknown> | null
  reason: string | null
  status: 'pending' | 'approved' | 'rejected'
  comment: string | null
  created_at: string
}

function toThaiDate(value: string | null | undefined) {
  if (!value) return '-'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return '-'
  return d.toLocaleDateString('th-TH', { timeZone: 'Asia/Bangkok' })
}

function toThaiStatus(status: ProfileRequestItem['status']): ApprovalRequest['status'] {
  if (status === 'approved') return 'อนุมัติแล้ว'
  if (status === 'rejected') return 'ปฏิเสธ'
  return 'รออนุมัติ'
}

export function useApprovalsData() {
  const rows = ref<ApprovalRequest[]>([])

  if (import.meta.client) {
    ensureTeacherSession().then(async (session) => {
      const teacherID = session?.teacher?.id
      const token = useCookie<string | null>('edu_teacher_token')
      if (!teacherID || !token.value) {
        rows.value = []
        return
      }

      const headers = { Authorization: `Bearer ${token.value}` }
      const config = useRuntimeConfig()

      try {
        const res = await $fetch<BaseResponse<ProfileRequestItem[]>>(`${config.public.apiBase}/teachers/${teacherID}/profile-requests`, { headers })
        const items = res.data || []
        rows.value = items.map((item) => {
          const requestedData = item.requested_data || {}
          const keys = Object.keys(requestedData)
          return {
            id: item.id,
            type: 'คำขอแก้ไขข้อมูล',
            detail: keys.length > 0 ? `แก้ไข ${keys.join(', ')}` : 'คำขอแก้ไขข้อมูล',
            editTargets: keys,
            changeSummary: keys.length > 0 ? keys.map(key => `${key} = ${String((requestedData as any)[key] ?? '-')}`).join(', ') : '',
            reason: item.reason || '',
            submittedAt: toThaiDate(item.created_at),
            status: toThaiStatus(item.status),
            approvedBy: '',
            priority: 'ปกติ',
            note: item.comment || '',
          }
        })
      }
      catch {
        rows.value = []
      }
    }).catch(() => {
      rows.value = []
    })
  }

  return { rows }
}
