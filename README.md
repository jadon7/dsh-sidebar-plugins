# DSH 左侧插件源码集合

本仓库收录当前 DeepSeek Harness（DSH）左侧栏中的 8 个自定义插件包。`任务面板`和`节点工作流`由同一个插件包提供。

源码来自本机 DSH 仓库：

`/Users/jadon7/Documents/ChatGPT/DeepSeek hernes/deepseek-harness`

整理时对应的 DSH 提交是 `47f943859b`，包版本是 `0.1.0-rc.5`。

## 入口与代码位置

| 左侧入口 | 插件目录 | 说明 |
| --- | --- | --- |
| 任务面板、节点工作流 | `packages/client/ui-taskboard` | 两个 DSH 入口和 iframe 外壳 |
| Token 德州 | `packages/client/ui-token-poker` | 本地交互牌桌 |
| 教师工作台 | `packages/client/ui-teacher-workbench` | 教师工作台界面 |
| QQ 宠物 | `packages/client/ui-pet-companion` | 宠物面板和企鹅资源 |
| 销售工作台 | `packages/client/ui-sales-workbench` | 销售工作台界面 |
| 个人工作台 | `packages/client/ui-personal-workbench` | 个人工作台界面 |
| 经典 QQ 聊天 | `packages/client/ui-qq-chat` | 使用真实 DSH 会话数据的 QQ 风格界面 |
| 飞书聊天 | `packages/client/ui-feishu-chat` | 使用真实 DSH 会话数据的飞书风格界面 |

截图中的“设置”是 DSH 原有功能，不在本仓库内。

## 任务面板实际应用

`packages/client/ui-taskboard` 只负责 DSH 入口和 iframe。实际任务面板源码在 `taskboard/`：

- Web 入口：`taskboard/web/src/main.tsx`
- 主界面：`taskboard/web/src/App.tsx`
- 节点工作流：`taskboard/web/src/components/WorkflowBoard.tsx` 和其他 `Workflow*.tsx`
- 服务端：`taskboard/server/`
- CLI：`taskboard/cli/taskctl.mjs`

这部分源码来自 `/Users/jadon7/Downloads/untitled folder/taskboard-src`，原远端是 `https://github.com/chuspeeism/dashi-taskboard.git`。本仓库保留了 `web/src/App.tsx` 中尚未提交的 `?view=workflow` 深链改动。该改动让 DSH 的“节点工作流”入口直接打开工作流页面。

## 仓库边界

本仓库保存 8 个 DSH 插件包和任务面板实际应用源码。它不保存 `lib`、`node_modules`、运行数据、构建缓存或完整 DSH 上游代码。

这些包使用 DSH 工作区依赖，例如 `client-runtime`、`ui-sidebar`、`ui-slots` 和 `cordis`。因此，本仓库是 DSH 的源码覆盖层，不能脱离 DSH 单独构建。

## 放回 DSH

1. 把本仓库的 `packages/client/*` 复制到 DSH 根目录的 `packages/client/`。
2. 在 DSH 根目录应用 `integration/dsh-rc5-sidebar-plugins.patch`。
3. 运行 `pnpm install`，让 pnpm 更新锁文件。
4. 按 DSH 的现有流程构建 Web 应用。

任务面板服务单独运行：

```sh
cd taskboard
npm install
npm start
```

集成补丁只包含 4 类必要接线：Web bundle 依赖、Cordis 插件注册、TypeScript 项目引用和左侧入口纵向排列。补丁不包含当前开发树中的其他功能改动。

任务面板插件只内嵌 `http://127.0.0.1:47823/`。它不会自动启动任务面板服务。
