<template>
  <div class="page">
    <TeacherAppSkeletonLoader v-if="loading" :rows="6" :cols="5" />
    <template v-else>
      <div class="page-header">
        <div>
          <h2 class="page-title">เช็คชื่อนักเรียน</h2>
          <p class="page-desc">เลือกวันที่และห้อง จากนั้นกดสถานะได้ทันทีทีละคนหรือทั้งห้อง</p>
        </div>
      </div>

      <div class="control-card section-gap">
        <div class="control-grid">
          <div class="control-item">
            <label class="form-label">วันที่</label>
            <input v-model="selectedDate" class="input" type="date" />
          </div>
          <div class="control-item">
            <label class="form-label">ห้องเรียน / รายวิชา</label>
            <select v-model="selectedClassroom" class="input">
              <option value="">เลือกห้อง</option>
              <option v-for="room in classroomOptions" :key="room" :value="room">{{ room }}</option>
            </select>
          </div>
          <div class="control-item control-item--wide">
            <label class="form-label">ค้นหานักเรียน</label>
            <input v-model="search" class="input" type="text" placeholder="พิมพ์ชื่อหรือนามสกุล..." />
          </div>
        </div>

        <div class="bulk-row">
          <span class="bulk-label">ตั้งสถานะทั้งห้อง:</span>
          <button type="button" class="bulk-btn bulk-btn--green" @click="applyAllStatus('มา')">มา</button>
          <button type="button" class="bulk-btn bulk-btn--red" @click="applyAllStatus('ขาด')">ขาด</button>
          <button type="button" class="bulk-btn bulk-btn--yellow" @click="applyAllStatus('ลา')">ลา</button>
          <button type="button" class="bulk-btn bulk-btn--orange" @click="applyAllStatus('สาย')">สาย</button>
        </div>
      </div>

      <div class="summary-grid section-gap">
        <div class="sum-card sum-card--green"><span>มาเรียน</span><strong>{{ presentCount }}</strong></div>
        <div class="sum-card sum-card--red"><span>ขาด</span><strong>{{ absentCount }}</strong></div>
        <div class="sum-card sum-card--yellow"><span>ลา</span><strong>{{ leaveCount }}</strong></div>
        <div class="sum-card sum-card--orange"><span>สาย</span><strong>{{ lateCount }}</strong></div>
      </div>

      <div class="attendance-card">
        <div class="list-head">
          <div class="lh-title">รายชื่อเช็คชื่อ</div>
          <div class="lh-meta">{{ displayRecords.length }} คน</div>
        </div>

        <div v-if="!selectedClassroom" class="empty-state">กรุณาเลือกห้องเรียนเพื่อเริ่มเช็คชื่อ</div>
        <div v-else-if="displayRecords.length === 0" class="empty-state">ไม่พบรายชื่อนักเรียนตามคำค้นหา</div>

        <div v-else class="student-list">
          <div v-for="rec in displayRecords" :key="rec.id" class="student-row" :class="rowClass(rec.status)">
            <div class="student-main">
              <div class="student-name">{{ rec.studentName }}</div>
              <div class="student-code">{{ rec.studentCode }}</div>
            </div>

            <div class="status-switch">
              <button
                v-for="opt in statusOptions"
                :key="opt.value"
                type="button"
                class="status-btn"
                :class="{ 'status-btn--active': rec.status === opt.value, [`status-btn--${opt.color}`]: rec.status === opt.value }"
                @click="setStatus(rec, opt.value as AttendanceRecord['status'])"
              >
                {{ opt.label }}
              </button>
            </div>

            <input v-model="rec.note" class="note-input" type="text" placeholder="หมายเหตุ (ถ้ามี)" />
          </div>
        </div>
      </div>

      <div class="save-row">
        <button type="button" class="btn btn-primary" :disabled="!selectedClassroom || displayRecords.length === 0" @click="openSaveConfirm">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7.5l3 3 6-6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
          บันทึกการเช็คชื่อ
        </button>
      </div>

      <div v-if="lastSavedText" class="save-hint">{{ lastSavedText }} · ยังสามารถแก้ไขการเช็คชื่อและบันทึกใหม่ได้ตลอดเวลา</div>
      <div v-if="isDirtySinceLastSave" class="dirty-hint">มีการแก้ไขข้อมูลหลังบันทึกล่าสุด · กรุณากดบันทึกอีกครั้ง</div>
    </template>

    <TeacherAppModal
      v-model="showSaveConfirm"
      title="ยืนยันการบันทึกเช็คชื่อ"
      size="sm"
      confirm-label="ยืนยันบันทึก"
      @confirm="confirmSaveAttendance"
    >
      <div class="confirm-body">
        <p class="confirm-text">ต้องการบันทึกการเช็คชื่อของห้องนี้ใช่หรือไม่</p>
        <div class="confirm-list">
          <div class="confirm-item"><span>วันที่</span><strong>{{ selectedDate }}</strong></div>
          <div class="confirm-item"><span>ห้องเรียน/รายวิชา</span><strong>{{ selectedClassroom || '-' }}</strong></div>
          <div class="confirm-item"><span>จำนวนรายการ</span><strong>{{ displayRecords.length }} คน</strong></div>
          <div class="confirm-item"><span>สรุปสถานะ</span><strong>มา {{ presentCount }} · ขาด {{ absentCount }} · ลา {{ leaveCount }} · สาย {{ lateCount }}</strong></div>
        </div>
      </div>
    </TeacherAppModal>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useAttendanceData, type AttendanceRecord } from '~/composables/useAttendanceData'

definePageMeta({ layout: 'teacher' })

const { loading } = usePageLoad()
const { records } = useAttendanceData()

const selectedDate = ref('2026-03-08')
const selectedClassroom = ref('')
const search = ref('')
const showSaveConfirm = ref(false)
const lastSavedText = ref('')
const lastSavedSnapshot = ref('')

const classroomOptions = [
  'ม.3/1 · คณิตศาสตร์พื้นฐาน',
  'ม.3/2 · คณิตศาสตร์พื้นฐาน',
  'ม.6/1 · แคลคูลัสเบื้องต้น',
]

const statusOptions = [
  { value: 'มา', label: 'มา', color: 'green' },
  { value: 'ขาด', label: 'ขาด', color: 'red' },
  { value: 'ลา', label: 'ลา', color: 'yellow' },
  { value: 'สาย', label: 'สาย', color: 'orange' },
]

const displayRecords = computed(() => {
  if (!selectedClassroom.value) return []
  const q = search.value.trim().toLowerCase()
  if (!q) return records.value
  return records.value.filter(r => r.studentName.toLowerCase().includes(q))
})

const presentCount = computed(() => displayRecords.value.filter(r => r.status === 'มา').length)
const absentCount = computed(() => displayRecords.value.filter(r => r.status === 'ขาด').length)
const leaveCount = computed(() => displayRecords.value.filter(r => r.status === 'ลา').length)
const lateCount = computed(() => displayRecords.value.filter(r => r.status === 'สาย').length)

const editableRecords = computed(() => (selectedClassroom.value ? records.value : []))

const currentSnapshot = computed(() => {
  const normalizedRows = editableRecords.value
    .map((r) => ({ id: r.id, status: r.status, note: (r.note ?? '').trim() }))
    .sort((a, b) => String(a.id).localeCompare(String(b.id)))
  return JSON.stringify({
    selectedDate: selectedDate.value,
    selectedClassroom: selectedClassroom.value,
    rows: normalizedRows,
  })
})

const isDirtySinceLastSave = computed(() =>
  lastSavedSnapshot.value.length > 0 && currentSnapshot.value !== lastSavedSnapshot.value,
)

function setStatus(rec: AttendanceRecord, status: AttendanceRecord['status']) {
  rec.status = status
}

function applyAllStatus(status: AttendanceRecord['status']) {
  if (!selectedClassroom.value) return
  displayRecords.value.forEach((rec) => {
    rec.status = status
  })
}

function rowClass(status: string) {
  if (status === 'ขาด') return 'row-absent'
  if (status === 'ลา') return 'row-leave'
  if (status === 'สาย') return 'row-late'
  return 'row-present'
}

function saveAttendance() {
  // In production: POST to API with selectedDate + selectedClassroom + displayRecords
}

function openSaveConfirm() {
  if (!selectedClassroom.value || displayRecords.value.length === 0) return
  showSaveConfirm.value = true
}

function confirmSaveAttendance() {
  saveAttendance()
  showSaveConfirm.value = false
  lastSavedSnapshot.value = currentSnapshot.value
  const now = new Date()
  lastSavedText.value = `บันทึกล่าสุด ${now.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}`
}
</script>

<style scoped>
.page { display: flex; flex-direction: column; gap: 0; }
.page-header { margin-bottom: 24px; }
.page-title { font-size: 1.3rem; font-weight: 700; color: #111827; margin: 0 0 4px; }
.page-desc { font-size: 0.875rem; color: #6b7280; margin: 0; }
.section-gap { margin-bottom: 18px; }

.control-card { background: #fff; border: 1px solid #e8eaed; border-radius: 14px; padding: 16px; display: flex; flex-direction: column; gap: 14px; }
.control-grid { display: grid; grid-template-columns: 180px 280px 1fr; gap: 12px; }
.control-item { display: flex; flex-direction: column; gap: 6px; }
.control-item--wide { min-width: 0; }
.form-label { font-size: 0.78rem; font-weight: 600; color: #6b7280; }
.input { width: 100%; padding: 8px 12px; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 0.86rem; font-family: inherit; color: #111827; background: #fff; outline: none; }
.input:focus { border-color: #16a34a; }

.bulk-row { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.bulk-label { font-size: 0.8rem; color: #6b7280; font-weight: 600; }
.bulk-btn { border: 1px solid transparent; border-radius: 999px; padding: 5px 12px; font-size: 0.8rem; font-weight: 600; cursor: pointer; font-family: inherit; }
.bulk-btn--green { background: #f0fdf4; color: #166534; border-color: #bbf7d0; }
.bulk-btn--red { background: #fef2f2; color: #b91c1c; border-color: #fecaca; }
.bulk-btn--yellow { background: #fffbeb; color: #b45309; border-color: #fde68a; }
.bulk-btn--orange { background: #fff7ed; color: #c2410c; border-color: #fed7aa; }

.summary-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 10px; }
.sum-card { border-radius: 12px; border: 1px solid transparent; padding: 10px 12px; display: flex; align-items: center; justify-content: space-between; font-size: 0.82rem; }
.sum-card strong { font-size: 1rem; }
.sum-card--green { background: #f0fdf4; color: #166534; border-color: #bbf7d0; }
.sum-card--red { background: #fef2f2; color: #b91c1c; border-color: #fecaca; }
.sum-card--yellow { background: #fffbeb; color: #b45309; border-color: #fde68a; }
.sum-card--orange { background: #fff7ed; color: #c2410c; border-color: #fed7aa; }

.attendance-card { background: #fff; border: 1px solid #e8eaed; border-radius: 14px; overflow: hidden; margin-bottom: 18px; }
.list-head { display: flex; align-items: center; justify-content: space-between; padding: 12px 14px; border-bottom: 1px solid #f1f3f4; background: #f9fafb; }
.lh-title { font-size: 0.86rem; font-weight: 700; color: #374151; }
.lh-meta { font-size: 0.78rem; color: #9ca3af; }
.empty-state { padding: 34px 18px; text-align: center; color: #9ca3af; font-size: 0.88rem; }

.student-list { display: flex; flex-direction: column; }
.student-row { display: grid; grid-template-columns: minmax(180px, 1fr) minmax(220px, 300px) minmax(180px, 1fr); gap: 10px; align-items: center; padding: 10px 12px; border-bottom: 1px solid #f8fafc; }
.student-row:last-child { border-bottom: none; }
.row-present { background: #ffffff; }
.row-absent { background: #fff7f7; }
.row-leave { background: #fffcf2; }
.row-late { background: #fff9f3; }

.student-main { display: flex; flex-direction: column; gap: 2px; }
.student-name { font-size: 0.88rem; color: #111827; font-weight: 600; }
.student-code { font-size: 0.78rem; color: #9ca3af; font-family: monospace; }

.status-switch { display: flex; gap: 5px; flex-wrap: wrap; }
.status-btn { border: 1px solid #e5e7eb; background: #fff; color: #6b7280; border-radius: 7px; padding: 4px 10px; font-size: 0.78rem; font-weight: 600; cursor: pointer; font-family: inherit; }
.status-btn--active { border-color: transparent; }
.status-btn--green { background: #f0fdf4; color: #166534; border-color: #bbf7d0; }
.status-btn--red { background: #fef2f2; color: #b91c1c; border-color: #fecaca; }
.status-btn--yellow { background: #fffbeb; color: #b45309; border-color: #fde68a; }
.status-btn--orange { background: #fff7ed; color: #c2410c; border-color: #fed7aa; }

.note-input { width: 100%; border: 1px solid #e5e7eb; border-radius: 7px; padding: 7px 10px; font-size: 0.8rem; font-family: inherit; color: #374151; background: #fff; outline: none; }
.note-input:focus { border-color: #16a34a; }

.save-row { display: flex; justify-content: flex-end; }
.save-hint { margin-top: 10px; font-size: 0.8rem; color: #15803d; }
.dirty-hint { margin-top: 6px; font-size: 0.8rem; color: #b45309; font-weight: 600; }
.btn { display: inline-flex; align-items: center; gap: 6px; border-radius: 8px; padding: 9px 20px; font-size: 0.875rem; font-weight: 500; cursor: pointer; border: 1px solid transparent; font-family: inherit; transition: background 0.12s; }
.btn-primary { background: #16a34a; color: #fff; border-color: #16a34a; }
.btn-primary:hover:not(:disabled) { background: #15803d; }
.btn-primary:disabled { opacity: .5; cursor: not-allowed; }

.confirm-body { display: flex; flex-direction: column; gap: 12px; }
.confirm-text { margin: 0; font-size: 0.86rem; color: #374151; }
.confirm-list { display: flex; flex-direction: column; gap: 8px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px 12px; }
.confirm-item { display: flex; justify-content: space-between; gap: 10px; font-size: 0.8rem; color: #64748b; }
.confirm-item strong { color: #334155; font-weight: 600; text-align: right; }

@media (max-width: 980px) {
  .control-grid { grid-template-columns: 1fr 1fr; }
  .control-item--wide { grid-column: 1 / -1; }
  .summary-grid { grid-template-columns: 1fr 1fr; }
  .student-row { grid-template-columns: 1fr; gap: 8px; padding: 12px; }
  .status-switch { order: 3; }
}
</style>
