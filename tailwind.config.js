/**
 * Tailwind v4 以 CSS 配置为主（@import "tailwindcss"、@theme），
 * 此文件在 v4 中可能不被 @tailwindcss/postcss 读取。
 * 若需 prefix 或关闭 preflight，请在 src/css/app.scss 中用 v4 写法：
 * - prefix: @import "tailwindcss" prefix(tw); 类名变为 tw:flex
 * - 关闭 preflight: 使用分层 import，不引入 preflight.css
 */
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}',
  ],
  prefix: 'tw-',
  theme: { extend: {} },
  plugins: [],
  corePlugins: { preflight: false },
};
