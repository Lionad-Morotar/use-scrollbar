# 外部集成（External Integrations）

**分析日期：** 2026-07-28（monorepo 改造后刷新）

## API 与外部服务

**未检测到。** 这是一个客户端 Vue 可组合函数库，没有运行时网络调用。`packages/` 和 `playground/` 中均未发现 `fetch`、`axios`、`XMLHttpRequest` 或 WebSocket 的使用。

## 数据存储

**数据库：**

- 不适用

**文件存储：**

- 仅本地文件系统（浏览器 DOM 操作）

**缓存：**

- 无

## 认证与身份

**认证提供方：**

- 不适用

## 监控与可观测性

**错误追踪：**

- 无

**日志：**

- 控制台日志仅少量用于错误与调试信息；生产代码中包含极少的 `console.error` 和 `console.log` 语句

## CI/CD 与部署

**托管：**

- npm registry（`https://registry.npmjs.org`）用于包发布
- GitHub 仓库用于源码托管

**CI 流水线：**

- GitHub Actions
  - `.github/workflows/ci-on-dev.yml` - 推送到 `dev` 分支时执行构建检查
  - `.github/workflows/ci-on-release.yml` - 推送到 `release` 分支时执行构建检查
  - 使用 Node.js 24 与 `pnpm/action-setup@v4`（版本读 `packageManager` 单源），frozen lockfile 安装；四门禁（typecheck / lint / test / build）走根 `pnpm -r --if-present` 编排，workflow 对 monorepo 布局无感知

**发布自动化：**

- `packages/vue/package.json` 中的脚本 `auto:publish` 自动完成分支创建、版本升级、构建、发布与推送（发布主体为核心包；`@lionad/use-scrollbar-nuxt` 首发手动）

## 环境配置

**必需环境变量：**

- 库运行时无需任何环境变量
- Playground 开发服务器 HTTPS 模式可选 `HTTPS` 环境变量

**密钥位置：**

- npm 发布令牌应位于 CI 环境或本地 npm 配置中（不在仓库内）

## Webhooks 与回调

**接入：**

- 无

**发出：**

- 无

## 包注册表配置

**npm registry：**

- 发布 registry：`https://registry.npmjs.org`（`packages/vue` 与 `packages/nuxt` 的 `publishConfig`）
- 本地安装 registry：`https://registry.npmmirror.com`（`.npmrc`）

---

_集成审计：2026-07-28（monorepo 改造后刷新）_
