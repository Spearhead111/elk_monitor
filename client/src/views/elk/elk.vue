<template>
  <section class="top_section">
    <img ref="sky" src="@/assets/img/sky_bg.jpg" />
    <img ref="mountain" id="mountain" src="@/assets/img/mountain.png" />
    <img ref="elk" src="@/assets/img/elks.png" id="elks" />
    <h2 ref="text" id="text">Protect Elks</h2>
  </section>
  <objDet></objDet>
  <segExtract></segExtract>
  <calBodyLen></calBodyLen>
</template>

<script lang="ts" setup>
import { ref } from '@vue/runtime-core'
import objDet from './obj-det/obj-det.vue'
import segExtract from './seg-extract/seg-extract.vue'
import calBodyLen from './cal-body-len/cal-body-len.vue'

const sky = ref()
const mountain = ref()
const elk = ref()
const text = ref()

document.addEventListener('scroll', () => {
  const value = window.scrollY
  sky.value.style.top = value * 0.5 + 'px'
  mountain.value.style.top = 30 - value * 0.15 + 'px'
  elk.value.style.top = value * 0.018 + 'px'
  text.value.style.top = value * 1 + 'px'
})
</script>

<style lang="less" scoped>
body {
  background-color: #0a2a43 !important;
}
.top_section {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  &:before {
    content: '';
    position: absolute;
    bottom: 0;
    width: 100%;
    height: 100px;
    background: linear-gradient(to top #0a2a43 transparent);
    z-index: 9999;
  }
  &:after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    // background: #6e6e6e;
    z-index: 10000;
    mix-blend-mode: color;
  }
  img {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    pointer-events: none;
  }
  #mountain {
    top: 30px;
  }
  #text {
    position: relative;
    color: #abf5d5;
    font-size: 10em;
    z-index: 1;
    animation: text-pop-up-top 1s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
  }
  #elks {
    z-index: 2;
  }
  @keyframes text-pop-up-top {
    0% {
      transform: translateY(0);
      transform-origin: 50% 50%;
      text-shadow: none;
    }
    100% {
      transform: translateY(-50px);
      transform-origin: 50% 50%;
      text-shadow: 0 1px 0 #ccc, 0 2px 0 #ccc, 0 3px 0 #ccc, 0 4px 0 #ccc, 0 5px 0 #ccc, 0 6px 0 #ccc, 0 7px 0 #ccc, 0 8px 0 #ccc, 0 9px 0 #ccc,
        0 50px 30px rgba(0, 0, 0, 0.3);
    }
  }
}
</style>
