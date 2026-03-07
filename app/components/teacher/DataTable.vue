<template>
  <div class="table-wrapper">
    <div class="table-head-row">
      <div class="title-area">
        <h3 v-if="title" class="table-title">{{ title }}</h3>
        <span v-if="rows.length" class="row-count">{{ rows.length }} รายการ</span>
      </div>
      <div class="head-right">
        <slot name="actions" />
        <div v-if="rows.length > 0" class="page-size-wrap">
          <span class="page-size-label">แสดง</span>
          <select v-model="localPageSize" class="page-size-sel" @change="currentPage = 1">
            <option :value="10">10</option>
            <option :value="20">20</option>
            <option :value="50">50</option>
            <option :value="100">100</option>
          </select>
          <span class="page-size-label">รายการ/หน้า</span>
        </div>
      </div>
    </div>

    <div class="scroll">
      <table class="data-table">
        <thead>
          <tr>
            <th v-for="col in columns" :key="col.key">{{ col.label }}</th>
            <th v-if="$slots.rowActions" class="th-actions" />
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, i) in pagedRows" :key="i" class="data-row">
            <td v-for="col in columns" :key="col.key">
              <slot :name="'cell-' + col.key" :row="row" :value="row[col.key]">
                {{ row[col.key] }}
              </slot>
            </td>
            <td v-if="$slots.rowActions" class="actions-cell">
              <slot name="rowActions" :row="row" />
            </td>
          </tr>
          <tr v-if="rows.length === 0">
            <td :colspan="columns.length + 1" class="empty">
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none" style="margin-bottom:8px;opacity:.4">
                <circle cx="14" cy="14" r="11" stroke="#9ca3af" stroke-width="1.5" fill="none" />
                <path d="M10 14h8" stroke="#9ca3af" stroke-width="1.5" stroke-linecap="round" />
              </svg>
              <div>ไม่มีข้อมูล</div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="totalPages > 1" class="pagination">
      <span class="page-info">{{ rangeStart }}–{{ rangeEnd }} จาก {{ rows.length }} รายการ</span>
      <div class="page-btns">
        <button type="button" class="page-btn" :disabled="currentPage === 1" @click="currentPage = 1">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 10.5L5.5 7 9 3.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M5 3.5v7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
        </button>
        <button type="button" class="page-btn" :disabled="currentPage === 1" @click="currentPage--">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M8.5 10.5L5 7l3.5-3.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </button>
        <button
          v-for="p in pageNumbers"
          :key="p"
          type="button"
          class="page-btn"
          :class="{ 'page-btn--active': p === currentPage, 'page-btn--dots': p === '…' }"
          :disabled="p === '…'"
          @click="typeof p === 'number' && (currentPage = p)"
        >{{ p }}</button>
        <button type="button" class="page-btn" :disabled="currentPage === totalPages" @click="currentPage++">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M5.5 10.5L9 7 5.5 3.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </button>
        <button type="button" class="page-btn" :disabled="currentPage === totalPages" @click="currentPage = totalPages">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M5 10.5L8.5 7 5 3.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M9 3.5v7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

export interface Column {
  key: string
  label: string
}

const props = defineProps<{
  title?: string
  columns: Column[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  rows: any[]
  pageSize?: number
}>()

const localPageSize = ref(props.pageSize ?? 10)
const currentPage = ref(1)

watch(() => props.rows, () => { currentPage.value = 1 })

const totalPages = computed(() => Math.max(1, Math.ceil(props.rows.length / localPageSize.value)))
const rangeStart = computed(() => props.rows.length === 0 ? 0 : (currentPage.value - 1) * localPageSize.value + 1)
const rangeEnd = computed(() => Math.min(currentPage.value * localPageSize.value, props.rows.length))
const pagedRows = computed(() =>
  props.rows.slice((currentPage.value - 1) * localPageSize.value, currentPage.value * localPageSize.value),
)

const pageNumbers = computed<(number | '…')[]>(() => {
  const total = totalPages.value
  const cur = currentPage.value
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const pages: (number | '…')[] = []
  const add = (n: number | '…') => { if (pages[pages.length - 1] !== n) pages.push(n) }
  add(1)
  if (cur > 3) add('…')
  for (let i = Math.max(2, cur - 1); i <= Math.min(total - 1, cur + 1); i++) add(i)
  if (cur < total - 2) add('…')
  add(total)
  return pages
})
</script>

<style scoped>
.table-wrapper { background: #fff; border: 1px solid #f1f3f4; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,.04); }
.table-head-row { display: flex; align-items: center; justify-content: space-between; padding: 16px 20px; gap: 12px; border-bottom: 1px solid #f1f3f4; flex-wrap: wrap; }
.title-area { display: flex; align-items: center; gap: 8px; }
.table-title { font-size: 0.95rem; font-weight: 700; color: #111827; }
.row-count { font-size: 0.78rem; color: #9ca3af; background: #f3f4f6; padding: 2px 8px; border-radius: 999px; font-weight: 500; }
.head-right { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.page-size-wrap { display: flex; align-items: center; gap: 6px; }
.page-size-label { font-size: 0.8rem; color: #6b7280; }
.page-size-sel { font-size: 0.8rem; border: 1px solid #e5e7eb; border-radius: 6px; padding: 3px 6px; color: #374151; background: #fff; font-family: inherit; outline: none; }

.scroll { overflow-x: auto; }
.data-table { width: 100%; border-collapse: collapse; font-size: 0.875rem; }
.data-table thead tr { background: #f9fafb; border-bottom: 1px solid #f1f3f4; }
.data-table th { padding: 10px 16px; text-align: left; font-size: 0.78rem; font-weight: 600; color: #6b7280; white-space: nowrap; letter-spacing: 0.03em; }
.th-actions { width: 1%; white-space: nowrap; }
.data-row { border-bottom: 1px solid #f9fafb; transition: background 0.1s; }
.data-row:last-child { border-bottom: none; }
.data-row:hover { background: #f9fafb; }
.data-table td { padding: 12px 16px; color: #374151; vertical-align: middle; }
.actions-cell { text-align: right; white-space: nowrap; }
.empty { text-align: center; padding: 48px 16px; color: #9ca3af; font-size: 0.875rem; }

.pagination { display: flex; align-items: center; justify-content: space-between; padding: 12px 20px; border-top: 1px solid #f1f3f4; flex-wrap: wrap; gap: 8px; }
.page-info { font-size: 0.8rem; color: #6b7280; }
.page-btns { display: flex; align-items: center; gap: 4px; }
.page-btn { background: none; border: 1px solid #e5e7eb; border-radius: 6px; padding: 4px 9px; font-size: 0.82rem; color: #374151; cursor: pointer; transition: background 0.1s, border-color 0.1s; min-width: 32px; display: flex; align-items: center; justify-content: center; font-family: inherit; }
.page-btn:hover:not(:disabled) { background: #f3f4f6; border-color: #d1d5db; }
.page-btn:disabled { opacity: .4; cursor: not-allowed; }
.page-btn--active { background: #16a34a; border-color: #16a34a; color: #fff; font-weight: 700; }
.page-btn--active:hover { background: #15803d; }
.page-btn--dots { border: none; cursor: default; }
</style>
