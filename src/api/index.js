//引入axios和封装好的config
import axios from 'axios';
import Vue from 'vue';
import apiUser from './user'
const config = require('../../config/index')

// axios.defaults.headers['Content-Type'] = 'application/json;charset=utf-8' 
const instance = axios.create({
    baseURL: config.BASE_URL,
    //超时时间，根据项目需求，决定是否启用
    //如有文件上传需求，建议设置大一些 或 另外创建一个axios实例 负责文件上传
    timeout: 1000 * 60 
});
 
//如有需要，可在请求发起之前，做拦截处理
instance.interceptors.request.use(
  request => {
    // 判断是否存在token,把token添加点请求头中，每次请求携带token传给后端
    if (Vue.cookie.get('token')) {
      request.headers['token'] = Vue.cookie.get('token') // 请求头带上token
    }
    return request
  },
  // error => {
  //   //处理错误请求
  //   return Promise.reject(error)
  // }
  error => {
    if (error.response && error.response.status === 401) {
      // 清除token
      // 清除用户信息
      this.$cookie.set('token', '')
      this.$cookie.set('userInfo', '')

      // 提示错误信息
      this.$message.error(error.response.data.message);

      // 跳转到登录页面进行传值
      this.$router.push('/login')
      // Router.push('/login?redirect=' + window.location.href.split('#')[1])
    }
    return Promise.reject(error)
  }
)
 
//如有需要，可在请求收到回复之后，做拦截处理
instance.interceptors.response.use(
  (res) => {
    // 是否需要刷新token, 前端调用接口
    // if(res.headers.refreshtoken == "true"){
    //   let userInfo = Vue.cookie.get("userInfo") && JSON.parse(Vue.cookie.get("userInfo"));
    //   apiUser.refreshToken({phoneNumber: userInfo.phoneNumber}).then(r => {
    //     if(r.token){
    //       Vue.cookie.set('token', r.token)
    //     }
    //   });
    // }
    
    // 是否需要刷新token
    if(res.headers.refreshtoken){
      Vue.cookie.set('token', res.headers.refreshtoken)
    }

    //请根据项目前后端约定，更改对应字段取值
    let resData = res.data;
    let code = resData.code || '200';
    if(code != '200'){
      if(res.config.commonHandleError !== false){
          
        // this.$Message.showToast({
        //     title: "网络连接错误，请稍后再试",
        //     icon: "fail", //success 成功， fail 失败
        //     duration: 1500
        // })

        // Message.error(resData && resData.message || '网络连接错误，请稍后再试');
      }
      //将数据暴露给调用函数，以便调用方使用catch捕获做个性化处理
      return Promise.reject(resData);
    }

    return resData;
  }, (error) => {
    console.log(error);
    
    // this.$Message.showToast({
    //     title: "网络连接错误，请稍后再试",
    //     icon: "fail", //success 成功， fail 失败
    //     duration: 1500
    // })

    //Message.error((error && error.message) || '网络连接错误，请稍后再试')
    
    return Promise.reject(error);
  }
)
 
//导出
export default instance;