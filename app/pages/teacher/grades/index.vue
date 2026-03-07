<template>
  <div class="page">
    <TeacherAppSkeletonLoader v-if="loading" :rows="5" :cols="7" />
    <template v-else>
      <div class="page-header">
        <div>
          <h2 class="page-title">ผลการเรียน</h2>
          <p class="page-desc">ภาพรวมผลการเรียนรายวิชา พร้อมแก้ไขคะแนนได้ทันทีจากหน้าเดียว</p>
        </div>
        <button type="button" class="btn btn-primary" @click="exportGrades">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1v8M4 6l3 3 3-3M2 11h10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
          Export ปพ.5
        </button>
      </div>

      <div class="kpi-grid section-gap">
        <div class="kpi-card">
          <div class="kpi-label">คะแนนเฉลี่ยรวม</div>
          <div class="kpi-value">{{ avgTotalScore }}</div>
          <div class="kpi-sub">จาก {{ filteredRows.length }} รายการ</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">อัตราผ่าน</div>
          <div class="kpi-value">{{ passRate }}%</div>
          <div class="kpi-sub">ไม่รวม มส / ร / 0</div>
        </div>
        <div class="kpi-card kpi-card--warn">
          <div class="kpi-label">กลุ่มเสี่ยง</div>
          <div class="kpi-value">{{ riskCount }} คน</div>
          <div class="kpi-sub">เกรด 0 / มส / ร</div>
        </div>
      </div>

      <div class="filter-panel section-gap">
        <div class="filter-row">
          <div class="search-wrap">
            <svg class="search-icon" width="15" height="15" viewBox="0 0 15 15" fill="none"><circle cx="6.5" cy="6.5" r="4.5" stroke="#9ca3af" stroke-width="1.4"/><path d="M10 10l3 3" stroke="#9ca3af" stroke-width="1.4" stroke-linecap="round"/></svg>
            <input v-model="search" class="input search" type="text" placeholder="ค้นหาชื่อนักเรียนหรือรหัส..." />
          </div>
          <select v-model="filterCourse" class="input sel">
            <option value="">รายวิชาทั้งหมด</option>
            <option v-for="c in courseOptions" :key="c">{{ c }}</option>
          </select>
          <select v-model="filterGrade" class="input sel">
            <option value="">เกรดทั้งหมด</option>
            <option>4</option><option>3.5</option><option>3</option><option>2.5</option>
            <option>2</option><option>1.5</option><option>1</option><option>0</option>
            <option>มส</option><option>ร</option>
          </select>
          <button v-if="search || filterCourse || filterGrade" type="button" class="btn btn-clear" @click="clearFilters">ล้างตัวกรอง</button>
        </div>
      </div>

      <div class="grade-summary section-gap">
        <div v-for="stat in gradeSummary" :key="stat.grade" class="grade-chip" :class="stat.cls">
          <span class="gcs-grade">{{ stat.grade }}</span>
          <span class="gcs-count">{{ stat.count }} คน</span>
        </div>
      </div>

      <TeacherDataTable :title="`ผลการเรียนทั้งหมด (${filteredRows.length})`" :columns="cols" :rows="paginatedRows">
        <template #cell-grade="{ value }">
          <span :class="gradeClass(value)">{{ value ?? '-' }}</span>
        </template>
        <template #cell-total="{ value }">
          <span class="total-pill" :class="totalClass(value)">{{ value ?? '-' }}</span>
        </template>
        <template #rowActions="{ row }">
          <div class="action-btns">
            <NuxtLink :to="`/teacher/grades/${(row as GradeRecord).id}`" class="btn btn-sm btn-detail">รายละเอียด</NuxtLink>
            <button type="button" class="btn btn-sm btn-edit" @click="openEdit(row as GradeRecord)">แก้ไขคะแนน</button>
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

    <!-- Edit Grade Modal -->
    <TeacherAppModal v-model="showEditModal" title="แก้ไขคะแนน" size="sm" confirm-label="บันทึก" @confirm="submitEdit">
      <div class="form-body" v-if="editRow">
        <div class="student-tag">{{ editRow.studentName }} · {{ editRow.courseName }}</div>
        <div class="score-grid">
          <div class="form-row">
            <label class="form-label">กลางภาค <span class="score-max">(max 50)</span></label>
            <input v-model.number="editForm.midterm" class="input" type="number" min="0" max="50" />
          </div>
          <div class="form-row">
            <label class="form-label">ปลายภาค <span class="score-max">(max 50)</span></label>
            <input v-model.number="editForm.final" class="input" type="number" min="0" max="50" />
          </div>
          <div class="form-row">
            <label class="form-label">จิตพิสัย <span class="score-max">(max 20)</span></label>
            <input v-model.number="editForm.behavior" class="input" type="number" min="0" max="20" />
          </div>
          <div class="form-row">
            <label class="form-label">รวม</label>
            <div class="total-display">{{ editTotal }}</div>
          </div>
        </div>
        <div class="form-row">
          <label class="form-label">เกรดพิเศษ (ถ้ามี)</label>
          <select v-model="editForm.specialGrade" class="input">
            <option value="">คำนวณอัตโนมัติ</option>
            <option value="มส">มส (ขาดเรียนเกินกำหนด)</option>
            <option value="ร">ร (รอการประเมิน)</option>
            <option value="0">0 (ไม่ผ่าน)</option>
          </select>
        </div>
      </div>
    </TeacherAppModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useGradesData, type GradeRecord } from '~/composables/useGradesData'
import { useCoursesData } from '~/composables/useCoursesData'

definePageMeta({ layout: 'teacher' })

const { loading } = usePageLoad()
const { rows } = useGradesData()
const { rows: courses } = useCoursesData()

const filterCourse = ref('')
const filterGrade = ref('')
const search = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const pageSizeOptions = [10, 20, 50]
const showEditModal = ref(false)
const editRow = ref<GradeRecord | null>(null)
const editForm = ref({ midterm: 0, final: 0, behavior: 0, specialGrade: '' })

const courseOptions = computed(() => [...new Set(rows.value.map(r => r.courseName))])

const cols = [
  { key: 'studentCode', label: 'รหัส' },
  { key: 'studentName', label: 'ชื่อ-สกุล' },
  { key: 'courseName', label: 'รายวิชา' },
  { key: 'midterm', label: 'กลางภาค' },
  { key: 'final', label: 'ปลายภาค' },
  { key: 'behavior', label: 'จิตพิสัย' },
  { key: 'total', label: 'รวม' },
  { key: 'grade', label: 'เกรด' },
]

const filteredRows = computed(() =>
  rows.value.filter((r: GradeRecord) => {
    const q = search.value.trim().toLowerCase()
    const matchSearch = !q || r.studentName.toLowerCase().includes(q) || r.studentCode.toLowerCase().includes(q)
    const matchCourse = !filterCourse.value || r.courseName === filterCourse.value
    const matchGrade = !filterGrade.value || r.grade === filterGrade.value
    return matchSearch && matchCourse && matchGrade
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

watch([search, filterCourse, filterGrade, pageSize], () => {
  currentPage.value = 1
})

watch([filteredRows, totalPages], () => {
  if (currentPage.value > totalPages.value) currentPage.value = totalPages.value
})

const avgTotalScore = computed(() => {
  const totals = filteredRows.value.map(r => r.total).filter((n): n is number => typeof n === 'number')
  if (!totals.length) return '-'
  const avg = totals.reduce((a, b) => a + b, 0) / totals.length
  return avg.toFixed(1)
})

const riskCount = computed(() =>
  filteredRows.value.filter(r => r.grade === '0' || r.grade === 'มส' || r.grade === 'ร').length,
)

const passRate = computed(() => {
  if (!filteredRows.value.length) return 0
  const passed = filteredRows.value.filter(r => !['0', 'มส', 'ร'].includes(r.grade)).length
  return Math.round((passed / filteredRows.value.length) * 100)
})

const gradeSummary = computed(() => {
  const map: Record<string, number> = {}
  rows.value.forEach(r => { map[r.grade] = (map[r.grade] ?? 0) + 1 })
  return Object.entries(map).map(([grade, count]) => ({
    grade, count,
    cls: grade === 'มส' || grade === '0' ? 'gcs-fail' : 'gcs-pass',
  }))
})

const editTotal = computed(() => {
  const t = (editForm.value.midterm ?? 0) + (editForm.value.final ?? 0) + (editForm.value.behavior ?? 0)
  return t
})

function gradeClass(g: string) {
  if (!g || g === '-') return 'grade-na'
  if (g === 'มส' || g === '0' || g === 'ร') return 'grade-fail'
  const num = parseFloat(g)
  if (num >= 3.5) return 'grade-a'
  if (num >= 2.5) return 'grade-b'
  if (num >= 1.5) return 'grade-c'
  return 'grade-d'
}

function totalClass(total: number | null) {
  if (total === null) return 'total-na'
  if (total >= 80) return 'total-high'
  if (total >= 60) return 'total-mid'
  return 'total-low'
}

function openEdit(row: GradeRecord) {
  editRow.value = row
  editForm.value = { midterm: row.midterm ?? 0, final: row.final ?? 0, behavior: row.behavior ?? 0, specialGrade: '' }
  showEditModal.value = true
}

function submitEdit() {
  showEditModal.value = false
}

function exportGrades() {
  // In production: generate PDF/Excel
}

function clearFilters() {
  search.value = ''
  filterCourse.value = ''
  filterGrade.value = ''
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
.section-gap { margin-bottom: 24px; }
.kpi-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; }
.kpi-card { background: #fff; border: 1px solid #e8eaed; border-radius: 12px; padding: 12px 14px; display: flex; flex-direction: column; gap: 2px; }
.kpi-card--warn { border-color: #fed7aa; background: #fffaf5; }
.kpi-label { font-size: 0.76rem; color: #6b7280; font-weight: 600; }
.kpi-value { font-size: 1.25rem; color: #111827; font-weight: 800; }
.kpi-sub { font-size: 0.75rem; color: #9ca3af; }

.filter-panel { background: #fff; border: 1px solid #e8eaed; border-radius: 12px; padding: 12px; }
.filter-row { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.search-wrap { position: relative; flex: 1; min-width: 220px; }
.search-icon { position: absolute; left: 10px; top: 50%; transform: translateY(-50%); }
.input { padding: 8px 12px; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 0.875rem; font-family: inherit; color: #111827; background: #fff; outline: none; width: 100%; }
.input:focus { border-color: #16a34a; }
.search { padding-left: 34px; }
.sel { width: auto; min-width: 180px; flex: none; }
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

.grade-summary { display: flex; gap: 8px; flex-wrap: wrap; }
.grade-chip { display: flex; flex-direction: column; align-items: center; padding: 8px 14px; border-radius: 10px; min-width: 60px; }
.gcs-pass { background: #f0fdf4; border: 1px solid #bbf7d0; }
.gcs-fail { background: #fef2f2; border: 1px solid #fecaca; }
.gcs-grade { font-size: 1rem; font-weight: 800; color: #111827; }
.gcs-count { font-size: 0.7rem; color: #9ca3af; margin-top: 2px; }

.grade-a { color: #15803d; font-weight: 700; }
.grade-b { color: #1d4ed8; font-weight: 600; }
.grade-c { color: #d97706; font-weight: 600; }
.grade-d { color: #ea580c; font-weight: 600; }
.grade-fail { background: #fef2f2; color: #dc2626; padding: 2px 8px; border-radius: 6px; font-weight: 700; font-size: 0.82rem; }
.grade-na { color: #9ca3af; }

.total-pill { display: inline-flex; align-items: center; justify-content: center; min-width: 48px; padding: 2px 8px; border-radius: 999px; font-size: 0.78rem; font-weight: 700; }
.total-high { background: #ecfdf5; color: #166534; }
.total-mid { background: #fffbeb; color: #b45309; }
.total-low { background: #fef2f2; color: #b91c1c; }
.total-na { background: #f3f4f6; color: #9ca3af; }

.form-body { display: flex; flex-direction: column; gap: 16px; }
.student-tag { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 8px 14px; font-size: 0.875rem; color: #15803d; font-weight: 500; }
.score-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.form-row { display: flex; flex-direction: column; gap: 4px; }
.form-label { font-size: 0.82rem; font-weight: 600; color: #374151; }
.score-max { font-weight: 400; color: #9ca3af; }
.total-display { padding: 8px 12px; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 1rem; font-weight: 800; color: #111827; }

@media (max-width: 900px) {
  .kpi-grid { grid-template-columns: 1fr; }
  .sel { min-width: 150px; }
}

@media (max-width: 760px) {
  .pagination-row { align-items: flex-start; }
  .pagination-controls { width: 100%; }
}
</style>
