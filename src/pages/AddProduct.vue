<template>
  <div class="product-add-container">
    <!-- 面包屑 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-alert title="添加商品信息" type="info" center show-icon></el-alert>
      <el-steps :space="200" :active="stepActive - 0" finish-status="success" align-center>
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>
      <el-form :model="addProductForm" :rules="addProductFormRules" ref="addProductFormRef" label-width="100px" label-position="top">
        <el-tabs 
          v-model="stepActive" 
          tab-position="left" 
          :before-leave="beforeTabChange"
          @tab-click="tabClick">
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addProductForm.goods_name" placeholder="请输入商品名称"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input
                v-model.number="addProductForm.goods_price" 
                placeholder="请输入商品价格 单位(元)"
                type="number">
              </el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input 
                v-model.number="addProductForm.goods_weight" 
                placeholder="请输入商品重量 单位(千克)"
                type="number">
              </el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input 
                v-model.number="addProductForm.goods_number"
                placeholder="请输入商品数量"
                type="number">
              </el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
              <el-cascader
                v-model="addProductForm.goods_cat"
                :options="categoryList"
                clearable
                :props="{
                  expandTrigger: 'hover',
                  value: 'cat_id',
                  label: 'cat_name'
                }"
                @change="cascaderChange">
              </el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <el-form-item 
              v-for="item in manyTableData" 
              :key="item.attr_id"
              :label="item.attr_name">
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox 
                  v-for="(subItem, index) in item.attr_vals" 
                  :key="index"
                  border
                  :label="subItem">
                </el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <el-form-item 
              v-for="item in onlyTableData" 
              :key="item.attr_id"
              :label="item.attr_name">
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <el-upload
              :action="uploadURL"
              :headers="headers"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              :on-success="uploadSuccess"
              list-type="picture">
              <el-button size="small" type="primary">点击上传</el-button>
              <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <quill-editor
              v-model="addProductForm.goods_introduce">
            </quill-editor>
            <el-button
              style="margin-top: 10px;"
              type="primary"
              @click="addProduct">
              添加商品
            </el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>
    <!-- 图片预览 -->
    <el-dialog
      title="图片预览"
      :visible.sync="previewPicVisible"
      width="50%">
      <img :src="previewPicURL" alt="" class="previewImg">
    </el-dialog>
  </div>
</template>

<script>
  export default {
    name: 'AddProduct',
    data() {
      return {
        stepActive: '0',
        categoryList: [],
        // 动态参数面板数据
        manyTableData: [],
        onlyTableData: [],
        uploadURL: 'http://127.0.0.1:8888/api/private/v1/upload',
        headers: {
          Authorization: window.sessionStorage.getItem('token')
        },
        previewPicURL: '',
        previewPicVisible: false,
        addProductForm: {
          goods_name: '',
          goods_price: 0,
          goods_weight: 0,
          goods_number: 0,
          goods_cat: [],
          pics: [],
          goods_introduce: '',
          // 参数属性
          attrs: []
        },
        addProductFormRules: {
          goods_name: [
            {required: true, message: '请输入商品名称', trigger: 'blur'}
          ],
          goods_price: [
            {required: true, message: '请输入商品价格', trigger: 'blur'},
            {type: 'number', message: '商品价格必须为数字', trigger: 'blur'}
          ],
          goods_weight: [
            {required: true, message: '请输入商品重量', trigger: 'blur'},
            {type: 'number', message: '商品重量必须为数字', trigger: 'blur'}
          ],
          goods_number: [
            {required: true, message: '请输入商品数量', trigger: 'blur'},
            {type: 'number', message: '商品数量必须为数字', trigger: 'blur'}
          ],
          goods_cat: [
            {required: true, message: '请选择商品分类', trigger: 'blur'}
          ],
        }
      }
    },
    methods: {
      async getCategoryList() {
        const {data: res} = await this.$http.get('categories')
        if (res.meta.status !== 200) {
          return this.$message.error('获取分类列表失败')
        }
        this.categoryList = res.data
      },
      cascaderChange() {
        if (this.addProductForm.goods_cat.length !== 3) {
          this.addProductForm.goods_cat = []
        }
      },
      beforeTabChange(currentPane, oldPane) {
        if (this.addProductForm.goods_cat.length !== 3 && oldPane === '0') {
          this.$message.error('请选择商品分类')
          return false
        }
      },
      async tabClick() {
        // 说明正要访问动态参数面板
        if (this.stepActive === '1') {
          const {data: res} = await this.$http.get(`categories/${this.cateId}/attributes`, {
            params: {sel: 'many'}
          })
          if (res.meta.status !== 200) {
            this.$message.error('获取商品参数失败')
          }
          // 将获取到的数据上的attr_vals转换成数组
          res.data.forEach(item => {
            item.attr_vals = item.attr_vals.length === 0 ? [] : item.attr_vals.split(' ')
          })
          this.manyTableData = res.data
          // console.log(this.manyTableData)
        } else if (this.stepActive === '2') { // 说明要访问静态属性面板
          const {data: res} = await this.$http.get(`categories/${this.cateId}/attributes`, {
            params: {sel: 'only'}
          })
          if (res.meta.status !== 200) {
            this.$message.error('获取商品属性失败')
          }
          this.onlyTableData = res.data
        } 
      },
      // 图片上传成功
      uploadSuccess(res) {
        const picInfo = {pic: res.data.tmp_path}
        this.addProductForm.pics.push(picInfo)
        console.log(this.addProductForm.pics)
      },
      // 图片预览事件
      handlePreview(file) {
        this.previewPicURL = file.response.data.url
        this.previewPicVisible = true
      },
      // 图片移除操作
      handleRemove(file) {
        const filePath = file.response.data.tmp_path
        // 查找对应文件路径的图片在数组中的下标
        const index = this.addProductForm.pics.findIndex(item => item.pic === filePath)
        // 删除对应下标
        this.addProductForm.pics.splice(index, 1)
        console.log('111', this.addProductForm.pics)
      },
      addProduct() {
        this.$refs.addProductFormRef.validate(async valid => {
          if (!valid) {
            return this.$message.error('请填写必要的表单项')
          }
          // 不能直接操作addProductForm, 所以先拷贝一份
          const addProductFormCopy = {...this.addProductForm}
          // console.log('addProductFormCopy',addProductFormCopy)
          addProductFormCopy.goods_cat = addProductFormCopy.goods_cat.toString()
          // 处理动态参数
          this.manyTableData.forEach(item => {
            const newInfo = {
              attr_id: item.attr_id,
              attr_value: item.attr_vals.join(' ')
            }
            this.addProductForm.attrs.push(newInfo)
          })
          // 处理静态属性
          this.onlyTableData.forEach(item => {
            const newInfo = {
              attr_id: item.attr_id,
              attr_value: item.attr_vals
            }
            this.addProductForm.attrs.push(newInfo)
          })
          addProductFormCopy.attrs = this.addProductForm.attrs
          // console.log(addProductFormCopy)

          // 发起添加商品请求
          // 商品名称必须唯一
          const {data: res} = await this.$http.post('goods', addProductFormCopy)
          if (res.meta.status !== 201) {
            return this.$message.error('添加商品失败！')
          }

          this.$message.success('添加商品成功！')
          this.$router.push('/goods')
        })
      }
    },
    computed: {
      cateId() {
        if (this.addProductForm.goods_cat.length === 3) {
          return this.addProductForm.goods_cat[2]
        }
        return null
      }
    },
    beforeMount() {
      this.getCategoryList()
    }
  }
</script>

<style lang="less" scoped>
  .product-add-container {

    .el-steps {
      margin: 15px 0;
    }

    .el-checkbox {
      margin: 0 10px 0 0 !important;
    }

    .previewImg {
      width: 100%;
    }
  }
</style>