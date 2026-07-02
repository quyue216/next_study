# Todo 管理系统 API 文档

## 概述

本文档描述了 Todo 管理系统的所有 REST API 接口。系统支持优先级管理、截止日期、标签分类、附件上传和子任务功能。

## 基础信息

- **Base URL**: `/api`
- **认证**: 需要 Supabase Auth 认证
- **数据格式**: JSON

---

## 目录

1. [待办事项 (Todos)](#1-待办事项-todos)
2. [子任务 (Subtasks)](#2-子任务-subtasks)
3. [附件 (Attachments)](#3-附件-attachments)
4. [数据模型](#4-数据模型)

---

## 1. 待办事项 (Todos)

### 1.1 获取待办列表

**接口**: `GET /api/todos`

**查询参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `page` | number | 否 | 页码，默认 1 |
| `pageSize` | number | 否 | 每页数量，默认 10 |
| `search` | string | 否 | 搜索关键词（按名称搜索） |
| `filterTag` | string | 否 | 按标签筛选 |
| `action` | string | 否 | 特殊操作：`tags` 获取所有标签，`byTag` 按标签获取待办 |
| `tag` | string | 否 | 与 `action=byTag` 配合使用，指定标签 |

**响应示例** (成功):
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "完成项目",
      "completed": false,
      "createdAt": "2024-01-01T00:00:00Z",
      "priority": "high",
      "dueDate": "2024-01-15T00:00:00Z",
      "tags": ["工作", "重要"]
    }
  ],
  "total": 50,
  "page": 1,
  "pageSize": 10,
  "totalPages": 5
}
```

**获取所有标签的响应**:
```json
{
  "tags": ["工作", "生活", "学习", "重要"]
}
```

---

### 1.2 创建待办

**接口**: `POST /api/todos`

**请求体**:
```json
{
  "name": "完成项目文档",
  "priority": "medium",
  "dueDate": "2024-01-15T23:59:59Z",
  "tags": ["工作", "文档"]
}
```

**字段说明**:
| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `name` | string | 是 | 待办名称 |
| `priority` | string | 否 | 优先级：`low`、`medium`、`high` |
| `dueDate` | string | 否 | 截止日期（ISO 8601 格式） |
| `tags` | string[] | 否 | 标签数组 |

**响应示例** (成功):
```json
{
  "success": true
}
```

---

### 1.3 更新待办

**接口**: `PATCH /api/todos/{id}`

**路径参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `id` | string | 是 | 待办 ID |

**请求体** (可只更新部分字段):
```json
{
  "name": "更新后的名称",
  "completed": true,
  "priority": "high",
  "dueDate": "2024-01-20T23:59:59Z",
  "tags": ["工作", "紧急"]
}
```

**响应示例** (成功):
```json
{
  "success": true
}
```

---

### 1.4 删除待办

**接口**: `DELETE /api/todos/{id}`

**路径参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `id` | string | 是 | 待办 ID |

**响应示例** (成功):
```json
{
  "success": true
}
```

---

## 2. 子任务 (Subtasks)

### 2.1 获取子任务列表

**接口**: `GET /api/todos/{id}/subtasks`

**路径参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `id` | string | 是 | 主待办 ID |

**查询参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `action` | string | 否 | 特殊操作：`progress` 获取完成进度 |

**响应示例**:
```json
{
  "subTasks": [
    {
      "id": "uuid",
      "todoId": "uuid",
      "name": "第一步",
      "completed": true,
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

**获取进度的响应**:
```json
{
  "total": 5,
  "completed": 3
}
```

---

### 2.2 创建子任务

**接口**: `POST /api/todos/{id}/subtasks`

**路径参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `id` | string | 是 | 主待办 ID |

**请求体**:
```json
{
  "name": "新的子任务"
}
```

**响应示例**:
```json
{
  "success": true
}
```

---

### 2.3 更新子任务

**接口**: `PATCH /api/subtasks/{id}`

**路径参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `id` | string | 是 | 子任务 ID |

**请求体**:
```json
{
  "name": "更新后的子任务名称",
  "completed": true
}
```

**响应示例**:
```json
{
  "success": true
}
```

---

### 2.4 删除子任务

**接口**: `DELETE /api/subtasks/{id}`

**路径参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `id` | string | 是 | 子任务 ID |

**响应示例**:
```json
{
  "success": true
}
```

---

## 3. 附件 (Attachments)

### 3.1 获取附件列表

**接口**: `GET /api/todos/{id}/attachments`

**路径参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `id` | string | 是 | 待办 ID |

**响应示例**:
```json
{
  "attachments": [
    {
      "id": "uuid",
      "todoId": "uuid",
      "fileName": "document.pdf",
      "fileUrl": "https://...",
      "fileSize": 1024000,
      "mimeType": "application/pdf",
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

---

### 3.2 上传附件

**接口**: `POST /api/todos/{id}/attachments`

**Content-Type**: `multipart/form-data`

**路径参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `id` | string | 是 | 待办 ID |

**Form Data**:
| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `file` | File | 是 | 要上传的文件 |

**响应示例**:
```json
{
  "success": true,
  "url": "https://..."
}
```

---

### 3.3 删除附件

**接口**: `DELETE /api/attachments/{id}`

**路径参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `id` | string | 是 | 附件 ID |

**响应示例**:
```json
{
  "success": true
}
```

---

## 4. 数据模型

### 4.1 Todo (待办事项)

```typescript
interface Todo {
  id: string;                    // UUID
  name: string;                  // 名称
  completed: boolean;            // 是否已完成
  createdAt: string;             // 创建时间 (ISO 8601)
  priority?: 'low' | 'medium' | 'high';  // 优先级
  dueDate?: string;              // 截止日期 (ISO 8601)
  tags?: string[];               // 标签数组
}
```

### 4.2 SubTask (子任务)

```typescript
interface SubTask {
  id: string;                    // UUID
  todoId: string;                // 所属待办 ID
  name: string;                  // 名称
  completed: boolean;            // 是否已完成
  createdAt: string;             // 创建时间 (ISO 8601)
}
```

### 4.3 TodoAttachment (附件)

```typescript
interface TodoAttachment {
  id: string;                    // UUID
  todoId: string;                // 所属待办 ID
  fileName: string;              // 文件名
  fileUrl: string;               // 文件 URL
  fileSize: number;              // 文件大小 (字节)
  mimeType: string;              // MIME 类型
  createdAt: string;             // 创建时间 (ISO 8601)
}
```

### 4.4 PaginatedResult (分页结果)

```typescript
interface PaginatedResult<T> {
  data: T[];                     // 数据数组
  total: number;                 // 总数
  page: number;                  // 当前页码
  pageSize: number;              // 每页数量
  totalPages: number;            // 总页数
}
```

---

## 5. Server Actions (服务端操作)

除了 REST API，系统还提供了 Server Actions 用于服务端调用：

```typescript
import {
  createTodoWithDetails,
  updateTodoDetails,
  createSubTask,
  updateSubTaskState,
  removeSubTask
} from '@/app/todos/actions';

// 创建带详情的待办
await createTodoWithDetails({
  name: '任务名称',
  priority: 'high',
  dueDate: '2024-01-15T23:59:59Z',
  tags: ['标签1', '标签2']
});

// 更新待办
await updateTodoDetails('todo-id', {
  name: '新名称',
  priority: 'medium'
});

// 子任务操作
await createSubTask('todo-id', '子任务名称');
await updateSubTaskState('subtask-id', '新名称', true);
await removeSubTask('subtask-id');
```

---

## 6. 错误响应

所有接口在出错时会返回以下格式：

```json
{
  "error": "错误描述"
}
```

**常见 HTTP 状态码**:
- `200` - 成功
- `400` - 请求参数错误
- `401` - 未授权（需要登录）
- `404` - 资源不存在
- `500` - 服务器内部错误

---

## 7. 使用示例

### JavaScript 示例

```javascript
// 获取待办列表
const response = await fetch('/api/todos?page=1&pageSize=20');
const data = await response.json();

// 创建待办
const newTodo = await fetch('/api/todos', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: '新任务',
    priority: 'high',
    tags: ['工作', '紧急']
  })
});

// 获取子任务
const subTasksResponse = await fetch(`/api/todos/${todoId}/subtasks`);
const { subTasks } = await subTasksResponse.json();

// 创建子任务
await fetch(`/api/todos/${todoId}/subtasks`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name: '子任务' })
});

// 更新子任务
await fetch(`/api/subtasks/${subtaskId}`, {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ completed: true })
});

// 上传附件
const formData = new FormData();
formData.append('file', fileInput.files[0]);
const uploadResponse = await fetch(`/api/todos/${todoId}/attachments`, {
  method: 'POST',
  body: formData
});

// 删除附件
await fetch(`/api/attachments/${attachmentId}`, {
  method: 'DELETE'
});
```

### React Query 示例

```typescript
import { useQuery, useMutation } from '@tanstack/react-query';

// 获取待办列表
const { data } = useQuery({
  queryKey: ['todos', page],
  queryFn: () => fetch(`/api/todos?page=${page}`).then(r => r.json())
});

// 创建待办
const createTodoMutation = useMutation({
  mutationFn: (todo) => fetch('/api/todos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(todo)
  }),
  onSuccess: () => queryClient.invalidateQueries(['todos'])
});
```

---

## 附录

### A. 优先级说明

| 值 | 说明 |
|----|------|
| `low` | 低优先级 |
| `medium` | 中优先级（默认） |
| `high` | 高优先级 |

### B. 文件限制

- 最大文件大小: 50MB
- 支持所有常见文件类型
- 文件按用户 ID 分文件夹存储

### C. 安全说明

- 所有表都启用了 RLS (Row Level Security)
- 用户只能访问自己的数据
- 附件按用户隔离存储
