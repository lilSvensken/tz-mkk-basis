import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt({
  files: ['**/*.vue'],
  rules: {
    'vue/block-order': ['error', { order: ['template', 'script', 'style'] }],
  },
})
