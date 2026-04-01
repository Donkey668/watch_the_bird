"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type RecordsAuthRequiredDialogProps = {
  open: boolean;
  title?: string;
  message: string;
  onOpenChange: (open: boolean) => void;
};

export function RecordsAuthRequiredDialog({
  open,
  title = "请登录个人空间",
  message,
  onOpenChange,
}: RecordsAuthRequiredDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[20rem]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{message}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            type="button"
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-full"
          >
            关闭
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
