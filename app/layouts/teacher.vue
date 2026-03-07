<template>
  <div class="teacher-shell">
    <TeacherAppSidebar :collapsed="sidebarCollapsed" @toggle="sidebarCollapsed = !sidebarCollapsed" />

    <div class="teacher-body" :class="{ 'sidebar-collapsed': sidebarCollapsed }">
      <TeacherAppTopbar @toggle-sidebar="sidebarCollapsed = !sidebarCollapsed" />

      <main class="teacher-main">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const sidebarCollapsed = ref(false)
</script>

<style>
*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html,
body {
  font-family: 'Segoe UI', 'Noto Sans Thai', sans-serif;
  font-size: 15px;
  color: #1a202c;
  background: #f7f8fa;
}

a {
  color: inherit;
  text-decoration: none;
}

button {
  font-family: inherit;
  cursor: pointer;
}
</style>

<style scoped>
.teacher-shell {
  display: flex;
  min-height: 100vh;
}

.teacher-body {
  flex: 1;
  margin-left: 240px;
  display: flex;
  flex-direction: column;
  min-width: 0;
  transition: margin-left 0.2s ease;
}

.teacher-body.sidebar-collapsed {
  margin-left: 64px;
}

.teacher-main {
  padding: 28px 32px;
  flex: 1;
}

@media (max-width: 900px) {
  .teacher-body {
    margin-left: 0;
  }
}
</style>
