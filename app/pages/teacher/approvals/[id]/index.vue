<template>
  <div class="page">
    <TeacherAppSkeletonLoader v-if="loading" :rows="3" :cols="4" />
    <template v-else-if="record">
      <div class="page-header">
        <div class="header-left">
          <NuxtLink to="/teacher/approvals" class="back-btn">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 11L5 7l4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
            กลับ
          </NuxtLink>
          <div>
            <h2 class="page-title">{{ record.type }}</h2>
            <p class="page-desc">รหัสคำขอ: <span class="mono">{{ record.id }}</span></p>
          </div>
        </div>
        <div class="header-actions">
          <TeacherStatusBadge :label="record.status" :variant="statusVariant(record.status)" />
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

      <div class="detail-card section-gap">
        <div class="detail-card-title">รายละเอียดคำขอ</div>
        <div class="detail-row"><span class="dl">รหัสคำขอ</span><span class="dv mono">{{ record.id }}</span></div>
        <div class="detail-row"><span class="dl">ประเภทคำขอ</span><span class="dv">{{ record.type }}</span></div>
        <div class="detail-row"><span class="dl">แก้ไขอะไร</span><span class="dv">{{ record.editTargets?.length ? record.editTargets.join(', ') : '-' }}</span></div>
        <div class="detail-row"><span class="dl">ข้อมูลที่ขอแก้</span><span class="dv">{{ record.changeSummary || '-' }}</span></div>
        <div class="detail-row"><span class="dl">เหตุผล</span><span class="dv">{{ record.reason || '-' }}</span></div>
        <div class="detail-row"><span class="dl">รายละเอียด</span><span class="dv">{{ record.detail }}</span></div>
        <div class="detail-row"><span class="dl">ความสำคัญ</span>
          <TeacherStatusBadge :label="record.priority" :variant="priorityVariant(record.priority)" />
        </div>
        <div class="detail-row"><span class="dl">วันที่ส่ง</span><span class="dv">{{ record.submittedAt }}</span></div>
        <div class="detail-row"><span class="dl">สถานะ</span>
          <TeacherStatusBadge :label="record.status" :variant="statusVariant(record.status)" />
        </div>
      </div>

      <div v-if="record.status !== 'รออนุมัติ'" class="detail-card section-gap">
        <div class="detail-card-title">ผลการพิจารณา</div>
        <div class="detail-row"><span class="dl">อนุมัติโดย</span><span class="dv">{{ record.approvedBy || '-' }}</span></div>
        <div class="detail-row"><span class="dl">หมายเหตุ</span><span class="dv">{{ record.note || '-' }}</span></div>
      </div>

      <div v-if="record.status === 'รออนุมัติ'" class="info-banner">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="5.5" stroke="#d97706" stroke-width="1.3"/><line x1="7" y1="4.5" x2="7" y2="7.5" stroke="#d97706" stroke-width="1.3" stroke-linecap="round"/><circle cx="7" cy="9" r="0.7" fill="#d97706"/></svg>
        คำขอนี้กำลังรอการพิจารณาจากบุคลากร โปรดรอการตอบกลับ
      </div>
    </template>
    <div v-else class="not-found">ไม่พบข้อมูลคำขอ</div>

    <TeacherAppModal
      v-model="showCancelModal"
      title="ยืนยันการยกเลิกคำขอ"
      size="sm"
      confirm-label="ยืนยันยกเลิก"
      @confirm="cancelRequest"
    >
      <div class="confirm-text">ต้องการยกเลิกคำขอนี้ใช่หรือไม่</div>
      <div class="confirm-box" v-if="record">
        <div class="confirm-item"><span>รหัสคำขอ</span><strong>{{ record.id }}</strong></div>
        <div class="confirm-item"><span>ประเภท</span><strong>{{ record.type }}</strong></div>
      </div>
    </TeacherAppModal>

    <TeacherAppModal
      v-model="showRestoreModal"
      title="ยืนยันการกู้คืนคำขอ"
      size="sm"
      confirm-label="ยืนยันกู้คืน"
      @confirm="restoreRequest"
    >
      <div class="confirm-text">ต้องการกู้คืนคำขอนี้กลับไปเป็นรออนุมัติใช่หรือไม่</div>
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
import { useApprovalsData } from '~/composables/useApprovalsData'

definePageMeta({ layout: 'teacher' })

const route = useRoute()
const { loading } = usePageLoad()
const { rows } = useApprovalsData()
const showCancelModal = ref(false)
const showRestoreModal = ref(false)
const feedbackMessage = ref('')

const record = computed(() => rows.value.find(r => r.id === route.params.id))
const canRestoreRecord = computed(() => !!record.value && record.value.status === 'ยกเลิกแล้ว' && (!record.value.approvedBy || record.value.approvedBy === '-'))

function statusVariant(s: string) {
  if (s === 'อนุมัติแล้ว') return 'success'
  if (s === 'ปฏิเสธ') return 'danger'
  if (s === 'ยกเลิกแล้ว') return 'neutral'
  return 'warning'
}
function priorityVariant(p: string) {
  return p === 'ด่วนมาก' ? 'danger' : p === 'ด่วน' ? 'warning' : 'neutral'
}

function cancelRequest() {
  if (!record.value || record.value.status !== 'รออนุมัติ') {
    showCancelModal.value = false
    return
  }
  record.value.status = 'ยกเลิกแล้ว'
  record.value.note = 'ผู้ขอยกเลิกคำขอ'
  record.value.approvedBy = '-'
  showFeedback(`ยกเลิกคำขอ ${record.value.id} สำเร็จ`)
  showCancelModal.value = false
}

function restoreRequest() {
  if (!canRestoreRecord.value || !record.value) {
    showRestoreModal.value = false
    return
  }
  record.value.status = 'รออนุมัติ'
  record.value.note = ''
  record.value.approvedBy = ''
  showFeedback(`กู้คืนคำขอ ${record.value.id} สำเร็จ`)
  showRestoreModal.value = false
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
.toast-floating { position: fixed; top: 18px; right: 18px; z-index: 60; display: inline-flex; align-items: center; gap: 8px; background: #ecfdf5; color: #166534; border: 1px solid #bbf7d0; border-radius: 10px; padding: 9px 12px; font-size: 0.82rem; font-weight: 600; box-shadow: 0 8px 24px rgba(15, 23, 42, 0.12); }
.feedback-dot { width: 7px; height: 7px; border-radius: 999px; background: #22c55e; }
.mono { font-family: monospace; }
.section-gap { margin-bottom: 20px; }
.detail-card { background: #fff; border: 1px solid #f1f3f4; border-radius: 12px; padding: 20px; display: flex; flex-direction: column; gap: 14px; }
.detail-card-title { font-size: 0.82rem; font-weight: 700; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.05em; }
.detail-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.dl { font-size: 0.82rem; color: #9ca3af; flex-shrink: 0; }
.dv { font-size: 0.875rem; color: #111827; font-weight: 500; }
.info-banner { display: flex; align-items: center; gap: 8px; background: #fffbeb; border: 1px solid #fde68a; border-radius: 10px; padding: 12px 16px; font-size: 0.82rem; color: #92400e; }
.btn-edit { background: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe; border-radius: 7px; padding: 7px 12px; font-size: 0.82rem; font-weight: 500; cursor: pointer; font-family: inherit; }
.btn-edit:hover { background: #dbeafe; }
.btn-delete { background: #fff5f5; color: #dc2626; border: 1px solid #fecaca; border-radius: 7px; padding: 7px 12px; font-size: 0.82rem; font-weight: 500; cursor: pointer; font-family: inherit; }
.btn-delete:hover { background: #fee2e2; }
.confirm-text { font-size: 0.85rem; color: #374151; margin-bottom: 10px; }
.confirm-box { display: flex; flex-direction: column; gap: 8px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px 12px; }
.confirm-item { display: flex; justify-content: space-between; gap: 8px; font-size: 0.82rem; color: #64748b; }
.confirm-item strong { color: #334155; font-weight: 600; text-align: right; }
.not-found { text-align: center; padding: 60px; color: #9ca3af; }

@media (max-width: 760px) {
  .toast-floating { top: 12px; right: 12px; left: 12px; justify-content: center; }
}
</style>
