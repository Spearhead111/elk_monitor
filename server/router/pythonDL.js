const express = require('express')
const router = express.Router()

const pythonDLHandler = require('../router_handler/pythonDL')

/* 上传目标检测图像 */
router.post('/uploadObjDetImgs', pythonDLHandler.uploadObjDetImgs)
/* 进行目标检测 */
router.post('/doObjDetect', pythonDLHandler.doObjDetect)
/* 预览目标检测的结果list */
router.get('/previewObjResList', pythonDLHandler.previewObjResList)
/* 获取目标检测状态 */
router.get('/getDetStatus', pythonDLHandler.getDetStatus)
/* 下载检测结果 */
router.get('/downloadDetRes', pythonDLHandler.downloadDetRes)
/* 上传语义分割和信息提取的图像和标签文件 */
router.post('/uploadSegImgTxt', pythonDLHandler.uploadSegImgTxt)
/* 进行语义分割和信息提取 */
router.post('/segExtract', pythonDLHandler.segExtract)
/* 获取语义分割和信息提取的子进程的状态,给用户返回状态 */
router.get('/getSegExtStatus', pythonDLHandler.getSegExtStatus)
/* 预览语义分割和信息提取结果 */
router.get('/previewSegExtRes', pythonDLHandler.previewSegExtRes)
/* 下载语义分割和信息提取结果 */
router.post('/downloadSegExtRes', pythonDLHandler.downloadSegExtRes)
/* 上传信息提取的结果 */
router.post('/uploadSegExtRes', pythonDLHandler.uploadSegExtRes)
/* 提取骨架线并且计算体长 */
router.post('/calBodyLength', pythonDLHandler.calBodyLength)
/* 获取计算体长进程状态 */
router.get('/getCalBLtStatus', pythonDLHandler.getCalBLtStatus)
/* 下载体长线计算结果 */
router.get('/downloadCalBLRes', pythonDLHandler.downloadCalBLRes)

module.exports = router
