<template>
  <div class="elk-load">
    <div class="progress-bar">
      <div class="progress-bar_outer" :style="{ height: `${props.barHeight}px` }">
        <div class="elk-gif-box" :style="{ left: `${props.percentage}%` }"></div>
        <div class="progress-bar_inner" :style="{ width: `${props.percentage}%`, backgroundColor: props.percentage === 100 ? '#47da99' : '#409eff' }">
          <span class="progress-bar__innerText">{{ percentage }}%</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
interface Props {
  barHeight?: number
  percentage?: number
}
const props = withDefaults(defineProps<Props>(), {
  barHeight: 20,
  percentage: 10,
})
</script>

<style lang="less" scoped>
.elk-load {
  margin: 0 4%;
  margin-bottom: 20px;
  .elk-gif-box {
    width: 80px;
    height: 60px;
    background: url('@/assets/img/elk_spirit.png') no-repeat;
    background-size: 1500% 100%;
    transform: translateX(-10px);
    animation: elk-gif 0.8s steps(15) infinite;
  }
  @keyframes elk-gif {
    from {
      background-position-x: 0;
    }
    to {
      background-position-x: -1200px;
    }
  }

  .progress-bar {
    padding: 30px 80px 0 80px;
    .progress-bar_outer {
      position: relative;
      display: flex;
      justify-content: left;
      border-radius: 100px;
      background-color: #ebeef5;
    }
    .elk-gif-box {
      position: absolute;
      bottom: -10px;
      transition: left 0.8s ease;
    }
    .progress-bar_inner {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: end;
      height: 100%;
      background-color: #409eff;
      border-radius: 100px;
      white-space: nowrap;
      overflow: hidden;
      transition: width 0.8s ease, background-color 1s;
      .progress-bar__innerText {
        vertical-align: middle;
        color: #fff;
        font-size: 12px;
        margin: 0 5px;
      }
    }

    .done {
      background-color: #47da99;
    }
  }
}
</style>
