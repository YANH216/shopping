<template>
  <div>
    <!-- 面包屑 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <el-row :gutter="20">
          <el-col :span="8">
            <!-- 搜索框 -->
            <el-input 
              placeholder="请输入内容" 
              v-model="queryInfo.query"
              clearable
              @clear="getProductList">
              <el-button slot="append" icon="el-icon-search" @click="getProductList">
              </el-button>
            </el-input>
          </el-col>
          <el-col :span="4">
            <!-- 操作按钮 -->
            <el-button type="primary" @click="gotoAdd">添加商品</el-button>
          </el-col>
        </el-row>
      </div>
      <!-- 商品列表展示 -->
      <el-table
        :data="productList"
        stripe
        border
        style="width: 100%">
        <el-table-column type="index">

        </el-table-column>
        <el-table-column 
          label="商品名称"
          width="600px"
          prop="goods_name">

        </el-table-column>
        <el-table-column
          width="70px"
          label="商品价格(元)"
          prop="goods_price">

        </el-table-column>
        <el-table-column
          width="70px"
          label="商品重量"
          prop="goods_weight">

        </el-table-column>
        <el-table-column 
          label="创建时间"
          prop="add_time">
          <template slot-scope="scope">
            {{scope.row.add_time | dateFormat}}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120px">
          <template slot-scope="scope">
            <!-- 修改按钮 -->
            <el-tooltip content="编辑信息" effect="dark" placement="top" :enterable="false">
              <el-button type="primary" icon="el-icon-edit" size="mini"></el-button>
            </el-tooltip>
            <!-- 删除按钮 -->
            <el-tooltip content="删除商品" effect="dark" placement="top" :enterable="false">
              <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeProductById(scope.row.goods_id)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[6, 10, 20]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>
    </el-card>
  </div>
</template>

<script>
  export default {
    name: 'Product',
    data() {
      return {
        productList: [],
        total: 0,
        queryInfo: {
          query: '',
          pagenum: 1,
          pagesize: 6
        }
      }
    },
    methods: {
      async getProductList() {
        const {data: res} = await this.$http.get('goods', {params: this.queryInfo})
        if (res.meta.status !== 200) {
          return this.$message.error('获取商品列表失败！')
        }
        this.productList = res.data.goods
        // 当删除用户所在页只有这一个用户时，删除后，应重新发起请求，请求前一页的用户列表
        if (this.productList.length === 0 && this.queryInfo.pagenum !== 1) {
          this.queryInfo.pagenum -= 1
          this.getProductList()
        }
        this.total = res.data.total
        this.$message.success('商品列表获取成功!')
      },
      async removeProductById(id) {
        const confirmResult = await this.$confirm('此操作将永久删除该用户, 是否继续', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(err => err)

        if(confirmResult !== 'confirm') return
        // 确认删除，发起删除用户请求
        const {data: res} = await this.$http.delete('goods/'+ id)
        if (res.meta.status !== 200) return this.$message.error('删除用户失败！')
        // 删除成功，重新获取用户列表
        this.getProductList()
        this.$message.success('删除用户成功！')
      },
      gotoAdd() {
        this.$router.push('/goods/add')
      },
      handleSizeChange(newPageSize) {
        this.queryInfo.pagesize = newPageSize
        this.getProductList()
      },
      handleCurrentChange(newPagenum) {
        this.queryInfo.pagenum = newPagenum
        this.getProductList()
      }
    },
    beforeMount() {
      this.getProductList()
    }
  }
</script>

<style lang="less" scoped>

</style>