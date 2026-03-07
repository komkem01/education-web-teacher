<template>
  <div class="page">
    <TeacherAppSkeletonLoader v-if="loading" :rows="3" :cols="3" />
    <template v-else-if="record">
      <div class="page-header">
        <div class="header-left">
          <NuxtLink to="/teacher/announcements" class="back-btn">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 11L5 7l4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
            กลับ
          </NuxtLink>
          <div>
            <div class="ann-category">{{ record.category }}</div>
            <h2 class="page-title">{{ record.title }}</h2>
            <div class="ann-meta">
              <span>{{ record.author }}</span>
              <span class="dot">·</span>
              <span>{{ record.publishedAt }}</span>
              <span v-if="record.pinned" class="pin-chip">
                <svg width="11" height="11" viewBox="0 0 13 13" fill="none"><path d="M7.5 1L9 4.5H12L9.5 6.5L10.5 10L7.5 8L4.5 10L5.5 6.5L3 4.5H6L7.5 1Z" fill="#d97706" stroke="#d97706" stroke-width="0.5" stroke-linejoin="round"/></svg>
                ปักหมุด
              </span>
            </div>
          </div>
        </div>
        <TeacherStatusBadge :label="record.status" :variant="record.status === 'เผยแพร่แล้ว' ? 'success' : 'neutral'" />
      </div>

      <div class="content-card">
        <p class="content-text">{{ record.summary }}</p>
      </div>
    </template>
    <div v-else class="not-found">ไม่พบประกาศ</div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAnnouncementsData } from '~/composables/useAnnouncementsData'

definePageMeta({ layout: 'teacher' })

const route = useRoute()
const { loading } = usePageLoad()
const { rows } = useAnnouncementsData()

const record = computed(() => rows.value.find(r => r.id === route.params.id))
</script>

<style scoped>
.page { display: flex; flex-direction: column; gap: 0; }
.back-btn { display: inline-flex; align-items: center; gap: 6px; padding: 7px 12px; font-size: 0.82rem; color: #6b7280; text-decoration: none; border: 1px solid #d1d5db; border-radius: 8px; background: #fff; transition: background 0.12s, color 0.12s; }
.back-btn:hover { background: #f3f4f6; color: #374151; }
.page-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; margin-bottom: 24px; flex-wrap: wrap; }
.header-left { display: flex; align-items: flex-start; gap: 12px; flex-wrap: wrap; }
.ann-category { font-size: 0.7rem; font-weight: 700; color: #16a34a; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 6px; }
.page-title { font-size: 1.4rem; font-weight: 800; color: #111827; margin: 0 0 10px; line-height: 1.4; }
.ann-meta { display: flex; align-items: center; gap: 6px; font-size: 0.78rem; color: #9ca3af; flex-wrap: wrap; }
.dot { color: #d1d5db; }
.pin-chip { display: inline-flex; align-items: center; gap: 3px; background: #fffbeb; color: #d97706; border-radius: 6px; padding: 2px 7px; font-size: 0.7rem; font-weight: 600; }
.content-card { background: #fff; border: 1px solid #f1f3f4; border-radius: 12px; padding: 28px; line-height: 1.8; }
.content-text { margin: 0; font-size: 0.9rem; color: #374151; line-height: 1.8; white-space: pre-line; }
.not-found { text-align: center; padding: 60px; color: #9ca3af; }
</style>
