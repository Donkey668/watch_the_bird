import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function RecordsScreen() {
  return (
    <div className="space-y-4">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">
          个人空间
        </p>
        <h1 className="text-2xl font-semibold leading-tight text-[var(--text-primary)]">
          个人观测记录
        </h1>
        <p className="text-sm leading-6 text-[var(--text-secondary)]">
          记录自己的观测发现，并回看最近外出时留下的笔记。
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>空状态</CardTitle>
          <CardDescription>
            当前 v1 页面中还没有保存任何观测记录。
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="rounded-lg border border-dashed border-amber-300 bg-amber-50/70 p-4">
            <p className="text-sm leading-6 text-amber-900/85">
              等记录持久化能力接入后，你保存的条目会显示在这里。
            </p>
          </div>
          <p className="text-sm leading-6 text-[var(--text-secondary)]">
            页面支持纵向滚动，顶部导航会始终固定，便于你快速切换分区。
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
