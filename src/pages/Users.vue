<template>
  <div>
    <!-- 面包屑 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片 -->
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <el-row :gutter="20">
          <el-col :span="8">
            <!-- 搜索框 -->
            <el-input 
              placeholder="请输入内容" 
              v-model="queryInfo.query"
              clearable
              @clear="getUserList">
              <el-button slot="append" icon="el-icon-search" @click="getUserList">
              </el-button>
            </el-input>
          </el-col>
          <el-col :span="4">
            <!-- 操作按钮 -->
            <el-button type="primary" @click="addDialogVisible = true">添加用户</el-button>
          </el-col>
        </el-row>
      </div>
      <!-- 用户列表展示 table -->
      <el-table
        :data="userList"
        stripe
        style="width: 100%"
        v-loading="loading">
        <el-table-column
          type="index">
        </el-table-column>
        <el-table-column
          prop="username"
          label="姓名">
        </el-table-column>
        <el-table-column
          prop="email"
          label="邮箱">
        </el-table-column>
        <el-table-column
          prop="mobile"
          label="电话">
        </el-table-column>
        <el-table-column
          prop="role_name"
          label="角色">
        </el-table-column>
        <el-table-column
          label="状态">
          <template slot-scope="scope">
            <el-switch 
              v-model="scope.row.mg_state" 
              active-color="#66b1ff"
              inactive-color="#efefef"
              @change="userStateChange(scope.row)">
            </el-switch>
          </template>
        </el-table-column>
        <el-table-column
          label="操作"
          width="200px">
          <template slot-scope="scope">
            <!-- 修改按钮 -->
            <el-tooltip content="编辑信息" effect="dark" placement="top" :enterable="false">
              <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.id)"></el-button>
            </el-tooltip>
            <!-- 删除按钮 -->
            <el-tooltip content="删除用户" effect="dark" placement="top" :enterable="false">
              <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeUserById(scope.row.id)"></el-button>
            </el-tooltip>
            <!-- 分配角色按钮 -->
            <el-tooltip content="分配角色" effect="dark" placement="top" :enterable="false">
              <el-button type="warning" icon="el-icon-setting" size="mini" @click="setRole(scope.row)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页 -->
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="queryInfo.pagenum"
          :page-sizes="[1, 2, 4]"
          :page-size="queryInfo.pagesize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total">
        </el-pagination>
    </el-card>
    <el-dialog
      title="添加用户"
      :visible.sync="addDialogVisible"
      width="40%"
      @close="addDialogClose">
      <el-form 
        :model="addForm" 
        :rules="addFormRules"
        ref="addFormRef" 
        label-width="70px" >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addForm.username">
          </el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input type="password" v-model="addForm.password">
          </el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email">
          </el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="addForm.mobile">
          </el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>
    <el-dialog
      title="修改用户信息"
      :visible.sync="editDialogVisible"
      width="40%"
      @close="editDialogClose">
      <el-form 
        :model="editForm" 
        :rules="editFormRules"
        ref="editFormRef" 
        label-width="70px" >
        <el-form-item label="用户名">
          <el-input v-model="editForm.username" disabled>
          </el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email">
          </el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="editForm.mobile">
          </el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="updateUser()">确 定</el-button>
      </span>
    </el-dialog>
    <el-dialog
      title="分配角色"
      :visible.sync="setRoleDialogVisible"
      width="40%"
      @close="setRoleDialogClose">
      <span>
        <p>当前用户: {{userInfo.username}}</p>
        <p>当前角色: {{userInfo.role_name}}</p>
        分配新角色:
        <el-select v-model="selectedRoleId" placeholder="请选择">
          <el-option
            v-for="item in roleList"
            :key="item.id"
            :label="item.roleName"
            :value="item.id">
          </el-option>
        </el-select>
      </span>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveRoleInfo">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>

  export default {
    name: 'users',
    data() {
      const checkMobile = (rule, value, callback) => {
        const regMobile = /^(0|86|17951)?(13[0-9]|15[0123456789]|17[678]|18[0-9]|14[57])[0-9]{8}$/
        if (regMobile.test(value)) {
          return callback()
        }
        callback(new Error('请输入合法的手机号'))
      }
      return {
        queryInfo: {
          query: '',
          pagenum: 1,
          pagesize: 2
        },
        addForm: {
          username: '',
          password: '',
          email: '',
          mobile: ''
        },
        addFormRules: {
          username: [
            {required: true, message: '请输入用户名', trigger: 'blur'},
            {min: 4, max: 12, message: '用户名长度在4-12个字符', trigger: 'blur'}
          ],
          password: [
            {required: true, message: '请输入密码', trigger: 'blur'},
            {min: 6, max: 18, message: '密码长度在6-18个字符', trigger: 'blur'}
          ],
          email: [
            {required: true, message: '请输入邮箱地址', trigger: 'blur'},
            {type: 'email', message: '邮箱格式不正确', trigger: 'blur'}
          ],
          mobile: [
            {required: true, message: '请输入手机号', trigger: 'blur'},
            {validator: checkMobile, trigger: 'blur'}
          ],
        },
        editForm: {},
        editFormRules: {
          email: [
            {required: true, message: '请输入邮箱地址', trigger: 'blur'},
            {type: 'email', message: '邮箱格式不正确', trigger: 'blur'}
          ],
          mobile: [
            {required: true, message: '请输入手机号', trigger: 'blur'},
            {validator: checkMobile, trigger: 'blur'}
          ],
        },
        userList: [],
        total: 0,
        loading: false,
        addDialogVisible: false,
        editDialogVisible: false,
        setRoleDialogVisible: false,
        userInfo: {},
        roleList: [],
        selectedRoleId: ''
      }
    },
    methods: {
      async getUserList() {
        this.loading = true
        let {data: res} = await this.$http.get('users', { params: this.queryInfo })
        // console.log(res);
        if (res.meta.status !== 200) {
          this.loading = false
          return this.$message.error('获取用户列表失败!')
        }
        this.userList = res.data.users
        // 当删除用户所在页只有这一个用户时，删除后，应重新发起请求，请求前一页的用户列表
        if (this.userList.length === 0 && this.queryInfo.pagenum !== 1) {
          this.queryInfo.pagenum -= 1
          this.getUserList()
        }
        this.total = res.data.total
        this.loading = false
      },
      async userStateChange(userInfo) {
        const {data: res} = await this.$http.put(`users/${userInfo.id}/state/${userInfo.mg_state}`)
        if (res.meta.status !== 200) {
          // 由于更新失败，开关按钮复原
          userInfo.mg_state = !userInfo.mg_state
          return this.$message.error('更新用户状态失败!')
        }
        this.$message.success('更新用户状态成功!')
      },
      handleSizeChange(newSize) {
        this.queryInfo.pagesize = newSize
        this.getUserList()
      },
      handleCurrentChange(newPagenum) {
        this.queryInfo.pagenum = newPagenum
        this.getUserList()
      },
      addDialogClose() {
        this.$refs.addFormRef.resetFields()
      },
      addUser() {
        this.$refs.addFormRef.validate(async valid => {
          if (!valid) return 
          // 发起添加用户请求
          const {data: res} = await this.$http.post('users', this.addForm)
          if (res.meta.status !== 201) {
            this.$message.error('添加用户失败!')
          }
          this.$message.success('添加用户成功!')
          this.addDialogVisible = false
          // 重新获取用户列表
          this.getUserList()
        })
      },
      editDialogClose() {
        this.$refs.editFormRef.resetFields()
      },
      async showEditDialog(id) {
        const {data: res} = await this.$http.get(`users/${id}`)
        if (res.meta.status !== 200) {
          return this.$message.error('查询用户信息失败!')
        }
        // console.log(res)
        this.editForm = res.data
        console.log(this.editForm)
        this.editDialogVisible = true
      },
      updateUser() {
        this.$refs.editFormRef.validate(async valid => {
          if (!valid) return 
          console.log(this.editForm.email, this.editForm.mobile);
          const {data: res} = await this.$http.put(`users/${this.editForm.id}`, {
            email: this.editForm.email,
            mobile: this.editForm.mobile,
          })
          if (res.meta.status !== 200) {
            return this.$message.error('更新用户信息失败!')
          }
          // console.log(res)
          this.editDialogVisible = false
          this.getUserList()
          this.$message.success('更新用户信息成功!')
        })
      },
      async removeUserById(id) {
        const confirmResult = await this.$confirm('此操作将永久删除该用户, 是否继续', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(err => err)

        if(confirmResult !== 'confirm') return
        // 确认删除，发起删除用户请求
        const {data: res} = await this.$http.delete('users/'+ id)
        if (res.meta.status !== 200) return this.$message.error('删除用户失败！')
        // 删除成功，重新获取用户列表
        this.getUserList()
        this.$message.success('删除用户成功！')
      },
      async setRole(userInfo) {
        this.userInfo = userInfo
        // console.log(this.userInfo)
        // 获取角色列表
        const {data: res} = await this.$http.get('roles')
        if (res.meta.status !== 200) {
          return this.$message.error('获取角色列表失败')
        }

        this.roleList = res.data
        console.log(this.roleList)
        this.setRoleDialogVisible = true
      },
      async saveRoleInfo() {
        if (!this.selectedRoleId) {
          return this.$message.error('请选择要分配的角色!')
        }

        const {data: res} = await this.$http.put(`users/${this.userInfo.id}/role`, {rid: this.selectedRoleId})
        if (res.meta.status !== 200) {
          return this.$message.error('更新角色失败!')
        }
        this.getUserList()
        this.$message.success('更新角色成功!')
        this.setRoleDialogVisible = false
      },
      setRoleDialogClose() {
        this.selectedRoleId = ''
        this.userInfo = {}
      }
    },
    beforeMount() {
      this.getUserList()
    }
  }
</script>

<style>
  .el-breadcrumb {
    margin-bottom: 15px;
  }
  .el-pagination {
    margin-top: 15px;
  }
</style>