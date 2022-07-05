<template>
  <div>
    <!-- 面包屑 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片 -->
    <el-card class="box-card">
      <el-row>
        <el-col>
          <el-button type="primary" @click="showAddCateDialog">添加分类</el-button>
        </el-col>
      </el-row>
      <!-- 用户列表展示 table -->
      <el-table
        :data="categoryList"
        row-key="cat_id"
        style="width: 100%"
        v-loading="loading"
        lazy
        :tree-props="{children: 'children'}">
        <el-table-column
          prop="cat_name"
          width="150px"
          label="分类名称">
        </el-table-column>
        <el-table-column
          label="是否有效"
          :align="'center'">
          <template slot-scope="scope">
            <i class="el-icon-success" style="color: #409eff" v-if="!scope.row.cat_deleted"></i>
            <i class="el-icon-error" style="color: #f67d7d" v-else></i>
          </template>
        </el-table-column>
        <el-table-column
          prop="cat_level"
          label="排序"
          :align="'center'">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.cat_level === 0">一级</el-tag>
            <el-tag v-if="scope.row.cat_level === 1" type="success">二级</el-tag>
            <el-tag v-if="scope.row.cat_level === 2" type="warning">三级</el-tag>
          </template>
        </el-table-column>
        <el-table-column
          label="操作"
          width="200px"
          :align="'center'">
          <template slot-scope="scope">
            <!-- 修改按钮 -->
              <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditCategoryDialog(scope.row.cat_id)">编辑</el-button>
            <!-- 删除按钮 -->
              <el-button type="danger" icon="el-icon-delete" size="mini" @click="reomveCategory(scope.row.cat_id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-size="queryInfo.pagesize"
        :page-sizes= "[5, 10, 20]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>
    </el-card>
    <el-dialog
      title="添加分类"
      :visible.sync="addCateDialogVisible"
      width="40%"
      @close="addCateDialogClose">
      <el-form 
        :model="addCateForm" 
        :rules="addCateFormRules"
        ref="addCateFormRef" 
        label-width="100px" >
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="addCateForm.cat_name">
          </el-input>
        </el-form-item>
        <el-form-item label="所属分类">
          <el-cascader
            clearable
            change-on-select
            v-model="cascaderValue"
            :options="parentCategoryList"
            :props="{
              expandTrigger: 'hover',
              value: 'cat_id',
              label: 'cat_name' 
            }">
          </el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCategory">确 定</el-button>
      </span>
    </el-dialog>
    <el-dialog
      title="修改分类"
      :visible.sync="editCateDialogVisible"
      width="40%"
      @close="editCateDialogClose">
      <el-form 
        :model="editCateForm" 
        :rules="editCateFormRules"
        ref="editCateFormRef" 
        label-width="100px" >
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="editCateForm.cat_name">
          </el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editCategory">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
  export default {
    name: 'Category',
    data() {
      return {
        categoryList: [],
        parentCategoryList: [],
        cascaderValue: [],
        addCateForm: {
          cat_name: '',
          cat_pid: 0,
          cat_level: 0
        },
        addCateDialogVisible: false,
        addCateFormRules: {
          cat_name: [
            {required: true, message: '请输入用户名', trigger: 'blur'},
          ]
        },
        editCateForm: {
          cat_id: '',
          cat_name: ''
        },
        editCateDialogVisible: false,
        editCateFormRules: {
          cat_name: [
            {required: true, message: '请输入用户名', trigger: 'blur'},
          ]
        },
        queryInfo: {
          type: [],
          pagenum: 1,
          pagesize: 5
        },
        total: 0,
        loading: false,
      }
    },
    methods: {
      async getCategoryList() {
        this.loading = true
        const {data: res} = await this.$http.get('categories', {params: this.queryInfo})
        if (res.meta.status !== 200) {
          this.loading = false
          return this.$message.error('获取分类列表失败!')
        }
        this.categoryList = res.data.result
        this.total = res.data.total
        this.loading = false
      },
      async getParentCategoryList() {
        const {data: res} = await this.$http.get('categories', {params: {type: 2}})
        if (res.meta.status !== 200) {
          return this.$message.error('获取父级分类失败!')
        }
        this.parentCategoryList = res.data
      },
      showAddCateDialog() {
        this.getParentCategoryList()
        this.addCateDialogVisible = true
      },
      async addCategory() {
        this.addCateForm.cat_level = this.cascaderValue.length
        this.addCateForm.cat_pid = this.cascaderValue.pop() || 0
        const {data: res} = await this.$http.post('categories', this.addCateForm)
        if (res.meta.status !== 201) {
          return this.$message.error('添加分类失败!')
        }
        this.$message.success('添加分类成功!')
        this.getCategoryList()
        this.addCateDialogVisible = false
      },
      addCateDialogClose() {
        this.addCateDialogVisible = false
        this.$refs.addCateFormRef.resetFields()
        this.cascaderValue = []
      },
      async reomveCategory(id) {
        const confirmResult = await this.$confirm('此操作将永久删除该分类, 是否继续', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(err => err)

        if(confirmResult !== 'confirm') return
        const {data: res} = await this.$http.delete('categories/'+ id)
        if (res.meta.status !== 200) {
          return this.$message.error('删除分类失败!')
        }
        this.getCategoryList()
        this.$message.success('删除分类成功!')
      },
      showEditCategoryDialog(id) {
        this.editCateDialogVisible = true
        this.editCateForm.cat_id = id
      },
      async editCategory() {
        console.log(this.editCateForm.cat_name)
        const {data: res} = await this.$http.put(`categories/${this.editCateForm.cat_id}`, { cat_name: this.editCateForm.cat_name })
        if (res.meta.status !== 200) {
          return this.$message.error('更新分类失败!')
        }
        this.editCateDialogVisible = false
        this.$message.success('更新分类成功!')
        this.getCategoryList()
      },
      editCateDialogClose() {
        this.$refs.editCateFormRef.resetFields()
      },
      handleCurrentChange(newPagenum) {
        this.queryInfo.pagenum = newPagenum
        this.getCategoryList()
      },
      handleSizeChange(newPagesize) {
        this.queryInfo.pagesize = newPagesize
        this.getCategoryList()
      },
    },
    beforeMount() {
      this.getCategoryList()
    }
  }
</script>

<style lang="less" scoped>
  .el-cascader {
    width: 100%;
  }
</style>