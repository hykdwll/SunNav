module.exports = {
  extends: ['react-app', 'react-app/jest'],
  rules: {
    // Disable no-unused-vars rule for ContextMenu.tsx
    '@typescript-eslint/no-unused-vars': 'warn'
  },
  overrides: [
    {
      files: ['src/components/ContextMenu.tsx'],
      rules: {
        '@typescript-eslint/no-unused-vars': 'off'
      }
    }
  ]
}