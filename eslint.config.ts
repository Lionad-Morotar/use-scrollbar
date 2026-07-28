import antfu from '@antfu/eslint-config'

// stylistic 偏好承接旧 .prettierrc（无分号/单引号/trailing comma/SFC 块内缩进）；
// Prettier 已退役，格式化统一由 @stylistic 承担，避免双工具规则冲突
export default antfu({
  vue: true,
  typescript: true,
  stylistic: {
    semi: false,
    quotes: 'single',
  },
  ignores: [
    'dist/**',
    // docs/ 是 flow-dev 运行产物（审查报告、最终报告等），非项目代码
    'docs/**',
    // .planning/ 是 AI 生成的代码库审计文档，含示意代码片段，受代码 lint 约束只会产生噪声
    '.planning/**',
    // gantt-elastic 是 vendored 的 Vue2 时代遗留 demo（含 JS mixin），
    // 对其全量 lint+fix 只会产生与库本体无关的大面积 diff
    'playground/src/gantt-elastic/**',
  ],
}, {
  // playground 是演示应用，console 输出属于正当交互反馈，不适用库源码的 no-console 约束
  files: ['playground/**'],
  rules: {
    'no-console': 'off',
  },
})
