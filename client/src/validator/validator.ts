export class Validator {
  /* 验证手机号 */
  static checkePhonenumber = (rule: any, value: any, callback: any) => {
    if (value) {
      const reg = /^1([38][0-9]|4[579]|5[0-3,5-9]|6[6]|7[0135678]|9[89])\d{8}$/
      if (!reg.test(value)) {
        return callback(new Error('请输入正确的手机号格式'))
      } else {
        return Promise.resolve()
      }
    } else {
      return Promise.reject('请输入手机号')
    }
  }

  /* 标准名称(账号)：只能包含英文字母、数字和下划线（以字母开头） */
  static standardName = (rule: any, value: any, callback: any) => {
    if (value) {
      const reg = /^[a-zA-Z][a-zA-Z0-9_]*$/
      if (!reg.test(value)) {
        return callback(new Error('账号名只能包含英文字母、数字和下划线(字母开头)'))
      } else {
        return callback()
      }
    } else {
      return callback(new Error('账号名不能为空'))
    }
  }

  /* 校验邮箱 */
  static checkemail = (rule: any, value: any, callback: any) => {
    if (value) {
      const reg = /^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/
      if (!reg.test(value)) {
        return callback(new Error('请输入正确的的邮箱格式'))
      } else {
        return callback()
      }
    } else {
      return callback(new Error('请输入邮箱'))
    }
  }

  /* 密码：至少为8位,必须包含数字和字母 */
  static password = (rule: any, value: any, callback: any) => {
    if (value) {
      const reg = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/
      if (!reg.test(value)) {
        return callback(new Error('密码至少8位且须包含数字和字母'))
      } else {
        return callback()
      }
    } else {
      return callback(new Error('密码不能为空'))
    }
  }
}
