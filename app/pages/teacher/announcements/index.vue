<template>
  <div class="page">
    <TeacherAppSkeletonLoader v-if="loading" :rows="4" :cols="4" />
    <template v-else>
      <div class="page-header">
        <div>
          <h2 class="page-title">ประกาศและข่าวสาร</h2>
          <p class="page-desc">ประกาศจากโรงเรียนและฝ่ายต่างๆ</p>
        </div>
      </div>

      <div class="filter-row">
        <div class="search-wrap">
          <svg class="search-icon" width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="6" cy="6" r="4.5" stroke="#9ca3af" stroke-width="1.4"/><path d="M9.5 9.5L12 12" stroke="#9ca3af" stroke-width="1.4" stroke-linecap="round"/></svg>
          <input v-model="search" class="search-input" placeholder="ค้นหาประกาศ..." />
        </div>
        <select v-model="filterCategory" class="filter-select">
          <option value="">หมวดหมู่ทั้งหมด</option>
          <option v-for="c in categories" :key="c" :value="c">{{ c }}</option>
        </select>
      </div>

      <div v-if="pinned.length" class="pinned-section">
        <div class="section-label">
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M7.5 1L9 4.5H12L9.5 6.5L10.5 10L7.5 8L4.5 10L5.5 6.5L3 4.5H6L7.5 1Z" fill="#d97706" stroke="#d97706" stroke-width="0.5" stroke-linejoin="round"/></svg>
          ปักหมุด
        </div>
        <div v-for="row in pinned" :key="row.id" class="ann-card pinned" @click="goTo(row.id)">
          <div class="ann-main">
            <div class="ann-cat">{{ row.category }}</div>
            <div class="ann-title">{{ row.title }}</div>
            <div class="ann-summary">{{ row.summary }}</div>
          </div>
          <div class="ann-meta">
            <span class="ann-author">{{ row.author }}</span>
            <span class="ann-date">{{ row.publishedAt }}</span>
          </div>
        </div>
      </div>

      <div v-if="unpinned.length" class="list-section">
        <div class="section-label">ทั้งหมด</div>
        <div v-for="row in unpinned" :key="row.id" class="ann-card" @click="goTo(row.id)">
          <div class="ann-main">
            <div class="ann-cat">{{ row.category }}</div>
            <div class="ann-title">{{ row.title }}</div>
            <div class="ann-summary">{{ row.summary }}</div>
          </div>
          <div class="ann-meta">
            <span class="ann-author">{{ row.author }}</span>
            <span class="ann-date">{{ row.publishedAt }}</span>
          </div>
        </div>
      </div>

      <div v-if="!pinned.length && !unpinned.length" class="empty-state">
        ไม่พบประกาศ
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAnnouncementsData } from '~/composables/useAnnouncementsData'

definePageMeta({ layout: 'teacher' })

const { loading } = usePageLoad()
const { rows } = useAnnouncementsData()
const router = useRouter()

const search = ref('')
const filterCategory = ref('')

const categories = computed(() => [...new Set(rows.value.map(r => r.category))])

const filtered = computed(() => rows.value.filter(r => {
  if (search.value && !r.title.includes(search.value) && !r.summary.includes(search.value)) return false
  if (filterCategory.value && r.category !== filterCategory.value) return false
  return true
}))

const pinned = computed(() => filtered.value.filter(r => r.pinned))
const unpinned = computed(() => filtered.value.filter(r => !r.pinned))

function goTo(id: string) { router.push(`/teacher/announcements/${id}`) }
</script>

<style scoped>
.page { display: flex; flex-direction: column; gap: 0; }
.page-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 24px; }
.page-title { font-size: 1.3rem; font-weight: 700; color: #111827; margin: 0 0 4px; }
.page-desc { font-size: 0.875rem; color: #6b7280; margin: 0; }
.filter-row { display: flex; gap: 10px; flex-wrap: wrap; align-items: center; margin-bottom: 20px; }
.search-wrap { position: relative; flex: 1; min-width: 180px; }
.search-icon { position: absolute; left: 10px; top: 50%; transform: translateY(-50%); pointer-events: none; }
.search-input { width: 100%; padding: 8px 12px 8px 32px; border-radius: 8px; border: 1px solid #e5e7eb; font-size: 0.82rem; background: #fff; outline: none; box-sizing: border-box; }
.search-input:focus { border-color: #16a34a; }
.filter-select { padding: 8px 12px; border-radius: 8px; border: 1px solid #e5e7eb; font-size: 0.82rem; background: #fff; outline: none; cursor: pointer; }
.filter-select:focus { border-color: #16a34a; }
.pinned-section, .list-section { margin-bottom: 24px; }
.section-label { display: flex; align-items: center; gap: 6px; font-size: 0.75rem; font-weight: 700; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 10px; }
.ann-card { background: #fff; border: 1px solid #f1f3f4; border-radius: 12px; padding: 16px 20px; cursor: pointer; transition: box-shadow 0.15s, border-color 0.15s; display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; margin-bottom: 10px; }
.ann-card:hover { box-shadow: 0 2px 12px rgba(0,0,0,.07); border-color: #e5e7eb; }
.ann-card.pinned { border-left: 3px solid #d97706; background: linear-gradient(90deg, #fffbeb 0%, #fff 60%); }
.ann-main { flex: 1; display: flex; flex-direction: column; gap: 4px; }
.ann-cat { font-size: 0.7rem; font-weight: 700; color: #16a34a; text-transform: uppercase; letter-spacing: 0.05em; }
.ann-title { font-size: 0.95rem; font-weight: 700; color: #111827; line-height: 1.4; }
.ann-summary { font-size: 0.82rem; color: #6b7280; line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 2; line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.ann-meta { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; flex-shrink: 0; }
.ann-author { font-size: 0.72rem; color: #9ca3af; }
.ann-date { font-size: 0.72rem; color: #9ca3af; }
.empty-state { text-align: center; padding: 60px; color: #9ca3af; }
</style>
