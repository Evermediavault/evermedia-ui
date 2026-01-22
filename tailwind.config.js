/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}',
  ],
  // 使用prefix避免与Quasar样式冲突
  prefix: 'tw-',
  theme: {
    extend: {
      // 可以在这里扩展主题，与Quasar变量集成
    },
  },
  plugins: [],
  // 重要：确保Tailwind不会覆盖Quasar的样式
  corePlugins: {
    preflight: false, // 禁用Tailwind的基础样式重置，避免与Quasar冲突
  },
};
