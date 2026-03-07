<template>
  <div class="page">
    <TeacherAppSkeletonLoader v-if="loading" :rows="5" :cols="6" />
    <template v-else>
      <div class="page-header">
        <div>
          <h2 class="page-title">รายวิชาของฉัน</h2>
          <p class="page-desc">รายวิชาที่ฉันเปิดสอนในภาคเรียนนี้</p>
        </div>
        <button type="button" class="btn btn-primary" @click="showAddModal = true">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1v12M1 7h12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
          เปิดรายวิชาใหม่
        </button>
      </div>

      <div class="filter-row">
        <div class="search-wrap">
          <svg class="search-icon" width="15" height="15" viewBox="0 0 15 15" fill="none"><circle cx="6.5" cy="6.5" r="4.5" stroke="#9ca3af" stroke-width="1.4"/><path d="M10 10l3 3" stroke="#9ca3af" stroke-width="1.4" stroke-linecap="round"/></svg>
          <input v-model="search" class="input search" type="text" placeholder="ค้นหาชื่อวิชา..." autocomplete="off" />
        </div>
        <select v-model="filterStatus" class="input sel">
          <option value="">สถานะทั้งหมด</option>
          <option>เปิดสอน</option>
          <option>รออนุมัติ</option>
          <option>ปิดสอน</option>
        </select>
        <button v-if="search || filterStatus" type="button" class="btn btn-clear" @click="clearFilters">ล้างตัวกรอง</button>
      </div>

      <TeacherDataTable :title="`รายวิชาทั้งหมด (${filteredRows.length})`" :columns="cols" :rows="paginatedRows">
        <template #cell-status="{ value }">
          <TeacherStatusBadge :label="value" :variant="statusVariant(value)" />
        </template>
        <template #rowActions="{ row }">
          <div class="action-btns">
            <NuxtLink :to="`/teacher/courses/${(row as CourseRow).id}`" class="btn btn-sm btn-detail">รายละเอียด</NuxtLink>
            <button type="button" class="btn btn-sm btn-edit" @click="openEdit(row as CourseRow)">ขอแก้ไขข้อมูล</button>
          </div>
        </template>
      </TeacherDataTable>

      <div class="pagination-row">
        <div class="pagination-info">
          แสดง {{ pageStart }}-{{ pageEnd }} จากทั้งหมด {{ filteredRows.length }} รายการ
        </div>
        <div class="pagination-controls">
          <label class="page-size-label">
            <span>ต่อหน้า</span>
            <select v-model.number="pageSize" class="page-size-select">
              <option v-for="size in pageSizeOptions" :key="size" :value="size">{{ size }}</option>
            </select>
          </label>
          <button type="button" class="page-btn" :disabled="currentPage === 1" @click="goPrevPage">ก่อนหน้า</button>
          <span class="page-indicator">หน้า {{ currentPage }} / {{ totalPages }}</span>
          <button type="button" class="page-btn" :disabled="currentPage === totalPages" @click="goNextPage">ถัดไป</button>
        </div>
      </div>
    </template>

    <!-- Add Course Modal -->
    <TeacherAppModal v-model="showAddModal" title="เปิดรายวิชาใหม่" size="md" confirm-label="ส่งคำขอ" @confirm="submitAdd">
      <div class="form-body">
        <div class="form-note">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="6" stroke="#d97706" stroke-width="1.3"/><path d="M7 4v4M7 9.5v.5" stroke="#d97706" stroke-width="1.4" stroke-linecap="round"/></svg>
          การเปิดรายวิชาใหม่จะต้องรอการอนุมัติจากบุคลากร
        </div>
        <div class="form-row">
          <label class="form-label">ชื่อวิชา <span class="req">*</span></label>
          <input v-model="addForm.name" class="input" type="text" placeholder="เช่น คณิตศาสตร์พื้นฐาน ม.3/1" />
        </div>
        <div class="form-row">
          <label class="form-label">กลุ่มสาระ <span class="req">*</span></label>
          <select v-model="addForm.subject" class="input">
            <option value="">เลือกกลุ่มสาระ</option>
            <option>ภาษาไทย</option><option>คณิตศาสตร์</option><option>วิทยาศาสตร์</option>
            <option>สังคมศึกษา</option><option>ภาษาต่างประเทศ</option><option>ศิลปะ</option><option>พลศึกษา</option>
          </select>
        </div>
        <div class="form-grid-2">
          <div class="form-row">
            <label class="form-label">ระดับชั้น</label>
            <input v-model="addForm.level" class="input" type="text" placeholder="เช่น ม.3" />
          </div>
          <div class="form-row">
            <label class="form-label">หน่วยกิต</label>
            <input v-model="addForm.credits" class="input" type="number" placeholder="1.5" step="0.5" min="0.5" max="4" />
          </div>
        </div>
        <div class="form-row">
          <label class="form-label">ห้องเรียน</label>
          <input v-model="addForm.room" class="input" type="text" placeholder="เช่น 301" />
        </div>
      </div>
    </TeacherAppModal>

    <!-- Edit Course Modal -->
    <TeacherAppModal v-model="showEditModal" title="ขอแก้ไขรายวิชา" size="md" confirm-label="ส่งคำขอแก้ไข" @confirm="submitEdit">
      <div class="form-body">
        <div class="form-note">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="6" stroke="#d97706" stroke-width="1.3"/><path d="M7 4v4M7 9.5v.5" stroke="#d97706" stroke-width="1.4" stroke-linecap="round"/></svg>
          การแก้ไขรายวิชาต้องรอการอนุมัติจากบุคลากร
        </div>
        <div class="form-row" v-if="editRow">
          <label class="form-label">รหัสวิชา</label>
          <span class="id-badge">{{ editRow.id }}</span>
        </div>
        <div class="form-row">
          <label class="form-label">ส่วนที่ต้องการแก้ไข <span class="req">*</span></label>
          <div class="check-grid">
            <label v-for="opt in editTargetOptions" :key="opt.value" class="check-item">
              <input
                :checked="editTargets.includes(opt.value)"
                type="checkbox"
                @change="toggleEditTarget(opt.value)"
              />
              <span>{{ opt.label }}</span>
            </label>
          </div>
        </div>
        <div v-if="editTargets.includes('other')" class="form-row">
          <label class="form-label">ระบุส่วนอื่นๆ ที่ต้องการแก้ไข <span class="req">*</span></label>
          <input v-model="editOtherDetail" class="input" type="text" placeholder="เช่น ตารางเวลาเรียน / จำนวนผู้เรียน" />
        </div>
        <div v-if="editTargets.includes('name')" class="form-row">
          <label class="form-label">ข้อมูลใหม่: ชื่อวิชา <span class="req">*</span></label>
          <input v-model="editRequestValues.name" class="input" type="text" placeholder="ระบุชื่อวิชาใหม่" />
        </div>
        <div v-if="editTargets.includes('subject')" class="form-row">
          <label class="form-label">ข้อมูลใหม่: กลุ่มสาระ <span class="req">*</span></label>
          <input v-model="editRequestValues.subject" class="input" type="text" placeholder="ระบุกลุ่มสาระใหม่" />
        </div>
        <div v-if="editTargets.includes('level')" class="form-row">
          <label class="form-label">ข้อมูลใหม่: ระดับชั้น <span class="req">*</span></label>
          <input v-model="editRequestValues.level" class="input" type="text" placeholder="เช่น ม.3" />
        </div>
        <div v-if="editTargets.includes('room')" class="form-row">
          <label class="form-label">ข้อมูลใหม่: ห้องเรียน <span class="req">*</span></label>
          <input v-model="editRequestValues.room" class="input" type="text" placeholder="เช่น 301" />
        </div>
        <div v-if="editTargets.includes('credits')" class="form-row">
          <label class="form-label">ข้อมูลใหม่: หน่วยกิต <span class="req">*</span></label>
          <input v-model="editRequestValues.credits" class="input" type="number" min="0.5" step="0.5" placeholder="เช่น 1.5" />
        </div>
        <div v-if="editTargets.includes('semester')" class="form-row">
          <label class="form-label">ข้อมูลใหม่: ภาคเรียน <span class="req">*</span></label>
          <input v-model="editRequestValues.semester" class="input" type="text" placeholder="เช่น 1/2568" />
        </div>
        <div class="form-row">
          <label class="form-label">เหตุผลในการแก้ไข <span class="req">*</span></label>
          <textarea v-model="editForm.reason" class="input textarea" rows="3" placeholder="ระบุเหตุผล..." />
        </div>
        <div v-if="editTargets.length || editForm.reason.trim()" class="summary-box">
          <div class="summary-title">สรุปคำขอ</div>
          <div class="summary-line"><span class="summary-label">ส่วนที่ขอแก้ไข:</span> {{ selectedEditTargetLabels || '-' }}</div>
          <div class="summary-line"><span class="summary-label">ข้อมูลใหม่:</span> {{ selectedChangeSummary || '-' }}</div>
          <div class="summary-line"><span class="summary-label">เหตุผล:</span> {{ editForm.reason.trim() || '-' }}</div>
        </div>
        <p v-if="editSubmitAttempted && !isEditRequestValid" class="form-error">กรุณาเลือกส่วนที่ต้องการแก้ไข กรอกข้อมูลใหม่ในทุกส่วน และระบุเหตุผลให้ครบถ้วน</p>
      </div>
    </TeacherAppModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useCoursesData, type CourseRow } from '~/composables/useCoursesData'

definePageMeta({ layout: 'teacher' })

const { loading } = usePageLoad()
const { rows } = useCoursesData()

const search = ref('')
const filterStatus = ref('')
const showAddModal = ref(false)
const showEditModal = ref(false)
const editRow = ref<CourseRow | null>(null)
const currentPage = ref(1)
const pageSize = ref(10)
const pageSizeOptions = [10, 20, 50]
const editTargets = ref<string[]>([])
const editOtherDetail = ref('')
const editSubmitAttempted = ref(false)
const editRequestValues = ref<Record<string, string>>({
  name: '',
  subject: '',
  level: '',
  room: '',
  credits: '',
  semester: '',
})

const addForm = ref({ name: '', subject: '', level: '', credits: 1.5, room: '' })
const editForm = ref({ name: '', room: '', reason: '' })

const editTargetOptions = [
  { value: 'name', label: 'ชื่อวิชา' },
  { value: 'subject', label: 'กลุ่มสาระ' },
  { value: 'level', label: 'ระดับชั้น' },
  { value: 'room', label: 'ห้องเรียน' },
  { value: 'credits', label: 'หน่วยกิต' },
  { value: 'semester', label: 'ภาคเรียน' },
  { value: 'other', label: 'อื่นๆ' },
]

const cols = [
  { key: 'id', label: 'รหัส' },
  { key: 'name', label: 'ชื่อวิชา' },
  { key: 'subject', label: 'กลุ่มสาระ' },
  { key: 'level', label: 'ระดับ' },
  { key: 'credits', label: 'หน่วยกิต' },
  { key: 'students', label: 'นักเรียน' },
  { key: 'room', label: 'ห้อง' },
  { key: 'status', label: 'สถานะ' },
]

const filteredRows = computed(() =>
  rows.value.filter((r: CourseRow) => {
    const q = search.value.toLowerCase()
    const matchSearch = !q || r.name.toLowerCase().includes(q)
    const matchStatus = !filterStatus.value || r.status === filterStatus.value
    return matchSearch && matchStatus
  }),
)

const totalPages = computed(() => Math.max(1, Math.ceil(filteredRows.value.length / pageSize.value)))

const paginatedRows = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredRows.value.slice(start, start + pageSize.value)
})

const pageStart = computed(() => {
  if (!filteredRows.value.length) return 0
  return (currentPage.value - 1) * pageSize.value + 1
})

const pageEnd = computed(() => {
  if (!filteredRows.value.length) return 0
  return Math.min(currentPage.value * pageSize.value, filteredRows.value.length)
})

watch([search, filterStatus, pageSize], () => {
  currentPage.value = 1
})

watch([filteredRows, totalPages], () => {
  if (currentPage.value > totalPages.value) currentPage.value = totalPages.value
})

const isEditRequestValid = computed(() => {
  const hasTarget = editTargets.value.length > 0
  const hasReason = editForm.value.reason.trim().length > 0
  const hasOtherDetail = !editTargets.value.includes('other') || editOtherDetail.value.trim().length > 0
  const hasAllTargetValues = editTargets.value
    .filter(value => value !== 'other')
    .every(value => (editRequestValues.value[value] ?? '').trim().length > 0)
  return hasTarget && hasReason && hasOtherDetail && hasAllTargetValues
})

const selectedEditTargetLabels = computed(() =>
  editTargets.value
    .map((value) => {
      if (value === 'other') {
        const detail = editOtherDetail.value.trim()
        return detail ? `อื่นๆ (${detail})` : 'อื่นๆ'
      }
      return editTargetOptions.find(opt => opt.value === value)?.label ?? value
    })
    .join(', '),
)

const selectedChangeSummary = computed(() =>
  editTargets.value
    .filter(value => value !== 'other')
    .map((value) => {
      const label = editTargetOptions.find(opt => opt.value === value)?.label ?? value
      const nextValue = (editRequestValues.value[value] ?? '').trim()
      return nextValue ? `${label} = ${nextValue}` : ''
    })
    .filter(Boolean)
    .join(', '),
)

function statusVariant(s: string) {
  if (s === 'เปิดสอน') return 'success'
  if (s === 'รออนุมัติ') return 'warning'
  return 'neutral'
}

function openEdit(row: CourseRow) {
  editRow.value = row
  editForm.value = { name: row.name, room: row.room, reason: '' }
  editRequestValues.value = {
    name: String(row.name ?? ''),
    subject: String((row as unknown as Record<string, unknown>).subject ?? ''),
    level: String((row as unknown as Record<string, unknown>).level ?? ''),
    room: String(row.room ?? ''),
    credits: String((row as unknown as Record<string, unknown>).credits ?? ''),
    semester: String((row as unknown as Record<string, unknown>).semester ?? ''),
  }
  editTargets.value = []
  editOtherDetail.value = ''
  editSubmitAttempted.value = false
  showEditModal.value = true
}

function toggleEditTarget(value: string) {
  if (editTargets.value.includes(value)) {
    editTargets.value = editTargets.value.filter(v => v !== value)
    if (value === 'other') editOtherDetail.value = ''
    return
  }
  editTargets.value = [...editTargets.value, value]
}

function submitAdd() {
  showAddModal.value = false
  addForm.value = { name: '', subject: '', level: '', credits: 1.5, room: '' }
}

function submitEdit() {
  editSubmitAttempted.value = true
  if (!isEditRequestValid.value) return

  const requestPayload = {
    requestType: 'course-update',
    courseId: editRow.value?.id ?? '',
    targets: editTargets.value,
    targetLabels: selectedEditTargetLabels.value,
    reason: editForm.value.reason.trim(),
    requestedChanges: editTargets.value
      .filter(value => value !== 'other')
      .reduce((acc, value) => {
        acc[value] = (editRequestValues.value[value] ?? '').trim()
        return acc
      }, {} as Record<string, string>),
    otherDetail: editTargets.value.includes('other') ? editOtherDetail.value.trim() : '',
  }
  // TODO: send requestPayload to API when endpoint is ready.
  void requestPayload

  showEditModal.value = false
  editRequestValues.value = { name: '', subject: '', level: '', room: '', credits: '', semester: '' }
  editTargets.value = []
  editOtherDetail.value = ''
  editSubmitAttempted.value = false
}

function clearFilters() {
  search.value = ''
  filterStatus.value = ''
}

function goPrevPage() {
  if (currentPage.value > 1) currentPage.value -= 1
}

function goNextPage() {
  if (currentPage.value < totalPages.value) currentPage.value += 1
}
</script>

<style scoped>
.page { display: flex; flex-direction: column; gap: 0; }
.page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; flex-wrap: wrap; gap: 12px; }
.page-title { font-size: 1.3rem; font-weight: 700; color: #111827; margin: 0 0 4px; }
.page-desc { font-size: 0.875rem; color: #6b7280; margin: 0; }
.filter-row { display: flex; align-items: center; gap: 10px; margin-bottom: 20px; flex-wrap: wrap; }
.search-wrap { position: relative; flex: 1; min-width: 200px; }
.search-icon { position: absolute; left: 10px; top: 50%; transform: translateY(-50%); }
.input { width: 100%; padding: 8px 12px; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 0.875rem; font-family: inherit; color: #111827; background: #fff; outline: none; transition: border-color 0.15s; }
.input:focus { border-color: #16a34a; }
.search { padding-left: 34px; }
.sel { width: auto; min-width: 160px; flex: none; }
.textarea { resize: vertical; min-height: 72px; }
.btn { display: inline-flex; align-items: center; gap: 6px; border-radius: 7px; padding: 7px 14px; font-size: 0.875rem; font-weight: 500; cursor: pointer; border: 1px solid transparent; font-family: inherit; transition: background 0.12s; white-space: nowrap; }
.btn-sm { padding: 5px 10px; font-size: 0.8rem; }
.btn-primary { background: #16a34a; color: #fff; border-color: #16a34a; }
.btn-primary:hover { background: #15803d; }
.btn-clear { background: #fff; color: #6b7280; border-color: #e5e7eb; }
.btn-clear:hover { background: #f9fafb; }
.btn-detail { background: #fff; color: #374151; border-color: #e5e7eb; }
.btn-detail:hover { background: #f9fafb; }
.btn-edit { background: #eff6ff; color: #1d4ed8; border-color: #bfdbfe; }
.btn-edit:hover { background: #dbeafe; }
.action-btns { display: flex; gap: 6px; justify-content: flex-end; flex-wrap: nowrap; }
.pagination-row { margin-top: 12px; display: flex; align-items: center; justify-content: space-between; gap: 10px; flex-wrap: wrap; }
.pagination-info { font-size: 0.8rem; color: #6b7280; }
.pagination-controls { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.page-size-label { display: inline-flex; align-items: center; gap: 6px; font-size: 0.8rem; color: #6b7280; }
.page-size-select { border: 1px solid #e5e7eb; border-radius: 8px; padding: 6px 10px; font-size: 0.82rem; color: #374151; background: #fff; font-family: inherit; }
.page-size-select:focus { outline: none; border-color: #16a34a; }
.page-btn { border: 1px solid #e5e7eb; background: #fff; color: #374151; border-radius: 8px; padding: 6px 10px; font-size: 0.82rem; font-weight: 500; cursor: pointer; font-family: inherit; }
.page-btn:hover:not(:disabled) { background: #f9fafb; }
.page-btn:disabled { opacity: .5; cursor: not-allowed; }
.page-indicator { font-size: 0.8rem; color: #374151; font-weight: 600; }
.form-body { display: flex; flex-direction: column; gap: 16px; }
.form-note { display: flex; align-items: center; gap: 6px; background: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 10px 14px; font-size: 0.82rem; color: #92400e; }
.form-row { display: flex; flex-direction: column; gap: 6px; }
.form-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.form-label { font-size: 0.82rem; font-weight: 600; color: #374151; }
.req { color: #dc2626; }
.id-badge { background: #f3f4f6; border: 1px solid #e5e7eb; border-radius: 6px; padding: 4px 10px; font-size: 0.82rem; font-family: monospace; color: #374151; display: inline-block; }
.check-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px 12px; }
.check-item { display: inline-flex; align-items: center; gap: 8px; font-size: 0.83rem; color: #374151; }
.check-item input { margin: 0; accent-color: #16a34a; }
.summary-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px 12px; display: flex; flex-direction: column; gap: 6px; }
.summary-title { font-size: 0.8rem; font-weight: 700; color: #334155; }
.summary-line { font-size: 0.82rem; color: #475569; line-height: 1.45; }
.summary-label { font-weight: 600; color: #334155; }
.form-error { margin: -6px 0 0; font-size: 0.8rem; color: #dc2626; font-weight: 500; }

@media (max-width: 760px) {
  .pagination-row { align-items: flex-start; }
  .pagination-controls { width: 100%; }
}
</style>
