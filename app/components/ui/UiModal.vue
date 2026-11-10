<template>
  <Teleport to="body">
    <Transition name="ui-modal">
      <div
        v-if="props.open"
        class="ui-modal"
        @pointerdown="onOverlayPointerDown"
        @click="onOverlayClick"
      >
        <div
          ref="dialog"
          class="ui-modal__dialog"
          :role="props.role"
          aria-modal="true"
          :aria-labelledby="titleId"
          :aria-describedby="slots.default ? bodyId : undefined"
          tabindex="-1"
        >
          <header class="ui-modal__header">
            <h2
              :id="titleId"
              class="ui-modal__title"
            >
              {{ props.title }}
            </h2>
            <button
              v-if="props.closable"
              type="button"
              class="ui-modal__close"
              aria-label="Закрыть"
              @click="requestClose"
            >
              <IconClose />
            </button>
          </header>
          <div
            v-if="slots.default"
            :id="bodyId"
            class="ui-modal__body"
          >
            <slot />
          </div>
          <footer
            v-if="slots.footer"
            class="ui-modal__footer"
          >
            <slot name="footer" />
          </footer>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { getFocusable } from '~/utils/focusable'
import { isTopModal, pushModal, removeModal } from '~/utils/modalStack'

const props = withDefaults(defineProps<{
  open: boolean
  title: string
  closable?: boolean
  role?: 'dialog' | 'alertdialog'
}>(), {
  closable: true,
  role: 'dialog',
})

const emit = defineEmits<{ close: [] }>()

const slots = useSlots()
const titleId = useId()
const bodyId = useId()
const dialog = ref<HTMLElement | null>(null)
const token = Symbol('modal')

let previousFocus: HTMLElement | null = null
let pointerOnOverlay = false
let active = false

function focusInitial() {
  const root = dialog.value
  if (!root) return
  const target = root.querySelector<HTMLElement>('[data-autofocus]') ?? getFocusable(root)[0] ?? root
  target.focus()
}

function requestClose() {
  if (props.closable) emit('close')
}

function onKeydown(event: KeyboardEvent) {
  if (!isTopModal(token) || !dialog.value) return

  if (event.key === 'Escape') {
    event.preventDefault()
    event.stopPropagation()
    requestClose()
    return
  }

  if (event.key !== 'Tab') return

  const items = getFocusable(dialog.value)
  if (items.length === 0) {
    event.preventDefault()
    dialog.value.focus()
    return
  }

  const first = items[0]!
  const last = items[items.length - 1]!
  const current = document.activeElement

  if (!dialog.value.contains(current)) {
    event.preventDefault()
    first.focus()
  }
  else if (event.shiftKey && (current === first || current === dialog.value)) {
    event.preventDefault()
    last.focus()
  }
  else if (!event.shiftKey && current === last) {
    event.preventDefault()
    first.focus()
  }
}

function onFocusIn(event: FocusEvent) {
  if (!isTopModal(token) || !dialog.value) return
  if (event.target instanceof Node && !dialog.value.contains(event.target)) focusInitial()
}

function activate() {
  if (active) return
  active = true
  previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null
  pushModal(token)
  document.addEventListener('keydown', onKeydown, true)
  document.addEventListener('focusin', onFocusIn)
  nextTick(focusInitial)
}

function deactivate() {
  if (!active) return
  active = false
  removeModal(token)
  document.removeEventListener('keydown', onKeydown, true)
  document.removeEventListener('focusin', onFocusIn)
  const target = previousFocus
  previousFocus = null
  if (target?.isConnected) target.focus()
}

function onOverlayPointerDown(event: PointerEvent) {
  pointerOnOverlay = event.target === event.currentTarget
}

function onOverlayClick(event: MouseEvent) {
  if (pointerOnOverlay && event.target === event.currentTarget) requestClose()
  pointerOnOverlay = false
}

watch(() => props.open, (open) => {
  if (open) activate()
  else deactivate()
})

onMounted(() => {
  if (props.open) activate()
})

onBeforeUnmount(deactivate)
</script>

<style lang="scss" scoped>
.ui-modal {
  position: fixed;
  inset: 0;
  z-index: $z-modal;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding: $space-4;
  overflow-y: auto;
  background: var(--color-overlay);
  backdrop-filter: blur(2px);

  @include from($bp-sm) {
    align-items: center;
  }

  &__dialog {
    width: 100%;
    max-width: 440px;
    margin: auto 0 0;
    background: var(--color-surface);
    border-radius: $radius-lg;
    box-shadow: var(--shadow-modal);
    outline: none;

    @include from($bp-sm) {
      margin: auto;
    }
  }

  &__header {
    display: flex;
    gap: $space-3;
    align-items: flex-start;
    justify-content: space-between;
    padding: $space-5 $space-5 0;
  }

  &__title {
    font-size: 1.1875rem;
    font-weight: 700;
    line-height: 1.35;
  }

  &__close {
    display: inline-flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    margin: -$space-1 (-$space-2) 0 0;
    padding: 0;
    color: var(--color-accent-text);
    cursor: pointer;
    background: transparent;
    border: 0;
    border-radius: 50%;

    @include focus-ring;

    &:hover {
      background: var(--color-fill);
    }

    svg {
      width: 18px;
      height: 18px;
    }
  }

  &__body {
    padding: $space-2 $space-5 0;
    font-size: 0.9375rem;
    color: var(--color-text-muted);
  }

  &__footer {
    display: flex;
    flex-direction: column-reverse;
    gap: $space-2;
    padding: $space-5;

    @include from($bp-sm) {
      flex-flow: row wrap;
      justify-content: flex-end;
    }
  }
}

.ui-modal-enter-active,
.ui-modal-leave-active {
  transition: opacity $transition-base;

  .ui-modal__dialog {
    transition: transform $transition-base;
  }
}

.ui-modal-enter-from,
.ui-modal-leave-to {
  opacity: 0;

  .ui-modal__dialog {
    transform: translateY(12px);
  }
}
</style>
