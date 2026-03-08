<template>
  <div class="page">
    <TeacherAppSkeletonLoader v-if="loading" :show-cards="true" :rows="4" :cols="5" />
    <template v-else>
      <div class="page-header">
        <div>
          <h2 class="page-title">ยินดีต้อนรับ นายสมชาย ใจดี</h2>
          <p class="page-desc">ครูผู้สอน · โรงเรียนตัวอย่างวิทยา · ปีการศึกษา 2568</p>
        </div>
      </div>

      <!-- Metric Cards -->
      <div class="grid-4 section-gap">
        <TeacherMetricCard icon="📚" label="รายวิชาที่สอน" :value="String(totalCourses)" sub="ภาคเรียน 1/2568" :trend="0" accent="#16a34a" />
        <TeacherMetricCard icon="🎓" label="นักเรียนทั้งหมด" :value="String(totalStudents)" sub="ในรายวิชาของฉัน" :trend="1" accent="#1d4ed8" />
        <TeacherMetricCard icon="✅" label="คำขอรออนุมัติ" :value="String(pendingApprovals)" sub="รอการพิจารณา" :trend="0" accent="#f59e0b" />
        <TeacherMetricCard icon="📄" label="คำขอเอกสาร" :value="String(pendingDocs)" sub="รออนุมัติ/กำลังดำเนินการ" :trend="0" accent="#8b5cf6" />
      </div>

      <!-- Mid stats -->
      <div class="grid-3 section-gap">
        <!-- Courses summary -->
        <div class="stat-card">
          <div class="stat-label">รายวิชาของฉัน</div>
          <div class="stat-row"><span>เปิดสอนแล้ว</span><strong>{{ openCourses }}</strong></div>
          <div class="stat-row"><span>รออนุมัติ</span><strong>{{ pendingCourses }}</strong></div>
          <div class="stat-row"><span>ปิดสอน</span><strong>{{ closedCourses }}</strong></div>
          <NuxtLink to="/teacher/courses" class="stat-link">จัดการรายวิชา →</NuxtLink>
        </div>

        <!-- Attendance summary -->
        <div class="stat-card">
          <div class="stat-label">การเข้าเรียนวันนี้</div>
          <div class="stat-row"><span>มาเรียน</span><strong class="text-green">{{ presentToday }}</strong></div>
          <div class="stat-row"><span>ขาดเรียน</span><strong class="text-red">{{ absentToday }}</strong></div>
          <div class="stat-row"><span>ลา/สาย</span><strong class="text-yellow">{{ lateToday }}</strong></div>
          <NuxtLink to="/teacher/attendance" class="stat-link">เช็คชื่อนักเรียน →</NuxtLink>
        </div>

        <!-- Grades summary -->
        <div class="stat-card">
          <div class="stat-label">ผลการเรียน</div>
          <div class="stat-row"><span>บันทึกแล้ว</span><strong>{{ gradedStudents }}</strong></div>
          <div class="stat-row"><span>ยังไม่บันทึก</span><strong>{{ ungradedStudents }}</strong></div>
          <div class="stat-row"><span>ติด มส/0</span><strong class="text-red">{{ failedStudents }}</strong></div>
          <NuxtLink to="/teacher/grades" class="stat-link">จัดการผลการเรียน →</NuxtLink>
        </div>
      </div>

      <!-- Recent approval requests -->
      <div class="section-gap">
        <div class="table-header-row">
          <h3 class="section-title">คำขอล่าสุดของฉัน</h3>
          <NuxtLink to="/teacher/approvals" class="btn-ghost-sm">ดูทั้งหมด →</NuxtLink>
        </div>
        <div class="approvals-list">
          <div v-if="recentApprovals.length === 0" class="empty-state">ไม่มีคำขอที่รออนุมัติ 🎉</div>
          <div v-for="req in recentApprovals" :key="req.id" class="approval-row">
            <div class="approval-info">
              <div class="approval-type">{{ req.type }}</div>
              <div class="approval-meta">{{ req.detail }} · {{ req.submittedAt }}</div>
            </div>
            <div class="approval-right">
              <span :class="statusClass(req.status)">{{ req.status }}</span>
              <NuxtLink :to="'/teacher/approvals/' + req.id" class="btn-view-sm">ดูรายละเอียด</NuxtLink>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Links -->
      <div>
        <h3 class="section-title" style="margin-bottom:14px">ทางลัด</h3>
        <div class="quick-links">
          <NuxtLink to="/teacher/courses" class="quick-link">
            <span class="ql-icon">📚</span>
            <span class="ql-label">รายวิชา</span>
          </NuxtLink>
          <NuxtLink to="/teacher/timetable" class="quick-link">
            <span class="ql-icon">🗓️</span>
            <span class="ql-label">ตารางสอน</span>
          </NuxtLink>
          <NuxtLink to="/teacher/attendance" class="quick-link">
            <span class="ql-icon">✅</span>
            <span class="ql-label">เช็คชื่อ</span>
          </NuxtLink>
          <NuxtLink to="/teacher/grades" class="quick-link">
            <span class="ql-icon">⭐</span>
            <span class="ql-label">ผลการเรียน</span>
          </NuxtLink>
          <NuxtLink to="/teacher/students" class="quick-link">
            <span class="ql-icon">🎓</span>
            <span class="ql-label">นักเรียน</span>
          </NuxtLink>
          <NuxtLink to="/teacher/approvals" class="quick-link">
            <span class="ql-icon">📋</span>
            <span class="ql-label">คำขอของฉัน</span>
          </NuxtLink>
          <NuxtLink to="/teacher/documents" class="quick-link">
            <span class="ql-icon">📄</span>
            <span class="ql-label">ขอเอกสาร</span>
          </NuxtLink>
          <NuxtLink to="/teacher/announcements" class="quick-link">
            <span class="ql-icon">📢</span>
            <span class="ql-label">ประกาศ</span>
          </NuxtLink>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useCoursesData } from '~/composables/useCoursesData'
import { useStudentsData } from '~/composables/useStudentsData'
import { useAttendanceData } from '~/composables/useAttendanceData'
import { useGradesData } from '~/composables/useGradesData'
import { useApprovalsData } from '~/composables/useApprovalsData'
import { useDocumentsData } from '~/composables/useDocumentsData'

definePageMeta({ layout: 'teacher' })

const { loading } = usePageLoad()

const { rows: courseRows } = useCoursesData()
const { rows: studentRows } = useStudentsData()
const { records: attendanceRecords } = useAttendanceData()
const { rows: gradeRows } = useGradesData()
const { rows: approvalRows } = useApprovalsData()
const { requests: docRequests } = useDocumentsData()

const totalCourses = computed(() => courseRows.value.filter(c => c.status === 'เปิดสอน').length)
const totalStudents = computed(() => studentRows.value.length)
const openCourses = computed(() => courseRows.value.filter(c => c.status === 'เปิดสอน').length)
const pendingCourses = computed(() => courseRows.value.filter(c => c.status === 'รออนุมัติ').length)
const closedCourses = computed(() => courseRows.value.filter(c => c.status === 'ปิดสอน').length)
const presentToday = computed(() => attendanceRecords.value.filter(a => a.status === 'มา').length)
const absentToday = computed(() => attendanceRecords.value.filter(a => a.status === 'ขาด').length)
const lateToday = computed(() => attendanceRecords.value.filter(a => a.status === 'ลา' || a.status === 'สาย').length)
const gradedStudents = computed(() => gradeRows.value.filter(g => g.total !== null).length)
const ungradedStudents = computed(() => gradeRows.value.filter(g => g.total === null && g.grade !== 'มส').length)
const failedStudents = computed(() => gradeRows.value.filter(g => g.grade === 'มส' || g.grade === '0').length)
const pendingApprovals = computed(() => approvalRows.value.filter(r => r.status === 'รออนุมัติ').length)
const pendingDocs = computed(() => docRequests.value.filter(d => d.status === 'รออนุมัติ' || d.status === 'กำลังดำเนินการ').length)

const recentApprovals = computed(() => approvalRows.value.slice(0, 5))

function statusClass(s: string) {
  if (s === 'อนุมัติแล้ว') return 'status-approved'
  if (s === 'ปฏิเสธ') return 'status-rejected'
  return 'status-pending'
}
</script>

<style scoped>
.page { display: flex; flex-direction: column; gap: 0; }
.page-header { margin-bottom: 24px; }
.page-title { font-size: 1.3rem; font-weight: 700; color: #111827; margin: 0 0 4px; }
.page-desc { font-size: 0.875rem; color: #6b7280; margin: 0; }
.section-gap { margin-bottom: 24px; }

.grid-4 { display: grid; grid-template-columns: repeat(4,1fr); gap: 16px; }
.grid-3 { display: grid; grid-template-columns: repeat(3,1fr); gap: 16px; }
@media (max-width: 1100px) { .grid-4 { grid-template-columns: repeat(2,1fr); } }
@media (max-width: 700px) { .grid-4, .grid-3 { grid-template-columns: 1fr; } }

.stat-card { background: #fff; border: 1px solid #f1f3f4; border-radius: 12px; padding: 18px 20px; display: flex; flex-direction: column; gap: 10px; box-shadow: 0 1px 3px rgba(0,0,0,.04); }
.stat-label { font-size: 0.82rem; font-weight: 600; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.04em; }
.stat-row { display: flex; align-items: center; justify-content: space-between; font-size: 0.875rem; color: #374151; }
.stat-row strong { font-weight: 700; color: #111827; }
.text-green { color: #16a34a !important; }
.text-red { color: #dc2626 !important; }
.text-yellow { color: #d97706 !important; }
.stat-link { font-size: 0.8rem; color: #16a34a; font-weight: 500; margin-top: 4px; text-decoration: none; }
.stat-link:hover { color: #15803d; }

.table-header-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
.section-title { font-size: 0.97rem; font-weight: 600; color: #111827; }
.btn-ghost-sm { display: inline-flex; align-items: center; border-radius: 7px; padding: 6px 12px; font-size: 0.82rem; font-weight: 500; cursor: pointer; border: 1px solid #d1d5db; background: #fff; color: #374151; text-decoration: none; transition: background 0.12s; }
.btn-ghost-sm:hover { background: #f9fafb; }

.approvals-list { display: flex; flex-direction: column; background: #fff; border: 1px solid #e5e7eb; border-radius: 10px; overflow: hidden; }
.empty-state { padding: 32px; text-align: center; color: #9ca3af; font-size: 0.875rem; }
.approval-row { display: flex; align-items: center; justify-content: space-between; padding: 14px 18px; gap: 12px; border-bottom: 1px solid #f3f4f6; transition: background 0.1s; }
.approval-row:last-child { border-bottom: none; }
.approval-row:hover { background: #f9fafb; }
.approval-info { flex: 1; min-width: 0; }
.approval-type { font-size: 0.875rem; font-weight: 600; color: #111827; }
.approval-meta { font-size: 0.78rem; color: #9ca3af; margin-top: 2px; }
.approval-right { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }
.btn-view-sm { font-size: 0.78rem; color: #374151; text-decoration: none; border: 1px solid #e5e7eb; border-radius: 6px; padding: 3px 10px; background: #fff; font-weight: 500; white-space: nowrap; }
.btn-view-sm:hover { background: #f9fafb; }
.status-approved { background: #f0fdf4; color: #16a34a; padding: 2px 8px; border-radius: 9999px; font-size: 0.75rem; font-weight: 600; }
.status-rejected { background: #fef2f2; color: #dc2626; padding: 2px 8px; border-radius: 9999px; font-size: 0.75rem; font-weight: 600; }
.status-pending { background: #fffbeb; color: #d97706; padding: 2px 8px; border-radius: 9999px; font-size: 0.75rem; font-weight: 600; }

.quick-links { display: grid; grid-template-columns: repeat(auto-fill, minmax(110px,1fr)); gap: 12px; }
.quick-link { display: flex; flex-direction: column; align-items: center; gap: 8px; background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 18px 12px; text-decoration: none; transition: box-shadow 0.12s, border-color 0.12s; }
.quick-link:hover { box-shadow: 0 2px 8px rgba(22,163,74,.12); border-color: #bbf7d0; }
.ql-icon { font-size: 1.5rem; }
.ql-label { font-size: 0.8rem; color: #374151; font-weight: 500; text-align: center; }
</style>
