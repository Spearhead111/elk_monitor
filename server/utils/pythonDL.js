const fs = require('fs')
const execs = require('child_process').exec

/* 根据路径生成文件夹(路径必须有开头) */
function mkdir(path) {
  let urlList = path.split('/')
  if (urlList.length < 2) {
    return false
  }
  let url = urlList[0] + '/' + urlList[1]
  let idx = 2
  while (url !== path) {
    url += '/' + urlList[idx++]
    if (!fs.existsSync(url)) {
      fs.mkdirSync(url)
    }
  }
  return true
}

/**
 * 删除指定目录下所有文件包括文件夹
 * @param {*} path
 */
function emptyDir(path) {
  const files = fs.readdirSync(path)
  files.forEach((file) => {
    const filePath = `${path}/${file}`
    const stats = fs.statSync(filePath)
    if (stats.isDirectory()) {
      emptyDir(filePath)
    } else {
      fs.unlinkSync(filePath)
      // console.log(`删除${file}文件成功`)
    }

    fs.existsSync(filePath) && fs.rmdirSync(filePath)
  })
}

/* 判断进程是否还在运行 */
const isRunning = (query, cb) => {
  let platform = process.platform
  let cmd = ''
  switch (platform) {
    case 'win32':
      cmd = `tasklist`
      break
    case 'darwin':
      cmd = `ps -ax | grep ${query}`
      break
    case 'linux':
      cmd = `ps -A`
      break
    default:
      break
  }
  execs(cmd, (err, stdout, stderr) => {
    cb(stdout.toLowerCase().indexOf(query.toLowerCase()) > -1)
  })
}

module.exports = { mkdir, emptyDir, isRunning }
