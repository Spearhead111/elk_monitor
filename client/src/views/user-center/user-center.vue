<template>
  <div class="user-head">
    <div class="avatar" @click="dialogAvatarVisible = true">
      <img :src="userStore.avatarBase64 ?? require('@/assets/img/default_avatar.jpg')" />
      <div class="avatar-hover">
        <i class="iconfont icon-xiangji"></i>
      </div>
    </div>
    <el-dialog
      class="upload-avatar animate__animated animate__fadeIn animate__faster"
      :show-close="false"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      width="600"
      v-model="dialogAvatarVisible"
      title="上传头像"
    >
      <div class="cropperBox">
        <vueCropper
          ref="cropper"
          :img="option.imgBase64"
          :outputSize="option.outputSize"
          :outputType="option.outputType"
          :canScale="option.canScale"
          :autoCrop="option.autoCrop"
          :autoCropWidth="option.autoCropWidth"
          :autoCropHeight="option.autoCropHeight"
          :canMoveBox="option.canMoveBox"
          :canMove="option.canMove"
          :centerBox="option.centerBox"
          :info="option.info"
          :fixedBox="option.fixedBox"
          :mode="option.mode"
        ></vueCropper>
      </div>
      <span class="avatar-tips">图片最大不能超过2m</span>
      <button class="slelect-image nice-btn1 nice-btn1-select" @click="selectImageInput.click()">
        <span class="transition"></span>
        <span class="gradient"></span>
        <span class="label">选择图像</span>
      </button>
      <input v-show="false" ref="selectImageInput" type="file" accept="image/jpeg" @change="changeImage" />
      <button class="nice-btn1 nice-btn1-submit" @click="updateAvatar()">
        <span class="transition"></span>
        <span class="gradient"></span>
        <span class="label">确定</span>
      </button>
      <button class="nice-btn1 nice-btn1-cancel" @click="cancelUpdateAvatar()">
        <span class="transition"></span>
        <span class="gradient"></span>
        <span class="label">取消</span>
      </button>
    </el-dialog>
  </div>
  <div class="user-info">
    <ul class="user-info-ul">
      <li>
        <span class="label">账号</span>
        <span class="content">{{ userStore.userInfo?.['account'] ?? '我是丁真，不说藏话' }}</span>
      </li>
      <li>
        <span class="label">邮箱</span>
        <span class="content">{{ userStore.userInfo?.['email'] ?? '我是谷爱玲，我爱中国' }}</span>
      </li>
      <li>
        <span class="label">昵称</span>
        <div class="can-change-info" v-show="!inputVisiable.nickname">
          <span class="content">{{ userStore.userInfo?.['nickname'] ?? '我是吴京，我就怼' }}</span>
          <div class="edit" @click="inputVisiable.nickname = true">
            <i class="iconfont icon-bianji"></i>
            编辑
          </div>
        </div>
        <div v-show="inputVisiable.nickname" class="nickname-input">
          <input type="text" class="user-info-input" v-model="changedNickname" />
          <button class="ncie-btn2 ncie-btn2-submit" @click="changeNickname">确定</button>
          <button class="ncie-btn2 ncie-btn2-cancel" @click="inputVisiable.nickname = false">取消</button>
        </div>
      </li>
    </ul>
  </div>
</template>

<script lang="ts" setup>
import { reactive, ref } from '@vue/runtime-core'
import 'vue-cropper/dist/index.css'
import { VueCropper } from 'vue-cropper'
import useUserStore from '@/stores/modules/user'
import { ElMessage } from 'element-plus'
import { UserInfoService } from '@/service/modules/userInfo'

const userStore = useUserStore()
const selectImageInput = ref()
const cropper = ref()
const dialogAvatarVisible = ref(false)
const option = reactive({
  imgBase64: '', // 裁剪图片地址，这里可以本地图片或者链接，链接不用require
  outputSize: 1, // 裁剪生成图片质量
  outputType: 'jepg', // 裁剪生成图片格式
  canScale: true, // 图片是否允许滚轮播放
  autoCrop: true, // 是否默认生成截图框 false
  info: false, // 是否展示截图框信息
  autoCropWidth: 200, // 生成截图框的宽度
  autoCropHeight: 200, // 生成截图框的高度
  canMoveBox: true, // 截图框是否可以拖动
  fixedBox: true, // 固定截图框的大小
  canMove: true, // 上传图片是否可拖动
  centerBox: true, // 截图框限制在图片里面
  mode: 'contain', // 图片默认渲染方式
})
const inputVisiable = reactive({
  nickname: false,
})
const changedNickname = ref<string>(userStore.userInfo?.['nickname'] || '')
/* input文件选取框中的文件改变的回调 */
const changeImage = (e: any) => {
  const file = e.target.files[0]
  getBase64(file).then(
    (res: any) => {
      option.imgBase64 = res
    },
    (err) => {
      ElMessage({ showClose: true, message: '读取文件失败！', type: 'warning' })
    }
  )
}
/* 文件转base64 */
function getBase64(file: any) {
  // 直接将处理结果返回
  return new Promise((resolve, reject) => {
    let reader = new FileReader()
    let fileResult = ''
    reader.readAsDataURL(file)
    reader.onload = () => {
      fileResult = reader.result?.toString() as string
    }
    reader.onerror = (error) => {
      reject(error)
    }
    reader.onloadend = () => {
      resolve(fileResult)
    }
  })
}
/* 从截图框中获取图像并更新头像 */
function updateAvatar() {
  if (selectImageInput.value.files.length === 0) {
    return ElMessage({ showClose: true, message: '没有选取任何图像！', type: 'warning' })
  }
  let newAvatarBase64 = ''
  cropper.value.getCropData((data: any) => {
    newAvatarBase64 = data
    const size = base64ToFile(newAvatarBase64)
    // 判断头像是否大于2m
    if (size / 1024 / 1024 >= 2) {
      return ElMessage({ showClose: true, message: '图像不能大于2m！', type: 'warning' })
    }
    UserInfoService.updateAvatar(newAvatarBase64).then(
      (res) => {
        if (res.status === 0) {
          ElMessage({ showClose: true, message: '更改成功！', type: 'success' })
          localStorage.setItem('avatar', newAvatarBase64)
          userStore.updateAvatar(newAvatarBase64)
          dialogAvatarVisible.value = false
        } else {
          ElMessage({ showClose: true, message: res.msg, type: 'error' })
        }
        option.imgBase64 = ''
        selectImageInput.value.value = ''
      },
      (err) => {
        console.log(err)

        ElMessage({ showClose: true, message: '更新失败，请稍后再试！', type: 'error' })
      }
    )
  })
}
/* 取消更新头像 */
function cancelUpdateAvatar() {
  dialogAvatarVisible.value = false
  option.imgBase64 = ''
  selectImageInput.value.value = ''
}
/* 通过base64获取截图的大小 */
function base64ToFile(base64: any) {
  return atob(base64.split(',')[1]).length
}
/* 更改用户昵称 */
function changeNickname() {
  changedNickname.value = changedNickname.value.replace(/\s*/g, '')
  if (changedNickname.value === userStore.userInfo?.['nickname']) {
    return (inputVisiable.nickname = false)
  }
  userStore.changeNickname(changedNickname.value)
  inputVisiable.nickname = false
}
</script>

<style lang="less" scoped>
.user-head {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 400px;
  background: url('@/assets/img/user-center-bg.jpg') bottom;
  /* 让背景图基于容器大小伸缩 */
  background-size: cover;

  .avatar {
    position: relative;
    height: 300px;
    width: 300px;
    border-radius: 50%;
    cursor: pointer;
    img {
      border-radius: 50%;
      height: 300px;
      width: 300px;
      object-fit: cover;
    }
    &:hover .avatar-hover {
      display: flex;
    }
    .avatar-hover {
      display: none;
      align-items: center;
      justify-content: center;
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      border-radius: 50%;
      i {
        color: #fff;
        font-size: 40px;
      }
    }
  }
  .upload-avatar {
    position: relative;
    z-index: 999;
    .cropperBox {
      height: 300px;
      margin-bottom: 10px;
    }
    .slelect-image {
      margin-right: 325px;
    }
    .avatar-tips {
      display: flex;
      justify-content: center;
      padding-bottom: 10px;
    }
  }
}

.user-info {
  margin: 30px;
  padding: 20px;
  border-radius: 20px;
  background: linear-gradient(145deg, #f0f0f0, #cacaca);
  box-shadow: 30px 30px 60px #bababa, -30px -30px 60px #ffffff;
  .user-info-ul {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    li {
      display: flex;
      width: 100%;
      margin-bottom: 30px;
    }
    span {
      padding: 10px 0;
      line-height: 100%;
      font-size: 22px;
    }
    .label {
      padding-left: 40%;
      margin-right: 30px;
    }
    .nickname-input {
      display: flex;
      align-items: center;
      justify-content: center;
      .user-info-input {
        width: 200px;
        font-size: 20px;
        line-height: 28px;
        border: 2px solid transparent;
        border-bottom-color: #777;
        outline: none;
        background-color: transparent;
        color: #0d0c22;
        transition: 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
      }

      .user-info-input:focus,
      input:hover {
        outline: none;
        padding: 0.2rem 1rem;
        border-radius: 1rem;
        border-color: #7a9cc6;
      }

      .user-info-input::placeholder {
        color: #777;
      }

      .user-info-input:focus::placeholder {
        opacity: 0;
        transition: opacity 0.3s;
      }
    }
    .can-change-info {
      display: flex;
      align-items: center;
      justify-content: center;
      &:hover .edit {
        display: flex;
      }
      .edit {
        display: none;
        font-size: 22px;
        color: #1989fa;
        cursor: pointer;
        i {
          font-size: 22px;
        }
      }
    }
  }
}
/* nice-btn1 --start-- */
.nice-btn1 {
  font-size: 14px;
  padding: 0.6em 1.2em;
  background: #1f2937;
  color: white;
  border: none;
  position: relative;
  overflow: hidden;
  border-radius: 0.6em;
  margin-right: 10px;
  cursor: pointer;
}

.gradient {
  position: absolute;
  width: 100%;
  height: 100%;
  left: 0;
  top: 0;
  border-radius: 0.6em;
  margin-top: -0.25em;
  background-image: linear-gradient(rgba(253, 251, 251, 0), rgba(203, 201, 201, 0), rgba(243, 241, 241, 0.3));
}

.label {
  position: relative;
  top: -1px;
}
.nice-btn1-select {
  background: #1989fa;
  .gradient {
    background-image: linear-gradient(rgba(253, 251, 251, 0) rgba(154, 151, 151, 0.3));
  }
  .transition {
    background-color: rgba(#4e8397, 1);
  }
}
.nice-btn1-cancel {
  background: #898484;
  .transition {
    background-color: rgba(175, 105, 25, 0.8);
  }
}
.transition {
  transition-timing-function: cubic-bezier(0, 0, 0.2, 1);
  transition-duration: 500ms;
  background-color: rgba(16, 185, 81, 1);
  border-radius: 9999px;
  width: 0;
  height: 0;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
}

.nice-btn1:hover .transition {
  width: 14em;
  height: 14em;
}

.nice-btn1:active {
  transform: scale(0.97);
}
/* nice-btn1 --end-- */

/* nice-btn2 --start-- */
.ncie-btn2 {
  font-size: 16px;
  border: 1.5px solid black;
  padding: 10px;
  width: 60px;
  height: 30px;
  margin: 0 15px;
  line-height: 100%;
  color: #f5f0f0;
  background-color: #101014;
  box-shadow: 2px 2px 4px #101014;
  transition: transform 0.3s ease-in-out;
}
.ncie-btn2-submit {
  color: #f5f0f0;
  background-color: #101014;
  box-shadow: 2px 2px 4px #101014;
  &:hover {
    color: #f5f0f0 !important;
    background-color: #101014 !important;
  }
}
.ncie-btn2-cancel {
  color: black;
  background-color: #dcdce0;
  box-shadow: 2px 2px 4px #b9b9bc;
}
.ncie-btn2:hover {
  background-color: #f5f0f0;
  color: #101014;
  transform: scale(1.1);
}
/* nice-btn2 --end-- */
</style>
