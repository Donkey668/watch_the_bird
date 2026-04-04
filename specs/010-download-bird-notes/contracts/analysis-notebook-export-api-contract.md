# API Contract: Analysis Notebook Export

## Route Surface

- **新增 Route Handler**: 无
- **复用 Route Handler**: `GET /api/records/notebook`
- **Caller**: “分析”页面中的记事本区域下载入口逻辑
- **Purpose**: 获取当前登录账号记事本数据快照，并据此生成本地 `.txt` 导出文件

## Request Contract (Reused)

### `GET /api/records/notebook`

- 无查询参数
- 依赖现有登录态 Cookie

## Required Response Fields For Export

导出逻辑依赖以下字段（其余字段保持原有语义不变）：

| Path | Type | Required | Description |
|------|------|----------|-------------|
| `requestStatus` | string | Yes | 需要为成功态才可导出 |
| `assistantAccount` | string | Yes | 作为文件名中的账号标识 |
| `notebook.records[]` | array | Yes | 导出数据源 |
| `notebook.records[].observationDate` | string | Yes | 导出“日期” |
| `notebook.records[].observationTime` | string | Yes | 导出“时间”（需转 `HH-MM`） |
| `notebook.records[].birdPoint` | string | Yes | 导出“鸟点” |
| `notebook.records[].speciesName` | string | Yes | 导出“鸟名” |

## Export Mapping Rules

1. 入口可见性：
   - 未登录：隐藏
   - 已登录但 `records` 为空：隐藏
   - 已登录且 `records` 非空：显示
2. 文件名：
   - `xx的观鸟记录.txt`（`xx = assistantAccount`）
3. 文本内容：
   - 一行一条记录
   - 行与行之间换行
   - 每行格式：
     `序号 日期：YYYY-MM-DD；时间：HH-MM；鸟点：xxx；鸟名：xxx。`

## Error and Boundary Behavior

- 若接口返回未登录/失败/无数据，则不展示导出入口，不触发下载。
- 导出行为不改变后端数据，不触发记录新增、更新或删除。

## Implementation Alignment (2026-04-04)

- 新增后端接口：无（继续复用 `GET /api/records/notebook`）。
- 前端导出入口仅使用已加载的 `notebook.records` 快照，不额外发起导出专用请求。
- 导出前置保护：
  - `isAuthenticated !== true` 时阻断；
  - `assistantAccount` 为空时阻断；
  - `recordCount <= 0` 或与 `records.length` 不一致时阻断。
- 下载触发方式：`Blob` + `URL.createObjectURL` + `<a download>`，下载完成后释放 object URL。
