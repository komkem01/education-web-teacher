<template>
  <div class="page">
    <TeacherAppSkeletonLoader v-if="loading" :rows="4" :cols="5" />
    <template v-else>
      <div class="page-header">
        <div>
          <h2 class="page-title">ข้อมูลส่วนตัว</h2>
          <p class="page-desc">ข้อมูลครูผู้ใช้งาน พร้อมส่งคำขอแก้ไขได้ทุกส่วน</p>
        </div>
        <button class="btn btn-primary" @click="openEditModal">ขอแก้ไขข้อมูล</button>
      </div>

      <div v-if="feedbackMessage" class="toast-floating" role="status" aria-live="polite">
        <span class="feedback-dot" aria-hidden="true"></span>
        {{ feedbackMessage }}
      </div>

      <div class="profile-hero">
        <div class="avatar">
          <span class="avatar-text">{{ profile.firstName.charAt(0) }}</span>
        </div>
        <div class="hero-info">
          <div class="hero-name">{{ profile.prefix }}{{ profile.firstName }} {{ profile.lastName }}</div>
          <div class="hero-code mono">{{ profile.code }}</div>
          <div class="hero-dept">{{ profile.department }}</div>
        </div>
      </div>

      <div class="detail-grid">
        <div class="detail-card">
          <div class="detail-card-title">ข้อมูลส่วนตัว</div>
          <div class="detail-row"><span class="dl">รหัสครู</span><span class="dv mono">{{ profile.code }}</span></div>
          <div class="detail-row"><span class="dl">คำนำหน้า</span><span class="dv">{{ profile.prefix }}</span></div>
          <div class="detail-row"><span class="dl">ชื่อ</span><span class="dv">{{ profile.firstName }}</span></div>
          <div class="detail-row"><span class="dl">นามสกุล</span><span class="dv">{{ profile.lastName }}</span></div>
          <div class="detail-row"><span class="dl">วัน/เดือน/ปีเกิด</span><span class="dv">{{ profile.dob }}</span></div>
          <div class="detail-row"><span class="dl">เพศ</span><span class="dv">{{ profile.gender }}</span></div>
          <div class="detail-row"><span class="dl">เลขบัตรประชาชน</span><span class="dv mono">{{ profile.idCard }}</span></div>
        </div>
        <div class="detail-card">
          <div class="detail-card-title">ข้อมูลการติดต่อ</div>
          <div class="detail-row"><span class="dl">อีเมล</span><span class="dv">{{ profile.email }}</span></div>
          <div class="detail-row"><span class="dl">เบอร์โทร</span><span class="dv">{{ profile.phone }}</span></div>
          <div class="detail-row"><span class="dl">ที่อยู่</span><span class="dv">{{ profile.address }}</span></div>
          <div class="detail-card-title" style="margin-top: 8px;">ข้อมูลวิชาชีพ</div>
          <div class="detail-row"><span class="dl">กลุ่มสาระ</span><span class="dv">{{ profile.department }}</span></div>
          <div class="detail-row"><span class="dl">วิทยฐานะ</span><span class="dv">{{ profile.academicStanding }}</span></div>
          <div class="detail-row"><span class="dl">วันที่เริ่มงาน</span><span class="dv">{{ profile.startDate }}</span></div>
          <div class="detail-row"><span class="dl">ใบอนุญาตประกอบวิชาชีพ</span><span class="dv mono">{{ profile.licenseNo }}</span></div>
          <div class="detail-row"><span class="dl">หมดอายุใบอนุญาต</span><span class="dv">{{ profile.licenseExpiry }}</span></div>
          <div class="detail-row"><span class="dl">ภาระงานสอน/สัปดาห์</span><span class="dv">{{ profile.weeklyTeachingHours }} ชั่วโมง</span></div>
        </div>
      </div>

      <div class="workload-grid">
        <div class="kpi-card">
          <div class="kpi-label">ชั่วโมงสอนต่อสัปดาห์</div>
          <div class="kpi-value">{{ profile.weeklyTeachingHours }}</div>
          <div class="kpi-sub">รวมคาบสอนทั้งหมด</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">รายวิชาที่ดูแล</div>
          <div class="kpi-value">{{ profile.activeCourses }}</div>
          <div class="kpi-sub">ภาคเรียนปัจจุบัน</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">ชั้นที่ปรึกษา</div>
          <div class="kpi-value">{{ profile.advisoryClass }}</div>
          <div class="kpi-sub">บทบาทปัจจุบัน</div>
        </div>
      </div>

      <div class="section-stack">
        <div class="detail-card">
          <div class="detail-card-title">ประวัติการศึกษา</div>
          <div v-for="(edu, i) in educationHistory" :key="`edu-${i}`" class="timeline-item">
            <div class="timeline-title">{{ edu.degree }} · {{ edu.institute }}</div>
            <div class="timeline-sub">{{ edu.field }} | {{ edu.year }}</div>
          </div>
        </div>

        <div class="detail-card">
          <div class="detail-card-title">ประวัติการทำงาน</div>
          <div v-for="(work, i) in workHistory" :key="`work-${i}`" class="timeline-item">
            <div class="timeline-title">{{ work.position }} · {{ work.organization }}</div>
            <div class="timeline-sub">{{ work.period }}</div>
          </div>
        </div>

        <div class="detail-card">
          <div class="detail-card-title">ประวัติคำขอแก้ไขข้อมูล</div>
          <div v-for="req in requestHistory" :key="req.id" class="timeline-item">
            <div class="timeline-row">
              <div class="timeline-title">{{ req.id }} · {{ req.sections }}</div>
              <TeacherStatusBadge :label="req.status" :variant="req.status === 'รออนุมัติ' ? 'warning' : req.status === 'อนุมัติแล้ว' ? 'success' : 'danger'" />
            </div>
            <div class="timeline-sub">{{ req.submittedAt }} · เหตุผล: {{ req.reason }}</div>
          </div>
        </div>

        <div class="detail-card">
          <div class="detail-card-title">Audit การแก้ไขข้อมูล</div>
          <div v-for="log in auditLogs" :key="log.id" class="timeline-item">
            <div class="timeline-title">{{ log.action }} · {{ log.target }}</div>
            <div class="timeline-sub">{{ log.performedAt }} · โดย {{ log.actor }}</div>
          </div>
        </div>
      </div>
    </template>

    <TeacherAppModal v-model="showEdit" title="ขอแก้ไขข้อมูลส่วนตัว" confirm-label="ส่งคำขอ" @confirm="submitEdit">
      <div class="warning-banner">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1L13 12H1L7 1Z" stroke="#d97706" stroke-width="1.3" fill="none"/><line x1="7" y1="5.5" x2="7" y2="8" stroke="#d97706" stroke-width="1.3" stroke-linecap="round"/><circle cx="7" cy="9.5" r="0.7" fill="#d97706"/></svg>
        การแก้ไขข้อมูลส่วนตัวต้องรอการอนุมัติจากฝ่ายบุคลากร
      </div>
      <div class="form-grid">
        <div class="form-group full-width">
          <label class="form-label">ส่วนที่ต้องการแก้ไข <span class="req">*</span></label>
          <div class="check-grid">
            <label v-for="opt in sectionOptions" :key="opt.value" class="check-item">
              <input
                :checked="selectedSections.includes(opt.value)"
                type="checkbox"
                @change="toggleSection(opt.value)"
              />
              <span>{{ opt.label }}</span>
            </label>
          </div>
        </div>

        <div v-if="selectedSections.includes('personal')" class="form-group full-width">
          <label class="form-label">ข้อมูลใหม่: ข้อมูลส่วนตัว <span class="req">*</span></label>
          <textarea v-model="editRequestValues.personal" class="form-input" rows="2" placeholder="เช่น ชื่อ-สกุล / วันเกิด / เลขบัตรประชาชน"></textarea>
        </div>

        <div v-if="selectedSections.includes('contact')" class="form-group full-width">
          <label class="form-label">ข้อมูลใหม่: ข้อมูลการติดต่อ <span class="req">*</span></label>
          <textarea v-model="editRequestValues.contact" class="form-input" rows="2" placeholder="เช่น เบอร์โทร / อีเมล / ที่อยู่"></textarea>
        </div>

        <div v-if="selectedSections.includes('professional')" class="form-group full-width">
          <label class="form-label">ข้อมูลใหม่: ข้อมูลวิชาชีพ <span class="req">*</span></label>
          <textarea v-model="editRequestValues.professional" class="form-input" rows="2" placeholder="เช่น กลุ่มสาระ / วิทยฐานะ / ใบอนุญาต"></textarea>
        </div>

        <div v-if="selectedSections.includes('education')" class="form-group full-width">
          <label class="form-label">ข้อมูลใหม่: ประวัติการศึกษา <span class="req">*</span></label>
          <textarea v-model="editRequestValues.education" class="form-input" rows="2" placeholder="เช่น วุฒิ / สาขา / สถาบัน / ปีที่จบ"></textarea>
        </div>

        <div v-if="selectedSections.includes('work')" class="form-group full-width">
          <label class="form-label">ข้อมูลใหม่: ประวัติการทำงาน <span class="req">*</span></label>
          <textarea v-model="editRequestValues.work" class="form-input" rows="2" placeholder="เช่น ตำแหน่ง / หน่วยงาน / ช่วงเวลา"></textarea>
        </div>

        <div v-if="selectedSections.includes('other')" class="form-group full-width">
          <label class="form-label">ระบุส่วนอื่นๆ ที่ต้องการแก้ไข <span class="req">*</span></label>
          <input v-model="otherSectionDetail" class="form-input" type="text" placeholder="เช่น เอกสารแนบ / ข้อมูลเพิ่มเติม" />
        </div>

        <div class="form-group full-width">
          <label class="form-label">เหตุผลในการแก้ไข <span class="req">*</span></label>
          <textarea v-model="editForm.reason" class="form-input" rows="3" placeholder="อธิบายเหตุผลที่ต้องการแก้ไข..."></textarea>
        </div>

        <div v-if="selectedSections.length || editForm.reason.trim()" class="summary-box full-width">
          <div class="summary-title">สรุปคำขอก่อนส่ง</div>
          <div class="summary-line"><span class="summary-label">ส่วนที่ขอแก้ไข:</span> {{ selectedSectionLabels || '-' }}</div>
          <div class="summary-line"><span class="summary-label">รายละเอียดข้อมูลใหม่:</span> {{ selectedChangeSummary || '-' }}</div>
          <div class="summary-line"><span class="summary-label">เหตุผล:</span> {{ editForm.reason.trim() || '-' }}</div>
        </div>

        <p v-if="submitAttempted && !isEditValid" class="form-error">กรุณาเลือกส่วนที่ต้องการแก้ไข กรอกข้อมูลใหม่ในทุกส่วน และระบุเหตุผลให้ครบถ้วน</p>
      </div>
    </TeacherAppModal>

    <TeacherAppModal v-model="showConfirmModal" title="ยืนยันการส่งคำขอ" size="sm" confirm-label="ยืนยันส่ง" @confirm="confirmSubmitEdit">
      <div class="confirm-text">ต้องการส่งคำขอแก้ไขข้อมูลนี้ใช่หรือไม่</div>
      <div class="confirm-box">
        <div class="confirm-item"><span>ส่วนที่แก้ไข</span><strong>{{ selectedSectionLabels || '-' }}</strong></div>
      </div>
    </TeacherAppModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ensureTeacherSession } from '~/composables/useTeacherSession'

definePageMeta({ layout: 'teacher' })

const { loading } = usePageLoad()
const showEdit = ref(false)
const showConfirmModal = ref(false)
const submitAttempted = ref(false)
const feedbackMessage = ref('')

const selectedSections = ref<string[]>([])
const otherSectionDetail = ref('')
const editForm = ref({ reason: '' })
const editRequestValues = ref<Record<string, string>>({
  personal: '',
  contact: '',
  professional: '',
  education: '',
  work: '',
})

const sectionOptions = [
  { value: 'personal', label: 'ข้อมูลส่วนตัว' },
  { value: 'contact', label: 'ข้อมูลการติดต่อ' },
  { value: 'professional', label: 'ข้อมูลวิชาชีพ' },
  { value: 'education', label: 'ประวัติการศึกษา' },
  { value: 'work', label: 'ประวัติการทำงาน' },
  { value: 'other', label: 'อื่นๆ' },
]

type BaseResponse<T> = { data: T }

type TeacherItem = {
  id: string
  teacher_code: string | null
  first_name: string | null
  last_name: string | null
  citizen_id: string | null
  phone: string | null
  current_position: string | null
  current_academic_standing: string | null
  department: string | null
  start_date: string | null
  addresses?: Array<{ address_line: string; is_primary: boolean }>
}

type TeacherEducationItem = {
  degree_level: string | null
  degree_name: string | null
  major: string | null
  university: string | null
  graduation_year: string | null
}

type TeacherWorkItem = {
  organization: string | null
  position: string | null
  start_date: string | null
  end_date: string | null
  is_current: boolean
}

type TeacherProfileRequestItem = {
  id: string
  requested_data: Record<string, unknown> | null
  reason: string | null
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
  processed_at: string | null
}

type SubjectAssignmentItem = {
  classroom_id: string
}

type ClassroomItem = { name: string | null }

const profile = ref({
  code: '-',
  prefix: '',
  firstName: '-',
  lastName: '',
  dob: '-',
  gender: '-',
  idCard: '-',
  email: '-',
  phone: '-',
  address: '-',
  department: '-',
  academicStanding: '-',
  startDate: '-',
  licenseNo: '-',
  licenseExpiry: '-',
  weeklyTeachingHours: 0,
  activeCourses: 0,
  advisoryClass: '-',
})

const educationHistory = ref<Array<{ degree: string; field: string; institute: string; year: string }>>([])
const workHistory = ref<Array<{ position: string; organization: string; period: string }>>([])
const requestHistory = ref<Array<{ id: string; sections: string; reason: string; submittedAt: string; status: string }>>([])
const auditLogs = ref<Array<{ id: string; action: string; target: string; performedAt: string; actor: string }>>([])

function formatThaiDate(value: string | null | undefined) {
  if (!value) return '-'
  return new Date(value).toLocaleDateString('th-TH', { timeZone: 'Asia/Bangkok' })
}

function formatThaiDateTime(value: string | null | undefined) {
  if (!value) return '-'
  return new Date(value).toLocaleString('th-TH', {
    timeZone: 'Asia/Bangkok',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function toThaiRequestStatus(status: TeacherProfileRequestItem['status']) {
  if (status === 'approved') return 'อนุมัติแล้ว'
  if (status === 'rejected') return 'ปฏิเสธ'
  return 'รออนุมัติ'
}

async function refreshProfileData() {
  const session = await ensureTeacherSession()
  const teacherID = session?.teacher?.id
  const token = useCookie<string | null>('edu_teacher_token')
  const config = useRuntimeConfig()
  if (!teacherID || !token.value) return

  const headers = { Authorization: `Bearer ${token.value}` }

  const [teacherRes, educationRes, workRes, requestRes, assignmentRes] = await Promise.all([
    $fetch<BaseResponse<TeacherItem>>(`${config.public.apiBase}/teachers/${teacherID}`, { headers }),
    $fetch<BaseResponse<TeacherEducationItem[]>>(`${config.public.apiBase}/teachers/${teacherID}/educations`, { headers }),
    $fetch<BaseResponse<TeacherWorkItem[]>>(`${config.public.apiBase}/teachers/${teacherID}/work-experiences`, { headers }),
    $fetch<BaseResponse<TeacherProfileRequestItem[]>>(`${config.public.apiBase}/teachers/${teacherID}/profile-requests`, { headers }),
    $fetch<BaseResponse<SubjectAssignmentItem[]>>(`${config.public.apiBase}/teachers/${teacherID}/subject-assignments?only_active=true`, { headers }),
  ])

  const teacher = teacherRes.data
  const primaryAddress = (teacher.addresses || []).find(addr => addr.is_primary)?.address_line || (teacher.addresses || [])[0]?.address_line || '-'

  profile.value = {
    code: teacher.teacher_code?.trim() || teacher.id,
    prefix: '',
    firstName: teacher.first_name?.trim() || '-',
    lastName: teacher.last_name?.trim() || '',
    dob: '-',
    gender: '-',
    idCard: teacher.citizen_id?.trim() || '-',
    email: session.member?.email || '-',
    phone: teacher.phone?.trim() || '-',
    address: primaryAddress,
    department: teacher.department?.trim() || '-',
    academicStanding: teacher.current_academic_standing?.trim() || '-',
    startDate: formatThaiDate(teacher.start_date),
    licenseNo: '-',
    licenseExpiry: '-',
    weeklyTeachingHours: 0,
    activeCourses: (assignmentRes.data || []).length,
    advisoryClass: '-',
  }

  educationHistory.value = (educationRes.data || []).map((item) => ({
    degree: item.degree_name?.trim() || item.degree_level?.trim() || '-',
    field: item.major?.trim() || '-',
    institute: item.university?.trim() || '-',
    year: item.graduation_year?.trim() || '-',
  }))

  workHistory.value = (workRes.data || []).map((item) => ({
    position: item.position?.trim() || '-',
    organization: item.organization?.trim() || '-',
    period: `${formatThaiDate(item.start_date)} - ${item.is_current ? 'ปัจจุบัน' : formatThaiDate(item.end_date)}`,
  }))

  const requests = (requestRes.data || []).slice().sort((a, b) => (a.created_at < b.created_at ? 1 : -1))
  requestHistory.value = requests.map((req) => {
    const data = req.requested_data || {}
    return {
      id: req.id,
      sections: String(data.sectionLabels || '-'),
      reason: req.reason?.trim() || '-',
      submittedAt: formatThaiDate(req.created_at),
      status: toThaiRequestStatus(req.status),
    }
  })

  auditLogs.value = requests.flatMap((req) => {
    const target = String(req.requested_data?.sectionLabels || '-')
    const items = [{
      id: `submit-${req.id}`,
      action: 'ส่งคำขอแก้ไข',
      target,
      performedAt: formatThaiDateTime(req.created_at),
      actor: `${profile.value.firstName} ${profile.value.lastName}`.trim() || 'ครูผู้ใช้งาน',
    }]
    if (req.status !== 'pending' && req.processed_at) {
      items.push({
        id: `processed-${req.id}`,
        action: req.status === 'approved' ? 'อนุมัติคำขอ' : 'ปฏิเสธคำขอ',
        target,
        performedAt: formatThaiDateTime(req.processed_at),
        actor: 'เจ้าหน้าที่บุคลากร',
      })
    }
    return items
  })

  const classroomIDs = [...new Set((assignmentRes.data || []).map(item => item.classroom_id).filter(Boolean))]
  if (classroomIDs.length > 0) {
    const classroomRes = await Promise.all(classroomIDs.map(async (id) => {
      try {
        const response = await $fetch<BaseResponse<ClassroomItem>>(`${config.public.apiBase}/teachers-meta/classrooms/${id}`, { headers })
        return response.data?.name?.trim() || ''
      }
      catch {
        return ''
      }
    }))
    profile.value.advisoryClass = classroomRes.find(Boolean) || '-'
  }
}

const selectedSectionLabels = computed(() =>
  selectedSections.value
    .map((value) => {
      if (value === 'other') {
        const detail = otherSectionDetail.value.trim()
        return detail ? `อื่นๆ (${detail})` : 'อื่นๆ'
      }
      return sectionOptions.find(opt => opt.value === value)?.label ?? value
    })
    .join(', '),
)

const selectedChangeSummary = computed(() =>
  selectedSections.value
    .filter(value => value !== 'other')
    .map((value) => {
      const label = sectionOptions.find(opt => opt.value === value)?.label ?? value
      const nextValue = (editRequestValues.value[value] ?? '').trim()
      return nextValue ? `${label} = ${nextValue}` : ''
    })
    .filter(Boolean)
    .join(', '),
)

const isEditValid = computed(() => {
  const hasSections = selectedSections.value.length > 0
  const hasReason = editForm.value.reason.trim().length > 0
  const hasOtherDetail = !selectedSections.value.includes('other') || otherSectionDetail.value.trim().length > 0
  const hasAllValues = selectedSections.value
    .filter(value => value !== 'other')
    .every(value => (editRequestValues.value[value] ?? '').trim().length > 0)
  return hasSections && hasReason && hasOtherDetail && hasAllValues
})

function openEditModal() {
  selectedSections.value = []
  otherSectionDetail.value = ''
  editForm.value = { reason: '' }
  editRequestValues.value = { personal: '', contact: '', professional: '', education: '', work: '' }
  submitAttempted.value = false
  showEdit.value = true
}

function toggleSection(value: string) {
  if (selectedSections.value.includes(value)) {
    selectedSections.value = selectedSections.value.filter(v => v !== value)
    if (value === 'other') otherSectionDetail.value = ''
    return
  }
  selectedSections.value = [...selectedSections.value, value]
}

function submitEdit() {
  submitAttempted.value = true
  if (!isEditValid.value) return
  showConfirmModal.value = true
}

async function confirmSubmitEdit() {
  const session = await ensureTeacherSession()
  const teacherID = session?.teacher?.id
  const token = useCookie<string | null>('edu_teacher_token')
  const config = useRuntimeConfig()
  if (!teacherID || !token.value) return

  const requestPayload = {
    requestType: 'teacher-profile-update',
    sections: selectedSections.value,
    sectionLabels: selectedSectionLabels.value,
    requestedChanges: selectedSections.value
      .filter(value => value !== 'other')
      .reduce((acc, value) => {
        acc[value] = (editRequestValues.value[value] ?? '').trim()
        return acc
      }, {} as Record<string, string>),
    otherSectionDetail: selectedSections.value.includes('other') ? otherSectionDetail.value.trim() : '',
    reason: editForm.value.reason.trim(),
  }

  await $fetch(`${config.public.apiBase}/teachers/${teacherID}/profile-requests`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token.value}`,
      'Content-Type': 'application/json',
    },
    body: {
      requested_data: requestPayload,
      reason: editForm.value.reason.trim(),
      status: 'pending',
    },
  })

  await refreshProfileData()

  showConfirmModal.value = false
  showEdit.value = false
  showFeedback('ส่งคำขอแก้ไขข้อมูลส่วนตัวสำเร็จ')
}

function showFeedback(message: string) {
  feedbackMessage.value = message
  setTimeout(() => {
    if (feedbackMessage.value === message) feedbackMessage.value = ''
  }, 2200)
}

if (import.meta.client) {
  refreshProfileData().catch(() => undefined)
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
.profile-hero { background: #fff; border: 1px solid #f1f3f4; border-radius: 12px; padding: 24px; display: flex; align-items: center; gap: 20px; margin-bottom: 20px; }
.avatar { width: 72px; height: 72px; border-radius: 50%; background: linear-gradient(135deg, #16a34a, #059669); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.avatar-text { font-size: 1.8rem; font-weight: 700; color: #fff; }
.hero-name { font-size: 1.15rem; font-weight: 700; color: #111827; margin-bottom: 4px; }
.hero-code { font-size: 0.82rem; color: #6b7280; margin-bottom: 4px; }
.hero-dept { font-size: 0.82rem; color: #16a34a; font-weight: 600; }
.mono { font-family: monospace; }
.detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
@media (max-width: 700px) { .detail-grid { grid-template-columns: 1fr; } }
.workload-grid { margin-top: 16px; margin-bottom: 16px; display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; }
.section-stack { margin-top: 16px; display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
@media (max-width: 700px) { .section-stack { grid-template-columns: 1fr; } }
.detail-card { background: #fff; border: 1px solid #f1f3f4; border-radius: 12px; padding: 20px; display: flex; flex-direction: column; gap: 14px; }
.detail-card-title { font-size: 0.82rem; font-weight: 700; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.05em; }
.detail-row { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; }
.dl { font-size: 0.82rem; color: #9ca3af; flex-shrink: 0; }
.dv { font-size: 0.875rem; color: #111827; font-weight: 500; text-align: right; }
.kpi-card { background: #fff; border: 1px solid #e8eaed; border-radius: 12px; padding: 12px 14px; display: flex; flex-direction: column; gap: 2px; }
.kpi-label { font-size: 0.76rem; color: #6b7280; font-weight: 600; }
.kpi-value { font-size: 1.2rem; color: #111827; font-weight: 800; }
.kpi-sub { font-size: 0.75rem; color: #9ca3af; }
.timeline-item { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px 12px; }
.timeline-row { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
.timeline-title { font-size: 0.84rem; color: #334155; font-weight: 600; }
.timeline-sub { margin-top: 3px; font-size: 0.78rem; color: #64748b; }
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
.toast-floating { position: fixed; top: 18px; right: 18px; z-index: 60; display: inline-flex; align-items: center; gap: 8px; background: #ecfdf5; color: #166534; border: 1px solid #bbf7d0; border-radius: 10px; padding: 9px 12px; font-size: 0.82rem; font-weight: 600; box-shadow: 0 8px 24px rgba(15, 23, 42, 0.12); }
.feedback-dot { width: 7px; height: 7px; border-radius: 999px; background: #22c55e; }

@media (max-width: 760px) {
  .form-grid { grid-template-columns: 1fr; }
  .check-grid { grid-template-columns: 1fr; }
  .workload-grid { grid-template-columns: 1fr; }
  .toast-floating { top: 12px; right: 12px; left: 12px; justify-content: center; }
}
</style>
