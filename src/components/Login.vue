<template>
  <div class="login-container" @keyup.enter="login('loginFormRef')">
    <div class="login-box">
      <!-- 头像部分 -->
      <div class="avatar-box">
        <img src="../assets/logo.png" alt="">
      </div>
      <!-- 登录表单部分 -->
      <el-form class="login-form" ref="loginFormRef" :model="loginForm" :rules="loginFormRules">
        <!-- 用户名 -->
        <el-form-item prop="username">
          <el-input placeholder="用户名" prefix-icon="iconfont icon-user" v-model="loginForm.username">

          </el-input>
        </el-form-item>
        <!-- 密码 -->
        <el-form-item prop="password">
          <el-input placeholder="密码" type="password" prefix-icon="iconfont icon-3702mima" v-model="loginForm.password">

          </el-input>
        </el-form-item>
        <!-- 按钮 -->
        <el-form-item class="btns">
          <el-button type="primary" @click="login('loginFormRef')">登录</el-button>
          <el-button type="info" @click="resetForm('loginFormRef')">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
  export default {
    name: "Login",
    data() {
      return {
        loginForm: {
          username: '',
          password: ''
        },
        loginFormRules: {
          // 验证用户名合法性
          username: [
            { required: true, message: '用户名不能为空', trigger: 'blur' },
            { min: 5, max: 12, message: '需6-12个字符', trigger: 'blur' }
          ],
          // 验证密码合法性
          password: [
            { required: true, message: '用户名不能为空', trigger: 'blur' },
            { min: 6, max: 18, message: '需6-18个字符', trigger: 'blur' }
          ]
        }
      }
    },methods: {
      resetForm(formName) {
        this.$refs[formName].resetFields()
      },
      login(formName) {
        this.$refs[formName].validate(async valid => {
          if (!valid) return 
          const {data: res} = await this.$http.post('login', this.loginForm)
          if (res.meta.status !== 200) 
            return this.$message.error(`登录失败！${res.meta.msg}`)
          this.$message.success({message: '登录成功'})
          // console.log(res);
          // 保存token
          window.sessionStorage.setItem('token', res.data.token)
          // 跳转页面
          this.$router.push('/home')
        })
      }
    }
  }
</script>

<style lang="less" scoped>
  .login-container {
    height: 100%;
    background-color: #2b4b6b;
  }
  .login-box {
    width: 450px;
    height: 300px;
    background-color: #fff;
    border-radius: 3px;
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    .avatar-box {
      height: 130px;
      width: 130px;
      border: 1px solid #eee;
      border-radius: 50%;
      padding: 10px;
      box-shadow: 0 0 10px #ddd;
      position: absolute;
      left: 50%;
      transform: translate(-50%, -50%);
      background-color: #fff;
      img {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        background-color: #eee;
      }
    }
    .login-form {
      width: 100%;
      position: absolute;
      padding: 0 20px;
      box-sizing: border-box;
      bottom: 0;
      .btns {
        display: flex;
        justify-content: center;
      }
    }
  }
</style>