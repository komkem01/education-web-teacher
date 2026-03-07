<template>
  <div class="page">
    <TeacherAppSkeletonLoader v-if="loading" :rows="6" :cols="5" />
    <template v-else>
      <div class="page-header">
        <div>
          <h2 class="page-title">ตารางสอน</h2>
          <p class="page-desc">ตารางสอนประจำสัปดาห์ของฉัน</p>
        </div>
      </div>

      <div class="toolbar">
        <div class="toolbar-left">
          <label class="toolbar-label" for="course-filter">กรองรายวิชา</label>
          <select id="course-filter" v-model="selectedCourseId" class="course-filter">
            <option value="">แสดงทุกรายวิชา</option>
            <option v-for="c in courseOptions" :key="c.courseId" :value="c.courseId">
              {{ c.courseId }} · {{ c.courseName }}
            </option>
          </select>
        </div>
        <div class="current-chip" :class="{ 'current-chip--active': !!currentPeriodNo }">
          <div class="current-main">{{ currentPeriodText }}</div>
          <div class="current-sub">{{ currentDayPeriodText }}</div>
        </div>
      </div>

      <div class="timetable-scroll">
        <table class="timetable">
          <thead>
            <tr>
              <th class="th-day-label">วัน / คาบ</th>
              <th
                v-for="p in periods"
                :key="p.no"
                class="th-period-col"
                :class="{ 'th-period-col--current': p.no === currentPeriodNo }"
              >
                <div class="period-no">คาบ {{ p.no }}</div>
                <div class="period-time">{{ p.start }} - {{ p.end }}</div>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="d in days" :key="d.key">
              <td class="td-day" :class="{ 'td-day--today': d.key === currentDayKey }">{{ d.label }}</td>
              <td
                v-for="p in periods"
                :key="p.no"
                class="td-slot"
                :class="{ 'td-slot--current': d.key === currentDayKey && p.no === currentPeriodNo }"
              >
                <div v-if="getSlot(d.key, p.no)" class="slot-box">
                  <div class="slot-course">{{ getSlot(d.key, p.no)!.courseName }}</div>
                  <div class="slot-room">ห้อง {{ getSlot(d.key, p.no)!.room }}</div>
                  <div class="slot-cls">{{ getSlot(d.key, p.no)!.classroom }}</div>
                </div>
                <div v-else class="slot-empty">-</div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="legend">
        <div class="legend-title">รายวิชาทั้งหมดที่สอน</div>
        <div class="legend-grid">
          <div v-for="c in courses" :key="c.courseId" class="legend-item">
            <div class="legend-dot"></div>
            <span class="lc-id">{{ c.courseId }}</span>
            <span class="lc-name">{{ c.courseName }}</span>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useTimetableData } from '~/composables/useTimetableData'

definePageMeta({ layout: 'teacher' })

const { loading } = usePageLoad()
const { slots } = useTimetableData()
const selectedCourseId = ref('')
const now = ref(new Date())

let clockTimer: ReturnType<typeof setInterval> | undefined

onMounted(() => {
  clockTimer = setInterval(() => {
    now.value = new Date()
  }, 30000)
})

onBeforeUnmount(() => {
  if (clockTimer) clearInterval(clockTimer)
})

const days = [
  { key: 'mon', label: 'จันทร์' },
  { key: 'tue', label: 'อังคาร' },
  { key: 'wed', label: 'พุธ' },
  { key: 'thu', label: 'พฤหัสบดี' },
  { key: 'fri', label: 'ศุกร์' },
]

const periods = [
  { no: 1, start: '08:30', end: '09:20' },
  { no: 2, start: '09:20', end: '10:10' },
  { no: 3, start: '10:10', end: '11:00' },
  { no: 4, start: '11:00', end: '11:50' },
  { no: 5, start: '12:40', end: '13:30' },
  { no: 6, start: '13:30', end: '14:20' },
  { no: 7, start: '14:20', end: '15:10' },
  { no: 8, start: '15:10', end: '16:00' },
]

function toMinutes(timeText: string) {
  const [h, m] = timeText.split(':').map(Number)
  return h * 60 + m
}

const nowMinutes = computed(() => now.value.getHours() * 60 + now.value.getMinutes())

const currentPeriodNo = computed(() => {
  const hit = periods.find((p) => {
    const start = toMinutes(p.start)
    const end = toMinutes(p.end)
    return nowMinutes.value >= start && nowMinutes.value < end
  })
  return hit?.no ?? null
})

const currentDayKey = computed(() => {
  const map = ['', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']
  return map[now.value.getDay()] || ''
})

const currentPeriodText = computed(() => {
  if (!currentPeriodNo.value) return 'นอกช่วงเวลาเรียน'
  const p = periods.find(x => x.no === currentPeriodNo.value)
  if (!p) return 'นอกช่วงเวลาเรียน'
  return `กำลังเรียนอยู่คาบ ${p.no} (${p.start} - ${p.end})`
})

const currentDayLabel = computed(() => {
  const found = days.find(d => d.key === currentDayKey.value)
  return found?.label ?? 'วันนี้'
})

const currentDayPeriodText = computed(() => {
  if (!currentPeriodNo.value) return `${currentDayLabel.value} · นอกเวลาเรียน`
  return `${currentDayLabel.value} · คาบ ${currentPeriodNo.value}`
})

const filteredSlots = computed(() => {
  if (!selectedCourseId.value) return slots.value
  return slots.value.filter(s => s.courseId === selectedCourseId.value)
})

const courseOptions = computed(() => {
  const seen = new Set<string>()
  return slots.value.filter((s) => {
    if (seen.has(s.courseId)) return false
    seen.add(s.courseId)
    return true
  })
})

function getSlot(day: string, period: number) {
  return filteredSlots.value.find(s => s.day === day && s.period === period) ?? null
}

const courses = computed(() => {
  const seen = new Set<string>()
  return slots.value.filter(s => { if (seen.has(s.courseId)) return false; seen.add(s.courseId); return true })
})
</script>

<style scoped>
.page { display: flex; flex-direction: column; gap: 0; }
.page-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 24px; }
.page-title { font-size: 1.3rem; font-weight: 700; color: #111827; margin: 0 0 4px; }
.page-desc { font-size: 0.875rem; color: #6b7280; margin: 0; }
.toolbar { display: flex; align-items: flex-end; justify-content: space-between; gap: 12px; margin-bottom: 14px; flex-wrap: wrap; }
.toolbar-left { display: flex; flex-direction: column; gap: 6px; }
.toolbar-label { font-size: 0.78rem; font-weight: 600; color: #6b7280; }
.course-filter { min-width: 250px; max-width: 360px; padding: 8px 10px; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 0.83rem; color: #111827; background: #fff; outline: none; font-family: inherit; }
.course-filter:focus { border-color: #16a34a; }
.current-chip { display: inline-flex; flex-direction: column; gap: 1px; color: #6b7280; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 7px 12px; }
.current-main { font-size: 0.8rem; font-weight: 700; }
.current-sub { font-size: 0.74rem; color: #94a3b8; }
.current-chip--active { color: #166534; background: #f0fdf4; border-color: #bbf7d0; }
.current-chip--active .current-sub { color: #16a34a; }
.timetable-scroll { overflow-x: auto; border-radius: 12px; border: 1px solid #f1f3f4; background: #fff; margin-bottom: 24px; }
.timetable { width: 100%; border-collapse: collapse; min-width: 980px; font-size: 0.82rem; }
.timetable th, .timetable td { border: 1px solid #f3f4f6; }
.th-day-label { min-width: 110px; background: #f9fafb; color: #6b7280; font-size: 0.75rem; font-weight: 700; text-align: center; padding: 12px 10px; }
.th-period-col { min-width: 110px; background: #f9fafb; text-align: center; padding: 10px 8px; }
.th-period-col--current { background: #ecfdf5; }
.period-no { font-size: 0.76rem; font-weight: 700; color: #374151; }
.period-time { font-size: 0.72rem; color: #9ca3af; margin-top: 2px; white-space: nowrap; }
.td-day { text-align: center; color: #374151; font-weight: 700; background: #f9fafb; padding: 14px 10px; white-space: nowrap; }
.td-day--today { background: #f0fdf4; color: #166534; }
.td-slot { vertical-align: middle; padding: 8px; height: 80px; min-width: 110px; }
.td-slot--current { background: #f0fdf4; }
.slot-box { background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border: 1px solid #bbf7d0; border-radius: 8px; padding: 8px 10px; height: 100%; display: flex; flex-direction: column; justify-content: center; gap: 2px; }
.slot-course { font-size: 0.8rem; font-weight: 700; color: #15803d; line-height: 1.3; }
.slot-room { font-size: 0.72rem; color: #6b7280; }
.slot-cls { font-size: 0.72rem; color: #9ca3af; }
.slot-empty { display: flex; align-items: center; justify-content: center; height: 100%; color: #d1d5db; font-size: 0.9rem; }
.legend { background: #fff; border: 1px solid #f1f3f4; border-radius: 12px; padding: 20px; }
.legend-title { font-size: 0.82rem; font-weight: 700; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 12px; }
.legend-grid { display: flex; flex-wrap: wrap; gap: 12px; }
.legend-item { display: flex; align-items: center; gap: 6px; }
.legend-dot { width: 8px; height: 8px; border-radius: 50%; background: #16a34a; flex-shrink: 0; }
.lc-id { font-size: 0.75rem; font-weight: 700; color: #6b7280; font-family: monospace; }
.lc-name { font-size: 0.82rem; color: #374151; }

@media (max-width: 760px) {
  .toolbar { align-items: stretch; }
  .toolbar-left { width: 100%; }
  .course-filter { min-width: 100%; max-width: 100%; }
  .timetable { min-width: 900px; }
  .th-day-label, .td-day { min-width: 90px; }
  .th-period-col, .td-slot { min-width: 95px; }
}
</style>
