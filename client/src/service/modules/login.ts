import MyRequest from '../request/index'

export const LoginService = {
  /* 注册账号 */
  register(params: any) {
    const url = '/api/register'
    return MyRequest.post(url, params)
  },

  /* 登录 */
  login(params: any) {
    const url = '/api/login'
    return MyRequest.post(url, params)
  },

  test() {
    const url = '/asd'
    return MyRequest.get(url)
  },
}
