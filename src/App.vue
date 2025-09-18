<script setup lang="ts">
import { onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'

type LoginForm = {
  username: string
  password: string
  remember: boolean
}

type FormErrors = {
  username: string
  password: string
}

const STORAGE_KEY = 'app-theme'

const form = reactive<LoginForm>({
  username: '',
  password: '',
  remember: true,
})

const errors = reactive<FormErrors>({
  username: '',
  password: '',
})

const isSubmitting = ref(false)
const submitted = ref(false)
const isDarkMode = ref(false)

let mediaQuery: MediaQueryList | null = null

const updateTheme = (value: boolean, persist = true) => {
  if (typeof document === 'undefined') {
    return
  }

  const root = document.documentElement
  root.classList.toggle('dark', value)

  if (persist && typeof window !== 'undefined') {
    window.localStorage.setItem(STORAGE_KEY, value ? 'dark' : 'light')
  }
}

const handleSystemThemeChange = (event: MediaQueryListEvent) => {
  if (typeof window === 'undefined') {
    return
  }

  const stored = window.localStorage.getItem(STORAGE_KEY)
  if (!stored) {
    isDarkMode.value = event.matches
    updateTheme(event.matches, false)
  }
}

onMounted(() => {
  if (typeof window === 'undefined') {
    return
  }

  const stored = window.localStorage.getItem(STORAGE_KEY)

  if (stored) {
    isDarkMode.value = stored === 'dark'
  } else if (window.matchMedia) {
    mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    isDarkMode.value = mediaQuery.matches
  }

  updateTheme(isDarkMode.value, false)

  if (!mediaQuery && window.matchMedia) {
    mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  }

  mediaQuery?.addEventListener('change', handleSystemThemeChange)
})

onBeforeUnmount(() => {
  mediaQuery?.removeEventListener('change', handleSystemThemeChange)
})

watch(isDarkMode, (value) => {
  submitted.value = false
  updateTheme(value)
})

watch(
  () => form.username,
  () => {
    if (errors.username) {
      errors.username = ''
    }
  },
)

watch(
  () => form.password,
  () => {
    if (errors.password) {
      errors.password = ''
    }
  },
)

const validate = () => {
  errors.username = form.username.trim() ? '' : 'Введите логин'
  errors.password = form.password ? '' : 'Введите пароль'
  return !errors.username && !errors.password
}

const onSubmit = () => {
  submitted.value = false

  if (!validate()) {
    return
  }

  isSubmitting.value = true

  setTimeout(() => {
    isSubmitting.value = false
    submitted.value = true
  }, 800)
}
</script>

<template>
  <div class="auth-page">
    <div class="auth-card">
      <div class="theme-toggle">
        <label class="theme-toggle__label" for="theme-switch">{{ isDarkMode ? 'Темный режим' : 'Светлый режим' }}</label>
        <InputSwitch v-model="isDarkMode" inputId="theme-switch" aria-label="Переключить тему" />
      </div>

      <Card class="login-card">
        <template #title>
          <div class="card-header">
            <div class="card-icon" aria-hidden="true">🔐</div>
            <div>
              <h2>Вход в систему</h2>
              <p>Введите логин и пароль, чтобы получить доступ к платформе.</p>
            </div>
          </div>
        </template>
        <template #content>
          <form class="login-form" @submit.prevent="onSubmit">
            <div class="form-field">
              <label class="form-label" for="username">Логин</label>
              <InputText
                id="username"
                v-model.trim="form.username"
                autocomplete="username"
                placeholder="Введите логин"
                class="w-full"
              />
              <small v-if="errors.username" class="form-error">{{ errors.username }}</small>
            </div>

            <div class="form-field">
              <label class="form-label" for="password">Пароль</label>
              <Password
                id="password"
                v-model="form.password"
                toggleMask
                :feedback="false"
                autocomplete="current-password"
                placeholder="Введите пароль"
                class="w-full"
                inputClass="w-full"
              />
              <small v-if="errors.password" class="form-error">{{ errors.password }}</small>
            </div>

            <div class="form-footer">
              <div class="remember">
                <Checkbox v-model="form.remember" inputId="remember" :binary="true" />
                <label for="remember">Запомнить меня</label>
              </div>
              <a class="link" href="#">Забыли пароль?</a>
            </div>

            <Button type="submit" label="Войти" class="submit-button" :loading="isSubmitting" />
          </form>

          <p v-if="submitted" class="success-message">
            Добро пожаловать обратно, {{ form.username || 'пользователь' }}!
          </p>
        </template>
      </Card>

      <Divider align="center" type="solid">
        <span>или</span>
      </Divider>

      <div class="helper-text">
        <p>
          Еще нет аккаунта?
          <a class="link" href="#">Создать учетную запись</a>
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: clamp(1.5rem, 5vw, 3rem);
  transition: background 0.4s ease, color 0.4s ease;
}

.auth-card {
  width: min(460px, 100%);
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.theme-toggle {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.75rem;
  color: var(--text-color-secondary);
  font-size: 0.9rem;
}

.theme-toggle__label {
  font-weight: 600;
}

:deep(.theme-toggle .p-inputswitch) {
  scale: 0.95;
}

:deep(.theme-toggle .p-inputswitch .p-inputswitch-slider) {
  background: rgba(41, 67, 161, 0.35);
}

html.dark :deep(.theme-toggle .p-inputswitch .p-inputswitch-slider) {
  background: rgba(91, 120, 255, 0.35);
}

:deep(.theme-toggle .p-inputswitch.p-inputswitch-checked .p-inputswitch-slider) {
  background: var(--primary-color);
}

:deep(.login-card.p-card) {
  background: var(--surface-card);
  border: 1px solid var(--surface-border);
  border-radius: 1.5rem;
  box-shadow: 0 22px 45px rgba(22, 34, 79, 0.18);
  color: var(--text-color);
}

:deep(.login-card .p-card-body) {
  padding: clamp(1.75rem, 5vw, 2.5rem);
  display: flex;
  flex-direction: column;
  gap: 1.75rem;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  color: var(--text-color);
}

.card-header h2 {
  margin: 0;
  font-size: clamp(1.4rem, 3.6vw, 1.75rem);
  font-weight: 700;
}

.card-header p {
  margin: 0.35rem 0 0;
  font-size: 0.95rem;
  color: var(--text-color-secondary);
}

.card-icon {
  width: 3rem;
  height: 3rem;
  display: grid;
  place-items: center;
  border-radius: 1rem;
  font-size: 1.4rem;
  background: linear-gradient(135deg, rgba(41, 67, 161, 0.12), rgba(91, 120, 255, 0.35));
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  font-weight: 600;
  color: var(--text-color);
}

:deep(.p-inputtext),
:deep(.p-password .p-inputtext) {
  width: 100%;
  background: var(--surface-section);
  border: 1px solid var(--surface-border);
  border-radius: 0.85rem;
  padding: 0.75rem 1rem;
  font-size: 1rem;
  color: var(--text-color);
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

:deep(.p-inputtext:focus),
:deep(.p-password .p-inputtext:focus) {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--primary-color) 25%, transparent);
}

:deep(.p-password) {
  width: 100%;
}

.form-error {
  margin-top: 0.25rem;
  color: #f87171;
  font-size: 0.8rem;
}

.form-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  font-size: 0.9rem;
  color: var(--text-color-secondary);
}

.remember {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

:deep(.p-checkbox .p-checkbox-box) {
  width: 1.1rem;
  height: 1.1rem;
  border-radius: 0.4rem;
  border: 1px solid var(--surface-border);
  transition: border-color 0.2s ease, background 0.2s ease;
}

:deep(.p-checkbox.p-highlight .p-checkbox-box) {
  border-color: var(--primary-color);
  background: var(--primary-color);
}

:deep(.p-checkbox .p-checkbox-box .p-checkbox-icon) {
  font-size: 0.7rem;
}

.submit-button {
  width: 100%;
  font-weight: 600;
  letter-spacing: 0.01em;
}

:deep(.submit-button.p-button) {
  padding-block: 0.85rem;
  border-radius: 0.9rem;
  background: var(--primary-color);
  border: 1px solid transparent;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

:deep(.submit-button.p-button:hover) {
  transform: translateY(-1px);
  box-shadow: 0 12px 20px rgba(41, 67, 161, 0.22);
}

:deep(.submit-button.p-button:focus-visible) {
  box-shadow: 0 0 0 4px color-mix(in srgb, var(--primary-color) 35%, transparent);
}

.link {
  color: var(--primary-color);
  font-weight: 600;
  text-decoration: none;
}

.link:hover {
  text-decoration: underline;
}

.success-message {
  margin: 1rem 0 0;
  padding: 0.75rem 1rem;
  border-radius: 0.85rem;
  background: color-mix(in srgb, var(--primary-color) 16%, transparent);
  color: var(--text-color);
  font-weight: 600;
  text-align: center;
}

:deep(.p-divider-horizontal) {
  margin: 0;
  border-color: var(--surface-border);
}

:deep(.p-divider .p-divider-content) {
  padding: 0 1rem;
  color: var(--text-color-secondary);
  font-size: 0.85rem;
  font-weight: 600;
}

.helper-text {
  text-align: center;
  color: var(--text-color-secondary);
  font-size: 0.95rem;
}

@media (max-width: 560px) {
  .auth-card {
    width: 100%;
  }

  :deep(.login-card .p-card-body) {
    padding: 1.5rem;
  }

  .form-footer {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
