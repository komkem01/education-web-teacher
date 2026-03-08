<template>
  <div class="page">
    <TeacherAppSkeletonLoader v-if="loading" :rows="5" :cols="5" />
    <template v-else>
      <div class="page-header">
        <div>
          <h2 class="page-title">คำขอแก้ไขข้อมูล</h2>
          <p class="page-desc">สร้างและติดตามคำขอแก้ไขข้อมูลที่ต้องส่งให้บุคลากรอนุมัติ</p>
        </div>
        <button class="btn btn-primary" @click="openCreate">+ สร้างคำขอใหม่</button>
      </div>

      <div v-if="feedbackMessage" class="toast-floating" role="status" aria-live="polite">
        <span class="feedback-dot" aria-hidden="true"></span>
        {{ feedbackMessage }}
      </div>

      <div class="filter-row">
        <div class="search-wrap">
          <svg class="search-icon" width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="6" cy="6" r="4.5" stroke="#9ca3af" stroke-width="1.4"/><path d="M9.5 9.5L12 12" stroke="#9ca3af" stroke-width="1.4" stroke-linecap="round"/></svg>
          <input v-model="search" class="search-input" placeholder="ค้นหาคำขอ..." />
        </div>
        <select v-model="filterStatus" class="filter-select">
          <option value="">สถานะทั้งหมด</option>
          <option value="รออนุมัติ">รออนุมัติ</option>
          <option value="อนุมัติแล้ว">อนุมัติแล้ว</option>
          <option value="ปฏิเสธ">ปฏิเสธ</option>
          <option value="ยกเลิกแล้ว">ยกเลิกแล้ว</option>
        </select>
        <select v-model="filterType" class="filter-select">
          <option value="">ประเภททั้งหมด</option>
          <option v-for="t in requestTypes" :key="t" :value="t">{{ t }}</option>
        </select>
      </div>

      <TeacherDataTable :title="`คำขอทั้งหมด (${filtered.length})`" :columns="cols" :rows="filtered" :empty-text="'ยังไม่มีคำขออนุมัติ'">
        <template #cell-type="{ row }"><span class="type-label">{{ row.type }}</span></template>
        <template #cell-editTargets="{ row }">
          <span class="target-text">{{ row.editTargets?.length ? row.editTargets.join(', ') : '-' }}</span>
        </template>
        <template #cell-status="{ row }">
          <TeacherStatusBadge :label="row.status" :variant="statusVariant(row.status)" />
        </template>
        <template #cell-priority="{ row }">
          <TeacherStatusBadge :label="row.priority" :variant="priorityVariant(row.priority)" />
        </template>
        <template #cell-actions="{ row }">
          <div class="actions">
            <NuxtLink :to="`/teacher/approvals/${row.id}`" class="btn-detail">รายละเอียด</NuxtLink>
            <button
              v-if="row.status === 'รออนุมัติ'"
              type="button"
              class="btn-delete"
              @click="openCancelModal(row.id)"
            >
              ยกเลิกคำขอ
            </button>
            <button
              v-if="canRestoreRequest(row)"
              type="button"
              class="btn-edit"
              @click="openRestoreModal(row.id)"
            >
              กู้คืนคำขอ
            </button>
          </div>
        </template>
      </TeacherDataTable>
    </template>

    <TeacherAppModal v-model="showCreate" title="สร้างคำขอแก้ไขข้อมูล" confirm-label="ส่งคำขอ" @confirm="submitCreate">
      <div class="warning-banner">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1L13 12H1L7 1Z" stroke="#d97706" stroke-width="1.3" fill="none"/><line x1="7" y1="5.5" x2="7" y2="8" stroke="#d97706" stroke-width="1.3" stroke-linecap="round"/><circle cx="7" cy="9.5" r="0.7" fill="#d97706"/></svg>
        คำขอจะถูกส่งให้บุคลากรพิจารณาและอนุมัติ
      </div>

      <div class="form-grid">
        <div class="form-group">
          <label class="form-label">ประเภทคำขอ <span class="req">*</span></label>
          <select v-model="form.type" class="form-input">
            <option v-for="t in requestTypes" :key="t" :value="t">{{ t }}</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">ความสำคัญ <span class="req">*</span></label>
          <select v-model="form.priority" class="form-input">
            <option value="ปกติ">ปกติ</option>
            <option value="ด่วน">ด่วน</option>
            <option value="ด่วนมาก">ด่วนมาก</option>
          </select>
        </div>

        <div class="form-group full-width">
          <label class="form-label">หัวข้อที่ต้องการแก้ไข <span class="req">*</span></label>
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

        <div v-if="editTargets.includes('other')" class="form-group full-width">
          <label class="form-label">ระบุหัวข้ออื่นๆ <span class="req">*</span></label>
          <input v-model="otherEditTarget" class="form-input" type="text" placeholder="เช่น ตารางเรียน / ครูที่ปรึกษา" />
        </div>

        <div class="form-group full-width">
          <label class="form-label">ข้อมูลเดิม</label>
          <input v-model="form.oldValue" class="form-input" type="text" placeholder="ข้อมูลปัจจุบัน (ถ้ามี)" />
        </div>

        <div class="form-group full-width">
          <label class="form-label">ข้อมูลใหม่ที่ต้องการแก้ไข <span class="req">*</span></label>
          <input v-model="form.newValue" class="form-input" type="text" placeholder="ระบุค่าที่ต้องการแก้เป็น" />
        </div>

        <div class="form-group full-width">
          <label class="form-label">เหตุผลในการแก้ไข <span class="req">*</span></label>
          <textarea v-model="form.detail" class="form-input" rows="4" placeholder="อธิบายเหตุผลของคำขอ..."></textarea>
        </div>

        <div v-if="editTargets.length || form.newValue.trim() || form.detail.trim()" class="summary-box full-width">
          <div class="summary-title">สรุปคำขอก่อนส่ง</div>
          <div class="summary-line"><span class="summary-label">ประเภท:</span> {{ form.type }}</div>
          <div class="summary-line"><span class="summary-label">แก้ไขหัวข้อ:</span> {{ selectedEditTargetLabels || '-' }}</div>
          <div class="summary-line"><span class="summary-label">ข้อมูลเดิม:</span> {{ form.oldValue.trim() || '-' }}</div>
          <div class="summary-line"><span class="summary-label">ข้อมูลใหม่:</span> {{ form.newValue.trim() || '-' }}</div>
          <div class="summary-line"><span class="summary-label">เหตุผล:</span> {{ form.detail.trim() || '-' }}</div>
        </div>

        <p v-if="submitAttempted && !isFormValid" class="form-error">
          กรุณาเลือกหัวข้อที่ต้องการแก้ไข พร้อมกรอกข้อมูลใหม่และเหตุผลให้ครบถ้วน
        </p>
      </div>
    </TeacherAppModal>

    <TeacherAppModal v-model="showConfirmModal" title="ยืนยันการส่งคำขอ" size="sm" confirm-label="ยืนยันส่ง" @confirm="confirmCreate">
      <div class="confirm-text">ต้องการส่งคำขอแก้ไขข้อมูลนี้ใช่หรือไม่</div>
      <div class="confirm-box">
        <div class="confirm-item"><span>ประเภท</span><strong>{{ form.type }}</strong></div>
        <div class="confirm-item"><span>หัวข้อแก้ไข</span><strong>{{ selectedEditTargetLabels || '-' }}</strong></div>
        <div class="confirm-item"><span>ความสำคัญ</span><strong>{{ form.priority }}</strong></div>
      </div>
    </TeacherAppModal>

    <TeacherAppModal
      v-model="showCancelModal"
      title="ยืนยันการยกเลิกคำขอ"
      size="sm"
      confirm-label="ยืนยันยกเลิก"
      @confirm="confirmCancel"
    >
      <div class="confirm-text">ต้องการยกเลิกคำขอนี้ใช่หรือไม่</div>
      <div class="confirm-box">
        <div class="confirm-item"><span>รหัสคำขอ</span><strong>{{ cancelTargetId || '-' }}</strong></div>
      </div>
    </TeacherAppModal>

    <TeacherAppModal
      v-model="showRestoreModal"
      title="ยืนยันการกู้คืนคำขอ"
      size="sm"
      confirm-label="ยืนยันกู้คืน"
      @confirm="confirmRestore"
    >
      <div class="confirm-text">ต้องการกู้คืนคำขอนี้กลับไปเป็นรออนุมัติใช่หรือไม่</div>
      <div class="confirm-box">
        <div class="confirm-item"><span>รหัสคำขอ</span><strong>{{ restoreTargetId || '-' }}</strong></div>
      </div>
    </TeacherAppModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useApprovalsData } from '~/composables/useApprovalsData'
import type { ApprovalRequest } from '~/composables/useApprovalsData'

definePageMeta({ layout: 'teacher' })

const { loading } = usePageLoad()
const { rows } = useApprovalsData()

const search = ref('')
const filterStatus = ref('')
const filterType = ref('')
const showCreate = ref(false)
const showConfirmModal = ref(false)
const showCancelModal = ref(false)
const showRestoreModal = ref(false)
const cancelTargetId = ref('')
const restoreTargetId = ref('')
const feedbackMessage = ref('')
const editTargets = ref<string[]>([])
const otherEditTarget = ref('')
const submitAttempted = ref(false)

const form = ref({
  type: 'ขอแก้ไขข้อมูลนักเรียน',
  priority: 'ปกติ' as ApprovalRequest['priority'],
  oldValue: '',
  newValue: '',
  detail: '',
})

const requestTypes = ['ขอแก้ไขข้อมูลนักเรียน', 'ขอแก้ไขผลการเรียน', 'ขอแก้ไขข้อมูลรายวิชา', 'ขอแก้ไขข้อมูลส่วนตัว', 'ขออื่นๆ']
const editTargetOptions = [
  { value: 'name', label: 'ชื่อ-นามสกุล' },
  { value: 'idNumber', label: 'เลขบัตรประชาชน' },
  { value: 'address', label: 'ที่อยู่' },
  { value: 'phone', label: 'เบอร์โทรศัพท์' },
  { value: 'subject', label: 'รายวิชา' },
  { value: 'score', label: 'คะแนน' },
  { value: 'grade', label: 'เกรด' },
  { value: 'room', label: 'ห้องเรียน' },
  { value: 'other', label: 'อื่นๆ' },
]

const cols = [
  { key: 'id', label: 'รหัส' },
  { key: 'type', label: 'ประเภท' },
  { key: 'editTargets', label: 'แก้ไขอะไร' },
  { key: 'detail', label: 'รายละเอียด' },
  { key: 'submittedAt', label: 'วันที่ส่ง' },
  { key: 'priority', label: 'ความสำคัญ' },
  { key: 'status', label: 'สถานะ' },
  { key: 'actions', label: '' },
]

const filtered = computed(() => rows.value.filter((r) => {
  const q = search.value.trim().toLowerCase()
  if (q) {
    const targetText = r.editTargets?.join(' ').toLowerCase() ?? ''
    const inText = r.detail.toLowerCase().includes(q) || r.type.toLowerCase().includes(q) || targetText.includes(q)
    if (!inText) return false
  }
  if (filterStatus.value && r.status !== filterStatus.value) return false
  if (filterType.value && r.type !== filterType.value) return false
  return true
}))

const selectedEditTargetLabels = computed(() =>
  editTargets.value
    .map((value) => {
      if (value === 'other') {
        const other = otherEditTarget.value.trim()
        return other ? `อื่นๆ (${other})` : 'อื่นๆ'
      }
      return editTargetOptions.find(opt => opt.value === value)?.label ?? value
    })
    .join(', '),
)

const isFormValid = computed(() => {
  const hasTargets = editTargets.value.length > 0
  const hasNewValue = form.value.newValue.trim().length > 0
  const hasReason = form.value.detail.trim().length > 0
  const hasOther = !editTargets.value.includes('other') || otherEditTarget.value.trim().length > 0
  return hasTargets && hasNewValue && hasReason && hasOther
})

function statusVariant(s: string) {
  if (s === 'อนุมัติแล้ว') return 'success'
  if (s === 'ปฏิเสธ') return 'danger'
  if (s === 'ยกเลิกแล้ว') return 'neutral'
  return 'warning'
}

function priorityVariant(p: string) {
  return p === 'ด่วนมาก' ? 'danger' : p === 'ด่วน' ? 'warning' : 'neutral'
}

function openCreate() {
  form.value = {
    type: 'ขอแก้ไขข้อมูลนักเรียน',
    priority: 'ปกติ',
    oldValue: '',
    newValue: '',
    detail: '',
  }
  editTargets.value = []
  otherEditTarget.value = ''
  submitAttempted.value = false
  showCreate.value = true
}

function toggleEditTarget(value: string) {
  if (editTargets.value.includes(value)) {
    editTargets.value = editTargets.value.filter(v => v !== value)
    if (value === 'other') otherEditTarget.value = ''
    return
  }
  editTargets.value = [...editTargets.value, value]
}

function submitCreate() {
  submitAttempted.value = true
  if (!isFormValid.value) return
  showConfirmModal.value = true
}

function confirmCreate() {
  const maxId = rows.value.reduce((max, item) => {
    const n = Number(item.id.replace('APR', ''))
    return Number.isNaN(n) ? max : Math.max(max, n)
  }, 0)
  const id = `APR${String(maxId + 1).padStart(3, '0')}`
  rows.value.unshift({
    id,
    type: form.value.type,
    detail: `คำขอแก้ไขข้อมูล: ${selectedEditTargetLabels.value}`,
    editTargets: selectedEditTargetLabels.value.split(',').map(v => v.trim()).filter(Boolean),
    changeSummary: `จาก ${form.value.oldValue.trim() || '-'} เป็น ${form.value.newValue.trim()}`,
    reason: form.value.detail.trim(),
    submittedAt: new Date().toLocaleDateString('th-TH'),
    status: 'รออนุมัติ',
    approvedBy: '',
    priority: form.value.priority,
    note: '',
  })
  showConfirmModal.value = false
  showCreate.value = false
}

function openCancelModal(id: string) {
  cancelTargetId.value = id
  showCancelModal.value = true
}

function openRestoreModal(id: string) {
  restoreTargetId.value = id
  showRestoreModal.value = true
}

function confirmCancel() {
  const target = rows.value.find(r => r.id === cancelTargetId.value)
  if (!target || target.status !== 'รออนุมัติ') {
    showCancelModal.value = false
    cancelTargetId.value = ''
    return
  }
  target.status = 'ยกเลิกแล้ว'
  target.note = 'ผู้ขอยกเลิกคำขอ'
  target.approvedBy = '-'
  showFeedback(`ยกเลิกคำขอ ${target.id} สำเร็จ`)
  showCancelModal.value = false
  cancelTargetId.value = ''
}

function canRestoreRequest(row: ApprovalRequest) {
  return row.status === 'ยกเลิกแล้ว' && (!row.approvedBy || row.approvedBy === '-')
}

function confirmRestore() {
  const target = rows.value.find(r => r.id === restoreTargetId.value)
  if (!target || !canRestoreRequest(target)) {
    showRestoreModal.value = false
    restoreTargetId.value = ''
    return
  }
  target.status = 'รออนุมัติ'
  target.note = ''
  target.approvedBy = ''
  showFeedback(`กู้คืนคำขอ ${target.id} สำเร็จ`)
  showRestoreModal.value = false
  restoreTargetId.value = ''
}

function showFeedback(message: string) {
  feedbackMessage.value = message
  setTimeout(() => {
    if (feedbackMessage.value === message) feedbackMessage.value = ''
  }, 2200)
}
</script>

<style scoped>
.page { display: flex; flex-direction: column; gap: 0; }
.page-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 24px; flex-wrap: wrap; gap: 12px; }
.page-title { font-size: 1.3rem; font-weight: 700; color: #111827; margin: 0 0 4px; }
.page-desc { font-size: 0.875rem; color: #6b7280; margin: 0; }
.toast-floating { position: fixed; top: 18px; right: 18px; z-index: 60; display: inline-flex; align-items: center; gap: 8px; background: #ecfdf5; color: #166534; border: 1px solid #bbf7d0; border-radius: 10px; padding: 9px 12px; font-size: 0.82rem; font-weight: 600; box-shadow: 0 8px 24px rgba(15, 23, 42, 0.12); }
.feedback-dot { width: 7px; height: 7px; border-radius: 999px; background: #22c55e; }

.btn { display: inline-flex; align-items: center; gap: 6px; border-radius: 7px; padding: 7px 14px; font-size: 0.875rem; font-weight: 500; cursor: pointer; border: 1px solid transparent; font-family: inherit; transition: background 0.12s; white-space: nowrap; }
.btn-primary { background: #16a34a; color: #fff; border-color: #16a34a; }
.btn-primary:hover { background: #15803d; }

.filter-row { display: flex; gap: 10px; flex-wrap: wrap; align-items: center; margin-bottom: 16px; }
.search-wrap { position: relative; flex: 1; min-width: 180px; }
.search-icon { position: absolute; left: 10px; top: 50%; transform: translateY(-50%); pointer-events: none; }
.search-input { width: 100%; padding: 8px 12px 8px 32px; border-radius: 8px; border: 1px solid #e5e7eb; font-size: 0.82rem; background: #fff; outline: none; box-sizing: border-box; }
.search-input:focus { border-color: #16a34a; }
.filter-select { padding: 8px 12px; border-radius: 8px; border: 1px solid #e5e7eb; font-size: 0.82rem; background: #fff; outline: none; cursor: pointer; }
.filter-select:focus { border-color: #16a34a; }

.actions { display: flex; gap: 6px; justify-content: flex-end; flex-wrap: nowrap; }
.btn-detail { background: #fff; color: #374151; border: 1px solid #e5e7eb; padding: 4px 12px; border-radius: 6px; font-size: 0.75rem; font-weight: 500; cursor: pointer; text-decoration: none; white-space: nowrap; }
.btn-detail:hover { background: #f9fafb; }
.btn-edit { background: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe; padding: 4px 12px; border-radius: 6px; font-size: 0.75rem; font-weight: 500; cursor: pointer; white-space: nowrap; font-family: inherit; }
.btn-edit:hover { background: #dbeafe; }
.btn-delete { background: #fff5f5; color: #dc2626; border: 1px solid #fecaca; padding: 4px 12px; border-radius: 6px; font-size: 0.75rem; font-weight: 500; cursor: pointer; white-space: nowrap; font-family: inherit; }
.btn-delete:hover { background: #fee2e2; }
.type-label { font-size: 0.82rem; color: #374151; }
.target-text { font-size: 0.8rem; color: #4b5563; line-height: 1.4; }

.warning-banner { display: flex; align-items: center; gap: 6px; background: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 10px 14px; font-size: 0.82rem; color: #92400e; margin-bottom: 16px; }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
.full-width { grid-column: 1 / -1; }
.form-group { display: flex; flex-direction: column; gap: 4px; }
.form-label { font-size: 0.75rem; font-weight: 600; color: #374151; }
.req { color: #dc2626; }
.form-input { padding: 8px 10px; border-radius: 8px; border: 1px solid #e5e7eb; font-size: 0.82rem; outline: none; width: 100%; box-sizing: border-box; font-family: inherit; resize: vertical; }
.form-input:focus { border-color: #16a34a; }

.check-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px 12px; }
.check-item { display: inline-flex; align-items: center; gap: 8px; font-size: 0.82rem; color: #374151; }
.check-item input { margin: 0; accent-color: #16a34a; }

.summary-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px 12px; display: flex; flex-direction: column; gap: 6px; }
.summary-title { font-size: 0.8rem; font-weight: 700; color: #334155; }
.summary-line { font-size: 0.82rem; color: #475569; line-height: 1.45; }
.summary-label { font-weight: 600; color: #334155; }
.form-error { margin: 2px 0 0; font-size: 0.8rem; color: #dc2626; font-weight: 500; }

.confirm-text { font-size: 0.85rem; color: #374151; margin-bottom: 10px; }
.confirm-box { display: flex; flex-direction: column; gap: 8px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px 12px; }
.confirm-item { display: flex; justify-content: space-between; gap: 8px; font-size: 0.82rem; color: #64748b; }
.confirm-item strong { color: #334155; font-weight: 600; text-align: right; }

@media (max-width: 760px) {
  .form-grid { grid-template-columns: 1fr; }
  .check-grid { grid-template-columns: 1fr; }
  .toast-floating { top: 12px; right: 12px; left: 12px; justify-content: center; }
}
</style>
