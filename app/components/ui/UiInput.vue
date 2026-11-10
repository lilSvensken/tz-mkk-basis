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

<style lang="scss" scoped>
.ui-input {
  display: flex;
  flex-direction: column;
  gap: $space-1;
  min-width: 0;

  &__label {
    font-size: 0.875rem;
    color: var(--color-text-muted);
  }

  &__field {
    width: 100%;
    min-height: 40px;
    padding: $space-2 $space-3;
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: $radius-sm;
    transition: border-color $transition-fast, box-shadow $transition-fast;

    &::placeholder {
      color: var(--color-text-muted);
      opacity: 0.8;
    }

    &:hover {
      border-color: var(--color-text-muted);
    }

    &:focus {
      border-color: var(--color-focus);
      outline: none;
      box-shadow: 0 0 0 3px rgb(99 102 241 / 25%);
    }
  }

  &--lg &__field {
    min-height: 48px;
    font-size: 1.25rem;
    font-weight: 600;
  }

  &--plain &__field {
    background: transparent;
    border-color: transparent;

    &:hover {
      border-color: var(--color-border);
    }

    &:focus {
      background: var(--color-surface);
      border-color: var(--color-focus);
    }
  }
}
</style>
