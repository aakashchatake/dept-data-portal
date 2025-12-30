module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    'react-app',
    'react-app/jest',
  ],
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 12,
    sourceType: 'module',
  },
  plugins: ['react'],
  rules: {
    // Add any custom rules here
  },
  globals: {
    __firebase_config: 'readonly',
    __app_id: 'readonly',
    __initial_auth_token: 'readonly',
  },
};