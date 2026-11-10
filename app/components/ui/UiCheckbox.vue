<script setup lang="ts">
const model = defineModel<boolean>({ required: true })

const props = withDefaults(defineProps<{
  label: string
  hideLabel?: boolean
  disabled?: boolean
}>(), {
  hideLabel: false,
  disabled: false,
})
</script>

<template>
  <label
    class="ui-checkbox"
    :class="{ 'ui-checkbox--disabled': props.disabled }"
  >
    <input
      v-model="model"
      type="checkbox"
      class="ui-checkbox__input"
      :disabled="props.disabled"
    >
    <span
      class="ui-checkbox__box"
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 16 16"
        fill="none"
      >
        <path
          d="M3.5 8.5l3 3 6-7"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </span>
    <span
      class="ui-checkbox__label"
      :class="{ 'visually-hidden': props.hideLabel }"
    >{{ props.label }}</span>
  </label>
</template>

<style lang="scss" scoped>
.ui-checkbox {
  position: relative;
  display: inline-flex;
  flex-shrink: 0;
  gap: $space-2;
  align-items: center;
  cursor: pointer;

  &--disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }

  &__input {
    position: absolute;
    top: 0;
    left: 0;
    width: 20px;
    height: 20px;
    margin: 0;
    cursor: inherit;
    opacity: 0;
  }

  &__box {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    color: transparent;
    background: var(--color-surface);
    border: 2px solid var(--color-text-muted);
    border-radius: 5px;
    transition: background-color $transition-fast, border-color $transition-fast, color $transition-fast;

    svg {
      width: 14px;
      height: 14px;
    }
  }

  &__input:checked + &__box {
    color: var(--color-on-primary);
    background: var(--color-primary);
    border-color: var(--color-primary);
  }

  &__input:focus-visible + &__box {
    outline: 2px solid var(--color-focus);
    outline-offset: 2px;
  }

  &:hover &__input:not(:disabled, :checked) + &__box {
    border-color: var(--color-primary);
  }
}
</style>
