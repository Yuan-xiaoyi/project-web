<template>
<div class="test">
  <div class="login">
    <div style="display:flex">
      <div class="title">登录</div> 
      <!--  :class="{active: active}"  @click="active = !active" -->
      <!-- <div class="title" :class="{active: !active}" @click="active = !active"
        style="border-left:1px solid var(--borderColor)">注册</div> -->
    </div>

    <el-form
      class="inner" ref="form" :rules="rules"
      :model="form" label-width="65px"
      :style="{'display': active ? 'block' : 'none'}"
      style="margin-top: 60px"
    >
      <el-form-item label="手机号" prop="phoneNumber">
        <el-input v-model="form.phoneNumber" maxlength="11"></el-input>
      </el-form-item>
      <el-form-item label="验证码" prop="captcha">
        <el-row :gutter="20">
          <el-col :span="11" style="padding-left: 0">
            <el-input v-model="form.captcha">
            </el-input>
          </el-col>
          <el-col :span="10" class="login-captcha">
            <el-button :loading="loading" :disabled="!truePhoneNumber" type="primary" plain @click="getCaptcha()">{{text}}</el-button>
          </el-col>
        </el-row>
      </el-form-item>
      <el-form-item>
        <el-button class="btn" type="primary" @click.prevent="login('form')">登 录</el-button>
      </el-form-item>
    </el-form>

  </div>
</div>
</template>

<script>
const config = require('../../config/index.js')
import apiUser from '../api/user';
// import { getUUID } from '../utils/index'
export default {
  name: "Login",
  data() {
    return {
      active: true,
      form: {
        uuid: '',
        phoneNumber: '',
        captcha: ''
      },
      captchaPath: '',
      rules:{
        phoneNumber: [{required: true, min:11, max:11, message: '请输入11位手机号', trigger: 'change' },
          {
            trigger: 'change',
            validator: (rule, value, callback) => {
              var passwordreg = /^(((13[0-9]{1})|(15[0-9]{1})|(16[0-9]{1})|(17[3-8]{1})|(18[0-9]{1})|(19[0-9]{1})|(14[5-7]{1}))+\d{8})$/
              this.truePhoneNumber = false
              if (!value) {
                return callback(
                  new Error(
                    '手机号码不能为空'
                  )
                )
              }else if (!passwordreg.test(value)) {
                callback(
                  new Error(
                    '请输入正确的手机号码'
                  )
                )
              } else {
                callback()
                this.truePhoneNumber = true
              }
            }
          }
        ],
        captcha: [
          { required: true, message: '验证码不能为空', trigger: 'blur' }
        ],
      },
      text: "获取验证码",
      second: 60,
      truePhoneNumber: false,
      loading: false
    };
  },
  created () {
  },
  methods: {
    // 获取验证码
    getCaptcha() {
      let that = this
      that.loading = true
      apiUser.sendSms({'telephone': that.form.phoneNumber}).then(res => {
        that.$message.success(res.message)  
        that.loading = false
        that.truePhoneNumber = false
        let sh = setInterval(function(){
          that.text = that.second + "秒..."
          that.second--
        }, 1000);
            
        setTimeout(() => {
          clearInterval(sh);
          that.truePhoneNumber = true
          that.text = "获取验证码"
          that.second = 60
        }, 62000)
      }).catch(e => {
        that.$message.error(e.message)
        that.loading = false
      });
    },
    login(formName) {
      console.log(this.form)
      this.$refs[formName].validate((valid) => {
        if (valid) {
          apiUser.login({"phoneNumber": this.form.phoneNumber, "code": this.form.captcha}).then(res => {
            if(res.token){
              this.$cookie.set('token', res.token)
            }
            apiUser.findUserByPhoneNumber({"phoneNumber": this.form.phoneNumber}).then(result => {
              this.$cookie.set('userInfo', JSON.stringify(result))
              this.$router.push({name:'Home'});
              this.$message.success(res.msg)
            }).catch(e => {
              this.$message.error(e.msg)
            });
          }).catch(e => {
            this.$message.error(e.msg)
          });
        } else {
          return false;
        }
      });
    }
  },
};
</script>

<style scoped>
a {
  text-decoration: none;
  font-size: 12px;
  color: white;
  float: right;
  margin: -20px 20px 0 0;
}
.test {
  width: 100%;
  height: 100%;
  font-family: "宋体";
  background-image: url('../assets/bg.jpg');
  background-position: 40% center;
  background-repeat: no-repeat;
  background-size: cover;
}
.login {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 370px;
  height: 400px;
  text-align: center;
  background: rgba(50, 50, 50, 0.8);
  border-radius: 10px;
}
.title {
  margin-top: 0px;
  margin-bottom: 0px;
  line-height: 50px;
  color: white;
  border-bottom: 1px solid var(--borderColor);
  width: 100%;
}
.inner {
  margin: 0 36px 0 25px;
}
.inner >>> .el-form-item{
  margin-bottom: 40px;
}
.inner >>> .el-form-item__label{
  color: white;
}
.inner >>> .el-form-item.is-required:not(.is-no-asterisk) .el-form-item__label-wrap>.el-form-item__label:before,
.inner >>> .el-form-item.is-required:not(.is-no-asterisk)>.el-form-item__label:before{
  color: transparent;
}
input {
  width: 170px;
  height: 34px;
  border-radius: 5px;
  color: black;
}
span {
  font-size: 12px;
  color: silver;
  margin-left: -80px;
}
.btn {
  width: 100%;
  height: 40px;
}
.active {
  color: wheat;
}
.login-captcha {
    height: 0;
    cursor: pointer;
}
.inner >>> .el-input__inner{
  background-color: rgba(50, 50, 50, 0.1);
  color: wheat;
}

.el-button--primary.is-plain{
  color: white;
  background: transparent;
}
.el-button--primary.is-plain.is-disabled,
.el-button--primary.is-plain.is-disabled:active,
.el-button--primary.is-plain.is-disabled:focus,
.el-button--primary.is-plain.is-disabled:hover{
  color: gray;
  background-color: transparent;
}
</style>