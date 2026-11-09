<script setup lang="ts">
const route = useRoute()
const noteId = computed(() => String(route.params.id))

useHead({ title: 'Редактирование заметки' })
</script>

<template>
  <section>
    <h1>Заметка {{ noteId }}</h1>
    <p class="placeholder">
      Здесь будет редактор заметки.
    </p>
  </section>
</template>

<style lang="scss" scoped>
.placeholder {
  color: var(--color-text-muted);
}
</style>
