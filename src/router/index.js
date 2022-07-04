import VueRouter from 'vue-router'
import Login from '../components/Login'
import Home from '../components/Home'
import Welcome from '../pages/Welcome'
import Users from '../pages/Users'
import Authority from '../pages/Authority'
import Category from '../pages/Category'
import DataReport from '../pages/DataReport'
import Order from '../pages/Order'
import Product from '../pages/Product'
import Roles from '../pages/Roles'
import Sort from '../pages/Sort'

const router = new VueRouter({
  routes: [
    {
      path: '/',
      redirect: '/login'
    },
    {
      path: '/login',
      component: Login,
      meta: {
        title: 'Login'
      }
    },
    {
      path: '/home',
      component: Home,
      redirect: '/welcome',
      children: [
        {
          path: '/welcome',
          component: Welcome
        },
        {
          path: '/users',
          component: Users
        },
        {
          path: '/roles',
          component: Roles
        },
        {
          path: '/rights',
          component: Authority
        },
        {
          path: '/goods',
          component: Product
        },
        {
          path: '/params',
          component: Sort
        },
        {
          path: '/categories',
          component: Category
        },
        {
          path: '/orders',
          component: Order
        },
        {
          path: '/reports',
          component: DataReport
        },
      ]
    }
  ]
})

router.beforeEach((to, from , next) => {

  if (to.path === '/login') return next()

  const token = window.sessionStorage.getItem('token')

  if (!token) return next('/login')
  
  next()
})

export default router
