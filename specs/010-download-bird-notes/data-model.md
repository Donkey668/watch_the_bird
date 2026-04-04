# Data Model: 分析页记事本导出

## Overview

本功能不新增持久化表结构。  
它基于现有记事本快照数据派生一次性的导出模型，并将其序列化为 `.txt` 文件下载。

## Entities

### NotebookExportContext

**Purpose**: 表示一次导出动作的上下文。

| Field | Type | Description |
|-------|------|-------------|
| `assistantAccount` | string | 当前登录账号，用于文件命名中的 `xx` |
| `isAuthenticated` | boolean | 当前是否登录 |
| `recordCount` | number | 当前账号可导出的记录条数 |

**Validation rules**:

- `isAuthenticated` 必须为 `true` 才允许触发导出。
- `recordCount` 必须大于 `0` 才显示导出入口并允许触发导出。
- `assistantAccount` 必须非空，若包含文件名非法字符需做安全替换。

### NotebookExportLineItem

**Purpose**: 单条导出文本行的中间模型。

| Field | Type | Description |
|-------|------|-------------|
| `sequence` | number | 行序号，从 `1` 开始 |
| `observationDate` | string | 日期，格式 `YYYY-MM-DD` |
| `observationTime` | string | 原始时间，格式 `HH:mm` |
| `birdPoint` | string | 鸟点文本 |
| `speciesName` | string | 鸟名文本 |

**Validation rules**:

- `sequence` 必须连续递增且从 `1` 开始。
- `observationDate` 必须满足 `YYYY-MM-DD`。
- `observationTime` 导出时必须转换为 `HH-MM`。
- `birdPoint`、`speciesName` 导出前应进行首尾空白修整。

### NotebookExportDocument

**Purpose**: 最终可下载的文档模型。

| Field | Type | Description |
|-------|------|-------------|
| `fileName` | string | 目标文件名：`xx的观鸟记录.txt` |
| `mimeType` | string | 文本类型：`text/plain;charset=utf-8` |
| `content` | string | 所有导出行拼接文本，行间以换行符分隔 |
| `lineCount` | number | 导出行数量，用于一致性校验 |

**Validation rules**:

- `fileName` 必须以 `.txt` 结尾。
- `content` 必须与 `lineCount` 一致（按换行拆分后条数匹配）。
- 每行必须严格遵循：
  `序号 日期：YYYY-MM-DD；时间：HH-MM；鸟点：xxx；鸟名：xxx。`

## State Transitions

### Entry Visibility

1. 页面加载后获取认证状态与记事本数据。
2. 若“未登录”或“无记录”，导出入口隐藏。
3. 若“已登录且有记录”，导出入口显示。

### Export Action

1. 用户点击“保存记录到本地”。
2. 系统将当前记录列表映射为 `NotebookExportLineItem[]`。
3. 生成 `NotebookExportDocument` 并触发浏览器下载。
4. 下载完成后保持当前页面与记事本状态不变。
