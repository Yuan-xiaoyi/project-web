<template>
  <div style="height: 100%;">
    <div style="height: 100%;">
      <el-table
        :data="tableData"
        height="100%"
        style="width: 100%; margin-bottom: 8px;"
      >
        <el-table-column prop="userName" label="用户名" width="" align="center"></el-table-column>
        <el-table-column prop="phoneNumber" label="电话" width="" align="center"></el-table-column>
        <el-table-column prop="inProjects" label="参与项目" width="" align="center"></el-table-column>
        <el-table-column prop="manageProjects" label="管理项目" width="" align="center"></el-table-column>
        <el-table-column prop="sendTasks" label="发布任务" width="" align="center"></el-table-column>
        <el-table-column prop="dealTasks" label="处理任务" width="" align="center"></el-table-column>
        <el-table-column prop="finnishedPercent" label="(已完成)任务按时完成率" width="" align="center"></el-table-column>
        <el-table-column prop="getBackPercent" label="任务回退率" width="" align="center"></el-table-column>
      </el-table>
      <!-- <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="currentPage"
        :page-sizes="pagesizes"
        :page-size="pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination> -->
    </div>
  </div>
</template>

<script>
import { promise } from "ora";
import apiProject from "../../api/project"
import apiTask from "../../api/task"
import apiUser from "../../api/user"
export default {
  name: 'userCenter',
  data() {
    return {
      userInfo: {},
      tasks: [],
      inProjects: 0,
      manageProjects: 0,
      sendTasks: 0,
      dealTasks: 0,

      hasEndTasks: 0, // 已完成的任务
      finnishedInTime: 0, // 未超时的任务
      finnishedPercent: "",

      submitTasks: 0, // 任务提交次数
      getBackTasks: 0, // 任务回退次数
      getBackPercent: "",

      tableData: []
    };
  },
  mounted() {
    let userInfo = this.$cookie.get("userInfo") && JSON.parse(this.$cookie.get("userInfo"));
    // userInfo.post = "common"
    this.userInfo = userInfo
    if(userInfo && userInfo.post != "common"){
      apiUser.findAllUser().then(res => {
        res.forEach(user => {
          this.inProjects = 0
          this.manageProjects = 0
          this.tasks = []
          this.submitTasks = 0
          this.getBackTasks = 0
          this.finnishedInTime = 0
          this.getBackPercent = ""
          this.finnishedPercent = ""
          this.setTableData(user)
        })
      }).catch(e => {
        this.$message.error(e.msg)
      })
    }else{
      this.setTableData(userInfo)
    }
  },

  methods: {
    setTableData(user){
      let item = {...user}
      Promise.all([this.getProjectData(user), this.getTaskData(user), this.getTaskRecordData(user), this.getBackRecordData(user)]).then(da => {
        da.forEach(returnItem => {
          item = {...item, ...returnItem}
        })
        this.tableData.push(item);
      })
    },

    getProjectData(userInfo){
      let that = this
      return new Promise((resolve, reject) => {
        apiProject.findProjectByUserId({
          "userId": userInfo.userId,
          "post": userInfo.post
        }).then(res => {
          that.inProjects = res.length
          that.manageProjects = 0
          for(let i = 0; i < res.length; i++){
            if(res[i].role == "项目经理"){
              that.manageProjects++
            }
          }
          let returnItem = {
            inProjects: that.inProjects,
            manageProjects: that.manageProjects
          }
          resolve(returnItem)
        }).catch(e => {
          that.$message.error(e.msg)
        })

      })
    },
    getTaskData(userInfo){
      let that = this
      return new Promise((resolve, reject) => {
        Promise.all([apiTask.finishedFindByUserId({'userId': userInfo.userId}), apiTask.backlogFindByUserId({'userId': userInfo.userId})]).then(ra => {
          ra.forEach(res => {
            if(res.length > 0){
              res.forEach(result => {
                let trecord = that.tasks.find(tr => tr.taskId == result.taskId)
                if(trecord == undefined){
                  that.tasks.push(result)
                }
              })
            }
            
          })
          
          that.sendTasks = 0
          that.dealTasks = 0
          that.tasks.forEach(record => {
            if(record.handPersonId == userInfo.userId && record.state != 0){
              that.dealTasks++
            }
            if(record.checkPersonId == userInfo.userId){
              that.sendTasks++
            }
          })
          
          let returnItem = {
            dealTasks: that.dealTasks, sendTasks: that.sendTasks,
            hasEndTasks: that.hasEndTasks, finnishedInTime: that.finnishedInTime,
            finnishedPercent: that.finnishedPercent
          }
          resolve(returnItem)
        })
      })
    },
    getTaskRecordData(userInfo){
      let that = this
      return new Promise((resolve, reject) => {
        apiTask.inTimeByUserId({'userId': userInfo.userId}).then(res => {
          that.finnishedInTime = 0
          let list = [];
          for(let i = 0; i < res.length; i++){
            if(list.find(listItem => listItem.taskId == res[i].taskId) == undefined && res[i].state == 1){
              list.push(res[i])
            }
          }
          for(let i = 0; i < list.length; i++){
            let deadline = new Date(list[i].deadline)
            let overTime = new Date(list[i].overTime)
            if(list[i].state == 1 && overTime.getTime() <= deadline.getTime()){ // 未超时
              that.finnishedInTime++
            }
          }
          that.finnishedPercent = list.length == 0 ? "" : (parseFloat(that.finnishedInTime/list.length)*100).toFixed(2) + "%"
          let returnItem = { finnishedPercent: that.finnishedPercent}
          resolve(returnItem)
        })
      })
    },
    getBackRecordData(userInfo){
      let that = this
      return new Promise((resolve, reject) => {
        apiTask.setBackByUserId({'userId': userInfo.userId}).then(res => {
          that.submitTasks = res.length
          that.getBackTasks = 0
          
          for(let i = 0; i < res.length; i++){
            if(res[i].state == 3){ // 被退回
              that.getBackTasks++
            }
          }
          that.getBackPercent = that.submitTasks == 0 ? "" : (parseFloat(that.getBackTasks/that.submitTasks) * 100).toFixed(2) + "%"
          let returnItem = { getBackPercent: that.getBackPercent}
          resolve(returnItem)

        })
      })
    },
    


    getMemberRole(projectId, userInfo){ // 判断是否为某个项目的项目经理
      return new Promise((resolve, reject) => {
        apiProject.findProjectMember({"projectId": projectId}).then(res => {
          let role = res.find(e => e.userId == userInfo.userId)
          if(role && role.role == "项目经理"){
            resolve("manager")
          }else if(role !== undefined){
            resolve("member")
          }else{
            resolve("")
          }
        }).catch(e => {
          this.$message.error(e.msg)
        })
      })
    },
    getTaskByTaskId(taskId){
      return new Promise((resolve, reject) => {
        apiTask.findByTaskId({"taskId": taskId}).then(res => {
          resolve(res)
        }).catch(e => {
          this.$message.error(e.msg)
        })
      })
    },
    getTaskbyPeojectId(projectId){
      return new Promise((resolve, reject) => {
        apiTask.findTaskByProjectId({"projectId": projectId}).then(res => {
          resolve(res)
        }).catch(e => {
          this.$message.error(e.msg)
        })
      })
    },
    getTaskRecord(taskId){
      return new Promise((resolve, reject) => {
        apiTask.findTaskRecordByTaskId({'taskId': taskId}).then(res => {
          resolve(res)
        }).catch(e => {
          this.$message.error(e.msg)
        })
      })
    }
  },
};
</script>

<style scoped>
.el-row{
  font-size: 24px;
  font-weight: 600;
  line-height: 60px;
  background: #e5e9f2;
}
.el-col-12{
  text-align: right
}
</style>