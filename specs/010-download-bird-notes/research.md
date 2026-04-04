# Research: 分析页记事本导出

## Decision 1: 不新增下载专用 Route Handler，复用现有记事本读取结果

- **Decision**: 复用当前“记录”能力中已存在的 `GET /api/records/notebook` 数据流，前端在已拿到的 `notebook` 快照上直接生成下载文本，不新增 `/api` 下载接口。
- **Rationale**: 功能只需要把当前账号已加载的条目转为本地文件，新增接口会增加维护面而不提升用户价值；同时不违反 App Router 边界原则。
- **Alternatives considered**:
  - 新增 `GET /api/analysis/notebook-export` 返回纯文本。
    Rejected：重复读取同一数据，增加接口和错误处理复杂度。

## Decision 2: 入口显示条件由“登录状态 + 条目数”联合判断

- **Decision**: 仅当 `authSession.status === authenticated` 且 `notebook.records.length > 0` 时显示“保存记录到本地”；其他状态隐藏。
- **Rationale**: 与需求完全一致，并减少无效点击与空下载文件。
- **Alternatives considered**:
  - 入口始终显示，点击时再提示不可用。
    Rejected：与需求冲突，且会造成无效交互。

## Decision 3: 下载文件使用浏览器 Blob + `<a download>` 触发

- **Decision**: 使用前端标准下载方式生成 `.txt` 文件并触发默认下载路径保存。
- **Rationale**: 浏览器原生支持，不引入新依赖；可直接控制文件名和内容。
- **Alternatives considered**:
  - 引入第三方文件下载库。
    Rejected：收益低且违反“依赖最小化”。

## Decision 4: 文件名与文本格式使用统一导出格式化器

- **Decision**: 封装导出格式化逻辑，固定输出：
  - 文件名：`xx的观鸟记录.txt`
  - 行格式：`序号 日期：YYYY-MM-DD；时间：HH-MM；鸟点：xxx；鸟名：xxx。`
- **Rationale**: 集中格式规则可避免 UI 层散落拼接逻辑，降低后续维护风险。
- **Alternatives considered**:
  - 在组件内临时字符串拼接。
    Rejected：可读性差，后续调整格式时容易遗漏。

## Decision 5: 时间显示按需求将 `HH:mm` 转为 `HH-MM`

- **Decision**: 导出时将记录中的 `observationTime` 从 `HH:mm` 映射为 `HH-MM`。
- **Rationale**: 满足用户明确格式要求，且不影响系统内原始记录结构。
- **Alternatives considered**:
  - 保持 `HH:mm` 原样导出。
    Rejected：与需求文本不一致。

## Decision 6: 图表范围明确为 N/A

- **Decision**: 本功能不引入 Apache ECharts 图表组件。
- **Rationale**: 导出功能仅涉及文本入口与下载，不存在图表场景。
- **Alternatives considered**:
  - 增加导出预览图或统计图。
    Rejected：超出需求范围。
