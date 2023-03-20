<template>
  <elkLoading v-show="disabled" :bar-height="15" :percentage="percentage"></elkLoading>
  <div v-show="!disabled" :style="{ height: '65px' }"></div>
  <div id="seg-extr">
    <div class="seg-extract">
      <div class="option">
        <label class="container">
          <label class="label" for="useLastDet">使用上一次检测结果</label>
          <input id="useLastDet" type="checkbox" v-model="segExtrParams.useLastDet" />
          <div class="checkmark"></div>
        </label>
        <div class="tips">
          <i class="iconfont icon-xinxi"></i>
          <div class="tips-info animate__animated animate__fadeIn animate__fast">
            勾选此项代表使用上一次目标检测的结果进行信息提取(不会上传图像和标签)
          </div>
        </div>
      </div>
      <div class="option">
        <label class="label" for="inputImgs">上传原始图像</label>
        <span>共</span><span class="span">{{ segExtrParams.inputImgs.length }}</span
        ><span>幅</span>
        <div class="img-detail">
          <i class="iconfont icon-xiangqing" @click="segExtrParams.inputImgs.length && (imgListShow = true)"></i>
          <div class="all-img" v-show="imgListShow">
            <div class="img-list-head">
              <i class="iconfont icon-cuowu" @click="imgListShow = false"></i>
              <el-popconfirm
                width="100"
                confirm-button-text="Yes"
                cancel-button-text="No"
                :icon="InfoFilled"
                title="确认移除全部?"
                @confirm="remove('inputImgs')"
              >
                <template #reference>
                  <div class="delete-all"><span>delete all</span><i class="iconfont icon-shanchu"></i></div>
                </template>
              </el-popconfirm>
            </div>
            <el-scrollbar class="img-list animate__animated animate__fadeIn animate__fast">
              <!-- 给li的移除添加动画 -->
              <TransitionGroup name="list" tag="ul">
                <li v-for="(img, index) of segExtrParams.inputImgs" :key="img.name">
                  <span>{{ img.name }}</span>
                  <i class="iconfont icon-shanchu" @click="remove('inputImgs', index)"></i>
                </li>
              </TransitionGroup>
            </el-scrollbar>
          </div>
        </div>
        <i class="iconfont icon-24gf-folderOpen" @click="segImgsInput.click()"></i>
        <input hidden ref="segImgsInput" type="file" accept="image/*" multiple @change="selectInpValueChanged('inputImgs')" />
      </div>
      <div class="option">
        <label class="label" for="inputTxts">上传检测标签</label>
        <span>共</span><span class="span">{{ segExtrParams.inputTxts.length }}</span
        ><span>个</span>
        <div class="img-detail">
          <i class="iconfont icon-xiangqing" @click="segExtrParams.inputTxts.length && (txtListShow = true)"></i>
          <div class="all-img" v-show="txtListShow">
            <div class="img-list-head">
              <i class="iconfont icon-cuowu" @click="txtListShow = false"></i>
              <el-popconfirm
                width="100"
                confirm-button-text="Yes"
                cancel-button-text="No"
                :icon="InfoFilled"
                title="确认移除全部?"
                @confirm="remove('inputTxts')"
              >
                <template #reference>
                  <div class="delete-all"><span>delete all</span><i class="iconfont icon-shanchu"></i></div>
                </template>
              </el-popconfirm>
            </div>
            <el-scrollbar class="img-list animate__animated animate__fadeIn animate__fast">
              <!-- 给li的移除添加动画 -->
              <TransitionGroup name="list" tag="ul">
                <li v-for="(txt, index) of segExtrParams.inputTxts" :key="txt.name">
                  <span>{{ txt.name }}</span>
                  <i class="iconfont icon-shanchu" @click="remove('inputTxts', index)"></i>
                </li>
              </TransitionGroup>
            </el-scrollbar>
          </div>
        </div>
        <i class="iconfont icon-24gf-folderOpen" @click="segTxtsInput.click()"></i>
        <input hidden ref="segTxtsInput" type="file" accept=".txt" multiple @change="selectInpValueChanged('inputTxts')" />
      </div>
      <div class="slider-demo-block option">
        <label class="label">分割尺度</label>
        <el-slider v-model="segExtrParams.cutScale" :min="0.5" :max="2" :step="0.1" />
      </div>
      <div class="option-btn">
        <button :class="{ btn: true, 'btn-disabled': disabled }" :disabled="disabled" @click="segExtract()">信息提取</button>
      </div>
    </div>
    <div class="seg-extract seg-extract2">
      <div class="head-div option">
        <div class="head-div-child">
          <div class="show-det-list" @click="preSegExtImgListShow = true"><i class="iconfont icon-xiangqing1"></i> <span>结果列表</span></div>
          <div v-show="previewImgList.length > 0">
            &ensp;<span> ( 共</span><span class="det-img-count">{{ previewImgList.length }}</span
            ><span>幅 )</span>
          </div>
          <div class="all-img" v-show="preSegExtImgListShow">
            <div class="pre-list-head">
              <i class="iconfont icon-cuowu" @click="preSegExtImgListShow = false"></i>
              <span v-show="previewImgList.length === 0">暂无结果</span>
            </div>
            <ul class="img-list animate__animated animate__fadeIn animate__faster">
              <li class="det-preview-detail-li" v-for="(img, index) of previewImgList" :key="img.name" @click="previewImgIdx = index">
                {{ img.name }}
              </li>
            </ul>
          </div>
        </div>
        <div class="head-div-child download-res" @click="downloadSegExtRes()">
          <span>下载结果</span>
          <i class="iconfont icon-xiazai"></i>
        </div>
      </div>
      <div class="preview-div">
        <el-image
          class="preview-img"
          :src="previewImgUrlList[previewImgIdx]"
          :zoom-rate="1.2"
          :preview-src-list="previewImgUrlList"
          :initial-index="previewImgIdx"
          fit="contain"
        >
          <template #error>
            <div class="image-slot">
              <el-icon><icon-picture /></el-icon>
            </div>
          </template>
        </el-image>
        <i class="iconfont icon-xiangzuo2" :class="{ 'icon-disabled': previewImgIdx <= 0 }" @click="previewImgIdx > 0 && previewImgIdx--"></i>
        <i
          class="iconfont icon-xiangyou2"
          :class="{ 'icon-disabled': previewImgIdx >= previewImgList.length - 1 }"
          @click="previewImgIdx < previewImgList.length - 1 && previewImgIdx++"
        ></i>
      </div>
      <div class="option-btn">
        <button class="btn" @click="previewLastSegExtRes()">预览上一次结果</button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import elkLoading from '@/components/elk-loading/index.vue'
import { reactive, Ref, ref } from '@vue/runtime-core'
import { InfoFilled } from '@element-plus/icons-vue'
import DLService from '@/service/modules/deeplearning'
import { ElMessage } from 'element-plus'
import { onMounted } from 'vue'
import { Picture as IconPicture } from '@element-plus/icons-vue'
import RequestConfig from '@/service/request/config'

const disabled = ref(false)
const imgListShow = ref(false)
const txtListShow = ref(false)
const segImgsInput = ref()
const segTxtsInput = ref()
const percentage = ref(0)
const previewImgIdx = ref(-1) // 当前预览img的索引
const preSegExtImgListShow = ref(false)
let previewImgList = reactive<Array<any>>([])
let previewImgUrlList = reactive<any[]>([])
const segExtrParams = reactive<{
  useLastDet: boolean
  inputImgs: File[]
  inputTxts: File[]
  cutScale: number
}>({
  useLastDet: false,
  inputImgs: [],
  inputTxts: [],
  cutScale: 1.2,
})
const inputImgsSet = new Set() // 用于添加影像去重(不能有相同名)
const inputTxtsSet = new Set() // 用于添加标签去重(不能有相同名)
/* 移除影像 */
function remove(key: string, idx?: number) {
  let set: Set<any> = new Set()
  let whichShow = ref()
  switch (key) {
    case 'inputImgs':
      ;[whichShow, set] = [imgListShow, inputImgsSet]
      break
    case 'inputTxts':
      ;[whichShow, set] = [txtListShow, inputTxtsSet]
      break
    default:
      break
  }
  if (idx === undefined) {
    segExtrParams[key] = []
    set.clear()
  } else {
    set.delete(segExtrParams[key][idx].name)
    segExtrParams[key].splice(idx, 1)
  }
  // 如果影响列表为空则自动关闭影像列表
  segExtrParams[key].length === 0 &&
    setTimeout(() => {
      whichShow.value = false
    }, 300)
}
/* 数据去重 */
function selectInpValueChanged(key: string) {
  let input: Ref<any> = ref()
  let set: Set<any> = new Set()
  switch (key) {
    case 'inputImgs':
      ;[input, set] = [segImgsInput, inputImgsSet]
      break
    case 'inputTxts':
      ;[input, set] = [segTxtsInput, inputTxtsSet]
      break
    default:
      break
  }

  for (const file of input.value.files) {
    if (!set.has(file.name)) {
      set.add(file.name)
      segExtrParams[key].push(file)
    }
  }
  // fileInput的值改变了并添加完影像后将fileInput的值置空,以防不能重复添加上次相同的结果
  // 触发场景:添加完一批影像后全部删除,再添加上次相同的一批影像
  input.value.value = ''
}
/* 上传图像和标签 */
async function uploadSegImgTxt() {
  const formData = new FormData()
  for (let file of segExtrParams.inputImgs) {
    formData.append(file.name, file)
  }
  for (let file of segExtrParams.inputTxts) {
    formData.append(file.name, file)
  }
  disabled.value = true
  await DLService.uploadSegImgTxt(formData).then(
    (res) => {
      if (res.status === 0) {
        console.log('上传图像和标签成功')
      } else {
        disabled.value = false
        throw new Error('上传图像和标签失败')
      }
    },
    (err) => {
      disabled.value = false
    }
  )
}
/* 进行语义分割并提取信息 */
async function segExtract() {
  if (!segExtrParams.useLastDet) {
    if (segExtrParams.inputImgs.length === 0 || segExtrParams.inputTxts.length === 0) {
      return ElMessage({ showClose: true, message: '请选择对应的图像和标签！', type: 'warning' })
    }
    await uploadSegImgTxt()
  }
  const params = { ...segExtrParams }
  // @ts-ignore
  delete params.inputImgs
  // @ts-ignore
  delete params.inputTxts
  disabled.value = true
  setTimeout(() => {
    getSegExtStatus()
  }, 1000)
  DLService.segExtract(params).then(
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
/* 预览上一次的信息提取结果 */
function previewLastSegExtRes() {
  if (disabled.value === true) {
    return ElMessage({ showClose: true, message: '正在处理中，请等待处理完毕', type: 'warning' })
  }
  DLService.previewSegExtRes().then(
    (res) => {
      if (res.status === 0) {
        previewImgIdx.value = -1
        previewImgList = res.data
        previewImgUrlList = reactive([])
        previewImgList.forEach((file) => {
          previewImgUrlList.push(`${RequestConfig.BASE_URL}/${file.path}`)
        })
        previewImgIdx.value = 0
      } else {
        ElMessage({ showClose: true, message: res.msg, type: 'warning' })
      }
    },
    (err) => {}
  )
}
/* 下载信息提取结果 */
function downloadSegExtRes() {}
/* 获取信息提取的状态 */
function getSegExtStatus() {
  DLService.getSegExtStatus().then(
    (res) => {
      if (res.status === 0) {
        disabled.value = false
        percentage.value = 0
      } else {
        disabled.value = true
        percentage.value = res.data.processPercentage
        setTimeout(() => {
          getSegExtStatus()
        }, 500)
      }
    },
    (err) => {}
  )
}
onMounted(() => {
  getSegExtStatus()
})
</script>

<style lang="less" scoped>
#seg-extr {
  display: flex;
}
.seg-extract {
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
.seg-extract {
  .head-div {
    display: flex;
    align-items: center;
    justify-content: space-between;

    .head-div-child {
      position: relative;
      display: flex;
      align-items: center;
      font-size: 16px;
      .det-img-count {
        margin: 0 10px;
        font-weight: bold;
        color: #409eff;
      }
      .all-img {
        z-index: 999;
        top: 100%;
        left: 0;
        min-width: 100px;
        cursor: default;
      }
      .pre-list-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      .icon-cuowu {
        margin: 0;
        opacity: 0.7;
      }
      .show-det-list {
        display: flex;
        align-items: center;
        cursor: pointer;
        &:hover {
          color: #409eff;
          .icon-xiangqing1 {
            color: #409eff;
          }
        }
      }
      .det-preview-detail-li {
        border-radius: 5px;
        min-width: 100px;
        cursor: default;
        &:hover {
          color: rgba(#409eff, 0.8);
        }
      }
    }

    .icon-xiangqing1 {
      margin: 0px 5px 0px 20px;
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
  .per-det-img-detail {
    min-height: 16px;
    margin-left: 25px;
  }
  .preview-div {
    position: relative;
    box-sizing: border-box;
    height: 300px;
    margin: 10px;
    border-radius: 10px;
    background: #cdcdcd;

    .iconfont {
      z-index: 99;
      position: absolute;
      top: 50%;
      margin: 0;
      font-size: 40px;
      color: rgba(#555555, 0.5);
      &:hover {
        color: #409eff;
      }
    }
    .icon-xiangzuo2 {
      left: -40px;
      transform: translateY(-50%);
    }
    .icon-xiangyou2 {
      right: -40px;
      transform: translateY(-50%);
    }
    .icon-disabled {
      cursor: default;
      &:hover {
        color: rgba(#555555, 0.5);
      }
    }
  }
}
.preview-img {
  width: 100%;
  height: 100%;
  .image-slot {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
    color: var(--el-text-color-secondary);
    font-size: 30px;
    .el-icon {
      font-size: 50px;
    }
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
  label {
    cursor: pointer;
  }
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

.slider-demo-block {
  display: flex;
  align-items: center;
}
:deep(.el-slider) {
  --el-slider-runway-bg-color: #c2c6cd;
}
.slider-demo-block .el-slider {
  margin-top: 0;
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

.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style>
