<template>
  <div class="page">
    <TeacherAppSkeletonLoader v-if="loading" :rows="3" :cols="4" />
    <template v-else-if="record">
      <div class="page-header">
        <div class="header-left">
          <NuxtLink to="/teacher/grades" class="back-btn">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 11L5 7l4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
            กลับ
          </NuxtLink>
          <div>
            <h2 class="page-title">รายละเอียดผลการเรียน</h2>
            <p class="page-desc">{{ record.studentName }} · {{ record.courseName }}</p>
          </div>
        </div>
        <div class="grade-tag" :class="gradeTagClass(record.grade)">เกรด {{ record.grade }}</div>
      </div>

      <div class="overview-card section-gap">
        <div class="overview-main">
          <div class="overview-label">คะแนนรวม</div>
          <div class="overview-total">{{ record.total ?? '-' }} <span>/ 120</span></div>
          <div class="overview-grade" :class="gradeClass(record.grade)">เกรด {{ record.grade }}</div>
        </div>
        <div class="overview-breakdown">
          <div class="break-item">
            <span>กลางภาค</span>
            <strong>{{ record.midterm ?? '-' }} / 50</strong>
          </div>
          <div class="break-item">
            <span>ปลายภาค</span>
            <strong>{{ record.final ?? '-' }} / 50</strong>
          </div>
          <div class="break-item">
            <span>จิตพิสัย</span>
            <strong>{{ record.behavior ?? '-' }} / 20</strong>
          </div>
        </div>
      </div>

      <div class="detail-grid">
        <div class="detail-card">
          <div class="detail-card-title">ข้อมูลนักเรียน</div>
          <div class="detail-row"><span class="dl">รหัสนักเรียน</span><span class="dv monospace">{{ record.studentCode }}</span></div>
          <div class="detail-row"><span class="dl">ชื่อ-สกุล</span><span class="dv">{{ record.studentName }}</span></div>
          <div class="detail-row"><span class="dl">ห้องเรียน</span><span class="dv">{{ record.classroom }}</span></div>
        </div>
        <div class="detail-card">
          <div class="detail-card-title">ข้อมูลรายวิชา</div>
          <div class="detail-row"><span class="dl">รายวิชา</span><span class="dv">{{ record.courseName }}</span></div>
          <div class="detail-row"><span class="dl">ภาคเรียน</span><span class="dv">{{ record.semester }}</span></div>
          <div class="detail-row"><span class="dl">สถานะผลการเรียน</span><span class="dv">{{ record.grade }}</span></div>
        </div>
      </div>
    </template>
    <div v-else class="not-found">ไม่พบข้อมูล</div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useGradesData } from '~/composables/useGradesData'

definePageMeta({ layout: 'teacher' })

const route = useRoute()
const { loading } = usePageLoad()
const { rows } = useGradesData()

const record = computed(() => rows.value.find(r => r.id === route.params.id))

function gradeClass(g: string) {
  if (g === 'มส' || g === '0' || g === 'ร') return 'fail'
  const n = parseFloat(g); if (isNaN(n)) return ''
  return n >= 3.5 ? 'a' : n >= 2.5 ? 'b' : n >= 1.5 ? 'c' : 'd'
}

function gradeTagClass(g: string) {
  const cls = gradeClass(g)
  return cls ? `grade-tag--${cls}` : ''
}
</script>

<style scoped>
.page { display: flex; flex-direction: column; gap: 0; }
.back-btn { display: inline-flex; align-items: center; gap: 6px; padding: 7px 12px; font-size: 0.82rem; color: #6b7280; text-decoration: none; border: 1px solid #d1d5db; border-radius: 8px; background: #fff; transition: background 0.12s, color 0.12s; }
.back-btn:hover { background: #f3f4f6; color: #374151; }
.page-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; flex-wrap: wrap; margin-bottom: 24px; }
.header-left { display: flex; align-items: flex-start; gap: 12px; flex-wrap: wrap; }
.page-title { font-size: 1.3rem; font-weight: 700; color: #111827; margin: 0 0 4px; }
.page-desc { font-size: 0.875rem; color: #6b7280; margin: 0; }
.section-gap { margin-bottom: 24px; }
.grade-tag { background: #f8fafc; border: 1px solid #e2e8f0; color: #475569; border-radius: 999px; padding: 6px 12px; font-size: 0.78rem; font-weight: 700; }
.grade-tag--a { background: #ecfdf5; color: #166534; border-color: #bbf7d0; }
.grade-tag--b { background: #eff6ff; color: #1d4ed8; border-color: #bfdbfe; }
.grade-tag--c { background: #fffbeb; color: #b45309; border-color: #fde68a; }
.grade-tag--d { background: #fff7ed; color: #c2410c; border-color: #fdba74; }
.grade-tag--fail { background: #fef2f2; color: #b91c1c; border-color: #fecaca; }

.overview-card { background: #fff; border: 1px solid #e8eaed; border-radius: 12px; padding: 16px; display: grid; grid-template-columns: 260px 1fr; gap: 14px; }
.overview-main { background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%); border: 1px solid #bbf7d0; border-radius: 10px; padding: 14px; display: flex; flex-direction: column; gap: 6px; }
.overview-label { font-size: 0.78rem; color: #6b7280; font-weight: 600; }
.overview-total { font-size: 1.65rem; font-weight: 800; color: #111827; line-height: 1.2; }
.overview-total span { font-size: 0.86rem; color: #6b7280; font-weight: 600; }
.overview-grade { font-size: 0.85rem; font-weight: 700; }
.overview-breakdown { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; }
.break-item { border: 1px solid #e5e7eb; border-radius: 10px; padding: 12px; display: flex; flex-direction: column; gap: 4px; }
.break-item span { font-size: 0.76rem; color: #9ca3af; font-weight: 600; }
.break-item strong { font-size: 1rem; color: #111827; }

.grade-big.a { color: #16a34a; }
.grade-big.b { color: #1d4ed8; }
.grade-big.c { color: #d97706; }
.grade-big.d { color: #ea580c; }
.grade-big.fail { color: #dc2626; }
.detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.detail-card { background: #fff; border: 1px solid #f1f3f4; border-radius: 12px; padding: 20px; display: flex; flex-direction: column; gap: 12px; }
.detail-card-title { font-size: 0.82rem; font-weight: 700; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.05em; }
.detail-row { display: flex; align-items: center; justify-content: space-between; }
.dl { font-size: 0.82rem; color: #9ca3af; }
.dv { font-size: 0.875rem; color: #111827; font-weight: 500; }
.monospace { font-family: monospace; }
.not-found { text-align: center; padding: 60px; color: #9ca3af; }

@media (max-width: 960px) {
  .overview-card { grid-template-columns: 1fr; }
  .overview-breakdown { grid-template-columns: 1fr; }
  .detail-grid { grid-template-columns: 1fr; }
}
</style>
