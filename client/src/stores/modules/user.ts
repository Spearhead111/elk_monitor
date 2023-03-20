//定义关于counter的store
import { LoginService } from '@/service/modules/login'
import { ElMessage } from 'element-plus'
import { defineStore } from 'pinia'
import lottie from 'lottie-web'
import loading from '@/assets/lottie/loading1.json'
import { UserInfoService } from '@/service/modules/userInfo'
import { Ref } from 'vue'
import jwt_decode from 'jwt-decode'

const useUserStore = defineStore('user', {
  state: () => ({
    token: localStorage.getItem('token') ?? null,
    avatarBase64: localStorage.getItem('avatar') ?? null,
    userInfo: null,
  }),
  actions: {
    login(params: any) {
      LoginService.login(params).then(
        (res) => {
          if (!res) {
            return ElMessage({ showClose: true, message: '服务器未响应！', type: 'error' })
          }
          if (res.status === 0) {
            ElMessage({ showClose: true, message: '登录成功！', type: 'success' })
            // 读取动画容器
            const lottieInstance = lottie.loadAnimation({
              renderer: 'svg', // 渲染方式
              loop: true, // 是否循环
              container: document.querySelector('#lottie_loading') as Element, // 动画容器
              animationData: loading, // 动画json文件
            })
            lottieInstance.play()
            setTimeout(() => {
              lottieInstance.stop()
              const token = res.data.token
              const avatar = res.data.avatar
              // console.log(avatar)

              token && localStorage.setItem('token', token)
              avatar && localStorage.setItem('avatar', avatar)
              this.token = token
              this.avatarBase64 = avatar
              this.decodeToken()
              location.href = '/home'
            }, 300)
          } else {
            ElMessage({ showClose: true, message: '账号或密码有误', type: 'error' })
          }
        },
        (err) => {
          ElMessage({ showClose: true, message: '登录失败，请稍后再试！', type: 'error' })
        }
      )
    },

    logout() {
      localStorage.removeItem('token')
      localStorage.removeItem('avatar')
      localStorage.removeItem('avatarBase64')
      this.token = null
      this.avatarBase64 = null
      this.userInfo = null
    },

    updateAvatar(params: any) {
      this.avatarBase64 = params
    },
    /* 解析token */
    decodeToken() {
      this.token && (this.userInfo = jwt_decode(this.token))
    },
    /* 更改用户nickname */
    changeNickname(params: any) {
      if (!params) return ElMessage({ showClose: true, message: '不能为空！', type: 'warning' })
      UserInfoService.updateNickname(params).then(
        (res) => {
          if (res.status === 0) {
            ElMessage({ showClose: true, message: '更改成功！', type: 'success' })
            // @ts-ignore
            this.userInfo!['nickname'] = params
            return true
          } else {
            ElMessage({ showClose: true, message: res.msg, type: 'error' })
          }
        },
        (err) => {
          ElMessage({ showClose: true, message: '更新失败，请稍后再试！', type: 'error' })
        }
      )
    },
  },
})
export default useUserStore
