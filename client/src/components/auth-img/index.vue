<template>
  <img ref="img" />
</template>

<script lang="ts" setup>
import useUserStore from '@/stores/modules/user'
import { ref } from '@vue/runtime-core'
import { watch } from 'vue'

interface Props {
  // src
  authSrc: string
}
const props = withDefaults(defineProps<Props>(), {
  authSrc: '',
})
const useUser = useUserStore()
const token = useUser.token as string

Object.defineProperty(Image.prototype, 'authSrc', {
  // 可写
  writable: true,
  // 可枚举
  enumerable: true,
  // 若configurable设为false，那就不可以delete了
  configurable: true,
})
const img = ref()

// 监控父组件传来的authSrc是否变化,并且请求并展示新的图像
watch(
  () => props.authSrc,
  (newVal, oldVal) => {
    refresh(props.authSrc)
  },
  { immediate: true }
)

function refresh(src: string) {
  let request = new XMLHttpRequest()
  request.responseType = 'blob'
  request.open('get', src, true)
  request.setRequestHeader('Authorization', token)
  request.onreadystatechange = (e: any) => {
    if (request.readyState === XMLHttpRequest.DONE && request.status === 200) {
      // URL.createObjectURL() 静态方法会创建一个 DOMString，其中包含一个表示参数中给出的对象URL，这个新的URL对象表示指定的File对象或blob对象
      img.value.src = URL.createObjectURL(request.response)
      img.value.onload = () => {
        // 在每次调用 createObjectURL() 方法时，都会创建一个新的 URL 对象，即使你已经用相同的对象作为参数创建过。当不再需要这些 URL 对象时，每个对象必须通过调用 URL.revokeObjectURL() 方法来释放。
        URL.revokeObjectURL(img.value.src)
      }
    }
  }
  request.send(null)
}
</script>

<style lang="less" scoped></style>
