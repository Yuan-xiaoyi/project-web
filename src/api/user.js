//引入request文件
import instance from './index';
 
//导出封装ok的请求
 
//查询需求申请列表,getURLList为请求名
const user = {
  /**
   * 若要传参
   * GET 用 params
   * POST 用 data
   */

   findUserByPhoneNumber: (data) => {
    return instance({
      url: '/findUserByPhoneNumber',
      method: 'get',
      params: data
    })
  },
  
  findAllUser: () => {
    return instance({
      url: '/findUser',
      method: 'post'
    })
  },
  findUserByUserId: (data) => {
    return instance({
      url: '/findUserByUserId',
      method: 'get',
      params: data
    })
  },
  updateUserinfo: (data) => {
    return instance({
      url: '/updateUserinfo',
      method: 'get',
      params: data
    })
  },
  insertUser: (data) => {
    return instance({
      url: '/insertUser',
      method: 'post',
      data: data
    })
  },
  deleteUser: (data) => {
    return instance({
      url: '/deleteUser',
      method: 'get',
      params: data
    })
  },
  // 获取验证码
  sendSms:(data) => {
    return instance({
      url: '/SendSms',
      method: 'get',
      params: data, 
    })
  },

  login: (data) => {
    return instance({
      url: '/login',
      method: 'get',
      params: data, 
    })
  },

  // 获取当前用户信息
  getUserInfo(){
    return instance({
      url: '/sys/user/info',
      method: 'get'
    })
  },
  // 获取所有用户
  getUserList(data){
    return instance({
      url: '/sys/user/list',
      method: 'get',
      params: data,
    })
  },
  
  register: (data) => {
    return instance({
      url: '/register',
      method: 'get',
      params: data, 
    })
  },

  del: (data) => {
    return instance({
      url: '/delUser',
      method: 'POST',
      data: data, 
    })
  },

  refreshToken: (data) =>{
    return instance({
      url: '/refreshToken',
      method: 'get',
      headers: {"refreshToken": true},
      params: data
    })
  }
}
export default user;