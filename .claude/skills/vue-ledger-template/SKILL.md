---
name: vue-ledger-template
description: 快速生成 Vue 2 + Element UI 台账（列表管理）页面。Use when Kimi needs to create a ledger/list management page with search, table, pagination, add/edit/detail dialog. Supports features like export, batch operations, permission controls. 适用于浦发养护项目风格的台账页面开发。
---

# Vue 台账模板技能

本技能用于快速生成基于 Vue 2 + Element UI 的台账（列表管理）页面，遵循浦发养护项目的代码规范。

## 适用场景

- 需要创建新的台账管理页面
- 包含搜索、列表、分页、新增、修改、详情、删除、导出等功能
- 使用 Element UI 组件库
- 需要遵循项目统一的代码风格和命名规范

## 快速开始

### 1. 确定台账信息

首先确认以下信息：

| 项目 | 说明 | 示例 |
|------|------|------|
| 模块名称 | 中文名称 | 车辆预警台账 |
| 页面名称 | Vue 组件 name | VehicleAlert |
| API 模块 | 接口文件路径 | dispatchVehicle/vehAlert |
| 权限前缀 | 权限标识前缀 | huanwei:vehicleAlert |
| 搜索字段 | 检索条件字段 | deptId, carPlate, alertName |
| 表格字段 | 列表显示字段 | deptId, carPlate, alertName, alertTime |
| 表单字段 | 新增/修改字段 | 同表格字段 |

### 2. 创建 API 文件

复制模板并修改：

```bash
# 参考模板
# .agents/skills/vue-ledger-template/assets/api-template.js
```

创建文件：`src/api/{模块}/{功能}.js`

### 3. 创建页面文件

复制模板并修改：

```bash
# 参考模板
# .agents/skills/vue-ledger-template/assets/ledger-template.vue
```

创建文件：`src/views/{模块}/{页面}/index.vue`



## 模板变量说明

### 页面模板变量

| 变量名 | 说明 | 示例 |
|--------|------|------|
| `{{MODULE_NAME}}` | 模块中文名 | 车辆预警 |
| `{{PAGE_NAME}}` | 页面组件名 | VehicleAlert |
| `{{API_MODULE}}` | API 模块路径 | dispatchVehicle/vehAlert |
| `{{PERMISSION_PREFIX}}` | 权限前缀 | huanwei:vehicleAlert |
| `{{LIST_API}}` | 列表接口名 | listCarAlert |
| `{{ADD_API}}` | 新增接口名 | addCarAlert |
| `{{UPDATE_API}}` | 修改接口名 | updateCarAlert |
| `{{DEL_API}}` | 删除接口名 | delCarAlert |
| `{{DETAIL_API}}` | 详情接口名 | getCarAlert |

### API 模板变量

| 变量名 | 说明 | 示例 |
|--------|------|------|
| `{{API_BASE_PATH}}` | 接口基础路径（前缀） | /huanwei(默认值) |
| `{{API_MODULE_PATH}}` | 接口模块路径 | /vehicle/device |
| `{{LIST_API}}` | 列表接口函数名 | listCarAlert |
| `{{ADD_API}}` | 新增接口函数名 | addCarAlert |
| `{{UPDATE_API}}` | 修改接口函数名 | updateCarAlert |
| `{{DEL_API}}` | 删除接口函数名 | delCarAlert |
| `{{DETAIL_API}}` | 详情接口函数名 | getCarAlert |


## 代码规范

### 命名规范

1. **组件名**：大驼峰命名，如 `VehicleAlert`
2. **文件名**：小驼峰命名，如 `vehAlert.js`
3. **API 函数名**：
   - 列表：`list{功能名}`，如 `listCarAlert`
   - 新增：`add{功能名}`，如 `addCarAlert`
   - 修改：`update{功能名}`，如 `updateCarAlert`
   - 删除：`del{功能名}`，如 `delCarAlert`
   - 详情：`get{功能名}`，如 `getCarAlert`

### 数据结构规范

#### Query Params（查询参数）
```javascript
const queryParams = {
  pageNum: 1,
  pageSize: 10,
  // 其他搜索字段...
};
```

#### Form Data（表单数据）
```javascript
const baseForm = {
  // 表单字段...
};
```

#### Dialog Title Map（对话框标题映射）
```javascript
const listDialogTitleMap = {
  add: '新增{模块名}',
  edit: '修改{模块名}',
  detail: '{模块名}详情',
};
```

### 方法规范

| 方法名 | 用途 |
|--------|------|
| `featList()` | 获取列表数据 |
| `handleQuery()` | 搜索按钮 |
| `resetQuery()` | 重置按钮 |
| `handleAdd()` | 新增按钮 |
| `handleUpdate(row)` | 修改按钮 |
| `handleDelete(row)` | 删除按钮 |
| `handleDetail(row)` | 详情按钮 |
| `handleExport()` | 导出按钮 |
| `handleSubmitRecord()` | 表单提交 |
| `resetForm(type)` | 重置表单 |
| `handleSelectionChange(selection)` | 表格选择变化 |

## 搜索字段组件对应表

根据字段含义选择合适的搜索组件：

| 字段含义 | 字段名 | 组件 | 数据源 | 说明 |
|----------|--------|------|--------|------|
| 单位/部门 | `deptId` | `treeselect` | `authData.deptList` | 树形选择器，支持层级展示 |
| 字典类型 | `status`, `type` 等 | `el-select` | `dict.type.xxx` | 普通下拉选择 |
| 通用列表 | `userId`, `carId` 等 | `el-select` | `echoData.xxxList` | 数据量较少时使用 |
| 大列表 | `toiletId`, `siteId` 等 | `VirtualScrollSelect` | 自定义数据 | 数据量较大时使用虚拟滚动 |
| 日期 | `date` | `el-date-picker` | - | type="date" |
| 日期范围 | `startTime`, `endTime` | `el-date-picker` | - | type="daterange" |
| 月份 | `month` | `el-date-picker` | - | type="month" |
| 年份 | `year`, `nf` | `el-date-picker` | - | type="year" |
| 文本 | `name`, `code` 等 | `el-input` | - | 普通文本输入 |

### VirtualScrollSelect 使用

当列表数据量较大（超过 100 条）时，使用 `VirtualScrollSelect` 替代 `el-select`：

```html
<el-form-item label="公厕" prop="toiletId">
  <VirtualScrollSelect
    v-model="queryParams.toiletId"
    :options="toiletList"
    label-key="sc"
    value-key="id"
    placeholder="请选择公厕"
    clearable
  />
</el-form-item>
```

**属性说明：**
- `options` - 选项列表数据
- `label-key` - 显示文本的字段名
- `value-key` - 选项值的字段名
- `placeholder` - 占位提示文字
- `clearable` - 是否可清空

## 高级特性

### 使用字典

```javascript
export default {
  dicts: ['dict_type_code'],
  // ...
};
```

### 使用回显数据

```javascript
export default {
  echoData: ['accountList'],
  // ...
};
```

### 使用权限控制

```html
<el-button v-hasPermi="['huanwei:module:add']">新增</el-button>
```

### 表格字段自定义 Header

```html
<el-table-column prop="fieldName">
  <template slot="header">
    <div style="text-align: center; font-weight: bold; color: #515a6e">
      字段名
      <el-popover placement="top" width="200" trigger="hover" title="说明">
        <div>字段说明内容</div>
        <i class="el-icon-question" slot="reference"></i>
      </el-popover>
    </div>
  </template>
</el-table-column>
```

### 弹框布局规范

弹框（新增/修改/详情）统一使用以下布局样式：

```html
<el-dialog
  :title="listDialogTitleMap[listDialogTitle]"
  :visible.sync="listDialogVisible"
  width="50%"
  append-to-body
  :close-on-click-modal="false"
  destroy-on-close
>
  <el-form ref="listFormRef" :model="listForm" :rules="rules" label-width="130px" inline>
    <!-- 普通字段：双列布局 -->
    <el-form-item label="字段名" prop="field">
      <el-input v-model="listForm.field" style="width: 220px" />
    </el-form-item>
    
    <!-- 长文本字段：独占一行 -->
    <el-form-item label="备注" prop="remark" class="full-width-item">
      <el-input v-model="listForm.remark" type="textarea" style="width: 100%" />
    </el-form-item>
  </el-form>
  
  <div slot="footer" v-if="!isDetail" class="dialog-footer">
    <el-button @click="listDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="handleSubmitRecord">确 定</el-button>
  </div>
</el-dialog>
```

**规范要点：**

| 属性/样式 | 值 | 说明 |
|-----------|-----|------|
| `width` | `50%` | 弹框宽度使用百分比，自适应屏幕 |
| `destroy-on-close` | - | 关闭时销毁组件，避免数据残留 |
| `label-width` | `130px` | 表单标签宽度 |
| `inline` | - | 启用行内布局，实现双列 |
| 输入框宽度 | `220px` | 统一固定宽度 |
| 长文本类 | `full-width-item` | 备注等长文本字段独占一行 |
| 底部按钮类 | `dialog-footer` | 按钮居右对齐 |
| 按钮顺序 | 取消→确定 | 取消在前，确定在后 |
| 底部条件 | `v-if="!isDetail"` | 详情模式隐藏底部按钮区域 |

**配套样式：**

```css
<style scoped>
.dialog-footer {
  text-align: right;
}

.full-width-item {
  width: 100%;
}

.full-width-item ::v-deep .el-form-item__content {
  width: calc(100% - 230px);
}
</style>
```

## 模板文件

- [API 模板](./assets/api-template.js)
- [页面模板](./assets/ledger-template.vue)

## 示例

参考项目中的现有台账：
- `src/views/dispatch/vehAlert/index.vue` - 车辆预警台账
- `src/views/dispatch/vehDevice/index.vue` - 终端设备台账
- `src/views/dispatch/vehMointor/index.vue` - 摄像头台账
- `src/views/dispatch/vehVender/index.vue` - 网关配置台账
