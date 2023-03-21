import MyRequest from '../request/index'

const DLService = {
  /* 测试调用python */
  testPython(params: any) {
    const url = '/DL/test'
    return MyRequest.post(url, params)
  },
  /* 上传图像 */
  uploadObjDetImg(params: any) {
    const url = '/DL/uploadObjDetImgs'
    return MyRequest.post(url, params)
  },
  /* 进行目标检测 */
  doObjDetect(params: any) {
    const url = '/DL/doObjDetect'
    return MyRequest.post(url, params)
  },
  /* 预览上一次目标检测结果列表 */
  previewLastDetRes() {
    const url = '/DL/previewObjResList'
    return MyRequest.get(url)
  },
  /* 获取检测状态 */
  getDetStatus() {
    const url = '/DL/getDetStatus'
    return MyRequest.get(url)
  },
  /* 下载检测结果 */
  downloadDetRes() {
    const url = '/DL/downloadDetRes'
    return MyRequest.get(url, {}, { responseType: 'blob' })
  },
  /* 上传语义分割和信息提取的图像和标签文件 */
  uploadSegImgTxt(params: any) {
    const url = '/DL/uploadSegImgTxt'
    return MyRequest.post(url, params)
  },
  /* 进行语义分割和信息提取 */
  segExtract(params: any) {
    const url = '/DL/segExtract'
    return MyRequest.post(url, params)
  },
  /* 获取语义分割和信息提取的状态(进度) */
  getSegExtStatus() {
    const url = '/DL/getSegExtStatus'
    return MyRequest.get(url)
  },
  /* 预览信息提取结果 */
  previewSegExtRes() {
    const url = '/DL/previewSegExtRes'
    return MyRequest.get(url)
  },
  /* 上传计算体长所需的信息提取影像 */
  uploadSegExtRes(params: any) {
    const url = '/DL/uploadSegExtRes'
    return MyRequest.post(url, params)
  },
  /* 进行体长计算 */
  calBodyLength(params: any) {
    const url = '/DL/calBodyLength'
    return MyRequest.post(url, params)
  },
  /* 获取计算体长状态 */
  getCalBLtStatus() {
    const url = '/DL/getCalBLtStatus'
    return MyRequest.get(url)
  },
  /* 下载体长线计算结果 */
  downloadCalBLRes() {
    const url = '/DL/downloadCalBLRes'
    return MyRequest.get(url, {}, { responseType: 'blob' })
  },
}
export default DLService
