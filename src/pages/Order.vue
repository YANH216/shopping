<template>
  <div class="order-container">
    <!-- 面包屑 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-row>
        <el-col :span="8">
          <el-input placeholder="请输入内容">
            <el-button slot="append" icon="el-icon-search"></el-button>
          </el-input>
        </el-col>
      </el-row>
      <el-table
        :data="orderList"
        stripe>
        <el-table-column
          type="index">
        </el-table-column>
        <el-table-column
          label="订单编号"
          prop="order_number">
        </el-table-column>
        <el-table-column
          label="订单价格"
          prop="order_price"
          align="center"
          width="100px">
        </el-table-column>
        <el-table-column
          label="是否付款"
          align="center"
          width="100px">
          <template slot-scope="scope">
            <el-tag 
              v-if="scope.row.pay_status === '0'"
              type="success">
              已付款
            </el-tag>
            <el-tag
              v-else
              type="danger">
              未付款
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          label="是否发货"
          prop="is_send"
          align="center"
          width="100px">
        </el-table-column>
        <el-table-column
          label="下单时间"
          align="center"
          width="100px">
          <template slot-scope="scope">
            {{scope.row.create_time | dateFormat}}
          </template>
        </el-table-column>
        <el-table-column
          label="操作"
          align="center"
          width="120px">
          <template>
            <!-- 修改按钮 -->
            <el-tooltip content="编辑信息" effect="dark" placement="top" :enterable="false">
              <el-button 
                type="primary" 
                icon="el-icon-edit" 
                size="mini"
                @click="showEditDialog">
              </el-button>
            </el-tooltip>
            <!-- 显示物流进度按钮 -->
            <el-tooltip content="物流进度" effect="dark" placement="top" :enterable="false">
              <el-button 
                type="success" 
                icon="el-icon-location" 
                size="mini"
                @click="showProgressDialog()">
              </el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[5, 10, 20]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>
    </el-card>
    <el-dialog
      title="修改地址"
      :visible.sync="editDialogVisible"
      width="40%"
      @close="editDialogClose">
      <el-form 
        :model="editForm" 
        :rules="editFormRules"
        ref="editFormRef" 
        label-width="100px" >
        <el-form-item label="省市区/县" prop="address">
          <el-cascader
            :options="cityData"
            v-model="editForm.address"
            :props="{
              expandTrigger: 'hover',
            }">
          </el-cascader>
        </el-form-item>
        <el-form-item label="详细地址" prop="detailAddress">
          <el-input v-model="editForm.detailAddress">
          </el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary">确 定</el-button>
      </span>
    </el-dialog>
    <el-dialog
      title="物流进度"
      :visible.sync="progressDialogVisible"
      width="40%"
      @close="progressDialogClose">
      <el-timeline>
        <el-timeline-item
          v-for="(activity, index) in processInfo"
          :key="index"
          :timestamp="activity.time">
          {{activity.context}}
        </el-timeline-item>
      </el-timeline>
    </el-dialog>
  </div>
</template>

<script>
  import cityData from '../assets/citydata'

  export default {
    name: 'Order',
    data() {
      return {
        orderList: [],
        total: 0,
        cityData: cityData,
        queryInfo: {
          query: '',
          pagenum: 1,
          pagesize: 10,
        },
        editDialogVisible: false,
        editForm: {
          address: [],
          detailAddress: ''
        },
        editFormRules: {
          address: [
            {required: true, message: '请选择省市区/县', trigger: 'blur'},
          ],
          detailAddress: [
            {required: true, message: '请输入详细地址', trigger: 'blur'},
          ]
        },
        progressDialogVisible: false,
        processInfo: []
      }
    },
    methods: {
      async getOrderList() {
        const {data: res} = await this.$http.get('orders', {params: this.queryInfo})
        if (res.meta.status !== 200) {
          return this.$message.error('获取订单列表失败')
        }
        this.orderList = res.data.goods
        this.total = res.data.total
      },
      handleSizeChange(newPageSize) {
        this.queryInfo.pagesize = newPageSize
        this.getOrderList()
      },
      handleCurrentChange(newPagenum) {
        this.queryInfo.pagenum = newPagenum
        this.getOrderList()
      },
      showEditDialog() {
        this.editDialogVisible = true
      },
      editDialogClose() {
        this.$refs.editFormRef.resetFields()
      },
      async showProgressDialog() {
        const {data: res} = await this.$http.get('/kuaidi/1106975712662')
        if (res.meta.status !== 200) {
          return this.$message.error('获取物流信息失败')
        }
        this.processInfo = res.data
        this.progressDialogVisible = true
      }
    },
    beforeMount() {
      this.getOrderList()
    }
  }
</script>

<style lang="less" scoped>
  .order-container {

    .el-table {
      margin-top: 10px;

    }
    .el-cascader {
      width: 100%;
    }
  }
</style>