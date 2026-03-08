<template>
  <div class="page">
    <TeacherAppSkeletonLoader v-if="loading" :rows="3" :cols="4" />
    <template v-else-if="record">
      <div class="page-header">
        <div class="header-left">
          <NuxtLink to="/teacher/documents" class="back-btn">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 11L5 7l4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
            กลับ
          </NuxtLink>
          <div>
            <h2 class="page-title">{{ record.type }}</h2>
            <p class="page-desc">รหัสคำขอ: <span class="mono">{{ record.id }}</span></p>
          </div>
        </div>
        <div class="header-actions">
          <TeacherStatusBadge :label="record.status" :variant="docStatusVariant(record.status)" />
          <button
            v-if="record.status === 'รออนุมัติ'"
            type="button"
            class="btn-delete"
            @click="showCancelModal = true"
          >
            ยกเลิกคำขอ
          </button>
          <button
            v-if="canRestoreRecord"
            type="button"
            class="btn-edit"
            @click="showRestoreModal = true"
          >
            กู้คืนคำขอ
          </button>
        </div>
      </div>

      <div v-if="feedbackMessage" class="toast-floating" role="status" aria-live="polite">
        <span class="feedback-dot" aria-hidden="true"></span>
        {{ feedbackMessage }}
      </div>

      <div v-if="record.status !== 'ยกเลิกแล้ว'" class="status-track section-gap">
        <div v-for="(step, i) in statusSteps" :key="step" class="step" :class="{ active: isStepActive(i), done: isStepDone(i) }">
          <div class="step-dot"></div>
          <div class="step-label">{{ step }}</div>
          <div v-if="i < statusSteps.length - 1" class="step-line"></div>
        </div>
      </div>

      <div v-else class="cancel-banner section-gap">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="5.5" stroke="#6b7280" stroke-width="1.3"/><path d="M5 5l4 4M9 5l-4 4" stroke="#6b7280" stroke-width="1.3" stroke-linecap="round"/></svg>
        คำขอเอกสารถูกยกเลิกแล้ว
      </div>

      <div class="detail-card section-gap">
        <div class="detail-card-title">รายละเอียดคำขอ</div>
        <div class="detail-row"><span class="dl">รหัสคำขอ</span><span class="dv mono">{{ record.id }}</span></div>
        <div class="detail-row"><span class="dl">ประเภทเอกสาร</span><span class="dv">{{ record.type }}</span></div>
        <div class="detail-row"><span class="dl">รายละเอียด</span><span class="dv">{{ record.detail }}</span></div>
        <div class="detail-row"><span class="dl">วันที่ขอ</span><span class="dv">{{ record.requestedAt }}</span></div>
      </div>

      <div v-if="record.note" class="detail-card">
        <div class="detail-card-title">หมายเหตุจากบุคลากร</div>
        <p class="note-text">{{ record.note }}</p>
      </div>

      <div v-if="record.status === 'พร้อมรับ'" class="ready-banner">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="5.5" stroke="#16a34a" stroke-width="1.3"/><path d="M4.5 7l2 2L9.5 5" stroke="#16a34a" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>
        เอกสารของคุณพร้อมรับแล้ว กรุณาติดต่อรับที่งานบุคลากร
      </div>
    </template>
    <div v-else class="not-found">ไม่พบข้อมูลคำขอ</div>

    <TeacherAppModal v-model="showCancelModal" title="ยืนยันการยกเลิกคำขอ" size="sm" confirm-label="ยืนยันยกเลิก" @confirm="cancelRequest">
      <div class="confirm-text">ต้องการยกเลิกคำขอนี้ใช่หรือไม่</div>
      <div class="confirm-box" v-if="record">
        <div class="confirm-item"><span>รหัสคำขอ</span><strong>{{ record.id }}</strong></div>
        <div class="confirm-item"><span>ประเภท</span><strong>{{ record.type }}</strong></div>
      </div>
    </TeacherAppModal>

    <TeacherAppModal v-model="showRestoreModal" title="ยืนยันการกู้คืนคำขอ" size="sm" confirm-label="ยืนยันกู้คืน" @confirm="restoreRequest">
      <div class="confirm-text">ต้องการกู้คืนคำขอนี้กลับไปเป็นสถานะรออนุมัติใช่หรือไม่</div>
      <div class="confirm-box" v-if="record">
        <div class="confirm-item"><span>รหัสคำขอ</span><strong>{{ record.id }}</strong></div>
        <div class="confirm-item"><span>ประเภท</span><strong>{{ record.type }}</strong></div>
      </div>
    </TeacherAppModal>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useDocumentsData } from '~/composables/useDocumentsData'

definePageMeta({ layout: 'teacher' })

const route = useRoute()
const { loading } = usePageLoad()
const { requests } = useDocumentsData()
const showCancelModal = ref(false)
const showRestoreModal = ref(false)
const feedbackMessage = ref('')

const record = computed(() => requests.value.find(r => r.id === route.params.id))
const canRestoreRecord = computed(() =>
  !!record.value && record.value.status === 'ยกเลิกแล้ว' && record.value.canceledByRequester === true,
)

const statusSteps = ['รออนุมัติ', 'กำลังดำเนินการ', 'พร้อมรับ', 'รับแล้ว']

function currentStepIndex() {
  return statusSteps.indexOf(record.value?.status ?? '')
}
function isStepDone(i: number) { return i < currentStepIndex() }
function isStepActive(i: number) { return i === currentStepIndex() }

function docStatusVariant(s: string) {
  if (s === 'รับแล้ว') return 'success'
  if (s === 'พร้อมรับ') return 'info'
  if (s === 'กำลังดำเนินการ') return 'warning'
  if (s === 'ยกเลิกแล้ว') return 'neutral'
  return 'warning'
}

function cancelRequest() {
  if (!record.value || record.value.status !== 'รออนุมัติ') {
    showCancelModal.value = false
    return
  }
  record.value.status = 'ยกเลิกแล้ว'
  record.value.canceledByRequester = true
  record.value.note = 'ผู้ขอยกเลิกคำขอเอกสาร'
  showCancelModal.value = false
  showFeedback(`ยกเลิกคำขอ ${record.value.id} สำเร็จ`)
}

function restoreRequest() {
  if (!record.value || !canRestoreRecord.value) {
    showRestoreModal.value = false
    return
  }
  record.value.status = 'รออนุมัติ'
  record.value.canceledByRequester = false
  record.value.note = ''
  showRestoreModal.value = false
  showFeedback(`กู้คืนคำขอ ${record.value.id} สำเร็จ`)
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
.back-btn { display: inline-flex; align-items: center; gap: 6px; padding: 7px 12px; font-size: 0.82rem; color: #6b7280; text-decoration: none; border: 1px solid #d1d5db; border-radius: 8px; background: #fff; transition: background 0.12s, color 0.12s; }
.back-btn:hover { background: #f3f4f6; color: #374151; }
.page-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; margin-bottom: 24px; flex-wrap: wrap; }
.header-left { display: flex; align-items: flex-start; gap: 12px; flex-wrap: wrap; }
.header-actions { display: inline-flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.page-title { font-size: 1.3rem; font-weight: 700; color: #111827; margin: 0 0 4px; }
.page-desc { font-size: 0.875rem; color: #6b7280; margin: 0; }
.mono { font-family: monospace; }
.section-gap { margin-bottom: 20px; }
.status-track { display: flex; align-items: flex-start; gap: 0; background: #fff; border: 1px solid #f1f3f4; border-radius: 12px; padding: 20px; }
.step { display: flex; flex-direction: column; align-items: center; gap: 6px; flex: 1; position: relative; }
.step-dot { width: 14px; height: 14px; border-radius: 50%; background: #e5e7eb; border: 2px solid #e5e7eb; transition: all 0.2s; flex-shrink: 0; }
.step.done .step-dot { background: #16a34a; border-color: #16a34a; }
.step.active .step-dot { background: #16a34a; border-color: #16a34a; box-shadow: 0 0 0 4px rgba(22,163,74,.15); }
.step-label { font-size: 0.72rem; color: #9ca3af; text-align: center; white-space: nowrap; }
.step.done .step-label, .step.active .step-label { color: #374151; font-weight: 600; }
.step-line { position: absolute; top: 7px; left: 50%; width: 100%; height: 2px; background: #e5e7eb; z-index: 0; }
.step.done .step-line { background: #16a34a; }
.cancel-banner { display: flex; align-items: center; gap: 8px; background: #f3f4f6; border: 1px solid #e5e7eb; border-radius: 10px; padding: 12px 16px; font-size: 0.82rem; color: #4b5563; }
.detail-card { background: #fff; border: 1px solid #f1f3f4; border-radius: 12px; padding: 20px; display: flex; flex-direction: column; gap: 14px; }
.detail-card-title { font-size: 0.82rem; font-weight: 700; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.05em; }
.detail-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.dl { font-size: 0.82rem; color: #9ca3af; flex-shrink: 0; }
.dv { font-size: 0.875rem; color: #111827; font-weight: 500; }
.note-text { margin: 0; font-size: 0.875rem; color: #374151; line-height: 1.6; }
.ready-banner { display: flex; align-items: center; gap: 8px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 10px; padding: 12px 16px; font-size: 0.82rem; color: #15803d; margin-top: 4px; }
.btn-edit { background: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe; border-radius: 7px; padding: 7px 12px; font-size: 0.82rem; font-weight: 500; cursor: pointer; font-family: inherit; }
.btn-edit:hover { background: #dbeafe; }
.btn-delete { background: #fff5f5; color: #dc2626; border: 1px solid #fecaca; border-radius: 7px; padding: 7px 12px; font-size: 0.82rem; font-weight: 500; cursor: pointer; font-family: inherit; }
.btn-delete:hover { background: #fee2e2; }
.confirm-text { font-size: 0.85rem; color: #374151; margin-bottom: 10px; }
.confirm-box { display: flex; flex-direction: column; gap: 8px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px 12px; }
.confirm-item { display: flex; justify-content: space-between; gap: 8px; font-size: 0.82rem; color: #64748b; }
.confirm-item strong { color: #334155; font-weight: 600; text-align: right; }
.toast-floating { position: fixed; top: 18px; right: 18px; z-index: 60; display: inline-flex; align-items: center; gap: 8px; background: #ecfdf5; color: #166534; border: 1px solid #bbf7d0; border-radius: 10px; padding: 9px 12px; font-size: 0.82rem; font-weight: 600; box-shadow: 0 8px 24px rgba(15, 23, 42, 0.12); }
.feedback-dot { width: 7px; height: 7px; border-radius: 999px; background: #22c55e; }
.not-found { text-align: center; padding: 60px; color: #9ca3af; }

@media (max-width: 760px) {
  .toast-floating { top: 12px; right: 12px; left: 12px; justify-content: center; }
}
</style>
