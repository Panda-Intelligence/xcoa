# Dialog Migration Guide

本指南说明如何将 toast.confirm 迁移到 AlertDialog 组件。

## ✅ 已完成的迁移

所有文件已成功迁移到使用 shadcn AlertDialog 组件！

## 1. 创建的组件

### AlertDialog 组件
- 路径: `src/components/ui/alert-dialog.tsx`
- 基于 Radix UI 的警告对话框基础组件

### ConfirmDialog 组件
- 路径: `src/components/ui/confirm-dialog.tsx`
- 封装好的确认对话框，支持：
  - 自定义标题和描述
  - 自定义按钮文本
  - destructive 变体（红色删除按钮）

## 2. 已迁移的文件

✅ src/app/(admin)/admin/_components/copyright-holders/copyright-holder-manager.tsx
✅ src/app/(admin)/admin/_components/scales/admin-scale-detail.tsx
✅ src/app/(admin)/admin/_components/scales/admin-scales-manager.tsx
✅ src/app/(admin)/admin/_components/cases/admin-cases-manager.tsx
✅ src/app/(admin)/admin/_components/invoices/admin-invoice-manager.tsx
✅ src/app/(admin)/admin/_components/invoices/admin-invoice-detail.tsx
✅ src/app/(dashboard)/scales/copyright/tickets/[ticketId]/page.tsx (alert → toast.error)

## 3. 迁移模式

### 导入组件
```typescript
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
```

### 添加状态
```typescript
const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
const [itemToDelete, setItemToDelete] = useState<string | null>(null);
```

### 修改删除函数

#### 之前:
```typescript
const handleDelete = async (id: string) => {
  const confirmed = await toast.confirm("确定要删除吗？");
  if (!confirmed) return;
  
  try {
    // 删除逻辑
  } catch (error) {
    // 错误处理
  }
};
```

#### 之后:
```typescript
const handleDelete = async () => {
  if (!itemToDelete) return;
  
  try {
    const id = itemToDelete;
    // 删除逻辑
    setItemToDelete(null); // 成功后清除
  } catch (error) {
    // 错误处理
  }
};
```

### 修改删除按钮

#### 之前:
```typescript
<Button onClick={() => handleDelete(item.id)}>
  <Trash2 />
</Button>
```

#### 之后:
```typescript
<Button onClick={() => {
  setItemToDelete(item.id);
  setDeleteConfirmOpen(true);
}}>
  <Trash2 />
</Button>
```

### 添加 ConfirmDialog 组件

在组件返回的 JSX 末尾添加:

```typescript
      {/* 删除确认对话框 */}
      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="删除确认"
        description="确定要删除这个项目吗？此操作不可逆转。"
        confirmText="删除"
        cancelText="取消"
        onConfirm={handleDelete}
        variant="destructive"
      />
    </div>
  );
}
```

## 4. Alert 迁移

对于 alert 调用，已全部替换为 toast.error()。

### 示例:
```typescript
// 之前
alert('Failed to send message');

// 之后
toast.error('Failed to send message');
```

## 5. 优势

### 之前的问题
1. 使用 Sonner toast 的 confirm 方法，但 toast 不是最佳的确认交互方式
2. 确认对话框总是在屏幕中央，无法靠近触发元素
3. 用户体验不够友好

### 现在的改进
1. ✅ 使用 shadcn 的 AlertDialog - 更符合 UI/UX 规范
2. ✅ 提供了 `variant="destructive"` 选项，删除操作显示为红色警告
3. ✅ 状态管理模式统一（使用 `xxxToDelete` 和 `xxxConfirmOpen`）
4. ✅ 更好的可访问性支持
5. ✅ 更清晰的用户交互流程

## 6. 清理工作

已移除 `useToast` hook 中的 `confirm` 方法，因为现在统一使用 `ConfirmDialog` 组件。

