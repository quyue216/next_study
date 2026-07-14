# Tailwind CSS & shadcn/ui 速查笔记

> 基于项目实际使用，用于快速复习和查阅。Tailwind v4 + shadcn/ui。

---

## 一、Tailwind 是什么

把 CSS 属性写成类名，直接写在 HTML 的 `className` 里，不用写 `.css` 文件。

```tsx
// 不用写 CSS
<div className="flex items-center gap-2 p-4 bg-blue-50 rounded-lg">
```

---

## 二、设计 Token（CSS 变量）

**核心思想：** 给 CSS 值起个名字，集中管理，改一处全局生效。

### 定义位置

`src/app/globals.css` 里的 `:root` 和 `.dark`：

```css
/* 定义 token */
:root {
  --background: oklch(1 0 0);        /* 白色 */
  --foreground: oklch(0.145 0 0);    /* 近黑色 */
  --primary: oklch(0.205 0 0);       /* 主色 */
  --muted: oklch(0.97 0 0);          /* 浅灰背景 */
  --muted-foreground: oklch(0.556 0 0); /* 灰色文字 */
  --border: oklch(0.922 0 0);        /* 边框色 */
  --radius: 0.625rem;                /* 圆角 */
}

.dark {
  --background: oklch(0.145 0 0);    /* 深色背景 */
  --foreground: oklch(0.985 0 0);    /* 浅色文字 */
}
```

### 桥接给 Tailwind

```css
@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
}
```

### 使用

```tsx
<div className="bg-background text-foreground">  // 引用 token
<div className="bg-muted text-muted-foreground">  // 引用 token
```

**亮色/暗色切换时，这些类自动适配，不需要改组件。**

---

## 三、oklch 颜色函数

CSS 原生颜色表示法，三个参数：

```
oklch(亮度  色度  色相)
      L     C     H
```

| 参数 | 范围 | 含义 |
|------|------|------|
| L（亮度） | `0` 纯黑 ~ `1` 纯白 | 明暗 |
| C（色度） | `0` 灰色，越大越鲜艳 | 饱和度 |
| H（色相） | `0~360` 度 | 红/橙/黄/绿/蓝/紫 |

**色度 C=0 时，色相 H 写什么都无所谓，出来都是灰色。**

```css
oklch(1 0 0)          → 纯白
oklch(0 0 0)          → 纯黑
oklch(0.5 0 0)        → 中灰
oklch(0.97 0 0)       → 浅灰（你项目的 muted）
oklch(0.577 0.245 27) → 红色（你项目的 destructive）
```

---

## 四、Tailwind 内置颜色

22 种色系，每种 11 个色阶。

### 色系

| 类别 | 色系 |
|------|------|
| 灰 | `slate` `gray` `zinc` `neutral` `stone` |
| 暖 | `red` `orange` `amber` `yellow` |
| 绿 | `lime` `green` `emerald` `teal` |
| 蓝 | `cyan` `sky` `blue` `indigo` |
| 紫 | `violet` `purple` `fuchsia` `pink` `rose` |

### 色阶

**50、100、200、300、400、500、600、700、800、900、950**

数字越小越浅，越大越深。

### 用法

```tsx
bg-{色系}-{色阶}        // 背景色    bg-blue-50
text-{色系}-{色阶}      // 文字色    text-red-500
border-{色系}-{色阶}    // 边框色    border-gray-200
```

### 常用色阶记忆

```
50       → 极浅，做背景底纹
100-200  → 浅色，hover 态
500      → 标准色，按钮、图标
600-700  → 深色，文字
900-950  → 极深，暗色模式用
```

---

## 五、间距档位

单位 `rem`，`1rem = 16px`。方向变体：`p`（四周）`px`（左右）`py`（上下）`pt` `pr` `pb` `pl`。

| 档位 | rem | px |
|------|-----|----|
| `p-0` | 0 | 0 |
| `p-px` | - | 1px |
| `p-0.5` | 0.125 | 2 |
| `p-1` | 0.25 | 4 |
| `p-1.5` | 0.375 | 6 |
| `p-2` | 0.5 | 8 |
| `p-2.5` | 0.625 | 10 |
| `p-3` | 0.75 | 12 |
| `p-3.5` | 0.875 | 14 |
| `p-4` | 1 | 16 |
| `p-5` | 1.25 | 20 |
| `p-6` | 1.5 | 24 |
| `p-8` | 2 | 32 |
| `p-10` | 2.5 | 40 |
| `p-12` | 3 | 48 |

---

## 六、字号

| 档位 | rem | px |
|------|-----|----|
| `text-xs` | 0.75 | 12 |
| `text-sm` | 0.875 | 14 |
| `text-base` | 1 | 16 |
| `text-lg` | 1.125 | 18 |
| `text-xl` | 1.25 | 20 |
| `text-2xl` | 1.5 | 24 |
| `text-3xl` | 1.875 | 30 |

---

## 七、圆角

| 档位 | 值 |
|------|-----|
| `rounded-none` | 0 |
| `rounded-sm` | 0.125rem |
| `rounded` | 0.25rem |
| `rounded-md` | 0.375rem |
| `rounded-lg` | 0.5rem |
| `rounded-xl` | 0.75rem |
| `rounded-2xl` | 1rem |
| `rounded-full` | 9999px（圆形） |

---

## 八、语法汇总

### 修饰符（前缀）

```tsx
hover:bg-blue-100       // 鼠标悬停
focus:ring-2            // 聚焦
disabled:opacity-50     // 禁用
dark:bg-blue-950        // 暗色模式
sm:w-full               // 小屏以上（≥640px）
md:flex-row             // 中屏以上（≥768px）
lg:text-lg              // 大屏以上（≥1024px）
```

可以叠加：`dark:hover:bg-blue-900`

### 透明度

```tsx
bg-blue-950/20    // 20% 不透明度
bg-black/50       // 50% 不透明度
```

### 任意值

```tsx
text-[10px]              // 精确字号
w-[300px]                // 精确宽度
h-[calc(100vh-64px)]     // 计算值
```

### 子元素选择器

```tsx
[&_tr]:border-b                           // 子元素中的 tr 加下边框
[&:has([role=checkbox])]:pr-0             // 如果包含 checkbox，去掉右 padding
```

### 兄弟联动

```tsx
// group: 父元素 hover 影响子元素
<div className="group">
  <span className="group-hover:text-blue-500">悬停变蓝</span>
</div>

// peer: 兄弟元素状态影响当前元素
<input className="peer" />
<span className="peer-focus:text-blue-500">聚焦时变蓝</span>
```

---

## 九、shadcn/ui Table 组件

安装后在 `src/components/ui/table.tsx`，本质是原生标签的薄封装，自带统一样式。

| 组件 | 对应标签 | 自带样式 |
|------|----------|----------|
| `<Table>` | `<table>` + 外层 div | `w-full`、`overflow-x-auto` |
| `<TableHeader>` | `<thead>` | 子元素 `tr` 带 `border-b` |
| `<TableBody>` | `<tbody>` | 最后一行去掉 `border-b` |
| `<TableRow>` | `<tr>` | `border-b`、`hover:bg-muted/50` |
| `<TableHead>` | `<th>` | `h-10 px-2`、`text-left` |
| `<TableCell>` | `<td>` | `p-2`、`align-middle` |

### 使用示例

```tsx
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"

<Table>
  <TableHeader>
    <TableRow>
      <TableHead className="text-center">序号</TableHead>
      <TableHead className="text-center">名称</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell className="text-center">1</TableCell>
      <TableCell className="text-center">任务名</TableCell>
    </TableRow>
  </TableBody>
</Table>
```

---

## 十、与 Element UI 对比

| | Element UI | shadcn/ui |
|---|---|---|
| 安装方式 | `npm install` | 源码复制到项目 |
| 样式控制 | props 穿透，改起来费劲 | 直接改源码 Tailwind 类 |
| 表格 | `el-table` 内置排序/筛选/固定列 | 原生 `<table>` 薄封装，需自己实现 |
| 适合 | 后台管理，快速出活 | 产品级项目，精细 UI 控制 |

---

## 十一、项目中的 CSS 变量清单

### 颜色类

| Token | 浅色 | 暗色 | 用途 |
|-------|------|------|------|
| `--background` | 纯白 | 深灰 | 页面背景 |
| `--foreground` | 近黑 | 浅白 | 正文文字 |
| `--primary` | 深灰 | 浅灰 | 主按钮 |
| `--muted` | 浅灰 | 深灰 | 次要背景 |
| `--muted-foreground` | 中灰 | 灰 | 辅助文字 |
| `--border` | 浅灰 | 白/10% | 边框 |
| `--destructive` | 红 | 红 | 删除/危险 |
| `--ring` | 中灰 | 深灰 | 聚焦环 |

### 使用

```tsx
bg-background           // 页面背景
text-foreground         // 正文
text-muted-foreground   // 次要文字
border-border           // 边框
bg-destructive          // 危险按钮背景
```