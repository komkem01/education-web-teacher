import { ref } from 'vue'
import { ensureTeacherSession } from './useTeacherSession'

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

type BaseResponse<T> = { data: T }

type SchoolAnnouncementItem = {
  id: string
  title: string | null
  content: string | null
  target: string | null
  is_active: boolean
  created_at: string
}

function toThaiDate(value: string | null | undefined) {
  if (!value) return '-'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return '-'
  return d.toLocaleDateString('th-TH', { timeZone: 'Asia/Bangkok' })
}

function categoryFromTarget(target: string | null | undefined) {
  const raw = (target || '').toLowerCase()
  if (raw.includes('teacher')) return 'ครู'
  if (raw.includes('student')) return 'นักเรียน'
  if (raw.includes('parent')) return 'ผู้ปกครอง'
  return 'ทั่วไป'
}

export function useAnnouncementsData() {
  const rows = ref<AnnouncementRow[]>([])

  if (import.meta.client) {
    ensureTeacherSession().then(async () => {
      const token = useCookie<string | null>('edu_teacher_token')
      if (!token.value) {
        rows.value = []
        return
      }

      const headers = { Authorization: `Bearer ${token.value}` }
      const config = useRuntimeConfig()

      try {
        const res = await $fetch<BaseResponse<SchoolAnnouncementItem[]>>(`${config.public.apiBase}/teachers-meta/school-announcements?only_active=true`, { headers })
        const items = res.data || []
        rows.value = items.map((item) => ({
          id: item.id,
          title: item.title?.trim() || 'ประกาศ',
          category: categoryFromTarget(item.target),
          publishedAt: toThaiDate(item.created_at),
          author: 'ฝ่ายบริหาร',
          status: item.is_active ? 'เผยแพร่แล้ว' : 'ฉบับร่าง',
          pinned: false,
          summary: item.content?.trim() || '-',
        }))
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
