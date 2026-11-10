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
  min-height: 100vh;
  min-height: 100dvh;

  &__header {
    position: sticky;
    top: 0;
    z-index: $z-header;
    background: var(--color-bar);
    border-bottom: 0.5px solid var(--color-border);
    backdrop-filter: saturate(180%) blur(20px);
  }

  &__header-inner {
    display: flex;
    align-items: center;
    height: 56px;
  }

  &__logo {
    display: inline-flex;
    gap: $space-2;
    align-items: center;
    font-size: 1.0625rem;
    font-weight: 600;
    color: var(--color-accent-text);
    text-decoration: none;
    border-radius: $radius-sm;

    svg {
      width: 22px;
      height: 22px;
    }

    @include focus-ring;
  }

  &__main {
    flex: 1;
    padding-block: $space-6;
  }
}
</style>
