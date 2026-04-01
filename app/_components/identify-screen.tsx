"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const STARTER_STEPS = [
  "通过竖屏友好的流程拍摄或上传清晰的鸟类照片。",
  "在保存结果前查看 AI 建议与置信度提示。",
  "将确认后的识别结果写入观测记录。",
];

export function IdentifyScreen() {
  return (
    <div className="space-y-4">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">
          工具介绍
        </p>
        <h1 className="text-2xl font-semibold leading-tight text-[var(--text-primary)]">
          鸟类识别工具
        </h1>
        <p className="text-sm leading-6 text-[var(--text-secondary)]">
          在不离开当前移动页面的情况下识别未知鸟类。
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>输入前说明</CardTitle>
          <CardDescription>
            在用户添加图片前，工具会先展示流程指引，帮助理解后续操作。
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {STARTER_STEPS.map((step, index) => (
            <div key={`${index}-${step}`} className="space-y-2">
              <p className="text-sm leading-6 text-[var(--text-secondary)]">
                {index + 1}. {step}
              </p>
              {index < STARTER_STEPS.length - 1 && <Separator />}
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border-sky-200 bg-sky-50/60">
        <CardHeader>
          <CardTitle className="text-sky-900">当前状态</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-6 text-sky-900/80">
            当前版本中的识别流程仍为占位演示；在后端能力接入前，这个面板主要用于说明功能用途。
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
