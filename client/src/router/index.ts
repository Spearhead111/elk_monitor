import { createRouter, createWebHistory } from 'vue-router'
import jwt_decode from 'jwt-decode'
import useUserStore from '@/stores/modules/user'
import { ElMessageBox, ElLoading } from 'element-plus'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/login' },
    {
      path: '/login',
      component: () => import('@/views/login/login.vue'),
      meta: {
        hideSidebar: true,
      },
    },
    {
      path: '/home',
      component: () => import('@/views/home/home.vue'),
    },
    {
      path: '/user-center/:account',
      component: () => import('@/views/user-center/user-center.vue'),
      meta: { needVerify: true },
    },
    {
      path: '/elk',
      component: () => import('@/views/elk/elk.vue'),
      meta: { needVerify: true, minimizeSidebar: true },
    },
    {
      path: '/404',
      component: () => import('@/views/404/404.vue'),
    },
    {
      path: '/:pathMatch(.*)*',
      component: () => import('@/views/404/404.vue'),
      // redirect: '/404',
    },
  ],
})

/* 判断所去的路由是否需要验证token */
router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  // 先判断是否需要验证token
  if (to.meta.needVerify) {
    // 再判断有没有token
    if (userStore.token) {
      const userInfo = jwt_decode<any>(userStore.token ?? '')
      const expireTimeStamp = userInfo.exp * 1000
      // 然后判断token有没有失效
      if (new Date().getTime() > expireTimeStamp) {
        ElMessageBox.alert('登陆过期，请重新登录', '系统提示', {
          confirmButtonText: 'reLogin',
          type: 'warning',
        }).then(() => {
          localStorage.removeItem('token')
          next('/login')
        })
      } else {
        next()
      }
    } else {
      ElMessageBox.alert('请先登录', '系统提示', {
        confirmButtonText: 'Login',
        type: 'warning',
      }).then(() => {
        localStorage.removeItem('token')
        next('/login')
      })
    }
  } else {
    next()
  }
})

export default router
