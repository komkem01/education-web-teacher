<template>
  <div class="page">
    <TeacherAppSkeletonLoader v-if="loading" :rows="3" :cols="4" />
    <template v-else-if="course">
      <div class="page-header">
        <div class="header-row">
          <div class="header-left">
            <NuxtLink to="/teacher/courses" class="back-btn">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 11L5 7l4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
              กลับ
            </NuxtLink>
            <div>
              <h2 class="page-title">{{ course.name }}</h2>
              <p class="page-desc">{{ course.subject }} · {{ course.level }} · ภาคเรียน {{ course.semester }}</p>
            </div>
          </div>
          <div class="header-actions">
            <TeacherStatusBadge :label="course.status" :variant="course.status === 'เปิดสอน' ? 'success' : 'warning'" />
            <button type="button" class="btn btn-edit" @click="openEditModal">ขอแก้ไขรายวิชา</button>
          </div>
        </div>
      </div>

      <!-- Info cards -->
      <div class="info-grid section-gap">
        <div class="info-card">
          <div class="info-icon">📚</div>
          <div class="info-val">{{ course.credits }}</div>
          <div class="info-label">หน่วยกิต</div>
        </div>
        <div class="info-card">
          <div class="info-icon">🎓</div>
          <div class="info-val">{{ course.students }}</div>
          <div class="info-label">นักเรียน</div>
        </div>
        <div class="info-card">
          <div class="info-icon">🏫</div>
          <div class="info-val">{{ course.room }}</div>
          <div class="info-label">ห้อง</div>
        </div>
        <div class="info-card">
          <div class="info-icon">📅</div>
          <div class="info-val">{{ course.semester }}</div>
          <div class="info-label">ภาคเรียน</div>
        </div>
      </div>

      <!-- Tabs -->
      <div class="tabs section-gap">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          type="button"
          class="tab-btn"
          :class="{ 'tab-btn--active': activeTab === tab.key }"
          @click="activeTab = tab.key"
        >{{ tab.label }}</button>
      </div>

      <!-- นักเรียน tab -->
      <div v-if="activeTab === 'students'">
        <TeacherDataTable title="นักเรียนในรายวิชา" :columns="studentCols" :rows="courseStudents">
          <template #cell-status="{ value }">
            <TeacherStatusBadge :label="value" :variant="value === 'ปกติ' ? 'success' : value === 'ลาพัก' ? 'warning' : 'neutral'" />
          </template>
          <template #rowActions="{ row }">
            <div class="action-btns">
              <NuxtLink :to="`/teacher/students/${(row as any).id}`" class="btn btn-sm btn-detail">ดูข้อมูล</NuxtLink>
            </div>
          </template>
        </TeacherDataTable>
      </div>

      <!-- ผลการเรียน tab -->
      <div v-else-if="activeTab === 'grades'">
        <TeacherDataTable title="ผลการเรียนในรายวิชา" :columns="gradeCols" :rows="courseGrades">
          <template #cell-grade="{ value }">
            <span :class="gradeClass(value)">{{ value ?? '-' }}</span>
          </template>
        </TeacherDataTable>
      </div>

      <!-- ตารางสอน tab -->
      <div v-else-if="activeTab === 'timetable'">
        <TeacherDataTable title="ตารางสอนรายวิชานี้" :columns="timetableCols" :rows="courseTimetable" />
      </div>
    </template>
    <div v-else class="not-found">ไม่พบรายวิชา</div>

    <!-- Edit Modal -->
    <TeacherAppModal v-model="showEditModal" title="ขอแก้ไขรายวิชา" size="md" confirm-label="ส่งคำขอ" @confirm="submitEditRequest">
      <div class="form-body">
        <div class="form-note">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="6" stroke="#d97706" stroke-width="1.3"/><path d="M7 4v4M7 9.5v.5" stroke="#d97706" stroke-width="1.4" stroke-linecap="round"/></svg>
          การแก้ไขรายวิชาต้องรอการอนุมัติจากบุคลากร
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
          <input v-model="editOtherDetail" class="input" type="text" placeholder="เช่น รายละเอียดเนื้อหา / เงื่อนไขประเมินผล" />
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
          <textarea v-model="editReason" class="input textarea" rows="3" placeholder="ระบุสิ่งที่ต้องการแก้ไขและเหตุผล..." />
        </div>
        <div v-if="editTargets.length || editReason.trim()" class="summary-box">
          <div class="summary-title">สรุปคำขอ</div>
          <div class="summary-line"><span class="summary-label">ส่วนที่ขอแก้ไข:</span> {{ selectedEditTargetLabels || '-' }}</div>
          <div class="summary-line"><span class="summary-label">ข้อมูลใหม่:</span> {{ selectedChangeSummary || '-' }}</div>
          <div class="summary-line"><span class="summary-label">เหตุผล:</span> {{ editReason.trim() || '-' }}</div>
        </div>
        <p v-if="editSubmitAttempted && !isEditRequestValid" class="form-error">กรุณาเลือกส่วนที่ต้องการแก้ไข กรอกข้อมูลใหม่ในทุกส่วน และระบุเหตุผลให้ครบถ้วน</p>
      </div>
    </TeacherAppModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useCoursesData } from '~/composables/useCoursesData'
import { useStudentsData } from '~/composables/useStudentsData'
import { useGradesData } from '~/composables/useGradesData'
import { useTimetableData } from '~/composables/useTimetableData'

definePageMeta({ layout: 'teacher' })

const route = useRoute()
const { loading } = usePageLoad()
const { rows: courses } = useCoursesData()
const { rows: students } = useStudentsData()
const { rows: grades } = useGradesData()
const { slots } = useTimetableData()

const activeTab = ref('students')
const showEditModal = ref(false)
const editReason = ref('')
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

const editTargetOptions = [
  { value: 'name', label: 'ชื่อวิชา' },
  { value: 'subject', label: 'กลุ่มสาระ' },
  { value: 'level', label: 'ระดับชั้น' },
  { value: 'room', label: 'ห้องเรียน' },
  { value: 'credits', label: 'หน่วยกิต' },
  { value: 'semester', label: 'ภาคเรียน' },
  { value: 'other', label: 'อื่นๆ' },
]

const tabs = [
  { key: 'students', label: 'นักเรียน' },
  { key: 'grades', label: 'ผลการเรียน' },
  { key: 'timetable', label: 'ตารางสอน' },
]

const course = computed(() => courses.value.find(c => c.id === route.params.id))
const courseStudents = computed(() => students.value.filter(s => s.classroom === course.value?.level + '/' + (course.value?.id.slice(-1) ?? '')))
const courseGrades = computed(() => grades.value.filter(g => g.courseId === route.params.id))
const courseTimetable = computed(() => slots.value.filter(t => t.courseId === route.params.id))
const isEditRequestValid = computed(() => {
  const hasTarget = editTargets.value.length > 0
  const hasReason = editReason.value.trim().length > 0
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

const studentCols = [
  { key: 'code', label: 'รหัส' },
  { key: 'name', label: 'ชื่อ-สกุล' },
  { key: 'classroom', label: 'ห้องเรียน' },
  { key: 'status', label: 'สถานะ' },
]

const gradeCols = [
  { key: 'studentCode', label: 'รหัสนักเรียน' },
  { key: 'studentName', label: 'ชื่อ-สกุล' },
  { key: 'midterm', label: 'กลางภาค (50)' },
  { key: 'final', label: 'ปลายภาค (50)' },
  { key: 'behavior', label: 'จิตพิสัย' },
  { key: 'total', label: 'รวม' },
  { key: 'grade', label: 'เกรด' },
]

const timetableCols = [
  { key: 'day', label: 'วัน' },
  { key: 'period', label: 'คาบ' },
  { key: 'timeStart', label: 'เริ่ม' },
  { key: 'timeEnd', label: 'สิ้นสุด' },
  { key: 'room', label: 'ห้อง' },
]

function gradeClass(g: string) {
  if (!g) return 'grade-na'
  if (g === 'มส' || g === '0') return 'grade-fail'
  const num = parseFloat(g)
  if (num >= 3.5) return 'grade-a'
  if (num >= 2.5) return 'grade-b'
  if (num >= 1.5) return 'grade-c'
  return 'grade-d'
}

function toggleEditTarget(value: string) {
  if (editTargets.value.includes(value)) {
    editTargets.value = editTargets.value.filter(v => v !== value)
    if (value === 'other') editOtherDetail.value = ''
    return
  }
  editTargets.value = [...editTargets.value, value]
}

function openEditModal() {
  const current = course.value
  editRequestValues.value = {
    name: String(current?.name ?? ''),
    subject: String(current?.subject ?? ''),
    level: String(current?.level ?? ''),
    room: String(current?.room ?? ''),
    credits: String(current?.credits ?? ''),
    semester: String(current?.semester ?? ''),
  }
  editTargets.value = []
  editOtherDetail.value = ''
  editReason.value = ''
  editSubmitAttempted.value = false
  showEditModal.value = true
}

function submitEditRequest() {
  editSubmitAttempted.value = true
  if (!isEditRequestValid.value) return

  const requestPayload = {
    requestType: 'course-update',
    courseId: String(route.params.id ?? ''),
    targets: editTargets.value,
    targetLabels: selectedEditTargetLabels.value,
    reason: editReason.value.trim(),
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
  editReason.value = ''
  editRequestValues.value = { name: '', subject: '', level: '', room: '', credits: '', semester: '' }
  editTargets.value = []
  editOtherDetail.value = ''
  editSubmitAttempted.value = false
}
</script>

<style scoped>
.page { display: flex; flex-direction: column; gap: 0; }
.back-btn { display: inline-flex; align-items: center; gap: 6px; padding: 7px 12px; font-size: 0.82rem; color: #6b7280; text-decoration: none; border: 1px solid #d1d5db; border-radius: 8px; background: #fff; transition: background 0.12s, color 0.12s; }
.back-btn:hover { background: #f3f4f6; color: #374151; }
.header-row { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; flex-wrap: wrap; }
.header-left { display: flex; align-items: flex-start; gap: 12px; flex-wrap: wrap; }
.page-header { margin-bottom: 24px; }
.page-title { font-size: 1.3rem; font-weight: 700; color: #111827; margin: 0 0 4px; }
.page-desc { font-size: 0.875rem; color: #6b7280; margin: 0; }
.header-actions { display: flex; align-items: center; gap: 10px; }
.section-gap { margin-bottom: 24px; }
.info-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 16px; }
@media (max-width: 700px) { .info-grid { grid-template-columns: repeat(2,1fr); } }
.info-card { background: #fff; border: 1px solid #f1f3f4; border-radius: 12px; padding: 18px; display: flex; flex-direction: column; align-items: center; gap: 6px; text-align: center; }
.info-icon { font-size: 1.4rem; }
.info-val { font-size: 1.5rem; font-weight: 800; color: #111827; }
.info-label { font-size: 0.78rem; color: #9ca3af; }
.tabs { display: flex; gap: 4px; border-bottom: 2px solid #f1f3f4; }
.tab-btn { background: none; border: none; padding: 10px 18px; font-size: 0.875rem; font-weight: 500; color: #6b7280; cursor: pointer; border-bottom: 2px solid transparent; margin-bottom: -2px; font-family: inherit; transition: color 0.12s, border-color 0.12s; }
.tab-btn:hover { color: #111827; }
.tab-btn--active { color: #16a34a; border-bottom-color: #16a34a; font-weight: 700; }
.action-btns { display: flex; gap: 6px; justify-content: flex-end; flex-wrap: nowrap; }
.btn { display: inline-flex; align-items: center; gap: 6px; border-radius: 7px; padding: 7px 14px; font-size: 0.875rem; font-weight: 500; cursor: pointer; border: 1px solid transparent; font-family: inherit; transition: background 0.12s; white-space: nowrap; }
.btn-sm { padding: 5px 10px; font-size: 0.8rem; }
.btn-edit { background: #eff6ff; color: #1d4ed8; border-color: #bfdbfe; }
.btn-edit:hover { background: #dbeafe; }
.btn-detail { background: #fff; color: #374151; border-color: #e5e7eb; }
.btn-detail:hover { background: #f9fafb; }
.not-found { text-align: center; padding: 60px; color: #9ca3af; }
.form-body { display: flex; flex-direction: column; gap: 16px; }
.form-note { display: flex; align-items: center; gap: 6px; background: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 10px 14px; font-size: 0.82rem; color: #92400e; }
.form-row { display: flex; flex-direction: column; gap: 6px; }
.form-label { font-size: 0.82rem; font-weight: 600; color: #374151; }
.req { color: #dc2626; }
.check-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px 12px; }
.check-item { display: inline-flex; align-items: center; gap: 8px; font-size: 0.83rem; color: #374151; }
.check-item input { margin: 0; accent-color: #16a34a; }
.summary-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px 12px; display: flex; flex-direction: column; gap: 6px; }
.summary-title { font-size: 0.8rem; font-weight: 700; color: #334155; }
.summary-line { font-size: 0.82rem; color: #475569; line-height: 1.45; }
.summary-label { font-weight: 600; color: #334155; }
.input { width: 100%; padding: 8px 12px; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 0.875rem; font-family: inherit; color: #111827; background: #fff; outline: none; }
.input:focus { border-color: #16a34a; }
.textarea { resize: vertical; min-height: 72px; }
.form-error { margin: -6px 0 0; font-size: 0.8rem; color: #dc2626; font-weight: 500; }
.grade-a { color: #15803d; font-weight: 700; }
.grade-b { color: #1d4ed8; font-weight: 600; }
.grade-c { color: #d97706; font-weight: 600; }
.grade-d { color: #dc2626; font-weight: 600; }
.grade-fail { background: #fef2f2; color: #dc2626; padding: 2px 8px; border-radius: 6px; font-weight: 700; font-size: 0.82rem; }
.grade-na { color: #9ca3af; }
</style>
