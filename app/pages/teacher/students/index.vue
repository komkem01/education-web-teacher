<template>
  <div class="page">
    <TeacherAppSkeletonLoader v-if="loading" :rows="5" :cols="5" />
    <template v-else>
      <div class="page-header">
        <div>
          <h2 class="page-title">ข้อมูลนักเรียน</h2>
          <p class="page-desc">นักเรียนในรายวิชาที่ฉันสอน · สามารถขอแก้ไขข้อมูลได้ผ่านระบบ</p>
        </div>
      </div>

      <div class="filter-row">
        <div class="search-wrap">
          <svg class="search-icon" width="15" height="15" viewBox="0 0 15 15" fill="none"><circle cx="6.5" cy="6.5" r="4.5" stroke="#9ca3af" stroke-width="1.4"/><path d="M10 10l3 3" stroke="#9ca3af" stroke-width="1.4" stroke-linecap="round"/></svg>
          <input v-model="search" class="input search" type="text" placeholder="ค้นหาชื่อหรือรหัสนักเรียน..." autocomplete="off" />
        </div>
        <select v-model="filterClassroom" class="input sel">
          <option value="">ห้องเรียนทั้งหมด</option>
          <option v-for="c in classrooms" :key="c">{{ c }}</option>
        </select>
        <select v-model="filterStatus" class="input sel">
          <option value="">สถานะทั้งหมด</option>
          <option>ปกติ</option><option>ลาพัก</option><option>รออนุมัติ</option>
        </select>
        <button v-if="search || filterClassroom || filterStatus" type="button" class="btn btn-clear" @click="clearFilters">ล้างตัวกรอง</button>
      </div>

      <TeacherDataTable :title="`รายชื่อนักเรียน (${filteredRows.length})`" :columns="cols" :rows="paginatedRows">
        <template #cell-status="{ value }">
          <TeacherStatusBadge :label="value" :variant="value === 'ปกติ' ? 'success' : value === 'ลาพัก' ? 'warning' : 'pending'" />
        </template>
        <template #rowActions="{ row }">
          <div class="action-btns">
            <NuxtLink :to="`/teacher/students/${(row as StudentRow).id}`" class="btn btn-sm btn-detail">รายละเอียด</NuxtLink>
            <button type="button" class="btn btn-sm btn-edit" @click="openRequestEdit(row as StudentRow)">ขอแก้ไขข้อมูล</button>
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

    <!-- Request Edit Modal -->
    <TeacherAppModal v-model="showRequestModal" title="ขอแก้ไขข้อมูลนักเรียน" size="md" confirm-label="ส่งคำขอ" @confirm="prepareRequestConfirm">
      <div class="form-body">
        <div class="form-note">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="6" stroke="#d97706" stroke-width="1.3"/><path d="M7 4v4M7 9.5v.5" stroke="#d97706" stroke-width="1.4" stroke-linecap="round"/></svg>
          คำขอแก้ไขข้อมูลนักเรียนต้องรอการอนุมัติจากบุคลากร
        </div>
        <div class="form-row" v-if="selectedStudent">
          <label class="form-label">นักเรียน</label>
          <span class="student-tag">{{ selectedStudent.name }} ({{ selectedStudent.code }})</span>
        </div>
        <div class="form-row">
          <label class="form-label">ส่วนที่ต้องการแก้ไข <span class="req">*</span></label>
          <select v-model="requestForm.field" class="input">
            <option value="">เลือกข้อมูล</option>
            <option>ที่อยู่</option><option>เบอร์โทรศัพท์ผู้ปกครอง</option>
            <option>ชื่อผู้ปกครอง</option><option>ข้อมูลสุขภาพ</option><option>อื่นๆ</option>
          </select>
        </div>
        <div v-if="requestForm.field === 'อื่นๆ'" class="form-row">
          <label class="form-label">ระบุส่วนที่ต้องการแก้ไข <span class="req">*</span></label>
          <input v-model="requestForm.otherPart" class="input" type="text" placeholder="เช่น วันเดือนปีเกิด / เลขบัตรประชาชน" />
        </div>
        <div class="form-row">
          <label class="form-label">รายละเอียดที่ต้องการแก้ไข <span class="req">*</span></label>
          <textarea v-model="requestForm.detail" class="input textarea" rows="3" placeholder="อธิบายสิ่งที่ต้องการเปลี่ยนแปลง..." />
        </div>
        <div v-if="requestForm.field || requestForm.detail.trim()" class="summary-box">
          <div class="summary-title">สรุปคำขอแก้ไข</div>
          <div class="summary-line"><span class="summary-label">ส่วนที่จะแก้ไข:</span> {{ selectedEditSection || '-' }}</div>
          <div class="summary-line"><span class="summary-label">รายละเอียด:</span> {{ requestForm.detail.trim() || '-' }}</div>
        </div>
        <p v-if="requestSubmitAttempted && !isRequestValid" class="form-error">กรุณาระบุส่วนที่จะแก้ไขและรายละเอียดให้ครบถ้วน</p>
      </div>
    </TeacherAppModal>

    <TeacherAppModal
      v-model="showRequestConfirmModal"
      title="ยืนยันการส่งคำขอแก้ไข"
      size="sm"
      confirm-label="ยืนยันส่งคำขอ"
      @confirm="submitRequest"
    >
      <div class="confirm-body">
        <p class="confirm-text">โปรดตรวจสอบข้อมูลก่อนยืนยันส่งคำขอ</p>
        <div class="confirm-list">
          <div class="confirm-item"><span>นักเรียน</span><strong>{{ selectedStudent ? `${selectedStudent.name} (${selectedStudent.code})` : '-' }}</strong></div>
          <div class="confirm-item"><span>ส่วนที่จะแก้ไข</span><strong>{{ selectedEditSection || '-' }}</strong></div>
          <div class="confirm-item"><span>รายละเอียด</span><strong>{{ requestForm.detail.trim() || '-' }}</strong></div>
        </div>
      </div>
    </TeacherAppModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useStudentsData, type StudentRow } from '~/composables/useStudentsData'

definePageMeta({ layout: 'teacher' })

const { loading } = usePageLoad()
const { rows } = useStudentsData()

const search = ref('')
const filterClassroom = ref('')
const filterStatus = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const showRequestModal = ref(false)
const showRequestConfirmModal = ref(false)
const selectedStudent = ref<StudentRow | null>(null)
const requestSubmitAttempted = ref(false)
const requestForm = ref({ field: '', otherPart: '', detail: '' })

const classrooms = computed(() => [...new Set(rows.value.map(r => r.classroom))])

const cols = [
  { key: 'code', label: 'รหัส' },
  { key: 'name', label: 'ชื่อ-สกุล' },
  { key: 'classroom', label: 'ห้องเรียน' },
  { key: 'guardian', label: 'ผู้ปกครอง' },
  { key: 'phone', label: 'โทร' },
  { key: 'status', label: 'สถานะ' },
]

const filteredRows = computed(() =>
  rows.value.filter((r: StudentRow) => {
    const q = search.value.toLowerCase()
    const matchSearch = !q || r.name.toLowerCase().includes(q) || r.code.includes(q)
    const matchClassroom = !filterClassroom.value || r.classroom === filterClassroom.value
    const matchStatus = !filterStatus.value || r.status === filterStatus.value
    return matchSearch && matchClassroom && matchStatus
  }),
)

const pageSizeOptions = [10, 20, 50]

const totalPages = computed(() => {
  const total = Math.ceil(filteredRows.value.length / pageSize.value)
  return Math.max(1, total)
})

const paginatedRows = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredRows.value.slice(start, start + pageSize.value)
})

const pageStart = computed(() => {
  if (!filteredRows.value.length) return 0
  return (currentPage.value - 1) * pageSize.value + 1
})

const pageEnd = computed(() =>
  Math.min(currentPage.value * pageSize.value, filteredRows.value.length),
)

watch([search, filterClassroom, filterStatus, pageSize], () => {
  currentPage.value = 1
})

watch(filteredRows, () => {
  if (currentPage.value > totalPages.value) {
    currentPage.value = totalPages.value
  }
})

const selectedEditSection = computed(() => {
  if (requestForm.value.field !== 'อื่นๆ') return requestForm.value.field
  const other = requestForm.value.otherPart.trim()
  return other ? `อื่นๆ (${other})` : 'อื่นๆ'
})

const isRequestValid = computed(() => {
  const hasField = requestForm.value.field.trim().length > 0
  const hasDetail = requestForm.value.detail.trim().length > 0
  const hasOtherPart = requestForm.value.field !== 'อื่นๆ' || requestForm.value.otherPart.trim().length > 0
  return hasField && hasDetail && hasOtherPart
})

function openRequestEdit(row: StudentRow) {
  selectedStudent.value = row
  requestForm.value = { field: '', otherPart: '', detail: '' }
  requestSubmitAttempted.value = false
  showRequestConfirmModal.value = false
  showRequestModal.value = true
}

function prepareRequestConfirm() {
  requestSubmitAttempted.value = true
  if (!isRequestValid.value) return
  showRequestConfirmModal.value = true
}

function submitRequest() {
  showRequestConfirmModal.value = false
  showRequestModal.value = false
  requestForm.value = { field: '', otherPart: '', detail: '' }
  requestSubmitAttempted.value = false
}

function clearFilters() {
  search.value = ''
  filterClassroom.value = ''
  filterStatus.value = ''
}

function goPrevPage() {
  if (currentPage.value > 1) currentPage.value--
}

function goNextPage() {
  if (currentPage.value < totalPages.value) currentPage.value++
}
</script>

<style scoped>
.page { display: flex; flex-direction: column; gap: 0; }
.page-header { margin-bottom: 24px; }
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
.form-label { font-size: 0.82rem; font-weight: 600; color: #374151; }
.req { color: #dc2626; }
.student-tag { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 6px 12px; font-size: 0.875rem; color: #15803d; font-weight: 500; display: inline-block; }
.summary-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px 12px; display: flex; flex-direction: column; gap: 6px; }
.summary-title { font-size: 0.8rem; font-weight: 700; color: #334155; }
.summary-line { font-size: 0.82rem; color: #475569; line-height: 1.45; }
.summary-label { font-weight: 600; color: #334155; }
.form-error { margin: -4px 0 0; font-size: 0.8rem; color: #dc2626; font-weight: 500; }
.confirm-body { display: flex; flex-direction: column; gap: 10px; }
.confirm-text { margin: 0; font-size: 0.84rem; color: #374151; }
.confirm-list { display: flex; flex-direction: column; gap: 8px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px 12px; }
.confirm-item { display: flex; justify-content: space-between; gap: 10px; font-size: 0.8rem; color: #64748b; }
.confirm-item strong { color: #334155; font-weight: 600; text-align: right; }

@media (max-width: 760px) {
  .pagination-row { align-items: flex-start; }
  .pagination-controls { width: 100%; }
}
</style>
