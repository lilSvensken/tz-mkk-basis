import { beforeEach, describe, expect, it } from 'vitest'
import type { NoteContent } from '~/types/note'
import { draftKey, DRAFT_SCHEMA_VERSION, loadDraft, removeDraft, saveDraft } from '~/utils/drafts'

const content: NoteContent = {
  title: 'Черновик',
  todos: [{ id: 'a', text: 'Пункт', done: false }],
}

describe('drafts', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('saves and loads a draft with schema version', () => {
    saveDraft('n1', content, 100)
    expect(JSON.parse(localStorage.getItem(draftKey('n1'))!).version).toBe(DRAFT_SCHEMA_VERSION)
    expect(loadDraft('n1')).toEqual({ noteId: 'n1', savedAt: 100, content })
  })

  it('keeps drafts of different notes apart', () => {
    saveDraft('n1', content)
    expect(loadDraft('n2')).toBeNull()
  })

  it('removes a draft', () => {
    saveDraft('n1', content)
    removeDraft('n1')
    expect(loadDraft('n1')).toBeNull()
  })

  it('ignores broken or unknown version data', () => {
    localStorage.setItem(draftKey('n1'), '{oops')
    expect(loadDraft('n1')).toBeNull()

    localStorage.setItem(draftKey('n1'), JSON.stringify({ version: 99, noteId: 'n1', savedAt: 1, content }))
    expect(loadDraft('n1')).toBeNull()

    localStorage.setItem(draftKey('n1'), JSON.stringify({ version: 1, noteId: 'n1', savedAt: 1, content: { title: 1 } }))
    expect(loadDraft('n1')).toBeNull()
  })
})
