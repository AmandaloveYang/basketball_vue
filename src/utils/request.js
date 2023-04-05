import axios from 'axios'
import { MessageBox, Message } from 'element-ui'
import store from '@/store'
import { getToken } from '@/utils/auth'

// 创建axios实例
const service = axios.create({
  baseURL: process.env.VUE_APP_BASE_API, // url = 基础url + 请求url
  // withCredentials: true, // 跨域请求时发送cookie
  timeout: 5000, // 请求超时时间
})

// 请求拦截器
service.interceptors.request.use(
  config => {
    // 在发送请求之前做些什么

    if (store.getters.token) {
      // 让每个请求携带token
      // ['X-Token'] 是自定义头部键值对，请根据实际情况修改
      config.headers['X-Token'] = getToken()
    }
    return config
  },
  error => {
    // 对请求错误做些什么
    console.log(error) // 调试用
    return Promise.reject(error)
  },
)

// 响应拦截器
service.interceptors.response.use(
  /**
   * 如果您想获得诸如头信息或状态之类的http信息
   * 请返回 response => response
  */

  /**
   * 通过自定义代码确定请求状态
   * 这里只是一个例子
   * 您还可以通过HTTP状态代码判断状态
   */
  response => {
    const res = response.data

    // 如果自定义代码不是200，则判断为错误。
    if (res.code !== 200 && res.status !== 200) {
      Message({
        message: res.message || '错误',
        type: 'error',
        duration: 5 * 1000,
      })

      // 50008：非法令牌；50012：其他客户端登录；50014：令牌过期；
      if (res.code === 50008 || res.code === 50012 || res.code === 50014) {
        // 重新登录
        MessageBox.confirm('您已注销，您可以取消停留在此页面，或重新登录', '确认注销', {
          confirmButtonText: '重新登录',
          cancelButtonText: '取消',
          type: 'warning',
        }).then(() => {
          store.dispatch('user/resetToken').then(() => {
            location.reload()
          })
        })
      }
      return Promise.reject(new Error(res.message || '错误'))
    } else {
      return res
    }
  },
  error => {
    console.log('err' + error) // 调试用
    Message({
      message: error.message,
      type: 'error',
      duration: 5 * 1000,
    })
    return Promise.reject(error)
  },
)

export default service
