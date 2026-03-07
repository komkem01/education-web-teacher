<template>
  <div class="login-page">
    <div class="card">
      <div class="logo">
        <div class="logo-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </div>
        <span class="logo-text">EduFlow</span>
      </div>
      <h1 class="title">เข้าสู่ระบบครู</h1>
      <p class="subtitle">ระบบจัดการการเรียนการสอน</p>

      <form class="form" @submit.prevent="handleLogin">
        <div v-if="error" class="error-banner">{{ error }}</div>
        <div class="form-group">
          <label class="form-label">อีเมล / รหัสครู</label>
          <input v-model="username" type="text" class="form-input" placeholder="กรอกอีเมลหรือรหัสครู" autocomplete="username" required />
        </div>
        <div class="form-group">
          <label class="form-label">รหัสผ่าน</label>
          <input v-model="password" type="password" class="form-input" placeholder="กรอกรหัสผ่าน" autocomplete="current-password" required />
        </div>
        <button type="submit" class="btn-submit" :disabled="loading">
          <span v-if="loading" class="spinner"></span>
          <span v-else>เข้าสู่ระบบ</span>
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useCookie, navigateTo } from '#app'

definePageMeta({ layout: false })

const username = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

async function handleLogin() {
  error.value = ''
  if (!username.value.trim() || !password.value.trim()) {
    error.value = 'กรุณากรอกข้อมูลให้ครบถ้วน'
    return
  }
  loading.value = true
  await new Promise(r => setTimeout(r, 800))
  loading.value = false

  // Demo: accept any credentials
  const token = useCookie('edu_teacher_token', { maxAge: 60 * 60 * 8, path: '/' })
  token.value = 'demo_teacher_token'
  await navigateTo('/teacher')
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 50%, #bbf7d0 100%);
  display: flex; align-items: center; justify-content: center; padding: 20px;
  font-family: 'Segoe UI', 'Noto Sans Thai', sans-serif;
}
.card {
  background: #fff; border-radius: 20px; padding: 40px 36px;
  width: 100%; max-width: 420px;
  box-shadow: 0 8px 48px rgba(0, 0, 0, .10);
}
.logo { display: flex; align-items: center; gap: 10px; margin-bottom: 28px; justify-content: center; }
.logo-icon { width: 40px; height: 40px; border-radius: 12px; background: linear-gradient(135deg, #16a34a, #059669); display: flex; align-items: center; justify-content: center; color: #fff; }
.logo-text { font-size: 1.2rem; font-weight: 800; color: #111827; }
.title { font-size: 1.4rem; font-weight: 800; color: #111827; text-align: center; margin: 0 0 6px; }
.subtitle { font-size: 0.875rem; color: #9ca3af; text-align: center; margin: 0 0 28px; }
.form { display: flex; flex-direction: column; gap: 16px; }
.error-banner { background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 10px 14px; font-size: 0.82rem; color: #dc2626; }
.form-group { display: flex; flex-direction: column; gap: 5px; }
.form-label { font-size: 0.78rem; font-weight: 600; color: #374151; }
.form-input { padding: 10px 14px; border-radius: 10px; border: 1px solid #e5e7eb; font-size: 0.875rem; outline: none; width: 100%; box-sizing: border-box; font-family: inherit; transition: border-color 0.15s; }
.form-input:focus { border-color: #16a34a; box-shadow: 0 0 0 3px rgba(22,163,74,.1); }
.btn-submit { background: #16a34a; color: #fff; border: none; padding: 12px; border-radius: 10px; font-size: 0.9rem; font-weight: 700; cursor: pointer; transition: background 0.15s; display: flex; align-items: center; justify-content: center; gap: 8px; font-family: inherit; margin-top: 4px; }
.btn-submit:hover:not(:disabled) { background: #15803d; }
.btn-submit:disabled { opacity: 0.6; cursor: not-allowed; }
.spinner { width: 16px; height: 16px; border: 2px solid rgba(255,255,255,.4); border-top-color: #fff; border-radius: 50%; animation: spin 0.7s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
</style>
