<template>
  <div class="app">
    <header class="app__header">
      <div class="container app__header-inner">
        <NuxtLink
          to="/"
          class="app__logo"
        >
          <IconNotes />
          Заметки
        </NuxtLink>
      </div>
    </header>

    <main class="app__main container">
      <NuxtPage />
    </main>

    <ConfirmHost />
  </div>
</template>

<style lang="scss" scoped>
.app {
  display: flex;
  flex-direction: column;
  min-height: 100dvh;

  &__header {
    position: sticky;
    top: 0;
    z-index: var(--z-header);
    background: var(--color-bar);
    border-bottom: 0.5px solid var(--color-border);
    backdrop-filter: saturate(180%) blur(20px);
  }

  &__header-inner {
    display: flex;
    align-items: center;
    height: var(--header-height);
  }

  &__logo {
    display: inline-flex;
    gap: var(--space-2);
    align-items: center;
    font-size: var(--font-size-base);
    font-weight: 600;
    color: var(--color-accent-text);
    text-decoration: none;
    border-radius: var(--radius-sm);

    @include focus-ring;
  }

  &__main {
    flex: 1;
    padding-block: var(--space-6);
  }
}
</style>
