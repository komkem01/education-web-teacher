<template>
  <div class="page">
    <TeacherAppSkeletonLoader v-if="loading" :rows="5" :cols="5" />
    <template v-else>
      <div class="page-header">
        <div>
          <h2 class="page-title">คำขอเอกสารของฉัน</h2>
          <p class="page-desc">สร้างและติดตามคำขอเอกสารที่ส่งให้ฝ่ายบุคลากร</p>
        </div>
        <button class="btn btn-primary" @click="openCreate">+ ขอเอกสารใหม่</button>
      </div>

      <div v-if="feedbackMessage" class="toast-floating" role="status" aria-live="polite">
        <span class="feedback-dot" aria-hidden="true"></span>
        {{ feedbackMessage }}
      </div>

      <div class="filter-row">
        <div class="search-wrap">
          <svg class="search-icon" width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="6" cy="6" r="4.5" stroke="#9ca3af" stroke-width="1.4"/><path d="M9.5 9.5L12 12" stroke="#9ca3af" stroke-width="1.4" stroke-linecap="round"/></svg>
          <input v-model="search" class="search-input" placeholder="ค้นหาคำขอเอกสาร..." />
        </div>
        <select v-model="filterStatus" class="filter-select">
          <option value="">สถานะทั้งหมด</option>
          <option value="ร้องขอ">ร้องขอ</option>
          <option value="กำลังดำเนินการ">กำลังดำเนินการ</option>
          <option value="พร้อมรับ">พร้อมรับ</option>
          <option value="รับแล้ว">รับแล้ว</option>
          <option value="ยกเลิกแล้ว">ยกเลิกแล้ว</option>
        </select>
      </div>

      <TeacherDataTable :title="`คำขอทั้งหมด (${filtered.length})`" :columns="cols" :rows="filtered" :empty-text="'ยังไม่มีคำขอเอกสาร'">
        <template #cell-type="{ row }"><span class="type-tag">{{ row.type }}</span></template>
        <template #cell-status="{ row }">
          <TeacherStatusBadge :label="row.status" :variant="docStatusVariant(row.status)" />
        </template>
        <template #cell-actions="{ row }">
          <div class="actions">
            <NuxtLink :to="`/teacher/documents/${row.id}`" class="btn-detail">รายละเอียด</NuxtLink>
            <button
              v-if="row.status === 'ร้องขอ'"
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

    <TeacherAppModal v-model="showCreate" title="ขอเอกสารใหม่" confirm-label="ส่งคำขอ" @confirm="submitCreate">
      <div class="warning-banner">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1L13 12H1L7 1Z" stroke="#d97706" stroke-width="1.3" fill="none"/><line x1="7" y1="5.5" x2="7" y2="8" stroke="#d97706" stroke-width="1.3" stroke-linecap="round"/><circle cx="7" cy="9.5" r="0.7" fill="#d97706"/></svg>
        คำขอจะถูกส่งไปให้บุคลากรดำเนินการ ระยะเวลาประมาณ 3–5 วันทำการ
      </div>
      <div class="form-grid">
        <div class="form-group">
          <label class="form-label">ประเภทเอกสาร <span class="req">*</span></label>
          <select v-model="form.type" class="form-input">
            <option v-for="t in docTypes" :key="t" :value="t">{{ t }}</option>
          </select>
        </div>

        <div class="form-group">
          <label class="form-label">จำนวนฉบับ <span class="req">*</span></label>
          <input v-model.number="form.copies" class="form-input" type="number" min="1" max="20" />
        </div>

        <div class="form-group full-width">
          <label class="form-label">วัตถุประสงค์การใช้งาน <span class="req">*</span></label>
          <input v-model="form.purpose" class="form-input" type="text" placeholder="เช่น ใช้ประกอบการประเมินวิทยฐานะ" />
        </div>

        <div class="form-group full-width">
          <label class="form-label">รายละเอียดเพิ่มเติม</label>
          <textarea v-model="form.detail" class="form-input" rows="3" placeholder="ระบุรายละเอียดเพิ่มเติม..."></textarea>
        </div>

        <div v-if="form.purpose.trim() || form.detail.trim()" class="summary-box full-width">
          <div class="summary-title">สรุปคำขอก่อนส่ง</div>
          <div class="summary-line"><span class="summary-label">ประเภทเอกสาร:</span> {{ form.type }}</div>
          <div class="summary-line"><span class="summary-label">จำนวน:</span> {{ form.copies }} ฉบับ</div>
          <div class="summary-line"><span class="summary-label">วัตถุประสงค์:</span> {{ form.purpose.trim() || '-' }}</div>
          <div class="summary-line"><span class="summary-label">รายละเอียด:</span> {{ form.detail.trim() || '-' }}</div>
        </div>

        <p v-if="submitAttempted && !isCreateValid" class="form-error">กรุณากรอกประเภทเอกสาร จำนวนฉบับ และวัตถุประสงค์ให้ครบถ้วน</p>
      </div>
    </TeacherAppModal>

    <TeacherAppModal v-model="showCreateConfirm" title="ยืนยันการส่งคำขอ" size="sm" confirm-label="ยืนยันส่ง" @confirm="confirmCreate">
      <div class="confirm-text">ต้องการส่งคำขอเอกสารนี้ใช่หรือไม่</div>
      <div class="confirm-box">
        <div class="confirm-item"><span>ประเภทเอกสาร</span><strong>{{ form.type }}</strong></div>
        <div class="confirm-item"><span>จำนวน</span><strong>{{ form.copies }} ฉบับ</strong></div>
      </div>
    </TeacherAppModal>

    <TeacherAppModal v-model="showCancelModal" title="ยืนยันการยกเลิกคำขอ" size="sm" confirm-label="ยืนยันยกเลิก" @confirm="confirmCancel">
      <div class="confirm-text">ต้องการยกเลิกคำขอนี้ใช่หรือไม่</div>
      <div class="confirm-box">
        <div class="confirm-item"><span>รหัสคำขอ</span><strong>{{ cancelTargetId || '-' }}</strong></div>
      </div>
    </TeacherAppModal>

    <TeacherAppModal v-model="showRestoreModal" title="ยืนยันการกู้คืนคำขอ" size="sm" confirm-label="ยืนยันกู้คืน" @confirm="confirmRestore">
      <div class="confirm-text">ต้องการกู้คืนคำขอนี้กลับไปเป็นสถานะร้องขอใช่หรือไม่</div>
      <div class="confirm-box">
        <div class="confirm-item"><span>รหัสคำขอ</span><strong>{{ restoreTargetId || '-' }}</strong></div>
      </div>
    </TeacherAppModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useDocumentsData } from '~/composables/useDocumentsData'
import type { DocumentRequest } from '~/composables/useDocumentsData'

definePageMeta({ layout: 'teacher' })

const { loading } = usePageLoad()
const { requests } = useDocumentsData()

const search = ref('')
const filterStatus = ref('')
const showCreate = ref(false)
const showCreateConfirm = ref(false)
const showCancelModal = ref(false)
const showRestoreModal = ref(false)
const cancelTargetId = ref('')
const restoreTargetId = ref('')
const feedbackMessage = ref('')
const submitAttempted = ref(false)

const form = ref({ type: 'ปพ.5', purpose: '', copies: 1, detail: '' })

const docTypes = ['ปพ.5', 'หนังสือรับรองการปฏิบัติงาน', 'ใบอนุญาตไปราชการ', 'คำสั่งโรงเรียน', 'อื่นๆ']

const cols = [
  { key: 'id', label: 'รหัส' },
  { key: 'type', label: 'ประเภทเอกสาร' },
  { key: 'detail', label: 'รายละเอียด' },
  { key: 'requestedAt', label: 'วันที่ขอ' },
  { key: 'status', label: 'สถานะ' },
  { key: 'actions', label: '' },
]

const filtered = computed(() => requests.value.filter(r => {
  if (search.value && !r.detail.includes(search.value) && !r.type.includes(search.value)) return false
  if (filterStatus.value && r.status !== filterStatus.value) return false
  return true
}))

const isCreateValid = computed(() =>
  !!form.value.type && form.value.copies >= 1 && form.value.purpose.trim().length > 0,
)

function docStatusVariant(s: string) {
  if (s === 'รับแล้ว') return 'success'
  if (s === 'พร้อมรับ') return 'info'
  if (s === 'กำลังดำเนินการ') return 'warning'
  if (s === 'ยกเลิกแล้ว') return 'neutral'
  return 'warning'
}

function openCreate() {
  form.value = { type: 'ปพ.5', purpose: '', copies: 1, detail: '' }
  submitAttempted.value = false
  showCreate.value = true
}

function submitCreate() {
  submitAttempted.value = true
  if (!isCreateValid.value) return
  showCreateConfirm.value = true
}

function confirmCreate() {
  const maxId = requests.value.reduce((max, item) => {
    const n = Number(item.id.replace('DOC', ''))
    return Number.isNaN(n) ? max : Math.max(max, n)
  }, 0)
  const id = `DOC${String(maxId + 1).padStart(3, '0')}`
  const detailParts = [
    `วัตถุประสงค์: ${form.value.purpose.trim()}`,
    `จำนวน: ${form.value.copies} ฉบับ`,
  ]
  if (form.value.detail.trim()) detailParts.push(`เพิ่มเติม: ${form.value.detail.trim()}`)

  requests.value.unshift({
    id,
    type: form.value.type,
    detail: detailParts.join(' | '),
    requestedAt: new Date().toLocaleDateString('th-TH'),
    status: 'ร้องขอ',
    canceledByRequester: false,
    note: '',
  })
  showCreateConfirm.value = false
  showCreate.value = false
  showFeedback(`ส่งคำขอเอกสาร ${id} สำเร็จ`)
}

function openCancelModal(id: string) {
  cancelTargetId.value = id
  showCancelModal.value = true
}

function confirmCancel() {
  const target = requests.value.find(r => r.id === cancelTargetId.value)
  if (!target || target.status !== 'ร้องขอ') {
    showCancelModal.value = false
    cancelTargetId.value = ''
    return
  }
  target.status = 'ยกเลิกแล้ว'
  target.canceledByRequester = true
  target.note = 'ผู้ขอยกเลิกคำขอเอกสาร'
  showCancelModal.value = false
  cancelTargetId.value = ''
  showFeedback(`ยกเลิกคำขอ ${target.id} สำเร็จ`)
}

function canRestoreRequest(row: DocumentRequest) {
  return row.status === 'ยกเลิกแล้ว' && row.canceledByRequester === true
}

function openRestoreModal(id: string) {
  restoreTargetId.value = id
  showRestoreModal.value = true
}

function confirmRestore() {
  const target = requests.value.find(r => r.id === restoreTargetId.value)
  if (!target || !canRestoreRequest(target)) {
    showRestoreModal.value = false
    restoreTargetId.value = ''
    return
  }
  target.status = 'ร้องขอ'
  target.canceledByRequester = false
  target.note = ''
  showRestoreModal.value = false
  restoreTargetId.value = ''
  showFeedback(`กู้คืนคำขอ ${target.id} สำเร็จ`)
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
.btn-detail { background: #fff; color: #374151; border: 1px solid #e5e7eb; padding: 4px 12px; border-radius: 6px; font-size: 0.75rem; font-weight: 500; text-decoration: none; white-space: nowrap; }
.btn-detail:hover { background: #f9fafb; }
.btn-edit { background: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe; padding: 4px 12px; border-radius: 6px; font-size: 0.75rem; font-weight: 500; cursor: pointer; white-space: nowrap; font-family: inherit; }
.btn-edit:hover { background: #dbeafe; }
.btn-delete { background: #fff5f5; color: #dc2626; border: 1px solid #fecaca; padding: 4px 12px; border-radius: 6px; font-size: 0.75rem; font-weight: 500; cursor: pointer; white-space: nowrap; font-family: inherit; }
.btn-delete:hover { background: #fee2e2; }
.type-tag { background: #eff6ff; color: #1d4ed8; border-radius: 6px; padding: 2px 8px; font-size: 0.75rem; font-weight: 600; }
.warning-banner { display: flex; align-items: center; gap: 6px; background: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 10px 14px; font-size: 0.82rem; color: #92400e; margin-bottom: 16px; }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
.full-width { grid-column: 1 / -1; }
.form-group { display: flex; flex-direction: column; gap: 4px; }
.form-label { font-size: 0.75rem; font-weight: 600; color: #374151; }
.req { color: #dc2626; }
.form-input { padding: 8px 10px; border-radius: 8px; border: 1px solid #e5e7eb; font-size: 0.82rem; outline: none; width: 100%; box-sizing: border-box; font-family: inherit; resize: vertical; }
.form-input:focus { border-color: #16a34a; }
.summary-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px 12px; display: flex; flex-direction: column; gap: 6px; }
.summary-title { font-size: 0.8rem; font-weight: 700; color: #334155; }
.summary-line { font-size: 0.82rem; color: #475569; line-height: 1.45; }
.summary-label { font-weight: 600; color: #334155; }
.form-error { margin: 2px 0 0; font-size: 0.8rem; color: #dc2626; font-weight: 500; }
.confirm-text { font-size: 0.85rem; color: #374151; margin-bottom: 10px; }
.confirm-box { display: flex; flex-direction: column; gap: 8px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px 12px; }
.confirm-item { display: flex; justify-content: space-between; gap: 8px; font-size: 0.82rem; color: #64748b; }
.confirm-item strong { color: #334155; font-weight: 600; text-align: right; }
.toast-floating { position: fixed; top: 18px; right: 18px; z-index: 60; display: inline-flex; align-items: center; gap: 8px; background: #ecfdf5; color: #166534; border: 1px solid #bbf7d0; border-radius: 10px; padding: 9px 12px; font-size: 0.82rem; font-weight: 600; box-shadow: 0 8px 24px rgba(15, 23, 42, 0.12); }
.feedback-dot { width: 7px; height: 7px; border-radius: 999px; background: #22c55e; }

@media (max-width: 760px) {
  .form-grid { grid-template-columns: 1fr; }
  .toast-floating { top: 12px; right: 12px; left: 12px; justify-content: center; }
}
</style>
