<template>
  <div class="topHeader">
    <img src="../assets/Header.png" alt="" class="headerImg">

    <el-menu
      :default-active="activeIndex"
      class="el-menu-demo"
      mode="horizontal"
      @select="handleSelect"
      background-color="var(--headerBgColor)"
      text-color="#fff"
      active-text-color="#ffd04b"
      style="padding-top: 5px"
    >
      <el-menu-item index="1">首&nbsp;&nbsp;页</el-menu-item>
      <el-menu-item index="2">项目中心</el-menu-item>
      <el-menu-item index="3">任务中心</el-menu-item>
      <el-menu-item index="4">个人中心</el-menu-item>
      <el-menu-item index="5" v-if="isAdmin">管理员中心</el-menu-item>
    </el-menu>


    <el-popover
      placement="bottom"
      width="150"
      trigger="click"
      style=" position: absolute;right: 0;"
    >  
      <div slot="reference" class="userHead">
        <div class="userImg1">
          <img :src="userHeadImg" alt="" class="userImg2">
        </div>
        <div class="userName">
          {{userName}}
        </div>
      </div>
      <div class="handleUser" @click="getOut">退出登录</div>
    </el-popover>
        
    <el-dialog
      title="修改个人信息"
      :close-on-click-modal="false"
      :visible.sync="dialogVisible"
      width="30%"
      :before-close="handleClose"
      style="margin-top: 5vh"
    >
      
      <el-form ref="form" :rules="rules" :model="form" label-width="80px" class="form">
        <el-form-item label="账户名称" prop="username">
          <el-input v-model="form.username"></el-input>
        </el-form-item>
        <el-form-item label="账户密码" prop="password">
          <el-input type="password" v-model="form.password"></el-input>
        </el-form-item>
        <el-form-item label="手机号码" prop="mobile">
          <el-input v-model="form.mobile" maxlength="11"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="form.email"></el-input>
        </el-form-item>
        <el-form-item label="账户头像" prop="image">
          <el-upload
            class="upload-demo"
            action=""
            :http-request="uploadMehod"
            :before-upload="beforeUpload"
            :on-preview="handlePreview"
            :on-success="handleSuccess"
            :on-remove="handleRemove"
            :before-remove="beforeRemove"
            multiple
            :limit="1"
            :on-exceed="handleExceed"
            :file-list="fileList">
            <el-button size="small" type="primary">点击上传</el-button>
            <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过2M</div>
          </el-upload>
        </el-form-item>
      </el-form>

      <el-dialog
        width="25%"
        title="请输入原密码二次确认"
        :visible.sync="innerVisible"
        append-to-body
        style="margin-top: 15vh"
      >
        <el-form ref="secondForm" :rules="rules" :model="secondForm" label-width="60px" class="form">
          <el-form-item label="密码" prop="password">
            <el-input type="password" v-model="secondForm.password" show-password></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button type="primary"  @click="secondConfirm('secondForm')">确认</el-button>
          <el-button @click="innerVisible = false">取 消</el-button>
        </span>
      </el-dialog>

      <span slot="footer" class="dialog-footer">
        <el-button type="primary"  @click="onSubmit('form')">确认修改</el-button>
        <el-button @click="dialogVisible = false">取 消</el-button>
      </span>
    </el-dialog>

  </div>
</template>

<script>
// import CryptoJS from "crypto-js";
import api from "../api/user.js";
const validateEmail = function validateEmail(rule, value, callback) {
  const emailReg = /^(([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5}){1,25})$/; // eslint-disable-line
  if (!value) {
    return callback();
  }
  setTimeout(() => {
    if (!emailReg.test(value)) {
      return callback(new Error("邮箱格式错误"));
    } else {
      callback();
    }
  }, 100);
};
export default {
  name: "Header",
  data() {
    return {
      isAdmin: false,
      activeIndex: '1',
      userInfo: {},
      userName: "游客模式",
      userHeadImg: require("../assets/HeaderTest.png"),
      dialogVisible: false,
      innerVisible: false,

      form: {
        name: "",
        password: "",
        mobile: "",
        email: "",
        image: ""
      },
      oldPassword: "",
      secondForm: {
        password: ""
      },
      rules: {
        username: [{ required: true, message: "请输入账户", trigger: "blur" }],
        password: [
          { required: true, message: "密码不能为空", trigger: "blur" }
        ],
        mobile: [
          {
            required: true,
            min: 11,
            max: 11,
            message: "手机号为11位",
            trigger: "change"
          },
          {
            trigger: "blur",
            validator: (rule, value, callback) => {
              var passwordreg = /^(((13[0-9]{1})|(15[0-9]{1})|(16[0-9]{1})|(17[3-8]{1})|(18[0-9]{1})|(19[0-9]{1})|(14[5-7]{1}))+\d{8})$/;
              console.log(passwordreg.test(value));
              if (!value) {
                return callback();
              } else if (!passwordreg.test(value)) {
                callback(new Error("请输入正确的手机号码"));
              } else {
                callback();
              }
            }
          }
        ],
        email: [
          { required: true, message: "邮箱必填", trigger: "blur" },
          { validator: validateEmail, trigger: "blur" }
        ]
      },
      fileList: []
    };
  },
  mounted() {
    let userInfo = this.$cookie.get("userInfo") && JSON.parse(this.$cookie.get("userInfo"));
    if (userInfo) {
      this.userInfo = userInfo;
      if (userInfo.userName) this.userName = userInfo.userName;
      if (userInfo.userHeadImg) this.userHeadImg = userInfo.userHeadImg;
      if(userInfo.post == "admin"){
        this.isAdmin = true
      }
    }
    this.handleSelect("1", ["1"])
  },
  methods: {
    handleSelect(key, keyPath) {
      this.$emit("childMsg", key);
    },

    modify() {
      document.getElementsByClassName("el-popover")[0].style.display = "none";

      let userId = JSON.parse(this.$cookie.get("userInfo")).userId;
      api
        .getUserInfo(userId)
        .then(result => {
          this.form = result.user;
          this.oldPassword = result.user.password;
        })
        .catch(e => {
          this.$message.error(e.msg);
        });
      this.dialogVisible = true;
    },

    onSubmit(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          this.innerVisible = true;
        } else {
          return false;
        }
      });
    },
    secondConfirm(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          api
            .verifyPassword(this.secondForm)
            .then(() => {
              let form1 = JSON.parse(JSON.stringify(this.form));
              form1.password = "";
              let form =
                this.oldPassword == this.form.password ? form1 : this.form;
              api
                .update(form)
                .then(res => {
                  this.$message.success({
                    message: res.msg + "，请重新登录"
                  });
                  this.getOut();
                })
                .catch(e => {
                  this.$message.error(e.msg ? e.msg : e.message);
                });
            })
            .catch(e => {
              this.$message.error(e.msg ? e.msg : e.message);
            });
        } else {
          return false;
        }
      });
    },

    getOut() {
      document.getElementsByClassName("el-popover")[0].style.display = "none";
      this.$router.push({ name: "Login" }); // 只能用 name
      this.$cookie.set("token", "");
      this.$cookie.set("userInfo", "");
    },
    handleClose() {
      this.dialogVisible = false;
    },

    uploadMehod(params) {
      console.log("http-request", params);
      this.fileList[0] = params.file;
    },
    handleRemove(file, fileList) {
      console.log("on-remove", file, fileList);
    },
    handlePreview(file) {
      console.log("on-preview", file);
    },
    beforeUpload(file) {
      const isJPG =
        file.type === "image/jpg" ||
        file.type === "image/png" ||
        file.type === "image/JPG" ||
        file.type === "image/PNG" ||
        file.type === "image/jpeg" ||
        file.type === "image/webp";
      const isLt2M = file.size / 1024 / 1024 < 2;

      if (!isJPG) {
        this.$message.error("请上传图片格式!");
      }
      if (!isLt2M) {
        this.$message.error("上传头像图片大小不能超过 2MB!");
      }
      return isJPG && isLt2M;
    },
    handleExceed(files, fileList) {
      console.log("on-exceed", files, fileList);
      this.$message.warning(`当前限制上传 1 个文件，请删除后再上传`);
    },
    handleSuccess(res, file) {
      this.fileList = URL.createObjectURL(file.raw);
    },
    beforeRemove(file) {
      console.log("before-remove", file);
    }
  }
};
</script>

<style scoped>
.topHeader{
  display: inline-flex;
  float: left;
}
.headerImg {
  width: 40px;
  height: 40px;
  float: left;
  margin: 13px 20px;
}
.el-menu.el-menu--horizontal {
  border-bottom: none
}
.userImg1 {
  width: 24px;
  height: 24px;
  margin-right: 10px;
  border: 1px solid var(--headerBgColor);
  border-radius: 50%;
  overflow: hidden;
}
.userImg2 {
  width: 24px;
  height: 24px;
}
.userName {
  line-height: 26px;
  max-width: 100px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.userHead {
  float: right;
  margin: 20px 36px;
  cursor: pointer;
  display: inline-flex;
}
.handleUser {
  font-size: 15px;
  cursor: pointer;
  margin: 2px 0;
  padding-left: 12px;
}
.handleUser:hover {
  background: rgb(84, 92, 100);
  color: white;
}
</style>
