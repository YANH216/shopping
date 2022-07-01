import VueRouter from 'vue-router'
import Login from '../components/Login'
import Home from '../components/Home'

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
      component: Home
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