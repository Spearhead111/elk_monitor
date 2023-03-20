<template>
  <!-- loading动画框 -->
  <div id="lottie_loading"></div>
  <div class="shell">
    <div class="container b-container" id="b-container">
      <el-form ref="signInFromRef" :model="signInForm" :rules="signInRules" action="" method="" class="form" id="b-form">
        <h2 class="form_title title">登入账号</h2>
        <!-- <div class="form_icons">
          <i class="iconfont icon-QQ"></i>
          <i class="iconfont icon-weixin"></i>
          <i class="iconfont icon-bilibili-line"></i>
        </div> -->
        <span class="form_span">请输入账号和密码</span>
        <el-form-item prop="account">
          <el-input type="text" v-model="signInForm.account" autocomplete="off" placeholder="Account / Email">
            <template #prefix> <i class="iconfont icon-zhanghao"></i> </template
          ></el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            type="password"
            class="form_input"
            v-model="signInForm.password"
            autocomplete="off"
            placeholder="Password"
            onpaste="return false"
            oncontextmenu="return false"
            oncopy="return false"
            oncut="return false"
          >
            <template #prefix>
              <i class="iconfont icon-mima"></i>
            </template>
            <template #suffix>
              <i class="iconfont icon-xianshikejian" @click="changePwdShow($event)"></i>
            </template>
          </el-input>
        </el-form-item>
        <a class="form_link">忘记密码？</a>
        <button class="form_button button submit" @click="submitForm(signInFromRef, 'signIn')">SIGN IN</button>
      </el-form>
    </div>

    <div class="container a-container" id="a-container">
      <el-form ref="signUpFormRef" :model="signUpForm" :rules="signUpRules" action="" method="" class="form" id="a-form">
        <h2 class="form_title title">创建账号</h2>
        <!-- <div class="form_icons">
          <i class="iconfont icon-QQ"></i>
          <i class="iconfont icon-weixin"></i>
          <i class="iconfont icon-bilibili-line"></i>
        </div> -->
        <span class="form_span"></span>
        <el-form-item prop="account">
          <el-input type="text" class="form_input" v-model="signUpForm.account" placeholder="Account">
            <template #prefix> <i class="iconfont icon-zhanghao"></i> </template
          ></el-input>
        </el-form-item>
        <el-form-item prop="email">
          <el-input type="text" class="form_input" v-model="signUpForm.email" placeholder="Email">
            <template #prefix>
              <i class="iconfont icon-youxiang"></i>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            type="password"
            class="form_input"
            v-model="signUpForm.password"
            placeholder="Password"
            onpaste="return false"
            oncontextmenu="return false"
            oncopy="return false"
            oncut="return false"
          >
            <template #prefix>
              <i class="iconfont icon-mima"></i>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item prop="password_again">
          <el-input
            type="password"
            class="form_input"
            v-model="signUpForm.password_again"
            placeholder="Password again"
            onpaste="return false"
            oncontextmenu="return false"
            oncopy="return false"
            oncut="return false"
          >
            <template #prefix>
              <i class="iconfont icon-mima"></i>
            </template>
          </el-input>
        </el-form-item>
        <button class="form_button button submit" @click="submitForm(signUpFormRef, 'signUp')">SIGN UP</button>
      </el-form>
    </div>

    <div class="switch" id="switch-cnt">
      <div class="switch_circle"></div>
      <div class="switch_circle switch_circle-t"></div>
      <div class="switch_container" id="switch-c1">
        <h2 class="switch_title title" style="letter-spacing: 0">Welcome Back！</h2>
        <p class="switch_description description">已经有账号了嘛，去登入账号来进入奇妙世界吧！！！</p>
        <button class="switch_button button switch-btn">SIGN IN</button>
      </div>

      <div class="switch_container is-hidden" id="switch-c2">
        <h2 class="switch_title title" style="letter-spacing: 0">Hello Friend！</h2>
        <p class="switch_description description">注册一个新账号，让我们踏入奇妙的旅途！！！</p>
        <button class="switch_button button switch-btn">SIGN UP</button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted } from 'vue'
import { FormInstance, FormRules, ElMessage } from 'element-plus'
import * as Base64 from 'js-base64'
import { Validator } from '@/validator'
import { LoginService } from '@/service'
import useUserStore from '@/stores/modules/user'

const userStore = useUserStore()

let switchCtn: Element
let switchC2: Element
let switchC1: Element
let switchCircle: NodeListOf<Element>
let switchBtn: NodeListOf<Element>
let aContainer: Element
let bContainer: Element
let allButtons: NodeListOf<Element>

const signInFromRef = ref<FormInstance>()
const signUpFormRef = ref<FormInstance>()
// 登录表单数据
const signInForm = reactive({
  account: '',
  password: '',
})
// 注册表单数据
const signUpForm = reactive({
  account: '',
  email: '',
  password: '',
  password_again: '',
})
// 登录表单的验证规则
const signInRules = reactive<FormRules>({
  account: [{ required: true, message: '账号不能为空', trigger: 'change' }],
  password: [{ required: true, message: '密码不能为空', trigger: 'change' }],
})
// 注册表单的验证规则
const signUpRules = reactive({
  account: [{ validator: Validator.standardName, trigger: 'change' }],
  email: [{ validator: Validator.checkemail, trigger: 'change' }],
  password: [{ validator: Validator.password, trigger: 'change' }],
  password_again: [{ validator: confirmPwd, trigger: 'change' }],
})

/* 确认密码的校验规则 */
function confirmPwd(rule: any, value: any, callback: any) {
  if (value !== signUpForm.password) {
    callback(new Error('两次输入密码不一致!'))
  } else {
    callback()
  }
}

/* 改变密码是否可见 */
const changePwdShow = (e: Event) => {
  const element = e.target as HTMLElement
  const elementInput = element.parentElement?.parentElement?.parentElement?.children[1]
  const nowType = elementInput?.getAttribute('type')
  const newType = nowType === 'password' ? 'text' : 'password'
  elementInput?.setAttribute('type', newType)

  element.classList.contains('icon-xianshikejian')
    ? element.classList.replace('icon-xianshikejian', 'icon-yincangbukejian')
    : element.classList.replace('icon-yincangbukejian', 'icon-xianshikejian')
}

/* 提交登录or注册表单 */
const submitForm = (formEl: FormInstance | undefined, type: string) => {
  if (!formEl) return
  formEl.validate((valid) => {
    if (valid) {
      if (type === 'signIn') {
        // 判断是账号名登录还是邮箱登录
        const loginParams: LoginParams = { password: Base64.encode(Base64.encode(signInForm.password)) }
        const signInAccount = signInForm.account.replace(/^\s*|\s*$/g, '')
        signInForm.account.includes('@') ? (loginParams.email = signInAccount) : (loginParams.account = signInAccount)
        login(loginParams)
      } else {
        let [account, password, email] = [signUpForm.account, Base64.encode(Base64.encode(signUpForm.password)), signUpForm.email]
        register({ account, password, email }, formEl)
      }
    } else {
      type === 'signIn' ? console.log('singIn error') : console.log('signUp error')
    }
  })
}

/* 测试token */
function testToken() {
  LoginService.test().then(
    (res) => {},
    (err) => {
      console.log(err)
    }
  )
}
interface RegisterParams {
  account: string
  password: string
  email: string
}
interface LoginParams {
  account?: string
  password: string
  email?: string
}
/* 提交注册请求 */
function register(params: RegisterParams, formEl: FormInstance | undefined) {
  LoginService.register(params).then(
    (res) => {
      if (res.status === 0) {
        ElMessage({ showClose: true, message: '注册成功，快去登录吧！', type: 'success' })
        formEl && formEl.resetFields()
        changeForm()
      } else {
        ElMessage({ showClose: true, message: res.msg, type: 'error' })
      }
      console.log(res)
    },
    (err) => {
      ElMessage({ showClose: true, message: '注册失败，请稍后再试！', type: 'error' })
    }
  )
}

/* 登录 */
function login(params: LoginParams) {
  userStore.login(params)
}

const getButtons = (e: Event) => e.preventDefault()
const changeForm = (e?: Event) => {
  // 修改类名
  switchCtn.classList.add('is-gx')
  setTimeout(function () {
    switchCtn.classList.remove('is-gx')
  }, 1500)
  switchCtn.classList.toggle('is-txr')
  switchCircle[0].classList.toggle('is-txr')
  switchCircle[1].classList.toggle('is-txr')

  switchC1.classList.toggle('is-hidden')
  switchC2.classList.toggle('is-hidden')
  aContainer.classList.toggle('is-txl')
  bContainer.classList.toggle('is-txl')
  bContainer.classList.toggle('is-z')
}
// 点击切换
const shell = () => {
  for (let i = 0; i < allButtons.length; i++) {
    allButtons[i].addEventListener('click', getButtons)
  }
  for (let i = 0; i < switchBtn.length; i++) {
    switchBtn[i].addEventListener('click', changeForm)
  }
}

onMounted(() => {
  switchCtn = document.querySelector('#switch-cnt') as Element
  switchC2 = document.querySelector('#switch-c2') as Element
  switchC1 = document.querySelector('#switch-c1') as Element
  switchCircle = document.querySelectorAll('.switch_circle') as NodeListOf<Element>
  switchBtn = document.querySelectorAll('.switch-btn') as NodeListOf<Element>
  aContainer = document.querySelector('#a-container') as Element
  bContainer = document.querySelector('#b-container') as Element
  allButtons = document.querySelectorAll('.submit') as NodeListOf<Element>
  shell()
})
</script>

<style lang="less" scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  /* 字体无法选中 */
  user-select: none;
}

#lottie_loading {
  position: absolute;
  z-index: 999;
  top: 40%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100px;
  height: 100px;
}

.shell {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  margin: auto;
  width: 1000px;
  min-width: 1000px;
  min-height: 600px;
  height: 600px;
  padding: 25px;
  background-color: #ecf0f3;
  box-shadow: 10px 10px 10px #d1d9e6, -10px -10px 10px #f9f9f9;
  border-radius: 12px;
  overflow: hidden;
}

/* 设置响应式 */
@media (max-width: 1200px) {
  .shell {
    transform: scale(0.7);
  }
}

@media (max-width: 1000px) {
  .shell {
    transform: scale(0.6);
  }
}

@media (max-width: 800px) {
  .shell {
    transform: scale(0.5);
  }
}

@media (max-width: 600px) {
  .shell {
    transform: scale(0.4);
  }
}

.container {
  display: flex;
  justify-content: center;
  align-items: center;
  position: absolute;
  top: 0;
  width: 600px;
  height: 100%;
  padding: 25px;
  background-color: #ecf0f3;
  transition: 1.25s;
}

.form {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  width: 100%;
  height: 100%;
}

.iconfont {
  margin: 0 5px;
  border: rgba(0, 0, 0, 0.5) 2px solid;
  border-radius: 50%;
  font-size: 25px;
  padding: 3px;
  opacity: 0.5;
  transition: 0.1s;
}

.iconfont:hover {
  opacity: 1;
  transition: 0.15s;
  cursor: pointer;
}

:deep(.el-input__wrapper) {
  width: 330px;
  height: 40px;
  margin: 4px 0 10px;
  // padding: 0px 0px 0px 25px;
  padding: 0;
  font-size: 13px;
  letter-spacing: 0.15px;
  border: none;
  outline: none;
  background-color: #ecf0f3;
  transition: 0.25s ease;
  border-radius: 8px;
  box-shadow: inset 2px 2px 4px #d1d9e6, inset -2px -2px 4px #f9f9f9;
}

:deep(.is-focus) {
  box-shadow: inset 4px 4px 4px #d1d9e6, inset -4px -4px 4px #f9f9f9;
}

.form_span {
  margin-top: 30px;
  margin-bottom: 12px;
}

.form_link {
  color: #181818;
  font-size: 15px;
  margin-top: 25px;
  border-bottom: 1px solid #a0a5a8;
  line-height: 2;
}

.title {
  font-size: 34px;
  font-weight: 700;
  line-height: 3;
  color: #181818;
  letter-spacing: 10px;
}

.description {
  font-size: 14px;
  letter-spacing: 0.25px;
  text-align: center;
  line-height: 1.6;
}

.button {
  position: relative;
  z-index: 1;
  width: 180px;
  height: 50px;
  border-radius: 25px;
  margin-top: 50px;
  font-weight: 700;
  font-size: 14px;
  letter-spacing: 1.15px;
  background: #93abff;
  color: #f9f9f9;
  box-shadow: 6px 6px 12px #c5c5c5, -6px -6px 12px #ffffff;
  border: none;
  outline: none;
  overflow: hidden;
}

.button::before {
  content: '';
  width: 0;
  height: 50px;
  border-radius: 25px;
  position: absolute;
  top: 0;
  left: 0;
  background-image: linear-gradient(to right, #0fd850 0%, #f9f047 100%);
  transition: 0.5s ease;
  display: block;
  z-index: -1;
}

.button:hover::before {
  width: 180px;
}

.a-container {
  z-index: 100;
  left: calc(100% - 600px);
}

.b-container {
  left: calc(100% - 600px);
  z-index: 0;
}

.switch {
  display: flex;
  justify-content: center;
  align-items: center;
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 400px;
  padding: 50px;
  z-index: 200;
  transition: 1.25s;
  background-image: linear-gradient(
    to left bottom,
    #3d526e,
    #496183,
    #567199,
    #6482b0,
    #7292c7,
    #7593c9,
    #7894cb,
    #7b95cd,
    #7287ba,
    #6979a7,
    #606b94,
    #565e82
  );
  overflow: hidden;
  box-shadow: 4px 4px 10px #d1d9e6, -4px -4px 10px #d1d9e6;
}

.switch_circle {
  position: absolute;
  width: 500px;
  height: 500px;
  border-radius: 50%;
  background-image: linear-gradient(to right top, #83b9dd, #8fb9e8, #a0b7f0, #b7b4f3, #cfb0f2);
  box-shadow: inset 8px 8px 12px #b8bec7, inset -8px -8px 12px #fff;
  bottom: -60%;
  left: -60%;
  transition: 1.25s;
}

.switch_circle-t {
  top: -30%;
  left: 60%;
  width: 300px;
  height: 300px;
}

.switch_container {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  position: absolute;
  width: 400px;
  padding: 50px 55px;
  transition: 1.25s;
}

.switch_button {
  cursor: pointer;
}

.switch_button:hover,
.submit:hover {
  box-shadow: 6px 6px 10px #d1d9e6, -6px -6px 10px #f9f9f9;
  transform: scale(0.985);
  transition: 0.25s;
  cursor: pointer;
}

.switch_button:active,
.switch_button:focus {
  box-shadow: 2px 2px 6px #d1d9e6, -2px -2px 6px #f9f9f9;
  transform: scale(0.97);
  transition: 0.25s;
}

.is-txr {
  left: calc(100% - 400px);
  transition: 1.25s;
  transform-origin: left;
}

.is-txl {
  left: 0;
  transition: 1.25s;
  transform-origin: right;
}

.is-z {
  z-index: 200;
  transition: 1.25s;
}

.is-hidden {
  visibility: hidden;
  opacity: 0;
  position: absolute;
  transition: 1.25s;
}

.is-gx {
  animation: is-gx 1.25s;
}

@keyframes is-gx {
  0%,
  10%,
  100% {
    width: 400px;
  }

  30%,
  50% {
    width: 500px;
  }
}

:deep(.el-form-item__error) {
  position: absolute;
  top: 43px;
  left: 35px;
  color: var(--el-color-danger);
}

:deep(.el-form-item.is-error .el-input__wrapper) {
  box-shadow: 0 0 3px 1px var(--el-color-danger) inset;
}

:deep(.el-message) {
  border-radius: 5px;
}

.iconfont {
  border: 0;
  font-size: 20px;
  cursor: default;
}
</style>
