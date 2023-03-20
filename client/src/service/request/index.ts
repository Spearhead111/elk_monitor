import axios, { AxiosInstance, AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios'
import { ElMessage, ElLoading, ElMessageBox } from 'element-plus'

import RequestConfig from './config'
import useUserStore from '@/stores/modules/user'

// response interface { code, msg, success }
// 不含 data
interface Result {
  code?: any
  status?: number
  msg: string
}

// request interface，包含 data
interface ResultData<T = any> extends Result {
  data?: T | any
}

// axios 基础配置
const config = {
  // 默认地址，可以使用 process Node内置的，项目根目录下新建 .env.development
  baseURL: RequestConfig.BASE_URL,
  timeout: RequestConfig.TIMEOUT, // 请求超时时间
  // withCredentials: true, // 跨越的时候允许携带凭证
}

class Request {
  service: AxiosInstance
  constructor(config: AxiosRequestConfig) {
    // 实例化 serice
    this.service = axios.create(config)

    /**
     * 请求拦截器
     * request -> { 请求拦截器 } -> server
     */
    this.service.interceptors.request.use(
      (config: any) => {
        const token = useUserStore().token ?? ''
        return {
          ...config,
          headers: {
            Authorization: token,
          },
        }
      },
      (error: AxiosError) => {
        // 请求报错
        Promise.reject(error)
      }
    )

    /**
     * 响应拦截器
     * response -> { 响应拦截器 } -> client
     */
    this.service.interceptors.response.use(
      (response: AxiosResponse) => {
        const { data, config } = response
        // 如果涉及到会重新传回token的接口,就将原先的token进行替换并重新解析用户信息
        if (data?.data?.token) {
          localStorage.setItem('token', data.data.token)
          useUserStore().decodeToken()
        }
        return data
      },
      (error: AxiosError | any) => {
        const { response } = error
        console.log(response)
        if (response) {
          const msg = response.data.msg
          this.handleCode(response.status, msg)
        }
        if (!window.navigator.onLine) {
          ElMessage.error('网络连接失败，请检查网络')
          location.href = '/404'
        }
      }
    )
  }

  /* 验证失败提示提示(401) */
  public reLogin = (msg: string = ''): void => {
    ElMessageBox.alert(msg, '系统提示', {
      confirmButtonText: 'reLogin',
      type: 'warning',
    }).then(() => {
      localStorage.removeItem('token')
      location.href = '/login'
    })
  }

  public handleCode = (code: number, responseMsg?: string): void => {
    switch (code) {
      case 401:
        this.reLogin(responseMsg)
        break
      case 404:
        location.href = '/404'
        break
      case 500:
        ElMessage.error('请求异常，请联系管理员')
        break
      default:
        ElMessage.error('请求失败')
        break
    }
  }
  // 通用方法封装
  get<T>(url: string, params?: object, config?: object): Promise<ResultData<T>> {
    return this.service.get(url, { params, ...config })
  }

  post<T>(url: string, params?: object, config?: object): Promise<ResultData<T>> {
    return this.service.post(url, params, config)
  }
  put<T>(url: string, params?: object): Promise<ResultData<T>> {
    return this.service.put(url, params)
  }
  delete<T>(url: string, params?: object): Promise<ResultData<T>> {
    return this.service.delete(url, { params })
  }
}

export default new Request(config)
