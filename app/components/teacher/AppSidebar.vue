<template>
  <aside class="sidebar" :class="{ collapsed }">
    <!-- Logo -->
    <div class="sidebar-header">
      <div class="logo-mark">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M10 2L3 6v8l7 4 7-4V6L10 2z" fill="#fff" fill-opacity=".9" />
        </svg>
      </div>
      <Transition name="fade">
        <div v-if="!collapsed" class="logo-text">
          <span class="logo-title">EduFlow</span>
          <span class="logo-sub">พอร์ทัลครู</span>
        </div>
      </Transition>
    </div>

    <!-- School tag -->
    <Transition name="fade">
      <div v-if="!collapsed" class="school-tag">
        <span class="online-dot" />
        <span class="school-name">{{ schoolName }}</span>
      </div>
    </Transition>

    <!-- Nav -->
    <nav class="nav">
      <template v-for="group in navGroups" :key="group.id">
        <!-- COLLAPSED: icon-only -->
        <template v-if="collapsed">
          <div class="collapsed-group">
            <NuxtLink
              v-for="item in group.items"
              :key="item.path"
              :to="item.path"
              class="nav-item nav-item--icon"
              active-class="nav-item--active"
              :title="item.label"
            >
              <span class="item-icon" v-html="item.icon" />
            </NuxtLink>
          </div>
        </template>

        <!-- EXPANDED: accordion -->
        <template v-else>
          <div class="nav-group">
            <button
              type="button"
              class="group-header"
              :class="{ 'group-header--open': openGroups.has(group.id) }"
              @click="toggleGroup(group.id)"
            >
              <span class="group-label">{{ group.label }}</span>
              <span class="group-chevron" :class="{ 'group-chevron--open': openGroups.has(group.id) }">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2.5 4.5L6 8l3.5-3.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </span>
            </button>
            <div class="group-items" :class="{ 'group-items--open': openGroups.has(group.id) }">
              <NuxtLink
                v-for="item in group.items"
                :key="item.path"
                :to="item.path"
                class="nav-item"
                active-class="nav-item--active"
              >
                <span class="item-icon" v-html="item.icon" />
                <span class="item-label">{{ item.label }}</span>
              </NuxtLink>
            </div>
          </div>
        </template>
      </template>
    </nav>

    <!-- Footer -->
    <div class="sidebar-footer">
      <div class="user-row">
        <div class="avatar">{{ avatarLetter }}</div>
        <Transition name="fade">
          <div v-if="!collapsed" class="user-info">
            <span class="user-name">{{ teacherName }}</span>
            <span class="user-role">ครูผู้สอน</span>
          </div>
        </Transition>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

defineProps<{ collapsed: boolean }>()
defineEmits<{ (e: 'toggle'): void }>()

const route = useRoute()
const teacherEmail = useCookie<string | null>('edu_teacher_email')
const teacherSession = useTeacherSessionState()

if (import.meta.client) {
  ensureTeacherSession().catch(() => {
    // Keep fallback labels if session lookup fails.
  })
}

const teacherName = computed(() => {
  const t = teacherSession.value?.teacher
  const fullName = `${t?.first_name || ''} ${t?.last_name || ''}`.trim()
  if (fullName) return fullName
  if (teacherEmail.value) return teacherEmail.value
  return 'ครูผู้สอน'
})

const avatarLetter = computed(() => teacherName.value.charAt(0) || 'ค')
const schoolName = computed(() => teacherSession.value?.schoolName || 'ยังไม่ระบุโรงเรียน')

const ICON_DASHBOARD = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="1" y="1" width="6" height="6" rx="1.5" fill="currentColor" fill-opacity=".8"/><rect x="9" y="1" width="6" height="6" rx="1.5" fill="currentColor" fill-opacity=".8"/><rect x="1" y="9" width="6" height="6" rx="1.5" fill="currentColor" fill-opacity=".8"/><rect x="9" y="9" width="6" height="6" rx="1.5" fill="currentColor" fill-opacity=".8"/></svg>`
const ICON_COURSE = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="2" y="2" width="12" height="12" rx="2" stroke="currentColor" stroke-width="1.3" fill="none"/><path d="M5 6h6M5 9h4" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/><circle cx="12" cy="12" r="3" fill="#fff" stroke="currentColor" stroke-width="1.2"/><path d="M11 12l.8.8 1.5-1.5" stroke="currentColor" stroke-width="1.1" stroke-linecap="round" stroke-linejoin="round"/></svg>`
const ICON_TIMETABLE = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="1" y="3" width="14" height="11" rx="1.5" stroke="currentColor" stroke-width="1.3" fill="none"/><path d="M1 7h14M5 3V1M11 3V1" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/><circle cx="5.5" cy="10.5" r=".8" fill="currentColor"/><circle cx="8" cy="10.5" r=".8" fill="currentColor"/><circle cx="10.5" cy="10.5" r=".8" fill="currentColor"/></svg>`
const ICON_ATTENDANCE = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="1" y="2" width="14" height="12" rx="1.5" stroke="currentColor" stroke-width="1.3" fill="none"/><path d="M4 7.5l2 2 4-4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`
const ICON_GRADE = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 2l1 2.5h3l-2.4 1.8.9 2.7L8 7.5l-2.5 1.5.9-2.7L4 4.5h3L8 2z" stroke="currentColor" stroke-width="1.2" fill="none" stroke-linejoin="round"/><path d="M3 12h10M5 14h6" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>`
const ICON_STUDENT = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 3L14 6l-6 3-6-3 6-3z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round" fill="none"/><path d="M4 7.5v3.5c0 0 1.5 1.5 4 1.5s4-1.5 4-1.5V7.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>`
const ICON_APPROVE = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="1" y="2" width="14" height="12" rx="1.5" stroke="currentColor" stroke-width="1.3" fill="none"/><path d="M4 7.5l2 2L12 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`
const ICON_DOCUMENT = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 1h6l4 4v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1z" stroke="currentColor" stroke-width="1.3" fill="none" stroke-linejoin="round"/><path d="M10 1v4h4" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/><path d="M5.5 8h5M5.5 11h3" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>`
const ICON_ANNOUNCE = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 5h9l3-2v9l-3-2H2a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z" stroke="currentColor" stroke-width="1.3" fill="none" stroke-linejoin="round"/><path d="M5 10v3" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>`
const ICON_PROFILE = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="5" r="3" stroke="currentColor" stroke-width="1.4" fill="none"/><path d="M2 14c0-3.314 2.686-5 6-5s6 1.686 6 5" stroke="currentColor" stroke-width="1.4" fill="none" stroke-linecap="round"/></svg>`

const navGroups = [
  {
    id: 'overview',
    label: 'ภาพรวม',
    items: [
      { path: '/teacher', label: 'แดชบอร์ด', icon: ICON_DASHBOARD },
    ],
  },
  {
    id: 'teaching',
    label: 'การสอน',
    items: [
      { path: '/teacher/courses', label: 'รายวิชาของฉัน', icon: ICON_COURSE },
      { path: '/teacher/timetable', label: 'ตารางสอน', icon: ICON_TIMETABLE },
      { path: '/teacher/attendance', label: 'เช็คชื่อนักเรียน', icon: ICON_ATTENDANCE },
      { path: '/teacher/grades', label: 'ผลการเรียน', icon: ICON_GRADE },
    ],
  },
  {
    id: 'students',
    label: 'นักเรียน',
    items: [
      { path: '/teacher/students', label: 'ข้อมูลนักเรียน', icon: ICON_STUDENT },
    ],
  },
  {
    id: 'workflow',
    label: 'คำขอและเอกสาร',
    items: [
      { path: '/teacher/approvals', label: 'คำขอของฉัน', icon: ICON_APPROVE },
      { path: '/teacher/documents', label: 'คำขอเอกสาร', icon: ICON_DOCUMENT },
    ],
  },
  {
    id: 'news',
    label: 'ข่าวสาร',
    items: [
      { path: '/teacher/announcements', label: 'ประกาศ/ข่าวสาร', icon: ICON_ANNOUNCE },
    ],
  },
  {
    id: 'system',
    label: 'ระบบ',
    items: [
      { path: '/teacher/profile', label: 'ข้อมูลของฉัน', icon: ICON_PROFILE },
    ],
  },
]

const openGroups = ref<Set<string>>(new Set())

function getActiveGroupId(path: string) {
  const found = navGroups.find(g =>
    g.items.some(item => path === item.path || path.startsWith(`${item.path}/`)),
  )
  return found?.id ?? 'overview'
}

function toggleGroup(id: string) {
  const next = new Set(openGroups.value)
  if (next.has(id)) next.delete(id)
  else next.add(id)
  openGroups.value = next
}

function syncOpenGroup(path: string) {
  const id = getActiveGroupId(path)
  if (!openGroups.value.has(id)) {
    openGroups.value = new Set([...openGroups.value, id])
  }
}

syncOpenGroup(route.path)
watch(() => route.path, syncOpenGroup)
</script>

<style scoped>
.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  width: 240px;
  height: 100vh;
  background: #0f172a;
  color: #e2e8f0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: width 0.2s ease;
  z-index: 100;
}

.sidebar.collapsed {
  width: 64px;
}

/* Header */
.sidebar-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 18px 16px 14px;
  border-bottom: 1px solid rgba(255,255,255,.06);
}

.logo-mark {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #16a34a 0%, #059669 100%);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-text { display: flex; flex-direction: column; min-width: 0; }
.logo-title { font-size: 0.95rem; font-weight: 700; color: #f1f5f9; line-height: 1.2; }
.logo-sub { font-size: 0.72rem; color: #64748b; }

/* School tag */
.school-tag {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 8px 16px;
  font-size: 0.78rem;
  color: #94a3b8;
}

.online-dot {
  width: 7px;
  height: 7px;
  background: #16a34a;
  border-radius: 50%;
  flex-shrink: 0;
  box-shadow: 0 0 0 2px rgba(22,163,74,.3);
}

.school-name { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

/* Nav */
.nav { flex: 1; overflow-y: auto; padding: 8px 0; scrollbar-width: none; }
.nav::-webkit-scrollbar { display: none; }

.collapsed-group { padding: 4px 0; border-bottom: 1px solid rgba(255,255,255,.04); }

.nav-group { margin-bottom: 2px; }

.group-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 6px 16px;
  background: none;
  border: none;
  color: #475569;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  cursor: pointer;
  transition: color 0.12s;
}

.group-header:hover { color: #94a3b8; }
.group-header--open { color: #64748b; }

.group-chevron { transition: transform 0.2s; }
.group-chevron--open { transform: rotate(180deg); }

.group-items { overflow: hidden; max-height: 0; transition: max-height 0.25s ease; }
.group-items--open { max-height: 400px; }

.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 16px;
  font-size: 0.875rem;
  color: #94a3b8;
  border-radius: 0;
  text-decoration: none;
  transition: background 0.12s, color 0.12s;
  white-space: nowrap;
}

.nav-item:hover { background: rgba(255,255,255,.04); color: #e2e8f0; }

.nav-item--active {
  background: rgba(22,163,74,.15) !important;
  color: #4ade80 !important;
  border-right: 2px solid #16a34a;
}

.nav-item--icon {
  justify-content: center;
  padding: 10px;
  margin: 2px 8px;
  border-radius: 8px;
}

.item-icon { flex-shrink: 0; display: flex; align-items: center; }
.item-label { overflow: hidden; text-overflow: ellipsis; }

/* Footer */
.sidebar-footer {
  padding: 14px 16px;
  border-top: 1px solid rgba(255,255,255,.06);
}

.user-row { display: flex; align-items: center; gap: 10px; }

.avatar {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #16a34a, #059669);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
  font-weight: 700;
  color: #fff;
}

.user-info { display: flex; flex-direction: column; min-width: 0; }
.user-name { font-size: 0.82rem; font-weight: 600; color: #e2e8f0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.user-role { font-size: 0.72rem; color: #64748b; }

/* Transitions */
.fade-enter-active, .fade-leave-active { transition: opacity 0.15s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
