<template>
  <elkLoading v-show="disabled" :bar-height="15" :percentage="percentage"></elkLoading>
  <div v-show="!disabled" :style="{ height: '65px' }"></div>
  <div id="cal-BL">
    <div class="cal-body_len">
      <div class="option">
        <label class="container">
          <label class="label" for="useLastSeg">使用上一次提取结果</label>
          <input id="useLastSeg" type="checkbox" v-model="calBLParams.useLastSeg" />
          <div class="checkmark"></div>
        </label>
        <div class="tips">
          <i class="iconfont icon-xinxi"></i>
          <div class="tips-info animate__animated animate__fadeIn animate__fast">勾选此项代表使用上一次信息提u的结果进行体长计算(不会上传图像)</div>
        </div>
      </div>
      <div class="option">
        <label class="label" for="inputImgs">上传信息提取图像</label>
        <span>共</span><span class="span">{{ calBLParams.inputImgs.length }}</span
        ><span>幅</span>
        <div class="img-detail">
          <i class="iconfont icon-xiangqing" @click="calBLParams.inputImgs.length && (imgListShow = true)"></i>
          <div class="all-img" v-show="imgListShow">
            <div class="img-list-head">
              <i class="iconfont icon-cuowu" @click="imgListShow = false"></i>
              <el-popconfirm
                width="100"
                confirm-button-text="Yes"
                cancel-button-text="No"
                :icon="InfoFilled"
                title="确认移除全部?"
                @confirm="remove()"
              >
                <template #reference>
                  <div class="delete-all"><span>delete all</span><i class="iconfont icon-shanchu"></i></div>
                </template>
              </el-popconfirm>
            </div>
            <el-scrollbar class="img-list animate__animated animate__fadeIn animate__fast">
              <!-- 给li的移除添加动画 -->
              <TransitionGroup name="list" tag="ul">
                <li v-for="(img, index) of calBLParams.inputImgs" :key="img.name">
                  <span>{{ img.name }}</span>
                  <i class="iconfont icon-shanchu" @click="remove(index)"></i>
                </li>
              </TransitionGroup>
            </el-scrollbar>
          </div>
        </div>
        <i class="iconfont icon-24gf-folderOpen" @click="imgsInput.click()"></i>
        <input hidden ref="imgsInput" type="file" accept="image/*" multiple @change="selectInpValueChanged()" />
      </div>
      <div class="option-btn">
        <button :class="{ btn: true, 'btn-disabled': disabled }" :disabled="disabled" @click="calBodyLen()">计算体长</button>
      </div>
    </div>
    <div class="cal-body_len cal-body_len2">
      <div class="head-div option">
        <div class="head-div-child download-res" @click="downloadCalBLRes()">
          <span>下载结果</span>
          <i class="iconfont icon-xiazai"></i>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { reactive, ref } from '@vue/runtime-core'
import { InfoFilled } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import DLService from '@/service/modules/deeplearning'
import { onMounted } from 'vue'
import elkLoading from '@/components/elk-loading/index.vue'

const imgListShow = ref(false)
const imgsInput = ref()
const disabled = ref(false)
const calBLParams = reactive<{
  useLastSeg: boolean
  inputImgs: File[]
}>({
  useLastSeg: false,
  inputImgs: [],
})
const uploadImgsSet = new Set()
const percentage = ref(0)

/* 上传数据去重 */
function selectInpValueChanged() {
  for (const file of imgsInput.value.files) {
    if (!uploadImgsSet.has(file.name)) {
      uploadImgsSet.add(file.name)
      calBLParams.inputImgs.push(file)
    }
  }
  // fileInput的值改变了并添加完影像后将fileInput的值置空,以防不能重复添加上次相同的结果
  // 触发场景:添加完一批影像后全部删除,再添加上次相同的一批影像
  imgsInput.value.value = ''
}
/* 移除上传影像 */
function remove(idx?: number) {
  if (idx === undefined) {
    calBLParams.inputImgs = []
    uploadImgsSet.clear()
  } else {
    // 注意下面两行操作的顺序不能颠倒，因为要先将set对应的name去除再将数组中的数据移除
    // 颠倒的话会导致数组中的数据删除了，set拿不到对应正确的数据的name，因为数组改变，idx也改变了
    uploadImgsSet.delete(calBLParams.inputImgs[idx].name)
    calBLParams.inputImgs.splice(idx, 1)
  }
  // 如果影响列表为空则自动关闭影像列表
  calBLParams.inputImgs.length === 0 &&
    setTimeout(() => {
      imgListShow.value = false
    }, 300)
}

/* 上传信息提取的影像 */
async function uploadSegImgs() {
  const formData = new FormData()
  for (let file of calBLParams.inputImgs) {
    formData.append(file.name, file)
  }
  disabled.value = true
  DLService.uploadSegExtRes(formData).then(
    (res) => {
      if (res.status === 0) {
        console.log('上传信息提取影像成功！')
      }
    },
    (err) => {
      disabled.value = false
    }
  )
}
/* 计算体长线 */
async function calBodyLen() {
  if (!calBLParams.useLastSeg) {
    if (calBLParams.inputImgs.length === 0) {
      return ElMessage({ showClose: true, message: '请选择信息提取影像！', type: 'warning' })
    }
    await uploadSegImgs()
  }
  const params = { ...calBLParams }
  // @ts-ignore
  delete params.inputImgs
  disabled.value = true
  setTimeout(() => {
    getCalBLtStatus()
  }, 1000)
  DLService.calBodyLength(params).then(
    (res) => {
      if (res.status === 0) {
      } else {
        ElMessage({ showClose: true, message: res.msg, type: 'warning' })
      }
      disabled.value = false
    },
    (err) => {
      disabled.value = false
    }
  )
}
/* 获取计算体长线状态 */
function getCalBLtStatus() {
  DLService.getCalBLtStatus().then(
    (res) => {
      if (res.status === 0) {
        disabled.value = false
        percentage.value = 0
      } else if (res.status === 1) {
        disabled.value = true
        percentage.value = res.data.processPercentage
        setTimeout(() => {
          getCalBLtStatus()
        }, 1000)
      } else {
        disabled.value = true
        ElMessage({ showClose: true, message: res.msg, type: 'warning' })
      }
    },
    (err) => {}
  )
}
/* 下载体长线计算结果 */
function downloadCalBLRes() {
  DLService.downloadCalBLRes().then(
    (res: any) => {
      if (res.status) {
        return ElMessage({ showClose: true, message: res.msg, type: 'warning' })
      }
      // 将响应数据处理为Blob类型
      const blob = new Blob([res])
      const url = window.URL.createObjectURL(blob)
      // 创建一个a标签
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = url
      a.download = 'ELK_length_Res.csv'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a) //下载完成移除元素
      // 释放之前创建的URL对象
      URL.revokeObjectURL(url)
    },
    (err) => {}
  )
}
onMounted(() => {
  getCalBLtStatus()
})
</script>

<style lang="less" scoped>
#cal-BL {
  display: flex;
}
.cal-body_len {
  display: flex;
  flex-direction: column;
  margin: 0 3% 3%;
  padding: 40px;
  border-radius: 50px;
  background: linear-gradient(145deg, #f0f0f0, #cacaca);
  box-shadow: 30px 30px 60px #bababa, -30px -30px 60px #ffffff;
  width: 44%;
  .option {
    display: flex;
    align-items: center;
    justify-content: left;
    margin: 25px 0;
    .label {
      text-align: end;
      margin-right: 30px;
      font-size: 16px;
      min-width: 150px;
    }
    span {
      font-size: 16px;
    }
    .span {
      color: #409eff;
      font-weight: bold;
      margin: 0 10px;
    }
    .obj-extract-input {
      font-weight: 500;
      font-size: 16px;
      height: 25px;
      border-radius: 5px;
      padding-left: 10px;
      border: none;
      border-bottom: 1px solid #e5e5e5;
      outline: none;
    }
    .tips {
      position: relative;
      margin-left: 30px;
      cursor: default;
      .icon-xinxi {
        margin: 0;
      }
      &:hover .tips-info {
        display: block;
      }
      .tips-info {
        display: none;
        position: absolute;
        padding: 8px;
        text-align: center;
        font-size: 8px;
        width: 150px;
        left: 100%;
        top: 50%;
        border-radius: 15px;
        font-weight: bold;
        color: #485570;
        transform: translateY(-50%);
        background: linear-gradient(145deg, #a2b1ba, #c1d3dd);
        box-shadow: 5px 5px 10px #99a7b0, -5px -5px 10px #cfe3ee;
      }
    }

    .obj-extract-input:focus {
      border-bottom: 1px solid #6941c6;
      -webkit-transition: 0.1s;
      transition: 0.5s;
    }
  }
  .icon-shanchu:hover {
    color: red !important;
  }
  .all-img {
    z-index: 999;
    position: absolute;
    top: 0px;
    left: 100%;
    min-width: 300px;
    padding: 10px;
    border-radius: 10px;
    background: #abbad8;
    box-shadow: 5px 5px 10px #919eb8, -5px -5px 10px #c5d6f8;
    .icon-cuowu {
      opacity: 0.7;
    }
  }
  .img-detail {
    position: relative;

    .img-list-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 10px;
      .iconfont {
        margin: 0;
      }
      .delete-all {
        line-height: 100%;
        cursor: pointer;
      }
      .delete-all:hover {
        color: red;
        .icon-shanchu {
          color: red;
        }
      }
    }
  }
  .img-list {
    display: flex;
    flex-direction: column;
    max-height: 250px;
    padding-right: 15px;
    li:last-child {
      border: none;
    }
    li {
      display: flex;
      align-items: center;
      justify-content: space-between;
      min-width: 300px;
      padding: 2px 0;
      border-bottom: solid 1px #555555;
    }
  }
  .option-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 10px;
  }
  .btn {
    cursor: pointer;
    transition: all 0.5s ease;
    &:hover {
      transform: scale(1.1);
    }
  }

  .iconfont {
    color: #303030;
    margin-left: 20px;
    font-size: 18px;
    cursor: pointer;
    &:hover {
      color: #409eff;
    }
  }
}
.cal-body_len2 {
  .head-div {
    display: flex;
    align-items: center;
    justify-content: end;

    .head-div-child {
      position: relative;
      display: flex;
      align-items: center;
      font-size: 16px;
      .icon-cuowu {
        margin: 0;
        opacity: 0.7;
      }
    }

    .icon-xiazai {
      margin: 0px 20px 0px 5px;
    }
    .download-res {
      cursor: pointer;
      &:hover {
        color: #409eff;
        .icon-xiazai {
          color: #409eff;
        }
      }
    }
  }
}
.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

.btn {
  color: #090909;
  padding: 10px 10px;
  font-size: 16px;
  border-radius: 0.5em;
  background: #e8e8e8;
  border: 1px solid #e8e8e8;
  transition: all 0.3s;
  box-shadow: 6px 6px 10px #c5c5c5, -6px -6px 10px #ffffff;
}

.btn:active {
  color: #666;
  box-shadow: inset 4px 4px 10px #c5c5c5, inset -4px -4px 10px #ffffff;
}

.btn-disabled {
  background: #808080;
  cursor: wait !important;
  &:active {
    color: #090909;
    box-shadow: 6px 6px 10px #c5c5c5, -6px -6px 10px #ffffff;
  }
}
/* checkbox --start-- */
/* Hide the default checkbox */
.container input {
  position: absolute;
  opacity: 0;
  cursor: pointer;
  height: 0;
  width: 0;
}

.container {
  display: flex;
  position: relative;
  cursor: pointer;
  font-size: 14px;
  user-select: none;
}
.container label {
  cursor: pointer;
}
/* Create a custom checkbox */
.checkmark {
  position: relative;
  top: 0;
  left: 0;
  height: 1.3em;
  width: 1.3em;
  background-color: #ccc;
  transition: all 0.3s;
  border-radius: 5px;
}

/* When the checkbox is checked, add a blue background */
.container input:checked ~ .checkmark {
  background-color: #47da99;
  animation: pop 0.5s;
  animation-direction: alternate;
}

/* Create the checkmark/indicator (hidden when not checked) */
.checkmark:after {
  content: '';
  position: absolute;
  display: none;
}

/* Show the checkmark when checked */
.container input:checked ~ .checkmark:after {
  display: block;
}

/* Style the checkmark/indicator */
.container .checkmark:after {
  left: 0.45em;
  top: 0.25em;
  width: 0.25em;
  height: 0.5em;
  border: solid white;
  border-width: 0 0.15em 0.15em 0;
  transform: rotate(45deg);
}

@keyframes pop {
  0% {
    transform: scale(1);
  }

  50% {
    transform: scale(0.9);
  }

  100% {
    transform: scale(1);
  }
}
/* checkbox --end-- */
</style>
