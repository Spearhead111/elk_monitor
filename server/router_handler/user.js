// 导入数据库操作模块
const db = require('../db/index')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const config = require('../config')
const userUtils = require('../utils/user')

// 注册处理函数
exports.register = (req, res) => {
  const { account, email } = req.body
  let { password } = req.body
  // 定义sql语句,查询用户名和邮箱是否被占用
  const countName = 'count'
  /* 根据sql语句union all 的顺序，返回的results为数组，第一个值是account的统计值，第二个是email的统计值 */
  const sqlStr_duplicateCheck = `SELECT COUNT(account) as ${countName} FROM spearhead_users where account=? UNION ALL SELECT COUNT(email) FROM spearhead_users where email=?;`
  db.query(sqlStr_duplicateCheck, [account, email], (err, results) => {
    // 执行sql语句失败
    if (err) {
      return res.valid_cc(err)
    }
    /* results的格式为：[ RowDataPacket { count: 0 }, RowDataPacket { count: 0 } ] */
    // console.log(results)
    // 如果account重复
    if (results[0][countName] && results[0][countName] > 0) {
      return res.valid_cc('账号名已存在，请更换账号名！', 1)
    }
    // 如果email重复
    if (results[1][countName] && results[1][countName] > 0) {
      return res.valid_cc('此邮箱已经注册，请直接登录或找回密码！', 2)
    }

    // 调用bcrypt.hashSync(明文密码, 随机盐的长度) 方法对密码进行加密
    password = bcrypt.hashSync(password, 10)

    const nickname = userUtils.randomName('可达鸭', 5)
    // 定义插入数据库的语句
    const sql_insertNewUser = `insert into spearhead_users set ?`
    db.query(sql_insertNewUser, { account, password, email, nickname }, (err, results) => {
      if (err) {
        return res.valid_cc(err)
      }
      if (results.affectedRows !== 1) {
        return res.valid_cc('注册新用户失败，请稍后再试！', 3)
      }
      res.valid_cc('注册成功！', 0)
    })
  })
}

// 登录处理函数
exports.login = (req, res) => {
  const { account, email } = req.body
  let { password } = req.body
  if (!account && !email) {
    return res.valid_cc('没有获取到账号名或邮箱！')
  }
  const sqlStr =
    account !== undefined ? `SELECT * FROM spearhead_users where account='${account}';` : `SELECT * FROM spearhead_users where email='${email}';`
  db.query(sqlStr, (err, results) => {
    if (err) {
      return res.valid_cc(err)
    }
    // 数据库查询不到账号名或邮箱
    if (results.length !== 1) {
      return res.valid_cc('账号名或密码有误！', 1)
    }
    // 对比密码
    const comparePwd = bcrypt.compareSync(password, results[0].password)
    if (!comparePwd) {
      return res.valid_cc('账号名或密码有误！', 2)
    }

    /* 剔除用户隐私信息，生成Token */
    const user = { ...results[0], password: null, user_pic: null }
    const tokenStr = jwt.sign(user, config.jwtSecretKey, { expiresIn: '5h' })
    // 将token传给用户 为了方便客户端使用 Token,在服务器端直接拼接上 Bearer 的前缀
    res.send({ status: 0, msg: '登陆成功', data: { token: 'Bearer ' + tokenStr, avatar: results[0].user_pic } })
  })
}
