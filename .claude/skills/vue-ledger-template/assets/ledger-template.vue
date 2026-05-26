<template>
  <div class="app-container">
    <!-- 检索表单 -->
    <el-form
      :model="queryParams"
      ref="queryForm"
      size="small"
      :inline="true"
      v-show="showSearch"
      label-width="80px"
    >
      <!-- 搜索字段区域 - 根据实际需求修改 -->
      <el-form-item label="关键词" prop="keyword">
        <el-input
          v-model="queryParams.keyword"
          placeholder="请输入关键词"
          clearable
          style="width: 200px"
        />
      </el-form-item>

      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery"
          >搜索</el-button
        >
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 操作按钮行 -->
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
          v-hasPermi="['{{PERMISSION_PREFIX}}:add']"
        >
          新增</el-button
        >
      </el-col>

      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleUpdate({ id: ids[ids.length - 1] })"
          v-hasPermi="['{{PERMISSION_PREFIX}}:edit']"
        >
          修改</el-button
        >
      </el-col>

      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['{{PERMISSION_PREFIX}}:remove']"
        >
          删除</el-button
        >
      </el-col>

      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['{{PERMISSION_PREFIX}}:export']"
        >
          导出</el-button
        >
      </el-col>

      <right-toolbar :showSearch.sync="showSearch" @queryTable="featList" />
    </el-row>

    <!-- 数据表格 -->
    <el-table
      v-loading="loading"
      :data="tableList"
      @selection-change="handleSelectionChange"
      width="100%"
      align="center"
    >
      <el-table-column type="selection" width="55" align="center" />

      <!-- 表格字段 - 根据实际需求修改 -->
      <el-table-column label="字段1" align="center" prop="field1" />
      <el-table-column label="字段2" align="center" prop="field2" />
      <el-table-column label="字段3" align="center" prop="field3" />

      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="200">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-info"
            @click="handleDetail(scope.row)"
          >
            详情
          </el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['{{PERMISSION_PREFIX}}:edit']"
          >
            修改
          </el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['{{PERMISSION_PREFIX}}:remove']"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页组件 -->
    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="featList"
    />

    <!-- 新增/修改/详情对话框 -->
    <el-dialog
      :title="listDialogTitleMap[listDialogTitle]"
      :visible.sync="listDialogVisible"
      width="50%"
      append-to-body
      :close-on-click-modal="false"
      destroy-on-close
    >
      <el-form
        ref="listFormRef"
        :model="listForm"
        :rules="rules"
        inline
        label-width="130px"
      >
        <!-- 表单字段 - 普通字段双列布局 -->
        <el-form-item label="字段1" prop="field1">
          <el-input
            v-model="listForm.field1"
            :disabled="isDetail"
            placeholder="请输入字段1"
            style="width: 220px"
          />
        </el-form-item>

        <el-form-item label="字段2" prop="field2">
          <el-input
            v-model="listForm.field2"
            :disabled="isDetail"
            placeholder="请输入字段2"
            style="width: 220px"
          />
        </el-form-item>

        <el-form-item label="字段3" prop="field3">
          <el-input
            v-model="listForm.field3"
            :disabled="isDetail"
            placeholder="请输入字段3"
            style="width: 220px"
          />
        </el-form-item>

        <!-- 长文本字段 - 独占一行 -->
        <el-form-item label="备注" prop="remark" class="full-width-item">
          <el-input
            v-model="listForm.remark"
            type="textarea"
            :rows="3"
            :disabled="isDetail"
            placeholder="请输入备注"
            style="width: 100%"
          />
        </el-form-item>
      </el-form>

      <div slot="footer" v-if="!isDetail" class="dialog-footer">
        <el-button @click="listDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="handleSubmitRecord">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  {{LIST_API}} as getList,
  {{ADD_API}} as addList,
  {{UPDATE_API}} as updateList,
  {{DEL_API}} as delList,
  {{DETAIL_API}} as getListItemDetail,
} from '@/api/{{API_MODULE}}';

// 基础表单数据
const baseForm = {
  id: null,
  field1: null,
  field2: null,
  field3: null,
};

// 查询参数
const queryParams = {
  pageNum: 1,
  pageSize: 10,
  keyword: null,
};

// 表单校验规则
const rules = {
  field1: [{ required: true, message: '字段1不能为空', trigger: 'blur' }],
  field2: [{ required: true, message: '字段2不能为空', trigger: 'blur' }],
};

// 对话框标题映射
const listDialogTitleMap = {
  add: '新增{{MODULE_NAME}}',
  edit: '修改{{MODULE_NAME}}',
  detail: '{{MODULE_NAME}}详情',
};

export default {
  name: '{{PAGE_NAME}}',
  data() {
    return {
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 表格数据
      tableList: [],
      // 弹出层标题
      listDialogTitle: listDialogTitleMap.add,
      // 是否显示弹出层
      listDialogVisible: false,
      // 查询参数
      queryParams: { ...queryParams },
      // 新增表单
      listAddForm: { ...baseForm },
      // 详情表单
      listDetailForm: { ...baseForm },
      // 修改表单
      listEditForm: { ...baseForm, id: null },
      // 表单校验
      rules: rules,
      // 对话框标题映射
      listDialogTitleMap,
    };
  },
  computed: {
    // 是否详情模式
    isDetail() {
      return this.listDialogTitle === 'detail';
    },
    // 当前表单（根据对话框类型返回对应表单）
    listForm() {
      const dataMap = {
        add: this.listAddForm,
        edit: this.listEditForm,
        detail: this.listDetailForm,
      };
      return dataMap[this.listDialogTitle] ?? {};
    },
  },
  mounted() {
    this.featList();
  },
  methods: {
    /** 查询列表 */
    async featList() {
      this.loading = true;
      try {
        const result = await getList({ ...this.queryParams });
        if (result.code === 200) {
          this.tableList = result.rows || [];
          this.total = result.total || 0;
        } else {
          this.$modal.msgError(result.msg || '查询失败');
        }
      } catch (error) {
        console.error('查询列表失败:', error);
        this.$modal.msgError('查询失败，请稍后重试');
      } finally {
        this.loading = false;
      }
    },

    /** 查询详情 */
    async featListItemDetail(id) {
      try {
        const res = await getListItemDetail(id);
        if (res.code === 200) {
          return res.data || {};
        } else {
          this.$modal.msgError(res.msg || '查询详情失败');
          return {};
        }
      } catch (error) {
        console.error('查询详情失败:', error);
        this.$modal.msgError('查询详情失败，请稍后重试');
        return {};
      }
    },

    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.featList();
    },

    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm('queryForm');
      this.featList();
    },

    /** 新增按钮操作 */
    handleAdd() {
      this.resetForm();
      this.listDialogTitle = 'add';
      this.listDialogVisible = true;
      this.$nextTick(() => {
        this.$refs.listFormRef?.clearValidate();
      });
    },

    /** 修改按钮操作 */
    async handleUpdate(row) {
      const result = await this.featListItemDetail(row.id);
      this.listDialogTitle = 'edit';
      this.listDetailForm = { ...baseForm, id: row.id };
      this.listDialogVisible = true;
      const keys = Object.keys(this.listForm);
      keys.forEach((key) => {
        if (key !== 'id') {
          this.listForm[key] = Object.keys(result).length ? result[key] : row[key];
        }
      });
      this.$nextTick(() => {
        this.$refs.listFormRef?.clearValidate();
      });
    },

    /** 删除按钮操作 */
    handleDelete(row) {
      const ids = row.id || this.ids;
      if (!ids || ids.length === 0) {
        this.$modal.msgWarning('请选择需要删除的记录');
        return;
      }
      this.$modal.confirm('是否确认删除选中的记录?').then(
        async () => {
          try {
            const result = await delList(ids);
            if (result.code === 200) {
              this.featList();
              this.$modal.msgSuccess('删除成功');
            } else {
              this.$modal.msgError(result.msg || '删除失败');
            }
          } catch (error) {
            console.error('删除失败:', error);
            this.$modal.msgError('删除失败，请稍后重试');
          }
        },
        () => {
          console.log('取消删除');
        }
      );
    },

    /** 提交表单 */
    handleSubmitRecord() {
      this.$refs.listFormRef.validate((valid) => {
        if (valid) {
          const isAdd = this.listDialogTitle === 'add';
          const api = isAdd ? addList : updateList;
          const msg = isAdd ? '新增成功' : '修改成功';
          const params = { ...this.listForm };
          api(params).then((res) => {
            if (res.code === 200) {
              this.$modal.msgSuccess(msg);
              this.listDialogVisible = false;
              this.featList();
            }
          });
        }
      });
    },

    /** 重置表单 */
    resetForm(refName) {
      if (this.$refs[refName]) {
        this.$refs[refName].resetFields();
      }
    },

    /** 表格复选框变更 */
    handleSelectionChange(selection) {
      this.ids = selection.map((item) => item.id);
      this.single = selection.length !== 1;
      this.multiple = !selection.length;
    },

    /** 导出按钮 */
    handleExport() {
      this.download(
        '{{API_BASE_PATH}}{{API_MODULE_PATH}}/export',
        {
          ...this.queryParams,
        },
        `{{MODULE_NAME}}_${new Date().getTime()}.xlsx`
      );
    },

    /** 显示详情 */
    async handleDetail(row) {
      const result = await this.featListItemDetail(row.id);
      this.listDialogTitle = 'detail';
      this.listDialogVisible = true;
      const keys = Object.keys(this.listForm);
      keys.forEach((key) => {
        this.listForm[key] = Object.keys(result).length ? result[key] : row[key];
      });
    },
  },
};
</script>

<style scoped lang="scss">
@import '@/assets/styles/element-input.scss';

.mb8 {
  margin-bottom: 8px;
}

.small-padding {
  padding: 0 5px;
}

.fixed-width {
  width: 150px;
}

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
