// 导入定义验证规则的包
const joi = require('joi')
/**
 * string() 值必须是字符串
 * alphanum() 值只能是包含 a-zA-Z0-9 的字符串
 * min(length) 最小长度
 * max(length) 最大长度
 * required() 值是必填项，不能为 undefined
 * pattern(正则表达式) 值必须符合正则表达式的规则
 */

// 定义验证规则
const account = joi
  .string()
  .required()
  .pattern(/^[a-zA-Z][a-zA-Z0-9_]*$/)
const account_notRequired = joi.string().pattern(/^[a-zA-Z][a-zA-Z0-9_]*$/)
const email = joi
  .string()
  .required()
  .pattern(/^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/)
const email_notRequired = joi.string().pattern(/^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/)
const password = joi
  .string()
  .required()
  .pattern(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/)
// dataUri() 指的是如下格式的字符串数据：
// data:image/png;base64,VE9PTUFOWVNFQ1JFVFM=
const avatar = joi.string().dataUri().required()
const nickname = joi.string().required()
//对外暴露验证规则
exports.register_schema = {
  body: {
    account,
    email,
    password,
  },
}
exports.login_schema = {
  body: {
    account: account_notRequired,
    email: email_notRequired,
    password,
  },
}

// 验证规则对象 - 更新头像
exports.update_avatar_schema = {
  body: {
    avatar,
  },
}

// 验证规则对象 - 更新昵称
exports.update_nickname_schema = {
  body: {
    nickname,
  },
}
