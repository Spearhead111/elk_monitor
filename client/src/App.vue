<template>
  <side-bar ref="side_bar" v-show="!isHideSidebar" @sendSidebarWidth="changeMarginLeft"></side-bar>
  <div id="router-view" :style="{ 'margin-left': `${left}px` }">
    <RouterView v-slot="{ Component }">
      <keep-alive :max="10">
        <component :is="Component" />
      </keep-alive>
    </RouterView>
  </div>
</template>

<script setup lang="ts">
import { RouterView, useRoute } from 'vue-router'
import { computed, onMounted, ref } from '@vue/runtime-core'

import sideBar from '@/components/side-bar/index.vue'
import useUserStore from '@/stores/modules/user'
import { watch } from 'vue'

const side_bar = ref()
const userStore = useUserStore()
const route = useRoute()
let left = ref(190)
// 监听路由的meta.minimizeSidebar变化，调用子组件sideBar的最小化侧边栏方法(子组件sideBar需要暴露这个方法)
watch(
  () => route.meta.minimizeSidebar,
  () => {
    if (route.meta.minimizeSidebar && side_bar.value && !side_bar.value.minimizeSidebar.value) {
      side_bar.value.hideSidebar()
    }
  }
)
/* 根据路由的meta.hideSidebar来判断是否隐藏侧边栏 */
let isHideSidebar = computed((): boolean => {
  return route.meta.hideSidebar as boolean
})
/* 调整右侧路由视窗的margin-left以适应侧边栏变化 */
const changeMarginLeft = (width: number) => {
  left.value = width
}
onMounted(() => {
  // 解码用户token获取用户基本信息
  userStore.decodeToken()
})
</script>

<style lang="less" scoped>
#router-view {
  margin: auto;
  height: 100vh;
  transition: all 0.5s ease;
}
</style>
