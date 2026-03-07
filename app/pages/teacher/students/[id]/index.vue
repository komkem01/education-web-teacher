<template>
  <div class="page">
    <TeacherAppSkeletonLoader v-if="loading" :rows="3" :cols="4" />
    <template v-else-if="student">
      <div class="page-header">
        <NuxtLink to="/teacher/students" class="back-btn">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 11L5 7l4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
          กลับ
        </NuxtLink>
        <div class="student-hero">
          <div class="student-avatar">{{ student.name.charAt(student.name.lastIndexOf(' ') + 1) }}</div>
          <div>
            <h2 class="page-title">{{ student.name }}</h2>
            <p class="page-desc">รหัส {{ student.code }} · {{ student.classroom }}</p>
          </div>
          <div class="header-actions">
            <TeacherStatusBadge :label="student.status" :variant="student.status === 'ปกติ' ? 'success' : 'warning'" />
            <button type="button" class="btn btn-edit" @click="openRequestModal">ขอแก้ไขข้อมูล</button>
          </div>
        </div>
      </div>

      <!-- Detail cards -->
      <div class="detail-grid section-gap">
        <div class="detail-card">
          <div class="detail-card-title">ข้อมูลส่วนตัว</div>
          <div class="detail-row"><span class="dl">รหัสนักเรียน</span><span class="dv monospace">{{ student.code }}</span></div>
          <div class="detail-row"><span class="dl">ชื่อ-สกุล</span><span class="dv">{{ student.name }}</span></div>
          <div class="detail-row"><span class="dl">ห้องเรียน</span><span class="dv">{{ student.classroom }}</span></div>
          <div class="detail-row"><span class="dl">ระดับชั้น</span><span class="dv">{{ student.level }}</span></div>
          <div class="detail-row"><span class="dl">สถานะ</span>
            <TeacherStatusBadge :label="student.status" :variant="student.status === 'ปกติ' ? 'success' : 'warning'" />
          </div>
        </div>
        <div class="detail-card">
          <div class="detail-card-title">ผู้ปกครอง</div>
          <div class="detail-row"><span class="dl">ชื่อผู้ปกครอง</span><span class="dv">{{ student.guardian }}</span></div>
          <div class="detail-row"><span class="dl">เบอร์โทร</span><span class="dv">{{ student.phone }}</span></div>
        </div>
      </div>
    </template>
    <div v-else class="not-found">ไม่พบข้อมูลนักเรียน</div>

    <TeacherAppModal v-model="showRequestModal" title="ขอแก้ไขข้อมูลนักเรียน" size="md" confirm-label="ส่งคำขอ" @confirm="prepareRequestConfirm">
      <div class="form-body">
        <div class="form-note">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="6" stroke="#d97706" stroke-width="1.3"/><path d="M7 4v4M7 9.5v.5" stroke="#d97706" stroke-width="1.4" stroke-linecap="round"/></svg>
          คำขอแก้ไขต้องรอการอนุมัติจากบุคลากร
        </div>
        <div class="form-row">
          <label class="form-label">ส่วนที่ต้องการแก้ไข <span class="req">*</span></label>
          <select v-model="requestField" class="input">
            <option value="">เลือกข้อมูล</option>
            <option>ที่อยู่</option><option>เบอร์โทรศัพท์ผู้ปกครอง</option>
            <option>ชื่อผู้ปกครอง</option><option>ข้อมูลสุขภาพ</option><option>อื่นๆ</option>
          </select>
        </div>
        <div v-if="requestField === 'อื่นๆ'" class="form-row">
          <label class="form-label">ระบุส่วนที่ต้องการแก้ไข <span class="req">*</span></label>
          <input v-model="requestOtherPart" class="input" type="text" placeholder="เช่น วันเดือนปีเกิด / เลขบัตรประชาชน" />
        </div>
        <div class="form-row">
          <label class="form-label">รายละเอียด <span class="req">*</span></label>
          <textarea v-model="requestDetail" class="input textarea" rows="3" placeholder="อธิบายรายละเอียดที่ต้องการเปลี่ยนแปลง..." />
        </div>
        <div v-if="requestField || requestDetail.trim()" class="summary-box">
          <div class="summary-title">สรุปคำขอแก้ไข</div>
          <div class="summary-line"><span class="summary-label">ส่วนที่จะแก้ไข:</span> {{ selectedEditSection || '-' }}</div>
          <div class="summary-line"><span class="summary-label">รายละเอียด:</span> {{ requestDetail.trim() || '-' }}</div>
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
          <div class="confirm-item"><span>นักเรียน</span><strong>{{ student ? `${student.name} (${student.code})` : '-' }}</strong></div>
          <div class="confirm-item"><span>ส่วนที่จะแก้ไข</span><strong>{{ selectedEditSection || '-' }}</strong></div>
          <div class="confirm-item"><span>รายละเอียด</span><strong>{{ requestDetail.trim() || '-' }}</strong></div>
        </div>
      </div>
    </TeacherAppModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useStudentsData } from '~/composables/useStudentsData'

definePageMeta({ layout: 'teacher' })

const route = useRoute()
const { loading } = usePageLoad()
const { rows } = useStudentsData()

const showRequestModal = ref(false)
const showRequestConfirmModal = ref(false)
const requestField = ref('')
const requestOtherPart = ref('')
const requestDetail = ref('')
const requestSubmitAttempted = ref(false)

const student = computed(() => rows.value.find(s => s.id === route.params.id))

const selectedEditSection = computed(() => {
  if (requestField.value !== 'อื่นๆ') return requestField.value
  const other = requestOtherPart.value.trim()
  return other ? `อื่นๆ (${other})` : 'อื่นๆ'
})

const isRequestValid = computed(() => {
  const hasField = requestField.value.trim().length > 0
  const hasDetail = requestDetail.value.trim().length > 0
  const hasOtherPart = requestField.value !== 'อื่นๆ' || requestOtherPart.value.trim().length > 0
  return hasField && hasDetail && hasOtherPart
})

function openRequestModal() {
  requestField.value = ''
  requestOtherPart.value = ''
  requestDetail.value = ''
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
  requestField.value = ''
  requestOtherPart.value = ''
  requestDetail.value = ''
  requestSubmitAttempted.value = false
}
</script>

<style scoped>
.page { display: flex; flex-direction: column; gap: 0; }
.back-btn { display: inline-flex; align-items: center; gap: 6px; padding: 7px 12px; font-size: 0.82rem; color: #6b7280; text-decoration: none; border: 1px solid #d1d5db; border-radius: 8px; background: #fff; transition: background 0.12s, color 0.12s; }
.back-btn:hover { background: #f3f4f6; color: #374151; }
.page-header { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; margin-bottom: 24px; }
.student-hero { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; flex: 1; min-width: 0; }
.student-avatar { width: 52px; height: 52px; background: linear-gradient(135deg, #16a34a, #059669); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.3rem; font-weight: 700; color: #fff; flex-shrink: 0; }
.page-title { font-size: 1.3rem; font-weight: 700; color: #111827; margin: 0 0 4px; }
.page-desc { font-size: 0.875rem; color: #6b7280; margin: 0; }
.header-actions { display: flex; align-items: center; gap: 10px; margin-left: auto; }
.section-gap { margin-bottom: 24px; }
.detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
@media (max-width: 700px) { .detail-grid { grid-template-columns: 1fr; } }
.detail-card { background: #fff; border: 1px solid #f1f3f4; border-radius: 12px; padding: 20px; display: flex; flex-direction: column; gap: 12px; }
.detail-card-title { font-size: 0.82rem; font-weight: 700; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.05em; }
.detail-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.dl { font-size: 0.82rem; color: #9ca3af; }
.dv { font-size: 0.875rem; color: #111827; font-weight: 500; }
.monospace { font-family: monospace; }
.btn { display: inline-flex; align-items: center; gap: 6px; border-radius: 7px; padding: 7px 14px; font-size: 0.875rem; font-weight: 500; cursor: pointer; border: 1px solid transparent; font-family: inherit; transition: background 0.12s; white-space: nowrap; }
.btn-edit { background: #eff6ff; color: #1d4ed8; border-color: #bfdbfe; }
.btn-edit:hover { background: #dbeafe; }
.not-found { text-align: center; padding: 60px; color: #9ca3af; }
.form-body { display: flex; flex-direction: column; gap: 16px; }
.form-note { display: flex; align-items: center; gap: 6px; background: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 10px 14px; font-size: 0.82rem; color: #92400e; }
.form-row { display: flex; flex-direction: column; gap: 6px; }
.form-label { font-size: 0.82rem; font-weight: 600; color: #374151; }
.req { color: #dc2626; }
.input { width: 100%; padding: 8px 12px; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 0.875rem; font-family: inherit; color: #111827; background: #fff; outline: none; }
.input:focus { border-color: #16a34a; }
.textarea { resize: vertical; min-height: 72px; }
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
</style>
