const child_process = require('child_process')
const { spawn } = require('child_process')
const db = require('../db/index')
const fs = require('fs')
const images = require('images')
const { DL_uploadPath } = require('../config')
const { mkdir, emptyDir, isRunning } = require('../utils/pythonDL')
const path = require('path')

// 设置环境
const condaEnv = 'ELK_torch'

let detWorkerProcess = {}
let segExtWorkerProcess = {}
let calBodyLentWorkerProcess = {}
let calBodyLenImgsTotal = {}
/* 上传待目标检测的图像 */
exports.uploadObjDetImgs = (req, res) => {
  const files = req.files
  const userAccount = req.auth.account
  // 设置放置文件的目标路径
  const destPath = path.join(__dirname, '../', `${DL_uploadPath}/users/${userAccount}/objDet/input`).replace(/\\/g, '/')
  // 判断目标路径是否存在并生成路径
  if (!mkdir(destPath)) {
    return res.valid_cc('error,请联系管理员')
  }
  // 现在的模式是检测前先清空该用户上一次的提交
  emptyDir(destPath)

  try {
    for (let file of files) {
      // 获取一上来就放置在设置的文件夹中的文件的名字
      const oldName = file.filename
      // 将文件的新名字修改为原图的名字
      const newName = file.originalname
      const id_ = new Date().getTime().toString().slice(-6)
      //改图片的名字,并移动到对应用户的目录下
      fs.renameSync(path.join(__dirname, '../', `${DL_uploadPath}/temp/${oldName}`), `${destPath}/${id_}_${newName}`)
    }
  } catch (error) {
    return res.valid_cc('上传影像失败，请联系管理员')
  }
  res.valid_cc('上传影像成功', 0)
}

/* 进行目标检测 */
exports.doObjDetect = (req, res) => {
  const userAccount = req.auth.account
  const outputDestPath = `${DL_uploadPath}/users/${userAccount}/objDet/output`

  const data = req.body
  let args = ''
  // 将前端传来的参数拼接成字符串,作为py文件的执行参数
  for (let arg in data) {
    args += ` --${arg} ${data[arg]}`
  }
  // 设置输入和输出路径
  const inDir = path.resolve(__dirname, '../', `${DL_uploadPath}/users/${userAccount}/objDet/input`).replace(/\\/g, '/')
  const outDir = path.resolve(__dirname, '../', `${DL_uploadPath}/users/${userAccount}/objDet/output`).replace(/\\/g, '/')
  // 清空目标输出路径下内容
  // 判断目标路径是否存在，没有则创建
  if (!mkdir(outDir)) {
    return res.valid_cc('error,请联系管理员')
  }
  emptyDir(outDir)

  // 清空预览文件夹
  const previewPath = path.join(__dirname, '../', `${DL_uploadPath}/users/${userAccount}/objDet/preview`).replace(/\\/g, '/')
  if (!mkdir(previewPath)) {
    return res.valid_cc('error,请联系管理员')
  }
  emptyDir(previewPath)

  if (fs.readdirSync(inDir).length === 0) {
    return res.valid_cc('暂无可处理数据')
  }
  // 为py文件拼接输入和输出路径参数
  args += ` --inDir ${inDir} --outDir ${outDir} --previewPath ${previewPath}`
  // 开启子进程调用python,此处用的是exec(),会新开启一个shell执行
  detWorkerProcess[userAccount] = child_process.exec(
    `activate ${condaEnv} && python _objectDetectNodePy.py ${args}`,
    { encoding: 'utf8', cwd: 'E:\\WORK\\ELK\\ELK' },
    (error, stdout, stderr) => {
      if (error) {
        console.log('error: ', error)
        return res.valid_cc(error, 1)
      }
      // console.log('stdout: ' + stdout)
      // console.log('stderr: ' + typeof stderr)
    }
  )
  detWorkerProcess[userAccount].on('exit', (code) => {
    if (code !== 0) {
      return res.valid_cc('出错了', 1)
    }
    res.valid_cc('处理完毕', 0)
    console.log('子进程已退出，退出码 ' + code)
  })
}

/* 预览目标检测结果 */
exports.previewObjResList = (req, res) => {
  const userAccount = req.auth.account
  const destPath = `${DL_uploadPath}/users/${userAccount}/objDet/output`
  let detResArr = []
  let dirName = fs.readdirSync(destPath)[0]
  fs.readdir(`${destPath}/${dirName}`, (err, files) => {
    if (err) {
      return res.valid_cc('暂无检测结果')
    }
    if (files.length === 0) return res.valid_cc('暂无检测结果')
    files.forEach((fileName) => {
      if (fileName !== 'labels') {
        let item = {
          name: '',
          path: '',
          count: 0,
        }
        item.name = fileName
        /*         // 返回给前端的图像请求路径
        if (['tif', 'tiff'].includes(fileName.split('.')[1])) {
          console.log('是tif')
          const input = fs.readFileSync(`${DL_uploadPath}/users/${userAccount}/objDet/output/${dirName}/${fileName}`)
          const image = new Tiff({ buffer: input })
          const dataUrl = image.toDataURL()
          item.path = dataUrl
        } else {
          item.path = `${userAccount}/objDet/output/${dirName}/${fileName}`
        } */
        item.path = `${userAccount}/objDet/output/${dirName}/${fileName}`

        // 获取文件名，无后缀
        const sufFileName = fileName.split('.')[0]
        // 拼接检测对应txt文件的绝对路径
        const detTxtFilePath = path.join(__dirname, '../', `${destPath}/${dirName}/labels/${sufFileName}.txt`)
        let count = 0
        if (!fs.existsSync(detTxtFilePath)) {
          detResArr.push(item)
        } else {
          // 读取txt文件流
          fs.createReadStream(detTxtFilePath)
            .on('data', (chunk) => {
              // 检测到换行的ASCII码(10)后count++
              for (i of chunk) {
                i === 10 && count++
              }
            })
            .on('end', () => {
              // 读取文件流是异步，得链式执行添加代码
              item.count = count
              detResArr.push(item)
              // 由于是异步，在这里判断一下并返回
              detResArr.length === files.length - 1 && res.send({ status: 0, msg: 'sucess', data: detResArr })
            })
        }
      }
    })
  })
}

/* 获取目标检测的子进程的状态,给用户返回状态 */
exports.getDetStatus = (req, res) => {
  const userAccount = req.auth.account
  const outPath = path.join(__dirname, '../', `${DL_uploadPath}/users/${userAccount}/objDet/output`).replace(/\\/g, '/')
  const projectName = fs.readdirSync(outPath)[0]
  // 根据执行目标检测的子进程的信息来判断检测状态
  // 现在这个判断规则不知道有没有风险，暂时是没问题
  // 先判断对应用户的目标检测任务进程时候存在，不存在说明没有检测任务或者已经完成
  if (!detWorkerProcess[userAccount]) {
    return res.valid_cc('空闲', 0)
  } else {
    // 对应用户存在检测任务进程，判断任务进程的exitCode是否为null(为null表示还在运行，否则已经结束)
    if (detWorkerProcess[userAccount].exitCode === null) {
      // 任务还在进行，但是获取不到生成的项目文件夹，表示还在初始化(在进行前置步骤)，返回此时的进度为0
      if (projectName === undefined) {
        return res.send({
          status: 1,
          msg: '检测中',
          data: { processPercentage: 0 },
        })
      }
      // 获取已经检测完成的图像的数量
      const handledNum = fs.readdirSync(`${outPath}/${projectName}`).length > 1 ? fs.readdirSync(`${outPath}/${projectName}`).length - 1 : 0
      // 获取需要处理的总图像数量
      const totalNum = fs.readdirSync(
        path.join(path.join(__dirname, '../', `${DL_uploadPath}/users/${userAccount}/objDet/input`).replace(/\\/g, '/'))
      ).length
      // 返回处理进度
      return res.send({
        status: 1,
        msg: '检测中',
        data: { processPercentage: Math.floor((handledNum / totalNum) * 100) },
      })
    } else {
      return res.valid_cc('空闲', 0)
    }
  }
}

/* 提供用户下载检测结果的压缩包 */
exports.downloadDetRes = (req, res) => {
  const userAccount = req.auth.account
  const outputPath = `${DL_uploadPath}/users/${userAccount}/objDet/output/`
  if (!fs.existsSync(outputPath) || fs.readdirSync(outputPath).length === 0) {
    return res.valid_cc('暂无结果')
  }
  const projectName = fs.readdirSync(outputPath)[0]
  const detResPath = path.join(__dirname, '../', `${outputPath}/${projectName}/labels/`).replace(/\\/g, '/')
  // downloadPath是用户下载的txt结果,去除了前缀，方便后续提取信息的逻辑
  const downloadPath = `${detResPath}/labels_download`
  // 判断downloadPath是否存在并清空
  if (fs.existsSync(downloadPath)) {
    emptyDir(downloadPath)
  } else {
    if (!mkdir(downloadPath)) {
      return res.valid_cc('出错了1')
    }
  }
  for (file of fs.readdirSync(detResPath)) {
    if (file.slice(-4) === '.txt') {
      const newFileName = file.slice(7)
      fs.copyFileSync(`${detResPath}/${file}`, `${downloadPath}/${newFileName}`)
    }
  }
  // 开启一个子进程压缩打包检测的txt结果
  const zipWorkerProcess = child_process.exec(`cd ${downloadPath} && tar -czvf ./${projectName}.zip ./*.txt`, (error, stdout, stderr) => {
    if (error) {
      return res.valid_cc(error, 1)
    }
  })
  zipWorkerProcess.on('exit', (code) => {
    if (code !== 0) {
      return res.valid_cc('出错了', 1)
    } else {
      // 打包成功向用户返回压缩包的文件流
      const zipReadStream = fs.createReadStream(`${downloadPath}/${projectName}.zip`)
      res.set({
        'Content-Type': 'application/octet-stream', // 告诉浏览器这是一个二进制文件
        'Content-Disposition': 'attachment; filename=' + `${projectName}.zip`, // 告诉浏览器这是一个需要下载的文件
      })
      zipReadStream.pipe(res)
    }
  })
}

/* 上传语义分割和信息提取的图像和标签文件 */
exports.uploadSegImgTxt = (req, res) => {
  const files = req.files
  const userAccount = req.auth.account
  // 设置放置影像和标签文件的目标路径
  const imgDestPath = path.join(__dirname, '../', `${DL_uploadPath}/users/${userAccount}/segExt/input/imgs`).replace(/\\/g, '/')
  const txtDestPath = path.join(__dirname, '../', `${DL_uploadPath}/users/${userAccount}/segExt/input/txts`).replace(/\\/g, '/')
  // 判断目标路径是否存在并生成路径
  if (!mkdir(imgDestPath) || !mkdir(txtDestPath)) {
    return res.valid_cc('error,请联系管理员')
  }
  // 现在的模式是检测前先清空该用户上一次的提交
  emptyDir(imgDestPath)
  emptyDir(txtDestPath)

  try {
    for (let file of files) {
      // 获取一上来就放置在设置的文件夹中的文件的名字
      const oldName = file.filename
      // 将文件的新名字修改为原图的名字
      const newName = file.originalname
      if (file.mimetype === 'text/plain') {
        fs.renameSync(path.join(__dirname, '../', `${DL_uploadPath}/temp/${oldName}`), `${txtDestPath}/${newName}`)
      } else {
        fs.renameSync(path.join(__dirname, '../', `${DL_uploadPath}/temp/${oldName}`), `${imgDestPath}/${newName}`)
      }
    }
  } catch (error) {
    return res.valid_cc('上传影像和标签失败，请联系管理员')
  }
  res.valid_cc('上传信息提取影像和标签成功', 0)
}

/* 语义分割和信息提取 */
exports.segExtract = (req, res) => {
  const userAccount = req.auth.account
  const { useLastDet, cutScale } = req.body
  let args = ''
  let imgsDir = ''
  let labelDir = ''
  const outDir = path.join(__dirname, '../', `${DL_uploadPath}/users/${userAccount}/segExt/output`).replace(/\\/g, '/')
  const projectName = fs.readdirSync(`${DL_uploadPath}/users/${userAccount}/objDet/output`)[0]
  // 判断目标路径是否存在并生成路径
  if (!mkdir(`${outDir}/processed`)) {
    return res.valid_cc('error,请联系管理员')
  }
  fs.existsSync(`${outDir}/processed`) && emptyDir(`${outDir}/processed`)
  if (useLastDet) {
    imgsDir = path.join(__dirname, '../', `${DL_uploadPath}/users/${userAccount}/objDet/input`).replace(/\\/g, '/')
    labelDir = path.join(__dirname, '../', `${DL_uploadPath}/users/${userAccount}/objDet/output/${projectName}/labels`).replace(/\\/g, '/')
    const txtDestPath = path.join(__dirname, '../', `${DL_uploadPath}/users/${userAccount}/segExt/input/txts`).replace(/\\/g, '/')
    // 判断目标路径是否存在并生成路径
    if (!mkdir(txtDestPath)) {
      return res.valid_cc('error,请联系管理员')
    }
    // 现在的模式是检测前先清空该用户上一次的提交
    emptyDir(txtDestPath)
    for (file of fs.readdirSync(labelDir)) {
      if (file.slice(-4) === '.txt') {
        fs.copyFileSync(`${labelDir}/${file}`, `${txtDestPath}/${file}`)
      }
    }
  } else {
    imgsDir = path.join(__dirname, '../', `${DL_uploadPath}/users/${userAccount}/segExt/input/imgs`).replace(/\\/g, '/')
    labelDir = path.join(__dirname, '../', `${DL_uploadPath}/users/${userAccount}/segExt/input/txts`).replace(/\\/g, '/')
  }
  if (fs.readdirSync(imgsDir).length === 0 || fs.readdirSync(labelDir).length === 0) {
    return res.valid_cc('暂无可处理数据')
  }
  args = `--img_dir ${imgsDir} --label_dir ${labelDir} --output_dir ${outDir} --cut_scale ${cutScale} `
  segExtWorkerProcess[userAccount] = child_process.exec(
    `activate ${condaEnv} && python _segExtractNodePy.py ${args}`,
    { encoding: 'utf8', cwd: 'E:\\WORK\\ELK\\ELK' },
    (error, stdout, stderr) => {
      if (error) {
        console.log('error: ', error)
        return res.valid_cc(error, 1)
      }
      // console.log('stdout: ' + stdout)
      // console.log('stderr: ' + typeof stderr)
    }
  )
  segExtWorkerProcess[userAccount].on('exit', (code) => {
    if (code !== 0) {
      return res.valid_cc('出错了', 1)
    }
    res.valid_cc('处理完毕', 0)
    console.log('子进程已退出，退出码 ' + code)
  })
}

/* 获取语义分割和信息提取的子进程的状态,给用户返回状态 */
exports.getSegExtStatus = (req, res) => {
  const userAccount = req.auth.account
  if (!segExtWorkerProcess[userAccount]) {
    return res.valid_cc('空闲', 0)
  } else {
    // 对应用户存在检测任务进程，判断任务进程的exitCode是否为null(为null表示还在运行，否则已经结束)
    if (segExtWorkerProcess[userAccount].exitCode === null) {
      const outDir = path.join(__dirname, '../', `${DL_uploadPath}/users/${userAccount}/segExt/output/processed`).replace(/\\/g, '/')
      // 获取已经检测完成的图像的数量
      const handledNum = fs.readdirSync(`${outDir}`).length
      // 获取需要处理的总图像数量
      const totalNum = fs.readdirSync(
        path.join(path.join(__dirname, '../', `${DL_uploadPath}/users/${userAccount}/segExt/input/txts`).replace(/\\/g, '/'))
      ).length
      // 返回处理进度
      return res.send({
        status: 1,
        msg: '检测中',
        data: { processPercentage: Math.floor((handledNum / totalNum) * 100) },
      })
    } else {
      return res.valid_cc('空闲', 0)
    }
  }
}

/* 预览语义分割和信息提取结果 */
exports.previewSegExtRes = (req, res) => {
  const userAccount = req.auth.account
  const destPath = `${DL_uploadPath}/users/${userAccount}/segExt/output/processed`
  let segExtResArr = []
  const files = fs.readdirSync(`${destPath}`)
  if (files.length === 0) {
    return res.valid_cc('暂无检测结果')
  }
  files.forEach((fileName) => {
    let item = {
      name: '',
      path: '',
    }
    item.name = fileName
    // 返回给前端的图像请求路径
    item.path = `${userAccount}/segExt/output/processed/${fileName}`
    segExtResArr.push(item)
  })
  res.send({ status: 0, msg: 'success', data: segExtResArr })
}

/* 下载语义分割和信息提取结果 */
exports.downloadSegExtRes = (req, res) => {}

/* 上传信息提取的结果 */
exports.uploadSegExtRes = (req, res) => {
  const files = req.files
  const userAccount = req.auth.account
  // 设置放置影像和标签文件的目标路径
  const segExtResPath = path.join(__dirname, '../', `${DL_uploadPath}/users/${userAccount}/calBodyLength/input`).replace(/\\/g, '/')
  // 判断目标路径是否存在并生成路径
  if (!mkdir(segExtResPath)) {
    return res.valid_cc('error,请联系管理员')
  }
  emptyDir(segExtResPath)

  try {
    for (let file of files) {
      const oldName = file.filename
      const newName = file.originalname
      fs.renameSync(path.join(__dirname, '../', `${DL_uploadPath}/temp/${oldName}`), `${segExtResPath}/${newName}`)
    }
  } catch (error) {
    return res.valid_cc('上传信息提取结果影像失败，请联系管理员！')
  }
  res.valid_cc('上传信息提取结果影像成功', 0)
}

/* 提取骨架线并且计算体长 */
exports.calBodyLength = (req, res) => {
  const userAccount = req.auth.account
  const { useLastSeg } = req.body
  let peocessedImgDir = ''
  const outDirPath = path.join(__dirname, '../', `${DL_uploadPath}/users/${userAccount}/calBodyLength/output`).replace(/\\/g, '/')
  peocessedImgDir = useLastSeg
    ? (peocessedImgDir = path.join(__dirname, '../', `${DL_uploadPath}/users/${userAccount}/segExt/output/processed`).replace(/\\/g, '/'))
    : (peocessedImgDir = path.join(__dirname, '../', `${DL_uploadPath}/users/${userAccount}/calBodyLength/input`).replace(/\\/g, '/'))
  if (fs.readdirSync(peocessedImgDir).length === 0) {
    return res.valid_cc('暂无可进行处理的数据')
  }
  calBodyLenImgsTotal[userAccount] = fs.readdirSync(peocessedImgDir).length
  // 判断目标路径是否存在并生成路径
  if (!mkdir(`${outDirPath}`)) {
    return res.valid_cc('error,请联系管理员')
  }
  emptyDir(`${outDirPath}`)

  /* 计算体长线需要三个大步骤:  tif转shp  -->  提取骨架线  -->  计算体长
   * 每个阶段的输入对应上一阶段的输出，用promise可以完美解决
   */
  new Promise((resolve, reject) => {
    console.log('开始进行体长线计算！！！！！')
    let args1 = `--img_dir ${peocessedImgDir} --out_dir ${outDirPath}`
    calBodyLentWorkerProcess[userAccount] = child_process.exec(
      `"D:/Program Files/ArcGIS/Python27/ArcGIS10.8/python" tif2shp.py ${args1}`,
      {
        encoding: 'utf8',
        cwd: 'E:\\WORK\\ELK\\elk_layout',
      },
      (error, stdout, stderr) => {
        if (error) {
          console.log('error: ', error)
          reject(error)
        }
      }
    )
    calBodyLentWorkerProcess[userAccount].on('exit', (code) => {
      if (code !== 0) {
        reject(new Error('出错了'))
      }
      resolve('tif2shp success!')
    })
  })
    .then((res) => {
      console.log(res)
      return new Promise((resolve, reject) => {
        let args2 = `--input_dir ${outDirPath}`
        calBodyLentWorkerProcess[userAccount] = child_process.exec(
          `activate ${condaEnv} && python _extractCenterLine.py ${args2}`,
          {
            encoding: 'utf8',
            cwd: 'E:\\WORK\\ELK\\ELK',
          },
          (error, stdout, stderr) => {
            if (error) {
              console.log('error: ', error)
              reject(error)
            }
          }
        )
        calBodyLentWorkerProcess[userAccount].on('exit', (code) => {
          if (code !== 0) {
            reject(new Error('出错了'))
          }
          resolve('提取骨架线 success!')
        })
      })
    })
    .then((res) => {
      console.log(res)
      return new Promise((resolve, reject) => {
        // 清空体长线输出的文件夹
        if (!mkdir(`${outDirPath}/bodyLength`)) {
          return res.valid_cc('error,请联系管理员')
        }
        emptyDir(`${outDirPath}/bodyLength`)
        let args3 = `--input_dir ${outDirPath}/SkeletonLine_outDir --out_dir ${outDirPath}/bodyLength`
        calBodyLentWorkerProcess[userAccount] = child_process.exec(
          `"D:/Program Files/ArcGIS/Python27/ArcGIS10.8/python" run_arcpy_utils.py ${args3}`,
          {
            encoding: 'utf8',
            cwd: 'E:\\WORK\\ELK\\elk_layout',
          },
          (error, stdout, stderr) => {
            if (error) {
              console.log('error: ', error)
              reject(error)
            }
          }
        )
        calBodyLentWorkerProcess[userAccount].on('exit', (code) => {
          if (code !== 0) {
            reject(new Error('出错了'))
          }
          resolve('计算完毕 success!')
        })
      })
    })
    .then((res) => {
      console.log(res)
      res.valid_cc('计算完毕', 0)
    })
    .catch((reason) => {
      res.valid_cc(reason)
    })
}

/* 获取计算体长线进程状态 */
exports.getCalBLtStatus = (req, res) => {
  const userAccount = req.auth.account
  if (!calBodyLentWorkerProcess[userAccount]) {
    return res.valid_cc('空闲', 0)
  } else {
    // 对应用户存在任务进程，判断任务进程的exitCode是否为null(为null表示还在运行，否则已经结束)
    if (calBodyLentWorkerProcess[userAccount].exitCode === null) {
      const totalNum = calBodyLenImgsTotal[userAccount]
      const outPath = path.join(__dirname, '../', `${DL_uploadPath}/users/${userAccount}/calBodyLength/output`).replace(/\\/g, '/')
      const toShpNum = fs.readdirSync(outPath).length
      let SktLingNum = 0
      let bodylenExlNum = 0
      fs.existsSync(`${outPath}/SkeletonLine_outDir`) && (SktLingNum = fs.readdirSync(`${outPath}/SkeletonLine_outDir`).length)
      fs.existsSync(`${outPath}/bodyLength`) &&
        (bodylenExlNum = fs.readdirSync(`${outPath}/bodyLength`).length > 0 ? fs.readdirSync(`${outPath}/bodyLength`).length - 1 : 0)
      if (toShpNum < 8 * totalNum) {
        // 8是每幅影像转shp会生成的文件数量，0.2为该步骤进度权重
        return res.send({ status: 1, msg: '计算中', data: { processPercentage: Math.floor((toShpNum / 8 / totalNum) * 100 * 0.2) } })
      } else if (SktLingNum < 4 * totalNum) {
        // 4是每幅影像转shp后再提取骨架线会生成的文件数量，0.1为该步骤进度权重
        return res.send({ status: 1, msg: '计算中', data: { processPercentage: 20 + Math.floor((SktLingNum / 4 / totalNum) * 100 * 0.1) } })
      } else {
        // 0.7为该步骤进度权重
        return res.send({ status: 1, msg: '计算中', data: { processPercentage: 30 + Math.floor((bodylenExlNum / totalNum) * 100 * 0.7) } })
      }
    } else {
      return res.valid_cc('空闲', 0)
    }
  }
}

/* 下载体长线结算结果 */
exports.downloadCalBLRes = (req, res) => {
  const userAccount = req.auth.account
  const bodyLenResPath = path.join(__dirname, '../', `${DL_uploadPath}/users/${userAccount}/calBodyLength/output/bodyLength`).replace(/\\/g, '/')
  if (fs.existsSync(bodyLenResPath) || fs.readdirSync(bodyLenResPath).length === 0) {
    return res.valid_cc('暂无结果展示')
  }

  // 开启一个子进程压缩打包计算的体长线csv结果
  const zipWorkerProcess = child_process.exec(`cd ${bodyLenResPath} && tar -czvf ./elk_body_length.zip ./*.csv`, (error, stdout, stderr) => {
    if (error) {
      return res.valid_cc(error)
    }
  })
  zipWorkerProcess.on('exit', (code) => {
    if (code !== 0) {
      return res.valid_cc('出错了', 1)
    } else {
      // 打包成功向用户返回压缩包的文件流
      const zipReadStream = fs.createReadStream(`${bodyLenResPath}/elk_body_length.zip`)
      res.set({
        'Content-Type': 'application/octet-stream', // 告诉浏览器这是一个二进制文件
        'Content-Disposition': 'attachment; filename=' + `elk_body_length.zip`, // 告诉浏览器这是一个需要下载的文件
      })
      zipReadStream.pipe(res)
    }
  })
}
