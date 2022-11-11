<template>
  <div style="height: 100%;">
    <div style="margin-bottom: 10px; float: right;">
      <el-button type="success" @click="add">新增用户</el-button>
    </div>
    <el-table
      :data="tableData.slice((currentPage-1)*pagesize,currentPage*pagesize)"
      height="calc(100% - 90px)"
      style="width: 100%; margin-bottom: 8px;"
    >
      <el-table-column prop="userName" label="用户名" width="" align="center"></el-table-column>
      <el-table-column prop="phoneNumber" label="电话" width="" align="center"></el-table-column>
      <el-table-column prop="post" label="职位" width="" align="center">
        <template slot-scope="scope">
          <span>{{judge(scope.row)}}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="" fixed="right" align="center">
        <template slot-scope="scope" style="display: inline-flex;">
          <el-button size="mini" @click="edit(scope.row)">编辑</el-button>
          <el-button size="mini" @click="del(scope.row)" style="color: red;">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="currentPage"
      :page-sizes="pagesizes"
      :page-size="pagesize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total"
    ></el-pagination>

    
    <el-dialog
      :title="dialogTitle"
      :visible.sync="dialogVisible"
      width="50%"
      :close-on-click-modal="false">
      <div>
        <el-form :model="dialogForm" :rules="rules" ref="dialogForm" label-width="100px" class="dialogForm" :inline="true">
          <el-form-item label="用户名称" prop="userName">
            <el-input v-model="dialogForm.userName" clearable></el-input>
          </el-form-item>
          <el-form-item label="电话" class="clumnIN2" prop="phoneNumber">
            <el-input v-model="dialogForm.phoneNumber" maxlength="11" clearable></el-input>
          </el-form-item>
          <el-form-item label="选择身份" prop="post"><!-- v-show="!idEdit" -->
            <el-select v-model="dialogForm.post" placeholder="请选择">
              <el-option
                v-for="item in posts"
                :key="item.post"
                :label="item.label"
                :value="item.post"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-form>
      </div>
      <div slot="footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="dialogConfirm">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import apiUser from "../../api/user"
export default {
  name: 'managePage',

  data() {
    return {
      tableData: [],
      currentPage: 1,
      pagesizes: [10, 20, 50, 100],
      pagesize: 10,
      total: 0,

      dialogForm:{
        post: "common"
      },
      dialogVisible: false,
      dialogTitle: "新增任务",
      isEdit: false,
      posts:[
        {
          label: "普通用户",
          post: "common"
        },{
          label: "超级管理员",
          post: "admin"
        },{
          label: "管理层",
          post: "manager"
        },
      ],
      rules:{
        userName:{required: true, message: '用户名不能为空', trigger: 'change' },
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
        post: [{ required: true, message: '用户职位不能为空', trigger: 'change' }],
      },
    };
  },

  mounted() {
    let userInfo = this.$cookie.get("userInfo") && JSON.parse(this.$cookie.get("userInfo"));
    if(userInfo){
      this.search() 
    }
  },

  methods: {
    resetForm() {
      if (this.$refs.dialogForm !== undefined)
        this.$refs['dialogForm'].resetFields();
    },
    search(){
      apiUser.findAllUser().then(res => {
        this.tableData = res
        this.total = res.length
      }).catch(e => {
        this.$message.error(e.msg)
      })
    },
    add(){
      this.resetForm()
      this.dialogForm = {}
      this.isEdit = false
      this.dialogTitle = "新增用户"
      this.dialogVisible = true
    },
    edit(row){
      this.isEdit = true
      this.dialogTitle = "编辑用户"
      this.dialogVisible = true
      apiUser.findUserByUserId({"userId": row.userId}).then(res => {
        this.dialogForm = res
      })
    },
    del(row){
      console.log(row)
      this.$confirm('确定删除此用户吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {   // 确定操作
        apiUser.deleteUser({"userId": row.userId}).then(res => {
          this.$message({
            type: 'success',
            message: '删除成功'
          });
          this.search();
        }).catch(e => {
          this.$message.error(e.msg)
        });
      }).catch(() => {  // 取消操作
        this.$message.info('已取消操作');
      });
    },
    dialogConfirm(){
      this.$refs['dialogForm'].validate((valid) => {
        if (valid) {
          if(this.isEdit){
            apiUser.updateUserinfo(this.dialogForm).then(res => {
              this.$message.success("修改信息成功")
              this.search();
              this.dialogVisible = false
            }).catch(e => {
              this.$message.error(e.msg)
            })
          }else{
            apiUser.insertUser(this.dialogForm).then(res => {
              this.$message.success("添加用户成功")
              this.search();
              this.dialogVisible = false
            }).catch(e => {
              this.$message.error(e.msg)
            })
          }
        }else{
          return false
        }
      })
    },

    judge(row){
      return this.posts.find(e => e.post == row.post).label;
    },
    handleSizeChange(val) {
      this.pagesize = val
    },
    handleCurrentChange(val) {
      this.currentPage = val
    },
  },
};
</script>

<style scoped>
.dialogForm >>> .el-form-item{
  width: 100%;
  text-align: left;
}
.dialogForm >>> .el-form-item__content{
  width: calc(100% - 160px);
}
</style>