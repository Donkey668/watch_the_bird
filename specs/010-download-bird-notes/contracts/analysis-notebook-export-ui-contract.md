# UI Contract: Analysis Notebook Export Entry

## Route Surface

- **Route**: `/`
- **Screen**: “分析”页面中的记事本区域
- **Primary container**: `RecordsNotebookPanel`

## Layout Contract

- 新增入口文案：`保存记录到本地`
- 入口形态：文本形式（非主按钮）
- 入口位置：`新增记录` 按钮正下方
- 入口字号：与“记录自己的观测发现，并回看最近外出时留下的笔记。”一致

## Visibility Contract

| State | Entry Visibility |
|-------|------------------|
| 未登录 | 隐藏 |
| 已登录 + 无条目 | 隐藏 |
| 已登录 + 有条目 | 显示 |

## Interaction Contract

1. 用户点击 `保存记录到本地`。
2. 系统下载 `.txt` 文件到浏览器默认下载路径。
3. 页面不跳转、不刷新当前列表，不改变当前编辑状态。

## Accessibility Contract

- 入口使用原生 `button` 呈现文本样式，支持键盘访问。
- `Enter` / `Space` 可触发同等下载行为（浏览器原生按钮行为）。

## Download Content Contract

- 文件名：`xx的观鸟记录.txt`
- 文件类型：`.txt`
- 内容规则：
  - 每行一条记录
  - 记录之间换行
  - 单行格式：
    `序号 日期：YYYY-MM-DD；时间：HH-MM；鸟点：xxx；鸟名：xxx。`

## Explicit Exclusions

- 不新增新页面和新导航入口。
- 不新增图表（ECharts = `N/A`）。
- 不改变“新增记录”按钮行为与位置。

## Implementation Alignment (2026-04-04)

- 入口位置已固定在“新增记录”按钮下方。
- 入口字号使用 `text-sm leading-6`，与说明文案保持一致。
- 显示规则已落地：
  - 未登录：隐藏；
  - 已登录但无条目：隐藏；
  - 已登录且有条目：显示。
