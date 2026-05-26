# API 请求规范

## 基础结构

```javascript
import request from '@/utils/request';

const baseUrl = '/模块路径';

export function 方法名(query) {
  return request({
    url: baseUrl + '/具体路径',
    method: 'get', // 或 'post', 'put', 'delete'
    params: query, // GET 请求用 params
    // data: data,  // POST/PUT 请求用 data
  });
}
```

## 规范要点

1. **baseUrl 必须定义**：每个 API 文件必须定义 `baseUrl` 常量，避免 URL 硬编码散落在各处
2. **URL 拼接**：使用 `baseUrl + '/路径'` 形式，保持一致性
3. **请求方法**：
   - GET 请求参数用 `params`
   - POST/PUT 请求参数用 `data`
4. **命名约定**：
   - 列表查询：`listXxx(query)`
   - 详情查询：`getXxx(id)`
   - 新增：`addXxx(data)`
   - 修改：`updateXxx(data)`
   - 删除：`delXxx(id)`

## 示例

```javascript
import request from '@/utils/request';

const baseUrl = '/huanwei';

// 查询列表
export function listBhxx(query) {
  return request({
    url: baseUrl + '/data/list',
    method: 'get',
    params: query,
  });
}

// 查询详情
export function getBhxx(id) {
  return request({
    url: baseUrl + '/data/' + id,
    method: 'get',
  });
}

// 新增
export function addBhxx(data) {
  return request({
    url: baseUrl + '/data',
    method: 'post',
    data: data,
  });
}

// 修改
export function updateBhxx(data) {
  return request({
    url: baseUrl + '/data',
    method: 'put',
    data: data,
  });
}

// 删除
export function delBhxx(id) {
  return request({
    url: baseUrl + '/data/' + id,
    method: 'delete',
  });
}
```

**Why:** 统一使用 `baseUrl` 可以方便地修改接口前缀，保持代码一致性，便于维护。

**How to apply:** 创建或修改 API 文件时，必须在文件顶部定义 `baseUrl` 常量，所有请求的 URL 使用 `baseUrl + '/路径'` 形式。不要在函数内部硬编码完整 URL。
