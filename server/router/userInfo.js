const express = require('express')
const router = express.Router()

const userInfoHandler = require('../router_handler/userInfo')

// 导入验证数据合法性的中间件
const expressJoi = require('@escook/express-joi')
// 在 /router/userinfo.js 模块中，导入需要的验证规则对象：
const { update_avatar_schema, update_nickname_schema } = require('../schema/user')
// 更新用户头像
router.post('/updateAvatar', expressJoi(update_avatar_schema), userInfoHandler.updateAvatar)
// 更新用户昵称
router.post('/updateNickname', expressJoi(update_nickname_schema), userInfoHandler.updateNickname)

module.exports = router
