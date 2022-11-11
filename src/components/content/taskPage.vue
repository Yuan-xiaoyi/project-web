<template>
  <div style="height: 100%">
    <el-form class="task" :model="task" label-width="100px">
      <el-form-item label="选择项目" v-show="!isEdit">
        <!-- <el-select v-model="task.projectId" placeholder="请选择">
          <el-option
            v-for="item in projects"
            :key="item.projectId"
            :label="item.projectName"
            :value="item.projectId"
          ></el-option>
        </el-select> -->

        <el-select v-model="task.projectId" placeholder="请选择" filterable :filter-method="dataFilter(task.projectId, projects, 'task')" clearable>
          <el-option
            v-for="item in projects"
            :key="item.projectId"
            :label="item.projectName"
            :value="item.projectId"
          ></el-option>
        </el-select>

      </el-form-item>
      <el-form-item label="任务名称">
        <el-input v-model="task.taskName" clearable></el-input>
      </el-form-item>
      <el-form-item label="任务状态">
        <el-select v-model="task.state" placeholder="请选择">
          <el-option
            v-for="item in states"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item  label="任务创建时间">
        <el-date-picker
          v-model="task.createTime"
          type="month"
          placeholder="选择时间"
          value-format="yyyy-MM"
        ></el-date-picker>
      </el-form-item>
      
      <el-form-item>
        <el-button type="primary" @click="search()">查询</el-button>
      </el-form-item>
    </el-form>
    
    <el-divider></el-divider>
    <div style="margin-bottom: 10px; float: right;">
      <el-button type="primary" @click="exportTable">导出表格</el-button>
      <el-button type="success" @click="add">新建任务</el-button>
    </div>
    <el-table
      :data="tableData.slice((currentPage-1)*pagesize,currentPage*pagesize)"
      id="exportTable"
      height="calc(100% - 180px)"
      style="width: 100%; margin-bottom: 8px;"
      @row-click="deal"
    >
      <el-table-column prop="taskName" label="任务名" width="" align="center"></el-table-column>
      <!-- <el-table-column prop="details" label="任务描述" width="" align="center"></el-table-column> -->
      <el-table-column label="任务状态" width="200" align="center">
        <template slot-scope="scope">
            <!-- :type="" -->
          <el-tag
            v-if="scope.row.state != undefined"
            disable-transitions
            :type="scope.row.state == 0 ? '':'success'"
          >{{judge(scope.row.state)}}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="projectName" label="所属项目" width="" align="center"></el-table-column>
      <el-table-column prop="createPerson" label="创建人" width="100" align="center"></el-table-column>
      <el-table-column prop="createTime" label="创建时间" width="120" align="center"></el-table-column>
      <el-table-column label="要求完成时间" width="200" align="center">
        <template slot-scope="scope" style="display: inline-flex;">
          <span :class="{'color_yellow': scope.row.taskStatus == 1, 'color_red': scope.row.taskStatus == -1}"
          >{{scope.row.deadline}}</span>
        </template>
      </el-table-column>
      <el-table-column prop="overTime" label="任务完成时间" width="200" align="center"></el-table-column>
      <el-table-column prop="handPerson" label="处理人" width="100" align="center"></el-table-column>
      <el-table-column prop="solveDetails" label="任务处理结果" width="" align="center"></el-table-column>
      <el-table-column label="操作" width="100" fixed="right" align="center">
        <template slot-scope="scope" style="display: inline-flex;">
          <el-popover
            placement="bottom"
            width="80"
            trigger="hover"
            @show="getMemberRole(scope.row)"
          >  
            <div slot="reference" style="font-size: 25px;height: 32px;cursor: pointer;">...</div>
            <div class="popBtns">
              <el-button size="mini" @click="deal(scope.row)">处理详情</el-button>
              <!-- <el-button size="mini" @click="edit(scope.row)">编辑</el-button> -->
              <el-button size="mini" @click="del(scope.row)" v-if="isCurrentXMmanger || isAdminOrManager" style="color: red;">删除</el-button>
            </div>
            
          </el-popover>
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
        <el-form :model="dialogForm" label-width="120px" :rules="rules" class="dialogForm" ref="dialogForm" :inline="true">
          <el-form-item label="选择项目" prop="projectId" v-show="!isEdit">
            <el-select v-model="dialogForm.projectId" placeholder="请选择" filterable :filter-method="dataFilter(dialogForm.projectId, projects)" clearable @change="getHandles">
              <el-option
                v-for="item in projects"
                :key="item.projectId"
                :label="item.projectName"
                :value="item.projectId"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="任务名称" prop="taskName">
            <el-input v-model="dialogForm.taskName" clearable></el-input>
          </el-form-item>
          <el-form-item label="任务描述" prop="details" class="clumnIN2">
            <el-input v-model="dialogForm.details" type="textarea" :rows="5" :maxlength="200" show-word-limit></el-input>
          </el-form-item>
          <!-- <el-form-item label="截至完成时间" v-show="!isEdit">
            <el-date-picker v-model="dialogForm.overTime" type="datetime" placeholder="选择日期时间"></el-date-picker>
          </el-form-item> -->
          <el-form-item label="要求完成时间" prop="deadline" v-show="!isEdit">
            <el-date-picker v-model="dialogForm.deadline" type="datetime" placeholder="选择日期时间" :picker-options="pickerOptions"></el-date-picker>
          </el-form-item>
          <el-form-item label="指派给" prop="handPersonId" v-show="!isEdit">
            <el-select v-model="dialogForm.handPersonId" placeholder="请选择">
              <el-option
                v-for="item in handlers"
                :key="item.userId"
                :disabled="item.disabled"
                :label="item.userName"
                :value="item.userId"
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

    <el-dialog
      title="任务处理"
      class="stageDialog"
      :visible.sync="dealVisible"
      width="70%"
      :close-on-click-modal="false"
    >
      <div class="details">
        <div class="detail_label">任务名称</div>
        <div class="detail_value">{{dealForm.taskName}}</div>
      </div>
      <div class="details">
        <div class="detail_label">任务描述</div>
        <div class="detail_value">{{dealForm.details}}</div>
      </div>
      <div v-for="(item,index) in dealForm.dealList" :key="index" class="details_father">
        <div v-if="item.userName" class="details">
          <div class="detail_label">处理人</div>
          <div class="detail_value">{{item.userName}}</div>
        </div>
        <div class="details">
          <div class="detail_label">处理详情</div>
          <div class="detail_value">{{item.solveDetails ? item.solveDetails : "尚未处理"}}</div>
        </div>
        <div v-if="item.checkDetails" class="details">
          <div class="detail_label">审核详情</div>
          <div class="detail_value">{{item.checkDetails}}</div>
        </div>
      </div>

      <div v-if="(dealForm.state == 0 || dealForm.state == 3) && isCurrentRWdealer" >
        <div class="details">
          <div class="detail_label" style="margin-bottom: 20px;">处理</div>
          <el-input v-model="inputDeal" class="detail_value" type="textarea" :maxlength="200" show-word-limit placeholder="请输入处理情况" :rows="5"/>
        </div>
        <div class="details" style="margin-left: calc(50% - 20px)">
          <el-button type="primary" @click="submit">提交</el-button>
        </div>
      </div>

      <div v-if="dealForm.state == 1 && isCurrentRWchecker">
        <div class="details">
          <div class="detail_label" style="margin-bottom: 20px;">审核</div>
          <el-input v-model="inputDeal" class="detail_value" type="textarea" :maxlength="200" show-word-limit placeholder="请输入修改意见" :rows="5"/>
        </div>
        <div v-show="false" class="details">
          <div class="detail_label" style="margin-bottom: 20px;">是否更换任务处理人</div>
          <el-select v-model="dealForm.dealList[dealForm.dealList.length - 1].handPersonId" placeholder="选择任务处理人"
            style="margin-bottom: 12px;"
          >
            <el-option
              v-for="item in handlers"
              :key="item.userId"
              :disabled="item.disabled"
              :label="item.userName"
              :value="item.userId">
            </el-option>
          </el-select>
        </div>
        <div class="details" style="margin-left: calc(50% - 80px)">
          <el-button type="primary" @click="pass">审核通过</el-button>
          <el-button type="default" @click="notpass">退回修改</el-button>
        </div>
      </div>

    </el-dialog>

  </div>
</template>

<script>
import { export_json_to_excel } from "../../utils/excel/export2Excel"
import apiProject from "../../api/project"
import apiTask from "../../api/task"
export default {
  name: 'taskPage',
  data() {
    return {
      userInfo: "",
      isAdminOrManager: false,
      isCurrentXMmanger: false,
      isCurrentRWdealer: false,
      isCurrentRWchecker: false,
      // isXMmanger: false,
      projectId: "",
      task:{
        projectId: "",
        taskName: "",
        state: '',
        createTime: "",
        isTask: 1
      },
      states: [
        {
          label: '请选择...',
          value: ''
        },{
          label: '未完结',
          value: 0
        },{
          label: '已完结',
          value: 1
        }
      ],
      tableData: [],
      currentPage: 1,
      pagesizes: [10, 20, 50, 100],
      pagesize: 10,
      total: 14,

      dialogVisible: false,
      dialogTitle: "新增任务",
      isEdit: false,
      pickerOptions: {
        disabledDate(time) {
          // let curDate = (new Date()).getTime();
          // let three = 90 * 24 * 3600 * 1000;
          // let threeMonths = curDate + three;
          return time.getTime() < Date.now() ;//选择当前时间之后
          // return time.getTime() > Date.now(); //选择当前时间之前的也写一下

        },
        //这个是限制分钟的
        // selectableRange: `${moment().locale('zh-cn').format('HH:mm:ss')} - 23:59:59`
      },
      dialogForm: {
        projectId: '',
        taskName: '',
        details: '',
        deadline: '',
        handPersonId: ''
      },
      rules: {
        projectId: [
          { required: true, message: '请选择任务所属项目', trigger: 'blur' }
        ],
        taskName: [
          { required: true, message: '任务名不能为空', trigger: 'blur' }
        ],
        details: [
          { required: true, message: '任务描述不能为空', trigger: 'blur' }
        ],
        deadline: [
          { required: true, message: '请选择要求完成时间', trigger: 'blur' }
        ],
        handPersonId: [
          { required: true, message: '验证码不能为空', trigger: 'blur' }
        ]
      },
      projects: [], // 参与的项目
      handlers: [],

      dealVisible: false,
      taskId: "",
      dealForm:{
        taskName: "",
        details: "",
        dealList:[
          // {
          //   userName: "",
          //   solveDetails: "",
          //   checkDetails: "",
          // }
        ],
        state: 3, /* 0待处理 1待审核 2已完成 3已退回 */
      },
      inputDeal: "",
    };
  },

  mounted() {
    let userInfo = this.$cookie.get("userInfo") && JSON.parse(this.$cookie.get("userInfo"));
    this.userInfo = userInfo
    if(userInfo){
      // this.$set(this.task,"userId", userInfo.userId);
      // this.$set(this.task,"post", userInfo.post);
      
      if(userInfo.post == "admin" || userInfo.post == "manager"){
        this.isAdminOrManager = true
      }
      apiProject.findProjectBySelection({
        "userId": userInfo.userId,
        "post": userInfo.post
      }).then(res => {
        this.projects = res
        // this.projects.forEach(pro => {
        //   this.getMemberRole2(pro.projectId).then(result => {
        //     if(result == true){
        //       this.isXMmanger = true
        //       this.projectXMs.push(pro)
        //     }
        //   });
        // })
        this.search()
      })
    }

    
  },

  methods: {
    search(){
      let param = JSON.parse(JSON.stringify(this.task))
      let arr = []
      if(param.projectId){
        arr = [param.projectId]
      }else{
        this.projects.forEach(e => {
          arr.push(e.projectId)
        })
      }
      apiTask.findTaskBySelection({"param": param, "arr": arr}).then(res => {
        let arr = JSON.parse(JSON.stringify(res))
        if(arr && arr.length > 0){
          arr.forEach(e => {
            if(e.createTime){
              e.createTime = e.createTime.slice(0, 10)
            }
            if(e.deadline){
              let time = JSON.parse(JSON.stringify(e.deadline))
              e.deadline = time.slice(0, 10) + " " + time.slice(11, time.length)
            }
            if(e.overTime){
              let time = JSON.parse(JSON.stringify(e.overTime))
              e.overTime = time.slice(0, 10) + " " + time.slice(11, time.length)
            }
            
            if(e.deadline && e.state != 1){
              let deadline = new Date(e.deadline).getTime()
              let now = new Date().getTime();
              if((deadline - now) > 24 * 60 * 60 * 1000){ // 大于24h
                e.taskStatus = 2
              }else if((deadline - now) > 0 && (deadline - now) < 24 * 60 * 60 * 1000){
                e.taskStatus = 1
              }else{
                e.taskStatus = -1
              }
            }else if(e.deadline && e.state == 1 && e.overTime){
              let deadline = new Date(e.deadline).getTime()
              let overTime = new Date(e.overTime).getTime();
              if((deadline - overTime) > 0){
                e.taskStatus = 2
              }else{
                e.taskStatus = -1
              }
            }
          })
        }
        this.tableData = arr
        this.total = this.tableData.length
        while((this.currentPage - 1) * this.pagesize > this.total){
          if(this.currentPage > 1)
            this.currentPage--;
        }
      }).catch(e => {
        this.$message.error(e.msg)
      })
    },
    add(){
      this.isEdit = false
      this.handlers = []
      this.dialogForm = {
        projectId: "",
        handPersonId: "",
        checkPersonId: this.userInfo.userId,
        state: 0,
        createPerson: this.userInfo.userName,
        isTask: 1,
      }
      this.dialogTitle = "新增任务"
      this.dialogVisible = true
    },
    deal(row){
      this.projectId = row.projectId
      this.getHandles(this.projectId)
      this.getMemberRole(row)
      this.dealVisible = true
      this.dealForm.dealList = []
      this.dealForm.state = 3
      this.dealForm.taskName = row.taskName
      this.dealForm.details = row.details
      this.taskId = row.taskId
      this.taskName = row.taskName
      this.details = row.details
      this.searchRecord()
    },
    // edit(row){
    //   this.isEdit = true
    //   this.dialogTitle = "编辑任务"
    //   this.dialogVisible = true
    //   console.log(row)
    // },
    del(row){
      this.$confirm('确定删除此任务及任务记录吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {   // 确定操作
        apiTask.deleteTaskRecord({"taskId": row.taskId}).then(() => { // 删除任务记录
          apiTask.deleteTask({"taskId": row.taskId}).then(res => {
            this.$message.success(res.msg)
            this.search()
          }).catch(e => {
            this.$message.error(e.msg)
          })
        })
      }).catch(() => {  // 取消操作
        this.$message({
          type: 'info',
          message: '已取消操作'
        });
      });
    },

    getTwo(time){
      let str = JSON.stringify(time)
      if(str.length < 2){
        return "0" + str
      }else{
        return str
      }
    },
    dialogConfirm(){
      this.$refs["dialogForm"].validate((valid) => {
        if (valid) {
          if(this.dialogForm.deadline){
            let year = this.dialogForm.deadline.getFullYear();
            let month = this.getTwo(this.dialogForm.deadline.getMonth() + 1);
            let date = this.getTwo(this.dialogForm.deadline.getDate());
            let hour = this.getTwo(this.dialogForm.deadline.getHours());
            let minute = this.getTwo(this.dialogForm.deadline.getMinutes());
            this.dialogForm.deadline = year + '-' + month + '-' + date + ' ' + hour + ":" + minute + ":00" 
          }
          apiTask.addTask({'projectId': this.dialogForm.projectId, 'task': this.dialogForm}).then(res => {
            apiTask.addTaskRecord({
              'taskId': res,
              'state': 0,
              'handPersonId': this.dialogForm.handPersonId,
              'checkPersonId': this.userInfo.userId
            }).then(result => {
              this.$message.success(result.msg)
              this.dialogVisible = false
              this.search()
            }).catch(e => {
              apiTask.deleteTask({"taskId": res})
              this.$message.error(e.msg)
            })
          }).catch(error => {
            this.$message.error(error.msg)
          })
        } else {
          return false;
        }
      })
    },
    searchRecord(){
      let that = this
      apiTask.findTaskRecordByTaskId({'taskId': that.taskId}).then(res => {
        that.dealForm.taskName = that.taskName
        that.dealForm.details = that.details
        if(res.length > 0){
          that.dealForm.dealList = res
          that.isCurrentRWdealer = that.userInfo.userId == res[res.length - 1].handPersonId
          that.isCurrentRWchecker = that.userInfo.userId == res[res.length - 1].checkPersonId
          that.dealForm.state = res[res.length - 1].state
        }
      })
    },
    submit(){
      if(this.inputDeal !== ""){
        this.dealForm.dealList[this.dealForm.dealList.length - 1].state = 1
        this.dealForm.dealList[this.dealForm.dealList.length - 1].solveDetails = this.inputDeal
        apiTask.updateTaskRecord(this.dealForm.dealList[this.dealForm.dealList.length - 1]).then(res => {
          this.$message.success(res.msg)
          this.searchRecord()
        }).catch(e => {
          this.$message.error(e.msg)
        })
      }else{
        this.$message.info("请输入处理情况")
      }
    },
    pass(){
      this.dealForm.dealList[this.dealForm.dealList.length - 1].state = 2
      this.dealForm.dealList[this.dealForm.dealList.length - 1].checkDetails = this.inputDeal
      apiTask.updateTaskRecord(this.dealForm.dealList[this.dealForm.dealList.length - 1]).then(() => {
        this.searchRecord()
        apiTask.updateTask({
          taskId: this.taskId,
          solveDetails: this.dealForm.dealList[this.dealForm.dealList.length - 1].solveDetails,
          state: 1
        }).then(result => {
          this.search()
          this.dealVisible = false
          this.$message.success(result.msg)
        }).catch(er => {
          this.$message.error(er.msg)
        })
      }).catch(e => {
        this.$message.error(e.msg)
      })
    },
    notpass(){
      if(this.inputDeal !== ""){
        this.dealForm.dealList[this.dealForm.dealList.length - 1].state = 3
        this.dealForm.dealList[this.dealForm.dealList.length - 1].checkDetails = this.inputDeal
        let that = this
        apiTask.updateTaskRecord(that.dealForm.dealList[that.dealForm.dealList.length - 1]).then(res => {
          apiTask.addTaskRecord({
            'taskId': that.taskId,
            'state': 0,
            'handPersonId': that.dealForm.dealList[that.dealForm.dealList.length - 1].handPersonId,
            'checkPersonId': that.userInfo.userId
          }).then(() => {
            that.$message.success(res.msg)
            that.searchRecord()
          }).catch(er => {
            that.$message.error(er.msg)
            
          })
        }).catch(e => {
          that.$message.error(e.msg)
        })
      }else{
        this.$message.info("请输入修改意见")
      }
    },

    exportTable(){
      let that = this;
      require.ensure([], () => {
        const tHeader = ["任务名", "任务状态", "所属项目", "创建人", "创建时间", "要求完成时间", "任务完成时间", "处理人", "是否超时", "任务处理结果", "任务描述"];
        const filterVal = ["taskName", "state", "projectName", "createPerson", "createTime", "deadline", "overTime", "handPerson", "taskStatus", "solveDetails", "details"];
        // 导出表格字段名
        const data = that.formatJson(filterVal, that.tableData);
        // 导出的表格名称
        export_json_to_excel(tHeader, data, "任务信息表");
      });
    },
    // 部分格式转换
    formatJson(filterVal, jsonData) {
      return jsonData.map(v => 
        filterVal.map(j => { 
          if(j == "state"){
            return v[j] == 0 ? '未完结' : '已完结'
          }else if(j == "taskStatus"){
            return v[j] == -1 ? '是' : '否'
          }else{
           return v[j]
          }
        })
      );
    },

    getHandles(projectId){
      this.dialogForm.handPersonId = ""
      apiProject.findProjectMember({"projectId": projectId}).then(result => {
        result.forEach(e => {
          if(e.userId == this.userInfo.userId){
            e.disabled = true
          }
        })
        this.handlers = result
      })
    },
    getMemberRole(row){
      apiProject.findProjectMember({"projectId": row.projectId}).then(res => {
        let role = res.find(e => e.userId == this.userInfo.userId)
        if(role && role.role == "项目经理"){
          this.isCurrentXMmanger = true
        }else{
          this.isCurrentXMmanger = false
        }
      })
    },
    dataFilter(val, options, flag = 'dialog'){
      if(flag == "task"){
        this.$set(this.task, "projectId", val)
      }else{
        this.$set(this.dialogForm, "projectId", val)
      }
      if(val){
        options = this.projects.filter(item => {
          if(!!~item.projectName.indexOf(val) || !!~item.projectName.toUpperCase().indexOf(val.toUpperCase())){
            return true
          }
        })
      }else{
        options = this.projects
      }
    },
    judge(val){
      let item = undefined
      this.states.forEach(e => {
        if(e.value == val){
          item = e
        }
      })
      if(item && item.label){
        return item.label
      } else {
        return ""
      }
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
.task {
  text-align: left;
}
.task >>> .el-form-item{
  width: 324px;
  display: inline-block;
}

.popBtns{
  display: contents;
}
.popBtns button{
  width: 100%;
  margin-left: 0;
  border: none;
}

.dialogForm >>> .el-form-item{
  width: 100%;
  text-align: left;
}
.dialogForm >>> .el-form-item__content{
  width: calc(100% - 160px);
}
.el-form-item__content > .el-select,
.el-form-item__content > .el-date-editor{
  width: 100%
}


.stageDialog{
  height: 880px;
  overflow: hidden;
}
.stageDialog >>> .el-dialog__body{
  height: 626px;
  overflow-y: auto;
  overflow-x: hidden;
}

.details{
  width: 100%;
  display: flex;
  margin: 10px 0;
}
.details_father{
  display: inline-block;
  width: 100%;
  border-top: lightgray 1px solid;
}
.details_father:last-child{
  border-bottom: lightgray 1px solid;
}
.detail_label{
  float: left;
  width: 150px;
  height: 100%;
  color: gray;
  text-align: left;
}
.detail_value{
  float: right;
  color: black;
  text-indent: 20px;
  text-align: left;
  word-break: break-all;
}

.details_btn{
  display: inline-flex;
  width: 100%;
}

.el-table >>> .hover-row{
  cursor: pointer;
}
.color_yellow{
  color: #db8400 !important;
}
.color_red{
  color: red !important;
}
</style>