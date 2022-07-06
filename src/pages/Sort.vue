<template>
  <div class="sort-container">
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片 -->
    <el-card>
      <!-- 警告区域 -->
      <el-alert show-icon title="注意：只允许为第三级分类设置相关参数！" type="warning"></el-alert>
      <el-row class="cat_option">
        <el-col>
          <span>选择商品分类：</span>
          <!-- 选择商品分类的级联选择框 -->
          <el-cascader
            v-model="cascaderValue"
            :options="categoryList"
            :props="{
              expandTrigger: 'hover',
              value: 'cat_id',
              label: 'cat_name' 
            }"
            @change="handleChange">
          </el-cascader>
        </el-col>
      </el-row>
      <el-tabs v-model="activeName" @tab-click="handleClick">
        <el-tab-pane label="动态参数" name="many">
          <!-- 添加动态参数 -->
          <el-button type="primary" size="mini" :disabled="isBtnDisabled" @click="showAddParamsDialog">
            添加参数
          </el-button>
          <el-table :data="manyParams" v-loading="loading">
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-tag
                  v-for="(tag, i) in scope.row.attr_vals"
                  :key="i"
                  closable
                  disable-transitions
                  @close="handleTagClose(scope.row, tag)">
                  {{tag}}
                </el-tag>
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleTagInputConfirm(scope.row)"
                  @blur="handleTagInputConfirm(scope.row)"
                >
                </el-input>
                <el-button v-else class="button-new-tag" size="small" @click="showTagInput(scope.row)">+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column type="index">
            </el-table-column>
            <el-table-column label="参数名称" prop="attr_name" :align="'center'">
            </el-table-column>
            <el-table-column width="200px" label="操作" :align="'center'">
              <template slot-scope="scope">
                <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditParamsDialog(scope.row.attr_id)">编辑</el-button>
                <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeParams(scope.row.attr_id)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="静态属性" name="only">
          <el-button type="primary" size="mini" :disabled="isBtnDisabled" @click="showAddParamsDialog">
            添加属性
          </el-button>
          <el-table :data="onlyParams">
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-tag
                  v-for="(tag, i) in scope.row.attr_vals"
                  :key="i"
                  closable
                  disable-transitions
                  @close="handleTagClose(scope.row, tag)">
                  {{tag}}
                </el-tag>
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleTagInputConfirm(scope.row)"
                  @blur="handleTagInputConfirm(scope.row)"
                >
                </el-input>
                <el-button v-else class="button-new-tag" size="small" @click="showTagInput(scope.row)">+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column type="index">
            </el-table-column>
            <el-table-column label="参数名称" prop="attr_name" :align="'center'">
            </el-table-column>
            <el-table-column width="200px" label="操作" :align="'center'">
              <template slot-scope="scope">
                <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditParamsDialog(scope.row.attr_id)">编辑</el-button>
                <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeParams(scope.row.attr_id)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
    <el-dialog
      :title="'添加'+ paramsdialogText"
      :visible.sync="addParamsDialogVisible"
      width="40%"
      @close="addParamsDialogClose">
      <el-form
        :model="addParamsForm"
        :rules="addParamsRules"
        ref="addParamsFormRef"
        label-width="100px">
        <el-form-item
          :label="paramsdialogText"
          prop="attr_name">
          <el-input v-model="addParamsForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addParamsDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParams">确 定</el-button>
      </span>
    </el-dialog>
    <el-dialog
      :title="'修改'+ paramsdialogText"
      :visible.sync="editParamsDialogVisible"
      width="40%"
      @close="editParamsDialogClose">
      <el-form
        :model="editParamsForm"
        :rules="editParamsRules"
        ref="editParamsFormRef"
        label-width="100px">
        <el-form-item
          :label="paramsdialogText"
          prop="attr_name">
          <el-input v-model="editParamsForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editParamsDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editParams">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>

  export default {
    name: 'Sort',
    data() {
      return {
        categoryList: [],
        cascaderValue: [],
        activeName: 'many',
        // 动态参数
        manyParams: [],
        // 静态参数
        onlyParams: [],
        loading: false,
        addParamsForm: {
          attr_name: ''
        },
        // 添加参数对话框是否隐藏
        addParamsDialogVisible: false,
        // 添加参数对话框规则
        addParamsRules: {
          attr_name: [
            {required: true, message: '不能为空', trgger: 'blur'}
          ]
        },
        editParamsForm: {
          attr_id: '',
          attr_name: ''
        },
        // 编辑参数对话框是否隐藏
        editParamsDialogVisible: false,
        // 编辑参数对话框规则
        editParamsRules: {
          attr_name: [
            {required: true, message: '不能为空', trgger: 'blur'}
          ]
        }
      }
    },
    methods: {
      async getCateList() {
        const {data: res} = await this.$http.get('categories')
        if (res.meta.status !== 200) {
          return this.$message.error('获取商品分类失败!')
        }

        this.categoryList = res.data
      },
      async getParams() {
        if (this.cascaderValue.length !== 3) {
          this.cascaderValue = []
          this.manyParams = []
          this.onlyParams = []
          return 
        }
        this.loading = true
        // 根据所选ID和当前面板请求对应数据
        const {data: res} = await this.$http.get(`categories/${this.cateId}/attributes`, {params: {sel: this.activeName}})
        if (res.meta.status !== 200) {
          return this.$message.error('获取对应分类参数失败!')
        }
        // 分割获取到的参数数据attr_vals
        // 如果attr_vals参数值为空，直接返回空数组
        res.data.forEach(item => {
          // 给每个attr_vals设置自身的inputValue和inputVisible 供tag标签的展示
          item.inputValue = ''
          item.inputVisible = false
          if (item.attr_vals === '') {
            item.attr_vals = []
          } else {
            item.attr_vals = item.attr_vals.split(' ')
          }
        })
        if (this.activeName === 'many') {
          this.manyParams = res.data
        } else {
          this.onlyParams = res.data
        }
        this.$message.success('获取对应分类参数成功')
        this.loading = false
      },
      addParams() {
        this.$refs.addParamsFormRef.validate(async valid => {
          if (!valid) return 
          const {data: res} = await this.$http.post(`categories/${this.cateId}/attributes`, {
            attr_name: this.addParamsForm.attr_name,
            attr_sel: this.activeName
          })
          if (res.meta.status !== 201) {
            return this.$message.error('添加参数失败!')
          }
          this.addParamsDialogVisible = false
          this.getParams()
          this.$message.success('添加参数成功!')
        })
      },
      showAddParamsDialog() {
        this.addParamsDialogVisible = true
      },
      addParamsDialogClose() {
        this.$refs.addParamsFormRef.resetFields()
      },
      editParams() {
        this.$refs.editParamsFormRef.validate(async valid => {
          if (!valid) return 
          const {data: res} = await this.$http.put(`categories/${this.cateId}/attributes/${this.editParamsForm.attr_id}`, {
            attr_name: this.editParamsForm.attr_name,
            attr_sel: this.activeName
          })
          if (res.meta.status !== 200) {
            return this.$message.error('更新参数失败!')
          }
          this.getParams()
          this.editParamsDialogVisible = false
          this.$message.success('更新参数成功!')
        })
      },
      showEditParamsDialog(id) {
        this.editParamsForm.attr_id = id
        this.editParamsDialogVisible = true
      },
      editParamsDialogClose() {
        this.$refs.editParamsFormRef.resetFields()
      },
      async removeParams(id) {
        const confirmResult = await this.$confirm('此操作将永久删除该参数, 是否继续', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(err => err)

        if(confirmResult !== 'confirm') return
        const {data: res} = await this.$http.delete(`categories/${this.cateId}/attributes/${id}`)
        if (res.meta.status !== 200) {
          return this.$message.error('删除分类失败!')
        }
        this.getParams()
        this.$message.success('删除分类成功!')
      },
      handleChange() {
        this.getParams()
      },  
      handleClick() {
        this.getParams()
      },
      // 将对tag的操作结果保存到数据库
      async saveAttrVals(row) {
        const {data: res} = await this.$http.put(`categories/${this.cateId}/attributes/${row.attr_id}`, {
          attr_name: row.attr_name,
          attr_sel: row.attr_sel,
          attr_vals: row.attr_vals.join(' ')
        })
        if (res.meta.status !== 200) {
          return this.$message.error('修改参数项失败!')
        }
        this.$message.success('修改参数项成功!')
      },
      // tag标签确定添加事件
      async handleTagInputConfirm(row) {
        if (row.inputValue.trim().length === 0) {
          row.inputValue = ''
          row.inputVisible = false
          return 
        }
        if (row.attr_vals.indexOf(row.inputValue) !== -1) {
          return this.$message.error('不能添加已有的参数项!')
        }
        row.attr_vals.push(row.inputValue.trim())
        row.inputValue = ''
        row.inputVisible = false

        // 发起添加属性请求
        this.saveAttrVals(row)
      },
      showTagInput(row) {
        row.inputVisible = true;
        this.$nextTick(() => {
          this.$refs.saveTagInput.$refs.input.focus();
        });
      },
      // 
      handleTagClose(row, tag) {
        row.attr_vals.splice(row.attr_vals.indexOf(tag), 1);
        this.saveAttrVals(row)
      },
    },
    computed: {
      // 是否禁用按钮
      isBtnDisabled() {
        if (this.cascaderValue.length !== 3) {
          return true
        }
        return false
      },
      cateId() {
        if (this.cascaderValue.length === 3) {
          return this.cascaderValue[2]
        }
        return null
      },
      // 添加参数对话框的文本
      paramsdialogText() {
        return this.activeName === 'many' ? '动态参数': '静态属性'
      }
    },
    beforeMount() {
      this.getCateList()
    },
  }
</script>

<style lang="less" scoped>
  .sort-container {
    .el-tag, .input-new-tag, .button-new-tag {
      margin-bottom: 5px;
      margin-right: 10px;
    }
    .input-new-tag {
      width: 90px;
    }
    .cat_option {
      margin-top: 20px;
    }
  }

</style>