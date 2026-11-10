<template>
  <div
    class="ui-input"
    :class="[`ui-input--${props.size}`, { 'ui-input--plain': props.plain }]"
  >
    <label
      :for="id"
      class="ui-input__label"
      :class="{ 'visually-hidden': props.hideLabel }"
    >{{ props.label }}</label>
    <input
      :id="id"
      ref="input"
      v-model="model"
      class="ui-input__field"
      type="text"
      autocomplete="off"
      :placeholder="props.placeholder"
      v-bind="$attrs"
    >
  </div>
</template>

<script setup lang="ts">
defineOptions({ inheritAttrs: false })

const model = defineModel<string>({ required: true })

const props = withDefaults(defineProps<{
  label: string
  hideLabel?: boolean
  placeholder?: string
  size?: 'md' | 'lg'
  plain?: boolean
}>(), {
  hideLabel: false,
  placeholder: undefined,
  size: 'md',
  plain: false,
})

const id = useId()
const input = ref<HTMLInputElement | null>(null)

defineExpose({
  focus: () => input.value?.focus(),
})
</script>

<style lang="scss" scoped>
.ui-input {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  min-width: 0;

  &__label {
    font-size: var(--font-size-sm);
    color: var(--color-text-muted);
  }

  &__field {
    width: 100%;
    min-height: var(--control-height);
    padding: var(--space-2) var(--space-3);
    caret-color: var(--color-primary);
    background: var(--color-fill);
    border: 0;
    border-radius: var(--radius-sm);
    outline: none;
    transition: background-color var(--transition-fast), box-shadow var(--transition-fast);

    &::placeholder {
      color: var(--color-text-muted);
      opacity: 1;
    }

    &:focus-visible {
      box-shadow: 0 0 0 2px var(--color-focus);
    }
  }

  &--lg &__field {
    min-height: 3.25rem;
    font-size: var(--font-size-xl);
    font-weight: 700;
    letter-spacing: -0.01em;
  }

  &--plain &__field {
    padding-inline: var(--space-2);
    background: transparent;

    &:hover {
      background: var(--color-bg);
    }

    &:focus {
      background: var(--color-bg);
      box-shadow: none;
    }
  }
}
</style>
