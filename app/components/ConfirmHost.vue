<template>
  <UiModal
    :open="current !== null"
    :title="shown?.title ?? ''"
    role="alertdialog"
    @close="settle(false)"
  >
    <template
      v-if="shown?.message"
      #default
    >
      <p>{{ shown.message }}</p>
    </template>
    <template #footer>
      <UiButton
        :data-autofocus="shown?.danger ? '' : undefined"
        @click="settle(false)"
      >
        {{ shown?.cancelText ?? 'Отмена' }}
      </UiButton>
      <UiButton
        :variant="shown?.danger ? 'danger' : 'primary'"
        :data-autofocus="shown?.danger ? undefined : ''"
        @click="settle(true)"
      >
        {{ shown?.confirmText ?? 'Подтвердить' }}
      </UiButton>
    </template>
  </UiModal>
</template>

<script setup lang="ts">
import { useConfirmState, type ConfirmRequest } from '~/composables/useConfirm'

const { current, settle } = useConfirmState()
const shown = shallowRef<ConfirmRequest | null>(current.value)

watch(current, (request) => {
  if (request) shown.value = request
})
</script>
