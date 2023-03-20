// 导入数据库操作模块
const db = require('../db/index')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const userInfoUtils = require('../utils/userInfo')
const config = require('../config')

/* 更新用户头像 */
exports.updateAvatar = (req, res) => {
  const avatarBase64 = req.body.avatar
  if (userInfoUtils.base64ToFileSize(avatarBase64) > 2 * 1024 * 1024) {
    return res.valid_cc('图像不能超过2m', 1)
  }
  const sqlStr_updateAvatar = `update spearhead_users set user_pic=? where id=${req.auth.id}`
  db.query(sqlStr_updateAvatar, avatarBase64, (err, results) => {
    // 执行 SQL 语句失败
    if (err) return res.valid_cc(err, 1)
    // 执行 SQL 语句成功，但是影响行数不等于 1
    if (results.affectedRows !== 1) return res.valid_cc('更新头像失败！', 1)
    // 更新用户头像成功
    return res.valid_cc('更新头像成功！', 0)
  })
}

/* 更新用户昵称 */
exports.updateNickname = (req, res) => {
  const changedNickname = req.body.nickname
  const sqlStr_updateNickname = `update spearhead_users set nickname=? where id=${req.auth.id}`
  db.query(sqlStr_updateNickname, changedNickname, (err, results) => {
    // 执行 SQL 语句失败
    if (err) return res.valid_cc(err, 1)
    // 执行 SQL 语句成功，但是影响行数不等于 1
    if (results.affectedRows !== 1) return res.valid_cc('更新昵称失败！', 1)
    console.log(req.auth)
    const sqlStr_queryUserInfo = `SELECT * FROM spearhead_users where id=${req.auth.id}`
    db.query(sqlStr_queryUserInfo, (err, results) => {
      // 执行 SQL 语句失败
      if (err) return res.valid_cc(err, 1)
      /* 剔除用户隐私信息，生成Token */
      const user = { ...results[0], password: null, user_pic: null }
      const tokenStr = jwt.sign(user, config.jwtSecretKey, { expiresIn: '5h' })
      // 将token传给用户 为了方便客户端使用 Token,在服务器端直接拼接上 Bearer 的前缀
      return res.send({ status: 0, msg: '更新头像成功！', data: { token: 'Bearer ' + tokenStr } })
    })
  })
}
