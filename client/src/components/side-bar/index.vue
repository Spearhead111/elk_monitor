<template>
  <transition name="sidebar">
    <div ref="sidebarWrap" class="wrap" v-show="!minimizeSidebar">
      <!-- 头部logo start -->
      <div class="logo">
        <i class="iconfont icon-S- not_change_color" @click="toggle()"></i>
        <span class="logo_name">Spearhead</span>
      </div>
      <!-- 头部logo end -->
      <!-- 一级列表 start-->
      <ul class="nav-links">
        <li v-for="(mod, index) in sidebarList">
          <div :class="{ 'selected-mod': selectedModIdx === index }"></div>
          <!-- 一级列表名和icon -->
          <div class="iocn-link">
            <a @click="jump(mod.path, index)">
              <i :class="['iconfont', mod.prefixIcon]" v-if="mod.prefixIcon"></i>
              <img class="img-icon" v-if="mod.tag === 'elk'" src="@/assets/icons/elk.ico" />
              <span class="link_name span_">{{ mod.naviName }}</span>
            </a>
            <!-- 展开收起的箭头标签 -->
            <i v-if="mod.suffixIcon" :class="['suffix-icon', 'iconfont', mod.suffixIcon]" @click="expandList($event, index)"></i>
          </div>
          <!-- 二级列表 start -->
          <div class="sub-menu-div">
            <transition name="subMenu">
              <ul class="sub-menu" v-show="showSecondMenu[index]">
                <!-- 第一个li为一级列表名，只在缩放的时候显示 -->
                <li class="sub-menu-title">
                  <a @click="jump(mod.path, index)" class="link_name">{{ mod.naviName }}</a>
                </li>
                <!-- 二级列表各项 -->
                <li v-for="(secondMod, i) in mod.secondList">
                  <a @click="jump(secondMod.path, index)">{{ secondMod.name }}</a>
                </li>
              </ul>
            </transition>
          </div>
          <!-- 二级列表 end -->
        </li>
      </ul>
      <!-- 一级列表 end-->
      <div class="user-info">
        <div class="profile-pic">
          <!-- 展开时的图片hover框 -->
          <div class="expand-user animate__animated animate__fadeIn animate__faster"></div>
          <img :src="userStore.avatarBase64 ?? require('@/assets/img/default_avatar.jpg')" />
          <!-- 缩放时的图片hover框(ul列表) -->
          <ul class="pic-expand">
            <li>
              <a><i class="expandIcon iconfont icon-24gl-shrink2" @click="hideSidebar()"></i></a>
            </li>
            <li>
              <a><i class="expandIcon iconfont icon-jurassic_user" @click="jumpToUserCenter()"></i></a>
            </li>
            <li v-show="userStore.token">
              <a><i class="expandIcon iconfont icon-tuichudenglu" @click="logout()"></i></a>
            </li>
            <li v-show="!userStore.token">
              <a><i class="expandIcon iconfont icon-denglu" @click="jump('/login')"></i></a>
            </li>
          </ul>
        </div>
        <i class="logout iconfont icon-24gl-shrink2" @click="hideSidebar()"></i>
        <i class="logout iconfont icon-jurassic_user" @click="jumpToUserCenter()"></i>
        <i class="logout iconfont icon-tuichudenglu" @click="logout()" v-show="userStore.token"></i>
        <i class="logout iconfont icon-denglu" @click="jump('/login')" v-show="!userStore.token"></i>
      </div>
    </div>
  </transition>
  <!-- 侧边栏最小化的用户头像框div -->
  <transition name="min_user">
    <div class="min-user" v-show="minimizeSidebar">
      <img :src="userStore.avatarBase64 ?? require('@/assets/img/default_avatar.jpg')" />
      <!-- 缩放时的图片hover框(ul列表) -->
      <ul class="min-user-expand-ul">
        <li>
          <i class="min-user-expandIcon iconfont icon-fangda" @click="hideSidebar()"></i>
        </li>
        <li>
          <i class="min-user-expandIcon iconfont icon-jurassic_user" @click="jumpToUserCenter()"></i>
        </li>
        <li v-show="userStore.token">
          <i class="min-user-expandIcon iconfont icon-tuichudenglu" @click="logout()"></i>
        </li>
        <li v-show="!userStore.token">
          <i class="min-user-expandIcon iconfont icon-denglu" @click="jump('/login')"></i>
        </li>
      </ul>
    </div>
  </transition>
</template>

<script lang="ts" setup>
import { reactive, ref } from 'vue'
import { sidebarList } from '@/assets/data/sidebarList'
import jwt_decode from 'jwt-decode'
import gsap from 'gsap'
import router from '@/router'
import useUserStore from '@/stores/modules/user'

const emit = defineEmits(['sendSidebarWidth'])

const userStore = useUserStore()
let userAccount = userStore.token ? jwt_decode<any>(userStore.token ?? '').account : null

let selectedModIdx = ref<number>(-1)
const minimizeSidebar = ref<boolean>(false)
const sidebarWrap = ref<HTMLElement>()
let lastTimeSidebarWidth = 190
const showSecondMenu = reactive<boolean[]>(new Array(sidebarList.length).fill(false))
/* 转换是否缩放 */
function toggle(): void {
  const nav_links = gsap.from('.span_', {
    opacity: 0,
    duration: 0.3,
    ease: 'power2', // 设置运动曲线,速度由快到慢
  })
  sidebarWrap.value?.classList.toggle('close')
  sidebarWrap.value?.classList.length === 1 && nav_links.play()
  const suffixIcons = document.getElementsByClassName('suffix-icon')
  for (let i in showSecondMenu) {
    showSecondMenu[i] = false
  }
  for (let i of suffixIcons) {
    const icon = i as HTMLElement
    icon.style.transform = ''
  }
  sidebarWrap.value?.offsetWidth && emit('sendSidebarWidth', sidebarWrap.value.offsetWidth > 125 ? 60 : 190)
}
/* 隐藏侧边栏，只展示用户头像 */
function hideSidebar() {
  // 如果当前侧边栏不是隐藏状态,记录一下缩放之前的宽度
  !minimizeSidebar.value && (lastTimeSidebarWidth = sidebarWrap.value?.offsetWidth as number)
  // toggle展示侧边栏
  minimizeSidebar.value = !minimizeSidebar.value
  // 向App.vue传递侧边栏宽度，改变主路由的margin-left以适应页面大小
  emit('sendSidebarWidth', minimizeSidebar.value ? 0 : lastTimeSidebarWidth)
}
/* 展开二级列表 */
function expandList(e: any, idx: number): void {
  showSecondMenu[idx] = !showSecondMenu[idx]
  e.currentTarget.style.transform = e.currentTarget.style.transform ? '' : 'rotate(-180deg)'
}
/* 路由跳转 */
function jump(path: string, idx?: number) {
  if (path !== '') {
    router.push(path)
    idx === undefined ? (selectedModIdx.value = -1) : (selectedModIdx.value = idx)
  }
}
/* 跳转个人中心 */
function jumpToUserCenter() {
  jump(`/user-center/${userAccount}`)
}
/* 登出账号 */
function logout() {
  userStore.logout()
}

//暴露hideSidebar方法
defineExpose({
  hideSidebar,
  minimizeSidebar,
})
</script>

<style lang="less" scoped>
.min-user {
  z-index: 10001;
  display: flex;
  justify-content: center;
  align-items: center;
  position: fixed;
  bottom: 24px;
  left: 4px;
  width: 52px;
  height: 52px;
  border-radius: 16px;
  background: #49546d;
  img {
    box-sizing: border-box;
    height: 52px;
    width: 52px;
    object-fit: cover;
    border-radius: 16px;
    margin: 0 4px 0 4px;
    padding: 5px;
    cursor: pointer;
    transition: all 0.5s ease;
  }
  &:hover .min-user-expand-ul {
    display: block;
    animation: scale-in-ver-bottom 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
  }

  .min-user-expand-ul {
    display: none;
    position: absolute;
    left: 8px;
    bottom: 50px;
    width: 36px;
    border-radius: 12px 12px 0 0;
    padding: 10px 0;
    color: #fff;
    background: #49546d;

    li .min-user-expandIcon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      padding: 0;
      margin: auto;
      font-size: 18px;
      cursor: pointer;
    }
  }
}

.min_user-enter-active,
.min_user-leave-active {
  transition: all 1s ease;
}
.min_user-enter-from,
.min_user-leave-to,
.min_user-leave-from {
  opacity: 0;
  transform: scale(0);
}
.min_user-enter-to {
  opacity: 1;
  transform: scale(1);
}

* {
  font-family: 'Poppins', sans-serif;
}
a {
  cursor: pointer;
}

.iconfont:not(.not_change_color):hover {
  color: #00b7ff !important;
}
.iconfont.icon-tuichudenglu:hover {
  color: #ff0071 !important;
}
.iconfont.icon-denglu:hover {
  color: #4ef708 !important;
}

.wrap {
  position: fixed;
  top: 0;
  left: 0;
  border-radius: 10px;
  height: 100%;
  width: 190px;
  background-image: linear-gradient(to bottom, #3d526e, #565e82);
  transition: all 0.5s ease;
  z-index: 10001;

  .logo {
    height: 60px;
    width: 100%;
    display: flex;
    align-items: center;
    font-size: 20px;
    font-weight: bold;
    color: #fff;
    .logo_name {
      opacity: 1;
      transition: all 1s ease;
    }

    .icon-S- {
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: lighter;
      width: 60px;
      min-width: 60px;
      height: 50px;
      font-size: 35px;
      cursor: pointer;
    }
  }

  .nav-links {
    &::-webkit-scrollbar {
      display: none;
    }
    overflow: auto;
    padding-top: 30px;
    margin-bottom: 20px;
    max-height: calc(100% - 190px);
    scroll-behavior: smooth;
    li {
      position: relative;
      margin-top: 5px;
      border-radius: 10px;
      transition: all 0.5s ease;
    }
    li:hover {
      background-color: #003467;
    }

    .link_name {
      font-size: 18px;
      font-weight: 400;
      color: #fff;
      transition: all 0.5s ease;
    }

    .sub-menu {
      padding: 6px 6px 14px 60px;
      margin-top: -10px;
      border-radius: 10px;
      text-align: left;
      background: #003467;
      transition: all 0.3s ease;
      .sub-menu-title {
        display: none;
      }

      li {
        padding: 5px 0;
      }
      a {
        color: #fff;
        font-size: 15px;
        white-space: nowrap;
        opacity: 0.6;
        transition: all 0.3s ease;
      }
      a:hover {
        opacity: 1;
      }
    }

    .subMenu-enter-active,
    .subMenu-leave-active {
      transition: all 0.3s ease;
    }
    .subMenu-enter-from,
    .subMenu-leave-from {
      opacity: 0;
      transform: translateX(-30px);
    }

    .subMenu-enter-to,
    .subMenu-leave-from {
      opacity: 1;
    }
  }
  .profile-pic {
    &:hover .expand-user {
      display: block;
    }
    &:hover img {
      width: 60px;
      height: 60px;
    }
  }
}

.sidebar-enter-from,
.sidebar-leave-to {
  opacity: 0;
  transform: translateX(-100%);
}

.sidebar-enter-to,
.sidebar-leave-from {
  opacity: 1;
}

.user-info {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 60px;
  bottom: 20px;
  left: 0;
  width: 100%;
  border-radius: 10px;
  background: #49546d;

  .profile-pic {
    img {
      box-sizing: border-box;
      height: 52px;
      width: 52px;
      object-fit: cover;
      border-radius: 16px;
      margin: 0 14px 0 12px;
      background: #49546d;
      cursor: pointer;
      transition: all 0.5s ease;
    }

    .pic-expand {
      display: none;
      position: absolute;
      left: 12px;
      bottom: 54px;
      width: 36px;
      border-radius: 12px 12px 0 0;
      padding: 10px 0;
      color: #fff;
      background: #49546d;
      animation: scale-in-ver-bottom 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
      li a .expandIcon {
        width: 32px;
        height: 32px;
        padding: 0;
        margin: auto;
        font-size: 18px;
      }
    }
  }

  .iconfont {
    display: flex;
    justify-content: center;
    align-items: center;
    padding-right: 10px;
    color: #fff;
    font-size: 20px;
    cursor: pointer;
  }
}

.iocn-link {
  display: flex;
  align-items: center;
  justify-content: space-between;

  a {
    display: flex;
    align-items: center;
    width: 100%;
    .iconfont {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 60px;
      min-width: 60px;
      height: 50px;
      color: #fff;
      font-size: 20px;
    }
  }
  .suffix-icon {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 0 10px;
    width: 20px;
    height: 30px;
    color: #fff;
    font-size: 20px;
    transition: all 0.3s ease;
    cursor: pointer;
  }
}

.wrap.close {
  width: 60px;

  .logo .logo_name {
    opacity: 0;
    transition: all 0.5s ease;
    pointer-events: none;
  }

  .nav-links {
    position: relative;
    overflow: visible;
    li .iocn-link a .link_name {
      display: none;
    }
    li:hover {
      border-radius: 10px 0 0 10px;
    }
    .suffix-icon {
      opacity: 0;
      pointer-events: none;
    }

    .sub-menu {
      position: absolute;
      left: 60px;
      top: -10px;
      margin-top: 0;
      padding: 10px 20px;
      border-radius: 0 6px 6px 0;
      opacity: 0;
      display: block !important;
      pointer-events: none;
      background: #003467;
      transition: 0s;

      .link_name {
        font-size: 18px;
        font-weight: 400;
        color: #fff;
        opacity: 1;
      }
    }
    li:hover .sub-menu {
      top: 0;
      opacity: 1;
      pointer-events: auto;
      transition: all 0.5s ease;
      .sub-menu-title {
        display: block;
        line-height: 100%;
        opacity: 1 !important;
      }
    }
  }

  .user-info {
    transition: all 0.5s ease;
    background: none;
    .profile-pic img {
      margin: 0 4px 0 4px;
      padding: 5px;
    }
    .profile-pic:hover {
      img {
        width: 52px;
        height: 52px;
      }
      .expand-user {
        display: none;
      }
      .pic-expand {
        display: block;
      }
    }
    .logout {
      pointer-events: none;
      opacity: 0;
    }
  }
}
.selected-mod {
  position: absolute;
  width: 8px;
  height: 34px;
  top: 9px;
  border-radius: 3px;
  background: #00be7c;
}

.expand-user {
  display: none;
  box-sizing: border-box;
  position: absolute;
  width: 170px;
  height: 100px;
  border-radius: 15px;
  bottom: 60px;
  left: 10px;
  background: #aca9bb;
}
.img-icon {
  box-sizing: border-box;
  width: 60px;
  min-width: 60px;
  height: 50px;
  padding: 10px;
}

/**
* ----------------------------------------
* animation scale-in-ver-bottom
* ----------------------------------------
*/
@keyframes scale-in-ver-bottom {
  0% {
    transform: scaleY(0);
    transform-origin: 0% 100%;
    opacity: 1;
  }
  100% {
    transform: scaleY(1);
    transform-origin: 0% 100%;
    opacity: 1;
  }
}
</style>
