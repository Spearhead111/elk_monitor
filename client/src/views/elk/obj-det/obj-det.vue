<template>
  <elkLoading v-show="disabled" :bar-height="15" :percentage="percentage"></elkLoading>
  <div v-show="!disabled" :style="{ height: '65px' }"></div>
  <div id="obj-det">
    <div class="obj-detect">
      <div class="option">
        <label class="label" for="inputFilePath">待检测图像</label>
        <span>共</span><span class="span">{{ objDetParams.inputImgs.length }}</span
        ><span>幅</span>
        <div class="img-detail">
          <i class="iconfont icon-xiangqing" @click="objDetParams.inputImgs.length && (imgListShow = true)"></i>
          <div class="all-img" v-show="imgListShow">
            <div class="img-list-head">
              <i class="iconfont icon-cuowu" @click="imgListShow = false"></i>
              <el-popconfirm
                width="100"
                confirm-button-text="Yes"
                cancel-button-text="No"
                :icon="InfoFilled"
                title="确认移除全部?"
                @confirm="removeImgs()"
              >
                <template #reference>
                  <div class="delete-all"><span>delete all</span><i class="iconfont icon-shanchu"></i></div>
                </template>
              </el-popconfirm>
            </div>
            <el-scrollbar class="img-list animate__animated animate__fadeIn animate__fast">
              <!-- 给li的移除添加动画 -->
              <TransitionGroup name="list" tag="ul">
                <li v-for="(img, index) of objDetParams.inputImgs" :key="img.name">
                  <span>{{ img.name }}</span>
                  <i class="iconfont icon-shanchu" @click="removeImgs(index)"></i>
                </li>
              </TransitionGroup>
            </el-scrollbar>
          </div>
        </div>
        <i class="iconfont icon-24gf-folderOpen" @click="objDetImgsInput.click()"></i>
        <input hidden ref="objDetImgsInput" type="file" accept="image/*" multiple @change="selectObjDetImgChanged" />
      </div>
      <div class="slider-demo-block option">
        <label class="label">conf_thres</label>
        <el-slider v-model="objDetParams.confThres" :max="1" :step="0.01" />
      </div>
      <div class="slider-demo-block option">
        <label class="label">iou_thres</label>
        <el-slider v-model="objDetParams.iouThres" :max="1" :step="0.01" />
      </div>
      <div class="option">
        <label class="label" for="saveName">项目名称</label>
        <input
          type="text"
          id="saveName"
          v-model="objDetParams.saveName"
          class="obj-det-input"
          placeholder="输出文件夹名"
          onkeyup="this.value=this.value.replace(/[^\w_]/g,'');"
        />
      </div>
      <div class="option">
        <label class="label" for="border">检测框宽度</label>
        <input
          type="number"
          id="border"
          v-model="objDetParams.border"
          class="obj-det-input"
          :min="1"
          :max="10"
          oninput="if(value>10)value=10;if(value<1)value=1"
        />
      </div>
      <div class="option">
        <label class="container">
          <label class="label" for="saveTxt">保存文本文件</label>
          <input id="saveTxt" type="checkbox" v-model="objDetParams.saveTxt" />
          <div class="checkmark"></div>
        </label>
      </div>
      <div class="option">
        <label class="container">
          <label class="label" for="withConf">保存置信度(文本中)</label>
          <input id="withConf" type="checkbox" v-model="objDetParams.withConf" />
          <div class="checkmark"></div>
        </label>
      </div>
      <div class="option">
        <label class="container">
          <label class="label" for="hideConf">隐藏置信度(图上)</label>
          <input id="hideConf" type="checkbox" v-model="objDetParams.hideConf" />
          <div class="checkmark"></div>
        </label>
      </div>
      <div class="option-btn">
        <button :class="{ btn: true, 'btn-disabled': disabled }" :disabled="disabled" @click="uploadImgs">进行检测</button>
      </div>
    </div>
    <div class="obj-detect obj-detect2">
      <div class="head-div option">
        <div class="head-div-child">
          <div class="show-det-list" @click="preDetImgListShow = true"><i class="iconfont icon-xiangqing1"></i> <span>结果列表</span></div>
          <div v-show="previewImgList.length > 0">
            &ensp;<span> ( 共</span><span class="det-img-count">{{ previewImgList.length }}</span
            ><span>幅，检测到共</span><span class="det-img-count">{{ total }}</span
            ><span>头 )</span>
          </div>
          <div class="all-img" v-show="preDetImgListShow">
            <div class="pre-list-head">
              <i class="iconfont icon-cuowu" @click="preDetImgListShow = false"></i>
              <span v-show="previewImgList.length === 0">暂无结果</span>
            </div>
            <ul class="img-list animate__animated animate__fadeIn animate__faster">
              <li class="det-preview-detail-li" v-for="(img, index) of previewImgList" :key="img.name" @click="previewImgIdx = index">
                {{ img.name }}
              </li>
            </ul>
          </div>
        </div>
        <div class="head-div-child download-res" @click="downloadDetRes()">
          <span>下载结果</span>
          <i class="iconfont icon-xiazai"></i>
        </div>
      </div>
      <div class="per-det-img-detail">
        <div v-show="previewImgList.length">
          <span>此幅检测出</span
          ><span :style="{ padding: '0 5px', color: '#409eff', fontWeight: 'bold' }">{{ previewImgList[previewImgIdx]?.count || 0 }}</span
          ><span>头</span>
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
        <button class="btn" @click="previewLastDetRes">预览上一次结果</button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import DLService from '@/service/modules/deeplearning'
import { onMounted, reactive, ref } from '@vue/runtime-core'
import { ElMessage } from 'element-plus'
import { InfoFilled } from '@element-plus/icons-vue'
import RequestConfig from '@/service/request/config'
import useUserStore from '@/stores/modules/user'
import { Picture as IconPicture } from '@element-plus/icons-vue'
import elkLoading from '@/components/elk-loading/index.vue'

const userStore = useUserStore()
const objDetImgsInput = ref() // 选择目标检测图像的隐藏fileinput的ref
const imgListShow = ref(false) // 上传目标检测待检测图像的列表是否show
const preDetImgListShow = ref(false) // 目标检测结果图像的预览列表是否show
const disabled = ref(false) // 按钮禁用
const detImgExist = ref(false) // 目标检测预览img是否展示
const total = ref(0) // 所有影像检测出的总头数
const inputImgsSet = new Set() // 用于添加影像去重(不能有相同名)
const percentage = ref(-1)
const objDetParams = reactive<{
  inputImgs: File[]
  confThres: number
  iouThres: number
  withConf: boolean
  saveTxt: boolean
  saveName: string
  border: number
  hideConf: boolean
}>({
  inputImgs: [],
  confThres: 0.3,
  iouThres: 0.5,
  withConf: true,
  saveTxt: true,
  saveName: 'objDetectResult',
  border: 3,
  hideConf: true,
})

const previewImgIdx = ref(-1) // 当前预览img的索引
let previewImgList = reactive<Array<any>>([])
let previewImgUrlList = reactive<any[]>([])
/* 移除影像 */
function removeImgs(idx?: number) {
  if (idx === undefined) {
    objDetParams.inputImgs = []
    inputImgsSet.clear()
  } else {
    inputImgsSet.delete(objDetParams.inputImgs[idx].name)
    objDetParams.inputImgs.splice(idx, 1)
  }
  // 如果影响列表为空则自动关闭影像列表
  objDetParams.inputImgs.length === 0 &&
    setTimeout(() => {
      imgListShow.value = false
    }, 300)
}
/* 选择待检测图像,会自动过滤重复影像(判断规则为影像名不能相同) */
function selectObjDetImgChanged(e: Event) {
  for (const img of objDetImgsInput.value.files) {
    if (!inputImgsSet.has(img.name)) {
      inputImgsSet.add(img.name)
      objDetParams.inputImgs.push(img)
    }
  }
  // fileInput的值改变了并添加完影像后将fileInput的值置空,以防不能重复添加上次相同的结果
  // 触发场景:添加完一批影像后全部删除,再添加上次相同的一批影像
  objDetImgsInput.value.value = ''
}

/* 上传目标检测的图像数据 */
function uploadImgs() {
  if (objDetParams.inputImgs.length === 0) {
    return ElMessage({ showClose: true, message: '请选择待检测图像！', type: 'warning' })
  }
  // 上传之前要处理一下文件 因为文件是二进制的，要利用 FormData 实例对象进行处理
  const formData = new FormData()
  // append方法把文件添加到 FormData实例对象中 第一个参数：文件名 第二个参数：要上传的文件
  for (let file of objDetParams.inputImgs) {
    formData.append(file.name, file)
  }
  disabled.value = true
  DLService.uploadObjDetImg(formData).then(
    async (res) => {
      if (res.status === 0) {
        console.log('图像上传成功')
        doObjDetect()
      } else {
        disabled.value = false
        ElMessage({ showClose: true, message: res.msg, type: 'error' })
      }
    },
    (err) => {
      disabled.value = false
      ElMessage({ showClose: true, message: '服务器出错了，请稍后再试！', type: 'error' })
    }
  )
}

/* 进行目标检测 */
function doObjDetect() {
  const params = { ...objDetParams, inputImgs: null }
  // @ts-ignore
  delete params.inputImgs
  setTimeout(() => {
    getDetStatus()
  }, 500)
  DLService.doObjDetect(params).then(
    (res) => {
      if (res.status === 0) {
        console.log('目标检测成功')
        ElMessage({ showClose: true, message: '检测完毕', type: 'success' })
      } else {
        ElMessage({ showClose: true, message: res.msg, type: 'error' })
      }
      disabled.value = false
      percentage.value = 0
    },
    (err) => {
      disabled.value = false
      ElMessage({ showClose: true, message: '服务器出错了，请稍后再试！', type: 'error' })
    }
  )
}

/* 预览上一次的目标检测结果 */
function previewLastDetRes() {
  if (disabled.value === true) {
    return ElMessage({ showClose: true, message: '正在检测中，请等待检测完毕', type: 'warning' })
  }
  detImgExist.value = false
  DLService.previewLastDetRes().then(
    (res) => {
      if (res.status === 0) {
        previewImgList = res.data
        total.value = 0
        previewImgUrlList = reactive([])
        previewImgList.forEach((file) => {
          previewImgUrlList.push(`${RequestConfig.BASE_URL}/${file.path}`)
          total.value += file.count
        })
        detImgExist.value = true
        previewImgIdx.value = 0
      } else {
        ElMessage({ showClose: true, message: res.msg, type: 'warning' })
      }
    },
    (err) => {}
  )
}

/* 下载检测结果(txt保存的检测信息) */
function downloadDetRes() {
  if (disabled.value === true) {
    return ElMessage({ showClose: true, message: '正在检测中，请等待检测完毕', type: 'warning' })
  }

  DLService.downloadDetRes().then(
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
      a.download = 'objDetResult.zip'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a) //下载完成移除元素
      // 释放之前创建的URL对象
      URL.revokeObjectURL(url)
    },
    (err) => {}
  )
}

/* 获取检测状态 */
function getDetStatus() {
  DLService.getDetStatus().then(
    (res) => {
      if (res.status === 0) {
        disabled.value = false
        percentage.value = 0
      } else {
        disabled.value = true
        percentage.value = res.data.processPercentage
        setTimeout(() => {
          getDetStatus()
        }, 500)
      }
    },
    (err) => {}
  )
}
onMounted(() => {
  getDetStatus()
})
</script>

<style lang="less" scoped>
#obj-det {
  display: flex;
}
.obj-detect {
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
    margin: 10px 0;
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
    .obj-det-input {
      font-weight: 500;
      font-size: 16px;
      height: 25px;
      border-radius: 5px;
      padding-left: 10px;
      border: none;
      border-bottom: 1px solid #e5e5e5;
      outline: none;
    }

    .obj-det-input:focus {
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
.obj-detect2 {
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
