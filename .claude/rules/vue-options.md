# Vue 组件选项规范

本项目提供三个特殊的 Vue 组件选项，用于自动注入全局数据，避免重复编写数据获取逻辑。

## 三个核心选项

| 选项 | 用途 | 数据权限 | 访问方式 |
|------|------|----------|----------|
| `authData` | 需要权限的全局数据 | 根据当前用户权限返回 | `this.authData.xxx` |
| `echoData` | 无需权限的全局数据 | 全部返回 | `this.echoData.xxx` |
| `dicts` | 字典数据 | 全部返回 | `this.dict.type.xxx` |

## 使用方法

### 1. authData - 权限数据

用于获取需要当前用户权限才能访问的数据（如部门列表、车辆列表等）。

```vue
<script>
export default {
  authData: ['deptList', 'carList'],
  mounted() {
    console.log(this.authData.deptList); // 当前用户有权限的部门列表
  }
}
</script>

<template>
  <treeselect :options="authData.deptList" />
</template>
```

**可用的 authData 键：**

| 键名 | 说明 |
|------|------|
| `deptList` | 部门树列表（当前用户有权限的） |
| `carList` | 所有车辆列表 |
| `qyCarList` | 清运车辆列表 |
| `zyCarList` | 转运车辆列表 |
| `jsyList` | 驾驶员列表 |
| `gcgList` | 跟车工列表 |
| `userList` | 人员列表 |
| `qyUserList` | 清运人员列表 |
| `zyUserList` | 转运人员列表 |
| `ysUserList` | 压缩人员列表 |
| `perYszList` | 压缩站列表 |
| `perZzzList` | 中转站列表 |
| `thisDeptAccountList` | 本部门及以下账号列表 |

### 2. echoData - 通用数据

用于获取无需特殊权限的全局数据。

```vue
<script>
export default {
  echoData: ['accountList', 'deptTree'],
  mounted() {
    console.log(this.echoData.accountList); // 账号列表
  }
}
</script>

<template>
  <el-select v-model="form.account">
    <el-option 
      v-for="item in echoData.accountList" 
      :key="item.id" 
      :label="item.name" 
      :value="item.id" 
    />
  </el-select>
</template>
```

**可用的 echoData 键：**

| 键名 | 说明 |
|------|------|
| `deptTree` | 部门树结构 |
| `dwTree` | 只有上级单位的树 |
| `deptList` | 部门列表（平级） |
| `accountList` | 账号列表 |
| `userList` | 人员列表 |
| `yszList` | 压缩站列表 |
| `zzzList` | 中转站列表 |
| `cllxList` | 车辆类型列表 |
| `gwList` | 岗位列表 |

### 3. dicts - 字典数据

用于获取系统字典数据（如状态、类型等固定选项）。

```vue
<script>
export default {
  dicts: ['vehicle_alert', 'sys_normal_disable'],
}
</script>

<template>
  <el-select v-model="form.status">
    <el-option 
      v-for="item in dict.type.sys_normal_disable" 
      :key="item.value" 
      :label="item.label" 
      :value="item.value" 
    />
  </el-select>
</template>
```

**常用字典类型：**

| 字典类型 | 说明 |
|----------|------|
| `sys_normal_disable` | 正常/停用状态 |
| `sys_yes_no` | 是/否 |
| `vehicle_alert` | 车辆预警名称 |
| `vehicle_device_type` | 车辆设备类型 |
| `vehicle_camera_position` | 摄像头位置 |
| `camera_install_location` | 摄像头安装位置 |
| `site_type` | 站点类型 |
| `site_fees_type` | 站点费用类型 |
| `ick_ljlx` | 垃圾类型 |
| `sys_user_tx` | 用户特性 |
| `gwxx` | 岗位信息 |
| `cllx` | 车辆类型 |

**查找更多字典类型：** 在数据库 `sys_dict_type` 表中查询，或查看 `src/views/**/*.vue` 中的使用示例。

## 完整示例

```vue
<template>
  <div>
    <!-- 使用 authData -->
    <el-form-item label="使用单位">
      <treeselect 
        v-model="queryParams.deptId" 
        :options="authData.deptList" 
      />
    </el-form-item>
    
    <!-- 使用 echoData -->
    <el-form-item label="账号">
      <el-select v-model="form.accountId">
        <el-option 
          v-for="item in echoData.accountList" 
          :key="item.id" 
          :label="item.name" 
          :value="item.id" 
        />
      </el-select>
    </el-form-item>
    
    <!-- 使用 dicts -->
    <el-form-item label="预警名称">
      <el-select v-model="queryParams.alertName">
        <el-option 
          v-for="item in dict.type.vehicle_alert" 
          :key="item.value" 
          :label="item.label" 
          :value="item.value" 
        />
      </el-select>
    </el-form-item>
  </div>
</template>

<script>
export default {
  // 权限数据
  authData: ['deptList'],
  // 通用数据
  echoData: ['accountList'],
  // 字典数据
  dicts: ['vehicle_alert'],
  
  data() {
    return {
      queryParams: {
        deptId: null,
        alertName: null,
      },
      form: {
        accountId: null,
      }
    };
  }
}
</script>
```

## 注意事项

1. **不要混用**：authData 和 echoData 可能有相同的键名（如都有 `deptList`），但它们的数据来源和权限控制不同
2. **数组形式**：三个选项都接受字符串数组
3. **响应式**：注入的数据是响应式的，数据更新会自动反映到模板
4. **自动加载**：声明选项后，数据会自动加载，无需手动调用 API
5. **权限控制**：authData 会自动根据当前用户权限过滤数据，无权限返回空数组

## 扩展数据

如需添加新的全局数据键：

1. **authData**：修改 `src/store/modules/auth.js` 和 `src/utils/globalEcho/authFunMap.js`
2. **echoData**：修改 `src/store/modules/echo.js` 和 `src/utils/globalEcho/echoFunMap.js`
3. **dicts**：在系统管理的字典管理中维护

**Why:** 这三个选项是项目约定的全局数据注入方式，统一使用可以避免重复编写数据获取逻辑，保持代码一致性。

**How to apply:** 当组件需要获取部门、车辆、人员、字典等全局数据时，必须使用这三个选项声明，而不是手动调用 API。选择正确的选项：需要权限控制的数据用 `authData`，通用数据用 `echoData`，字典数据用 `dicts`。
