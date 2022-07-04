<template>
  <div class="role-container">
    <!-- 面包屑 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片 -->
    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary">添加角色</el-button>
        </el-col>
      </el-row>
      <el-table :data="roleList" stripe>
        <el-table-column width="50px" type="expand">
          <template slot-scope="scope">
            <el-row v-for="item1 in scope.row.children" :key="item1.id">
              <!-- 渲染一级权限 -->
              <el-col :span="5">
                <el-tag closable @close="removeAuthById(scope.row, item1.id)">{{item1.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 渲染二级和三级权限 -->
              <el-col :span="19">
                <el-row v-for="item2 in item1.children" :key="item2.id">
                  <!-- 渲染二级权限 -->
                  <el-col :span="6">
                    <el-tag type="success" closable @close="removeAuthById(scope.row, item2.id)">{{item2.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <!-- 渲染三级权限 -->
                  <el-col :span="18">
                    <el-tag 
                      type="warning" 
                      v-for="item3 in item2.children" 
                      :key="item3.id" 
                      closable
                      @close="removeAuthById(scope.row, item3.id)">
                      {{item3.authName}}
                    </el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column width="300px" label="操作">
          <template slot-scope="scope">
            <!-- 编辑按钮 -->
              <el-button type="primary" icon="el-icon-edit" size="mini">编辑</el-button>
            <!-- 删除按钮 -->
              <el-button type="danger" icon="el-icon-delete" size="mini">删除</el-button>
            <!-- 分配权限按钮 -->
              <el-button type="warning" icon="el-icon-setting" size="mini" @click="showSetAuthDialog(scope.row)">分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <el-dialog
      title="分配权限"
      :visible.sync="setAuthDialogVisible"
      width="40%"
      @close="setAuthDialogClose">
      <el-tree 
        :data="authList" 
        :props="treeProps" 
        ref="treeRef"
        show-checkbox
        node-key="id"
        default-expand-all
        :default-checked-keys="defaultKeys">
      </el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setAuthDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="setAuth">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
  export default {
    name: 'Roles',
    data() {
      return {
        roleList: [],
        setAuthDialogVisible: false,
        authList: [],
        treeProps: {
          label: 'authName',
          children: 'children'
        },
        defaultKeys: [],
        roleId: ''
      }
    },
    methods: {
      async getRoleList() {
        const {data: res} = await this.$http.get('roles')
        if (res.meta.status !== 200) {
          return this.$message.error('获取角色列表失败')
        }
        this.roleList = res.data
        console.log(this.roleList)
      },
      async removeAuthById(role, authId) {
        console.log(role.id, authId)
        const confirmResult = await this.$confirm('此操作将永久删除该角色的指定权限, 是否继续', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(err => err)

        if(confirmResult !== 'confirm') return
        // 确认删除，发起删除权限请求
        const {data: res} = await this.$http.delete(`roles/${role.id}/rights/${authId}`)
        if (res.meta.status !== 200) return this.$message.error('删除指定权限失败！')
        // 删除成功
        // 重新给角色权限赋值
        role.children = res.data
        // 如果直接调用获取角色列表，会重新渲染table表格，权限展开页会合上
        // this.getRoleList()
        this.$message.success('删除指定权限成功！')
      },
      async showSetAuthDialog(role) {
        // 保存当前roleId  供权限设置时 使用
        this.roleId = role.id
        const {data: res} = await this.$http.get('rights/tree')
        if (res.meta.status !== 200) return this.$message.error('获取权限数据失败')
        this.authList = res.data
        // console.log(this.authList)
        this.getDefaultKeys(role, this.defaultKeys)
        this.setAuthDialogVisible = true
      },
      getDefaultKeys(node, arr) {
        if (!node.children) {
          return arr.push(node.id)
        }

        node.children.forEach(item => this.getDefaultKeys(item, arr))
      },
      setAuthDialogClose() {
        this.defaultKeys = []
      },
      async setAuth() {
        // 所有选中的节点的id值  key
        const keys = [
          ...this.$refs.treeRef.getCheckedKeys(),
          ...this.$refs.treeRef.getHalfCheckedKeys()
        ]
        
        // 请求参数
        const idStr = keys.join(',')
        const {data: res} = await this.$http.post(`roles/${this.roleId}/rights`, {rids: idStr})
        if (res.meta.status !== 200) {
          return this.$message.error('分配权限失败')
        }
        this.getRoleList()
        this.setAuthDialogVisible = false
        this.$message.success('分配权限成功')
      }
    }, 
    beforeMount() {
      this.getRoleList()
    }
  }
</script>

<style lang="less" scoped>
  .role-container {

    .el-row {
      display: flex;
      align-items: center;
      border-bottom: 1px solid #efefef;
      .el-tag {
        margin: 7px;
      }
    }
  }
</style>