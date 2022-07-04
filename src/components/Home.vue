<template>
  <el-container class="home-container">
    <!-- 头部区域 -->
    <el-header>
      <div class="header-title">
        <img src="../assets/logo.png" alt="">
        <span>后台管理</span>
      </div>
      <el-button type="info" @click="logout">logout</el-button>
    </el-header>
    <el-container>
      <!-- 侧边栏区域 -->
        <el-aside :width="isCollapse? '64px':'200px'">
          <el-menu
            class="el-menu-vertical-demo"
            router
            unique-opened
            :collapse="isCollapse"
            background-color="#545c64"
            :default-active="activePath"
            text-color="#fff"
            active-text-color="#ffd04b"
            :collapse-transition="false"
          >
          <!-- 一级菜单 -->
            <div class="menu-toggle" @click="toggleMenu">{{isCollapse? '😂':'😊'}}</div>
            <el-submenu v-for="item in menuList" :key="item.id" :index="item.id.toString()">
              <template slot="title">
                <i :class="menuIconList[item.id]"></i>
                <span>{{item.authName}}</span>
              </template>
              <!-- 二级菜单 -->
              <el-menu-item v-for="subItem in item.children" :key="subItem.id" :index="'/'+subItem.path" @click="saveNavState('/'+subItem.path)">
                <template slot="title">
                  <i class="el-icon-menu"></i>
                  <span>{{subItem.authName}}</span>
                </template>
              </el-menu-item>
            </el-submenu>
          </el-menu>
        </el-aside>
      <el-container>
        <!-- 主体区域 -->
        <el-main>
          <router-view></router-view>
        </el-main>
        <el-footer>Footer</el-footer>
      </el-container>
    </el-container>
  </el-container>

</template>

<script>
  export default {
    name: 'Home',
    data() {
      return {
        menuList: [],
        menuIconList: {
          '125': 'iconfont icon-user',
          '103': 'iconfont icon-tijikongjian',
          '101': 'iconfont icon-shangpin',
          '102': 'iconfont icon-danju',
          '145': 'iconfont icon-baobiao'
        },
        isCollapse: false,
        activePath: ''
      }
    },
    methods: {
      logout() {
        this.$confirm('确定登出吗?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          window.sessionStorage.clear()
          this.$router.replace('/login')
          this.$message({
            type: 'success',
            message: '成功登出!'
          })
        }).catch(() => {

        })
      },
      async getMenuList() {
        const {data: res} = await this.$http.get('menus')
        if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
        // console.log(res.data);
        this.menuList = res.data
      },
      toggleMenu() {
        this.isCollapse = !this.isCollapse
      },
      saveNavState(activePath) {
        this.activePath = activePath
        window.sessionStorage.setItem('activePath', activePath)
      }
    },
    beforeMount() {
      this.getMenuList()
      this.activePath = sessionStorage.getItem('activePath')
    }
  }
</script>

<style lang="less" scoped>
  .home-container {
    height: 100%;


    .el-header {
      background-color: #545c64;
      display: flex;
      align-items: center;
      justify-content: space-between;
      .header-title {
        display: flex;
        align-items: center;
        img {
          width: 18%;
          margin-right: 10px;
        }
        span {
          font-weight: bold;
          font-size: 20px;
          color: #fff;
        }
      }
      
      .el-button {
        height: 60%;
        color: #545c64;
        background-color: #ffd04b;
        border: none;

        &:hover {
          background-color: rgb(177, 175, 175);
          color: black;
        }
      }
    }
    .el-aside {
      background-color: #545c64;

      .menu-toggle {
        height: 30px;
        line-height: 30px;
        text-align: center;
        background-color: #efefef;
        cursor: pointer;
      }
      .el-menu {
        border-right: none;
      }
      .el-menu-vertical-demo:not(.el-menu--collapse) {
        width: 200px;
        min-height: 400px;
      
        .iconfont {
          margin-right: 8px;
        }
      }
    }

  }
  
</style>