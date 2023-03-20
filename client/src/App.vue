<template>
  <side-bar v-if="!isHideSidebar" @sendSidebarWidth="changeMarginLeft"></side-bar>
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

const userStore = useUserStore()
const route = useRoute()
let left = ref(190)
let isHideSidebar = computed((): boolean => {
  return route.meta.hideSidebar as boolean
})
const changeMarginLeft = (width: number) => {
  left.value = width
}
onMounted(() => {
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
