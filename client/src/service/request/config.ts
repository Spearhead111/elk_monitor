// const BASE_URL = 'http://127.0.0.1:3000'
const RequestConfig = {
  BASE_URL: import.meta.env.VITE_BASE_URL,
  TIMEOUT: 10000,
  FAIL: 500, // 服务器异常 server error
  LOGINTIMEOUT: 401, // 登录超时 login timeout
  SUCCESS: 200, // 请求成功 request successfully
}
export default RequestConfig
