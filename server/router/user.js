const express = require('express')
const router = express.Router()

// 导入用户路由处理函数模块
const userHandler = require('../router_handler/user')
// 导入验证表单数据的中间件
const expressJoi = require('@escook/express-joi')
// 导入需要验证的规则对象
const { register_schema, login_schema } = require('../schema/user')
// 注册
router.post('/register', expressJoi(register_schema), userHandler.register)

// 登录
router.post('/login', expressJoi(login_schema), userHandler.login)

module.exports = router
