const express = require('express')
const cors = require('cors')
const path = require('path')
const Base64 = require('js-base64')
const joi = require('joi')
const { expressjwt } = require('express-jwt')
// Multer 是一个 node.js 中间件，用于处理 multipart/form-data 类型的表单数据，它主要用于上传文件。
const multer = require('multer')

const userRouter = require('./router/user')
const userInfoRouter = require('./router/userInfo')
const pythonDLRouter = require('./router/pythonDL')
const { jwtSecretKey, DL_uploadPath } = require('./config')

const app = express()

// 在server服务端下新建一个public文件，在public文件下新建upload文件用于存放图片
const upload = multer({ dest: DL_uploadPath + '/temp' })
//实例化multer，传递的参数对象，dest表示上传文件的存储路径
// app.use(upload.any()) //any表示任意类型的文件
app.use(upload.any())

app.use(
  cors({
    // origin: 'http://localhost:5173',
    // credentials: true,
  })
)

// 配置中间件更改最大文件传输大小
const bodyParser = require('body-parser')
app.use(bodyParser.json({ limit: '10mb' }))
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }))
// 配置解析表单数据的中间件
app.use(express.urlencoded({ extended: false }))
// 配置解析 json 数据
app.use(express.json())

/* 登录注册接口使用的响应数据的中间件 */
const validatorMW = (req, res, next) => {
  // status = 0 为成功； status !== 0 为失败； 默认将 status 的值设置为 1，方便处理失败的情况
  res.valid_cc = (err, status = 1) => {
    res.send({
      status,
      // 状态描述，判断 err 是 错误对象 还是 字符串
      msg: err instanceof Error ? err.message : err,
    })
  }
  next()
}

/* 密码解密中间件 */
const decodePwd = (req, res, next) => {
  if (req.body.password) {
    req.body.password = Base64.decode(Base64.decode(req.body.password))
  }
  next()
}

// 将静态资源托管，这样才能在浏览器上直接访问预览图片或则html页面
app.use(express.static(path.join(__dirname, './public/DL_files/users')))

/*
 * 解析token的中间件
 * 使用 .unless({ path: [/^\/api\//] }) 指定哪些接口不需要进行 Token 的身份认证
 */
app.use(expressjwt({ secret: jwtSecretKey, algorithms: ['HS256'] }).unless({ path: [/^\/api\//] }))
/* 全局中间件:将res.send进行了封装，简化代码 */
app.use(validatorMW)
// 导入使用用户路由模块
app.use('/api', decodePwd, userRouter)
// 导入用户信息路由模块
app.use('/userInfo', userInfoRouter)
// 导入调用python文件模块
app.use('/DL', pythonDLRouter)
// 定义错误中间件
app.use((err, req, res, next) => {
  // 验证失败导致的错误
  if (err instanceof joi.ValidationError) {
    return res.valid_cc(err)
  }
  // 捕获身份认证失败的错误
  if (err.name === 'UnauthorizedError') {
    let msg = err.code
    err.code === 'invalid_token' && (msg = '登录过期，请重新登录')
    err.code === 'credentials_required' && (msg = '请先登录')
    return res.status(401).send({ msg })
  }
  // 未知的错误
  res.send(err)
})

app.listen(3000, () => {
  console.log('spearhead-server running at http://127.0.0.1:3000')
})
