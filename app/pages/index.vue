<script setup lang="ts">
useHead({ title: 'Заметки' })
</script>

<template>
  <section>
    <h1>Все заметки</h1>
    <p class="placeholder">
      Здесь будет список заметок.
    </p>
  </section>
</template>

<style lang="scss" scoped>
.placeholder {
  color: var(--color-text-muted);
}
</style>
