import { useNotesStore } from '~/stores/notes'

export default defineNuxtPlugin(() => {
  useNotesStore().init()
})
