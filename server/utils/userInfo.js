/* 通过base64获取图片大小 */
exports.base64ToFileSize = (base64) => {
  return atob(base64.split(',')[1]).length
}
