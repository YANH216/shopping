<template>
  <div class="auth-container">
    <!-- 面包屑 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>权限列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片 -->
    <el-card>
      <el-table :data="authList" stripe>
        <el-table-column :align="'center'" type="index"></el-table-column>
        <el-table-column :align="'center'" label="权限名称" prop="authName"></el-table-column>
        <el-table-column :align="'center'" label="路径" prop="path"></el-table-column>
        <el-table-column :align="'center'" label="权限等级" prop="level">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.level === '0'">一级</el-tag>
            <el-tag v-if="scope.row.level === '1'" type="success">二级</el-tag>
            <el-tag v-if="scope.row.level === '2'" type="warning">三级</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script>
  export default {
    name: 'Authority',
    data() {
      return {
        authList: []
      }
    },
    methods: {
      async getAuthList() {
        const {data: res} = await this.$http.get('rights/list')
        if (res.meta.status !== 200) {
          return this.$message.error('获取权限列表失败!')
        }
        this.authList = res.data
      }
    },
    beforeMount() {
      this.getAuthList()
    },
  }
</script>

<style>

</style>