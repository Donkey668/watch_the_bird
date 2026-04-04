# Quickstart: 分析页记事本导出

## Prerequisites

- Node.js 20+ installed
- npm available
- Existing auth and notebook features are functional
- Browser allows file download to default download path

## Run The App

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Manual Validation Flow

1. 进入首页并切换到“分析”页面。
2. 在未登录状态确认记事本区域不显示“保存记录到本地”。
3. 登录一个“无记录”账号，确认仍不显示“保存记录到本地”。
4. 登录一个“有记录”账号，确认“保存记录到本地”显示在“新增记录”按钮下方。
5. 确认“保存记录到本地”字号与“记录自己的观测发现，并回看最近外出时留下的笔记。”一致。
6. 点击“保存记录到本地”，确认浏览器下载一个 `.txt` 文件。
7. 确认文件名格式为“xx的观鸟记录.txt”，其中 `xx` 为当前账号。
8. 打开文件，确认每行一条记录，记录间换行。
9. 抽样检查每行格式：
   `序号 日期：YYYY-MM-DD；时间：HH-MM；鸟点：xxx；鸟名：xxx。`
10. 切换到其他账号再次下载，确认文件内容仅包含当前账号条目。

## Validation Commands

```bash
npm run lint
npx tsc --noEmit
```

## Implementation Notes

- 不新增 Route Handler，复用现有记事本读取结果。
- 导出规则集中在单一格式化逻辑中，避免 UI 拼接分散。
- 图表范围为 `N/A`。

## Validation Record (2026-04-04)

- 静态检查：
  - `npm run lint`：通过
  - `npx tsc --noEmit`：通过
- 导出规则走查：
  - 文件名格式：`xx的观鸟记录.txt`（通过）
  - 单行格式：`序号 日期：YYYY-MM-DD；时间：HH-MM；鸟点：xxx；鸟名：xxx。`（通过）
  - 记录间换行（通过）
- 入口规则走查：
  - 未登录隐藏（通过）
  - 已登录但无条目隐藏（通过）
  - 已登录且有条目显示（通过）
  - 入口位于“新增记录”下方且字号 `text-sm leading-6`（通过）
  - 入口为文本按钮并具备键盘可访问性（通过）
