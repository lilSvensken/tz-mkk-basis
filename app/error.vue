<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{ error: NuxtError }>()

const notFound = computed(() => props.error.statusCode === 404)

useHead({ title: () => notFound.value ? 'Страница не найдена' : 'Ошибка' })
</script>

<template>
  <main class="error-page container">
    <EmptyState
      :title="notFound ? 'Страница не найдена' : 'Что-то пошло не так'"
      :text="notFound ? 'Проверьте адрес или вернитесь к списку заметок.' : 'Попробуйте обновить страницу.'"
    >
      <UiButton
        variant="primary"
        @click="clearError({ redirect: '/' })"
      >
        К списку заметок
      </UiButton>
    </EmptyState>
  </main>
</template>

<style lang="scss" scoped>
.error-page {
  padding-block: $space-8;
}
</style>
