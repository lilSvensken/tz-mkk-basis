<template>
  <div class="app">
    <header class="app__header">
      <div class="container app__header-inner">
        <NuxtLink
          to="/"
          class="app__logo"
        >
          Заметки
        </NuxtLink>
      </div>
    </header>

    <main class="app__main container">
      <NuxtPage />
    </main>
  </div>
</template>

<style lang="scss" scoped>
.app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  min-height: 100dvh;

  &__header {
    position: sticky;
    top: 0;
    z-index: $z-header;
    background: var(--color-surface);
    border-bottom: 1px solid var(--color-border);
  }

  &__header-inner {
    display: flex;
    align-items: center;
    height: 56px;
  }

  &__logo {
    font-size: 1.125rem;
    font-weight: 700;
    color: var(--color-text);
    text-decoration: none;

    @include focus-ring;
  }

  &__main {
    flex: 1;
    padding-block: $space-6;
  }
}
</style>
