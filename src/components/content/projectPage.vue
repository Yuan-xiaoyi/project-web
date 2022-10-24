<template>
  <div style="height: 100%">
    <el-form class="project" :model="project" label-width="100px">
      <el-form-item label="项目名称">
        <el-input v-model="project.projectName" clearable></el-input>
      </el-form-item>
      <el-form-item label="项目状态">
        <el-select v-model="project.state" placeholder="请选择">
          <el-option
            v-for="item in states"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item  label="项目创建时间">
        <el-date-picker
          v-model="project.createTime"
          type="year"
          placeholder="选择时间"
          value-format="yyyy"
        ></el-date-picker>
      </el-form-item>
      
      <el-form-item>
        <el-button type="primary" @click="search()">查询</el-button>
      </el-form-item>
    </el-form>
    
    <el-divider></el-divider>
    <div style="margin-bottom: 10px; float: right;">
      <el-button type="primary" @click="exportTable">导出表格</el-button>
      <el-button type="success" @click="add" v-if="isAdminOrManager">新增项目</el-button>
    </div>
    <el-table
      :data="tableData.slice((currentPage-1)*pagesize,currentPage*pagesize)"
      height="calc(100% - 180px)"
      style="width: 100%; margin-bottom: 8px;"
      @row-click="detail"
    >
      <el-table-column prop="projectName" label="项目名" width="" align="center"></el-table-column>
      <el-table-column prop="createTime" label="创建时间" width="200" align="center"></el-table-column>
      <el-table-column prop="industry" label="项目分类" width="100" align="center"></el-table-column>
      <el-table-column prop="significance" label="项目级别" width="120" align="center">
        <template slot-scope="scope">
          <span v-for="(num,index) in scope.row.significance" :key="index">
            <img src="../../assets/wjx.png" alt="" class="levelImg">
          </span>
        </template>
      </el-table-column>
      <el-table-column label="项目状态" width="120" align="center">
        <template slot-scope="scope">
          <el-tag
            v-if="scope.row.state != undefined"
            disable-transitions
            :type="scope.row.state == 2 ? 'success': 
                   scope.row.state == 3 ? 'danger': ''"
          >{{judge(scope.row.state)}}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="proprietor" label="项目业主" width="200" align="center"></el-table-column>
      <el-table-column prop="mainManager" label="(客户)主管领导" width="200" align="center"></el-table-column>
      <el-table-column prop="fenManager" label="(客户)分管领导" width="200" align="center"></el-table-column>
      <el-table-column prop="agent" label="(客户)经办人" width="200" align="center"></el-table-column>
      <el-table-column prop="bidding" label="是否我方中标" width="120" align="center"></el-table-column>
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
              <el-button size="mini" @click="detail(scope.row)">项目详情</el-button>
              <el-button size="mini" @click="memberManage(scope.row)">成员管理</el-button>
              <el-button size="mini" @click="edit(scope.row)">编辑</el-button>
              <el-button size="mini" @click="del(scope.row)" v-if="isAdminOrManager" style="color: red;">删除</el-button>
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
      width="70%"
      :close-on-click-modal="false"
    >
      <div>
        <el-form :model="dialogForm" label-width="100px" :rules="rules" class="dialogForm" ref="dialogForm" :inline="true">
          <el-form-item label="项目名称" prop="projectName">
            <el-input v-model="dialogForm.projectName" clearable :disabled="!isXMmanger && !isAdminOrManager"></el-input>
          </el-form-item>
          <el-form-item label="项目状态" v-if="isEdit" prop="state">
            <el-select v-model="dialogForm.state" placeholder="请选择" :disabled="!isXMmanger && !isAdminOrManager">
              <el-option
                v-for="item in states"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="项目分类" prop="industry"><!-- v-if="!isEdit" -->
            <el-select v-model="dialogForm.industry" placeholder="请选择" :disabled="!isXMmanger && !isAdminOrManager">
              <el-option
                v-for="item in industrys"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="项目级别" prop="significance">
            <el-select v-model="dialogForm.significance" placeholder="请选择" :disabled="!isXMmanger && !isAdminOrManager">
              <el-option
                v-for="item in significances"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="项目业主" prop="proprietor">
            <el-input v-model="dialogForm.proprietor" clearable :disabled="!isXMmanger && !isAdminOrManager"></el-input>
          </el-form-item>
          <el-form-item label="主管领导" prop="mainManager">
            <el-input v-model="dialogForm.mainManager" clearable :disabled="!isXMmanger && !isAdminOrManager"></el-input>
          </el-form-item>
          <el-form-item label="分管领导" prop="fenManager">
            <el-input v-model="dialogForm.fenManager" clearable :disabled="!isXMmanger && !isAdminOrManager"></el-input>
          </el-form-item>
          <el-form-item label="经办人" prop="agent">
            <el-input v-model="dialogForm.agent" clearable :disabled="!isXMmanger && !isAdminOrManager"></el-input>
          </el-form-item>
          <el-form-item label="是否我方中标" v-if="isEdit" prop="bidding">
            <el-select v-model="dialogForm.bidding" placeholder="请选择" :disabled="dialogForm.state != 2 || !isXMmanger && !isAdminOrManager">
              <el-option
                v-for="item in biddings"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="项目描述" class="clumnIN2" style="width:59%" prop="details">
            <el-input v-model="dialogForm.details" type="textarea" :rows="3" :maxlength="200" show-word-limit :disabled="!isXMmanger && !isAdminOrManager"></el-input>
          </el-form-item>
        </el-form>
      </div>
      <div slot="footer" v-if="isXMmanger || isAdminOrManager">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="projectConfirm">确 定</el-button>
      </div>
    </el-dialog>

    
    <el-dialog
      title="项目详情"
      class="stageDialog"
      :visible.sync="stageVisible"
      width="70%"
      :close-on-click-modal="false"
    >
      
      <div class="details">
        <div class="detail_label">项目名称</div>
        <div class="detail_value">{{stageForm.projectName}}</div>
      </div>
      <div class="details">
        <div class="detail_label">项目详情</div>
        <div class="detail_value">{{stageForm.details}}</div>
      </div>
      
      <div class="details">
        <div class="detail_label">任务及反馈详情</div>
        <div class="detail_value">
          <!-- <el-button type="success" round class="stageAddBtn" @click="addStage" size="mini"
            title="新增项目阶段" v-if="isXMmanger || isAdminOrManager"
          >+</el-button> -->
          <el-timeline style="margin-top: 20px;">
            <el-timeline-item
              v-for="(item, index) in stageForm.timeItems" :key="index"
              :timestamp="item.createTime" placement="top"
            >
              <el-card>
                <div class="details" v-if="item.isTask == 1">
                  <div class="detail_label detail_label_time" style="text-indent: 0;margin-left: 20px;">
                    <el-tag
                      v-if="item.state != undefined"
                      disable-transitions
                      size="mini"
                      :type="item.state == 0 ? '':'success'"
                    >{{judge2(item.state)}}</el-tag>
                  </div>
                  <!-- <div class="detail_value"> -->
                    
                  <!-- </div> -->
                </div>
                <div class="details" v-if="item.isTask == 1">
                  <div class="detail_label detail_label_time">任务详情</div>
                  <div class="detail_value">{{item.details}}</div>
                </div>
                <div class="details" v-if="item.isTask == 1">
                  <div class="detail_label detail_label_time">处理结果</div>
                  <div class="detail_value">{{item.solveDetails}}</div>
                </div>
                
                <div class="details" v-if="item.isTask == 0">
                  <div class="detail_label detail_label_time">{{item.createPerson}} </div>
                  <div class="detail_value">反馈了问题</div>
                </div>
                <div class="details" v-if="item.isTask == 0">
                  <div class="detail_label detail_label_time">反馈详情</div>
                  <div class="detail_value">{{item.details}}</div>
                </div>
                <!-- <el-button v-if="isXMmanger || isAdminOrManager" class="cardBtn" type="primary" size="mini" @click="editStage(item)">修改</el-button> -->
              </el-card>
            </el-timeline-item>
          </el-timeline>
        </div>
      </div>
      

      
    </el-dialog>
    <el-dialog
      title="新增项目阶段"
      :visible.sync="stageSecVisible"
      width="50%"
    >
      <el-form ref="form" :model="timeForm" label-width="80px">
        <el-form-item label="阶段名称">
          <el-input v-model="timeForm.title" clearable></el-input>
        </el-form-item>
        <el-form-item label="阶段描述">
          <el-input v-model="timeForm.details" type="textarea" :maxlength="200" show-word-limit :rows="6"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="stageConfirm">{{isStageEdit?'确认修改':'确认增加'}}</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>


    <el-dialog
      title="项目成员管理"
      class="stageDialog"
      :visible.sync="memberVisible"
      width="70%"
      :close-on-click-modal="false"
      @close="memberAddContent = false"
    >
      <div v-for="(member,index) in memberList" :key="index" class="memberlist">
        <el-input v-model="member.userName" readonly></el-input>
        <el-input v-model="member.role" readonly></el-input>
        <el-button v-if="isXMmanger || isAdminOrManager" type="danger" @click="deleteMember(member)">删除此成员</el-button>
      </div>
      <div v-if="memberAddContent" class="memberlist">
        <el-select v-model="memberUsername" placeholder="请选择成员">
          <el-option
            v-for="item in memberUsernames"
            :key="item.userId"
            :label="item.userName"
            :value="item.userId"
          ></el-option>
        </el-select>
        
        <el-select v-model="memberRole" placeholder="请选择成员身份">
          <el-option
            v-for="item in memberRoles"
            :key="item.value"
            :label="item.label"
            :value="item.value"
            :disabled="item.disabled"
          ></el-option>
        </el-select>


        <el-button type="primary" @click="addMemberConfirm">确认添加</el-button>
      </div>
      <el-button v-if="isXMmanger || isAdminOrManager" type="success" size="mini" round class="stageAddBtn" @click="addMember" style="float: left;">+</el-button>
    </el-dialog>

  </div>
</template>

<script>
import { export_json_to_excel } from "../../utils/excel/export2Excel"
import apiUser from "../../api/user"
import apiProject from "../../api/project"
import apiTask from "../../api/task"
export default {
  name: 'projectPage',
  data() {
    return {
      isAdminOrManager: false,
      userInfo: {},
      isXMmanger: false,
      project:{
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
          value: 2
        },{
          label: '项目停止',
          value: 3
        },
      ],
      states2: [
        {
          label: '未完结',
          value: 0
        },{
          label: '已完结',
          value: 1
        }
      ],
      significances: [
        {
          label: '三星级',
          value: '3'
        },{
          label: '四星级',
          value: '4'
        },{
          label: '五星级',
          value: '5'
        },
      ],
      industrys: [
        {
          label: '党政军',
          value: '党政军'
        },{
          label: '教文卫',
          value: '教文卫'
        },{
          label: '大企业',
          value: '大企业'
        },{
          label: '其他',
          value: '其他'
        }
      ],
      biddings: [
        {
          label: '是',
          value: '是'
        },{
          label: '否',
          value: '否'
        }
      ],
      tableData: [
        // {projectName: "test1"},
        // {projectName: "test2"}
      ],
      currentPage: 1,
      pagesizes: [10, 20, 50, 100],
      pagesize: 10,
      total: 0,
      
      isEdit: false,
      dialogTitle: "",
      dialogVisible: false,
      dialogForm:{
        projectName: "",
        state: "",
        industry: "",
        significance: "",
        proprietor: "",
        mainManager: "",
        fenManager: "",
        agent: "",
        bidding: "",
        details: ""
      },
      rules: {
        projectName: [
          { required: true, message: '项目名不能为空', trigger: 'blur' }
        ],
        state: [
          { required: true, message: '项目状态不能为空', trigger: 'blur' }
        ],
        industry: [
          { required: true, message: '请选择项目分类', trigger: 'blur' }
        ],
        significance: [
          { required: true, message: '请选择项目级别', trigger: 'blur' }
        ],
        proprietor: [
          { required: false, message: '', trigger: 'blur' }
        ],
        mainManager: [
          { required: false, message: '', trigger: 'blur' }
        ],
        fenManager: [
          { required: false, message: '', trigger: 'blur' }
        ],
        agent: [
          { required: false, message: '', trigger: 'blur' }
        ],
        bidding: [
          { required: false, message: '是否中标', trigger: 'blur' }
        ],
        details: [
          { required: true, message: '项目描述不能为空', trigger: 'blur' }
        ]
      },

      isStageEdit: false,
      stageVisible: false,
      stageSecVisible: false,
      stageForm:{
        projectId: '',
        projectName: '',
        details: '',
        timeItems: [],
      },
      timeForm: {
        title: "",
        details: ""
      },

      memberVisible: false,
      memberList: [],
      memberUsername: "",
      memberRole: "",
      projectId: "",
      memberAddContent: false,
      memberRoles:[
        {
          label: '项目经理',
          value: '项目经理',
          disabled: false,
        },{
          label: '客户经理',
          value: '客户经理'
        },{
          label: '解决方案经理',
          value: '解决方案经理'
        }
      ],
      memberUsernames: []
    };
  },

  mounted() {
    let userInfo = this.$cookie.get("userInfo") && JSON.parse(this.$cookie.get("userInfo"));
    this.userInfo = userInfo
    if(userInfo){
      this.$set(this.project,"userId", userInfo.userId);
      this.$set(this.project,"post", userInfo.post);
      this.search()
      if(userInfo.post == "admin" || userInfo.post == "manager"){
        this.isAdminOrManager = true
      }
    }
  },

  methods: {
    resetForm() {
      if (this.$refs.dialogForm !== undefined)
        this.$refs['dialogForm'].resetFields();
    },
    search(){
      apiProject.findProjectBySelection(this.project).then(res => {
        let arr = JSON.parse(JSON.stringify(res))
        if(arr && arr.length > 0){
          arr.forEach(e => {
            if(e.createTime){
              e.createTime = e.createTime.slice(0, 10)
            }
            if(e.significance){
              e.significance = parseInt(e.significance)
            }
          })
          // 排序
          // for(let i = 0; i < arr.length - 1; i++){
          //   for(let j = 0; j < arr.length - i - 1; j++){
          //     if(arr[j].state > arr[j+1].state){
          //       let temp = arr[j];
          //       arr[j] = arr[j+1];
          //       arr[j+1] = temp
          //     }
          //     if(arr[j].state == arr[j+1].state && arr[j].significance < arr[j+1].significance){
          //       let temp = arr[j];
          //       arr[j] = arr[j+1];
          //       arr[j+1] = temp
          //     }
          //   } 
          // }
        }
        this.tableData = arr;
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
      this.resetForm()
      this.dialogForm = {state: 0}
      this.isEdit = false
      this.dialogTitle = "新增项目"
      this.dialogVisible = true
    },
    edit(row){
      this.projectId = row.projectId
      this.isEdit = true
      this.dialogTitle = "编辑项目"
      this.dialogVisible = true
      apiProject.findProjectById({"projectId": row.projectId}).then(res => {
        this.dialogForm = res
      })
    },
    del(row){
      this.$confirm('确定删除此项目吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {   // 确定操作
        apiProject.deleteProject({"projectId": row.projectId}).then(res => {
          this.$message.success(res.msg);
          this.search();
        }).catch(e => {
          this.$message.error(e.msg)
        });
      }).catch(() => {  // 取消操作
        this.$message({
          type: 'info',
          message: '已取消操作'
        });
      });
    },
    detail(row){
      this.projectId = row.projectId
      this.getMemberRole(row)
      this.stageVisible = true
      this.stageForm.projectName = row.projectName
      this.stageForm.details = row.details
      this.stageForm.projectId = row.projectId
      this.searchStage()
    },
    memberManage(row){
      this.projectId = row.projectId
      this.searchMembers()
      this.memberVisible = true
    },

    projectConfirm(){
      this.$refs["dialogForm"].validate((valid) => {
        if (valid) {
          if(this.isEdit){
            apiProject.updateProject(this.dialogForm).then(res => {
              this.$message.success('修改成功');
              this.search();
              this.dialogVisible = false
            }).catch(e => {
              this.$message.error(e.msg)
            });
          }else{
            apiProject.addProject(this.dialogForm).then(res => {
              this.$message.success(res.msg)
              this.search();
              this.dialogVisible = false
            })
          }
        }
      })
    },

    addStage(){
      this.isStageEdit = false
      this.timeForm = {}
      this.stageSecVisible = true
    },
    editStage(item){
      this.isStageEdit = true
      this.timeForm = item
      this.stageSecVisible = true
    },
    searchStage(){
      apiTask.findTaskByProjectId({"projectId": this.stageForm.projectId}).then(res => {
        let arr = JSON.parse(JSON.stringify(res))
        if(arr && arr.length > 0){
          arr.forEach(e => {
            if(e.createTime){
              e.createTime = e.createTime.slice(0, 10)
            }
          })
        }
        this.stageForm.timeItems = arr;
      }).catch(e => {
        this.$message.error(e.msg)
      })
    },
    stageConfirm(){
      if(this.isStageEdit){
        apiProject.updateStage(
          {'id': this.timeForm.id, 'title': this.timeForm.title, 'details': this.timeForm.details}).then(res => {
          this.$message.success(res.msg);
          this.searchStage()
          this.stageSecVisible = false
        })
      }else{
        apiProject.addStage({"projectId": this.stageForm.projectId, "summarize": this.timeForm}).then(res => {
          this.$message.success(res.msg);
          this.searchStage()
          this.stageSecVisible = false
        })
      }
    },

    addMember(){
      this.memberAddContent = true
      this.memberUsernames = []
      let that = this
      apiUser.findAllUser().then(res => {
        res.forEach(user => {
          let item = that.memberList.find(member => member.userId == user.userId)
          if(item == undefined){
            that.memberUsernames.push(user)
          }
        })
      })
    },
    searchMembers(){
      let that = this
      apiProject.findProjectMember({"projectId": that.projectId}).then(res => {
        that.memberList = res
        if(that.memberList.find(member => member.role == "项目经理") != undefined){
          that.memberRoles[0].disabled = true
        }else{
          that.memberRoles[0].disabled = false
        }
      })
    },
    addMemberConfirm(){
      apiProject.addProjectMember(
        {"userId": this.memberUsername, "role": this.memberRole, "projectId": this.projectId}
      ).then(res => {
        this.$message.success(res.msg)
        this.searchMembers()
        this.memberAddContent = false
        this.memberUsernames = []
        this.memberUsername = ""
        this.memberRole = ""
      }).catch(e => {
        this.$message.error(e.msg)
      })
    },
    deleteMember(item){
      apiProject.deleteProjectMember({projectMemberId: item.projectMemberId}).then(res => {
        this.$message.success("删除成员成功")
        this.searchMembers()
      }).catch(e => {
        this.$message.error(e.msg)
      })
    },
    getMemberRole(row){
      apiProject.findProjectMember({"projectId": row.projectId}).then(res => {
        let role = res.find(e => e.userId == this.userInfo.userId)
        if(role && role.role == "项目经理"){
          this.isXMmanger = true
        }else{
          this.isXMmanger = false
        }
      })
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
    
    judge2(val){
      let item = undefined
      this.states2.forEach(e => {
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
    exportTable(){
      let that = this;
      require.ensure([], () => {
        const tHeader = ["项目名", "创建时间", "项目分类", "项目级别", "项目状态", "项目业主", "主管领导(客户)", "分管领导(客户)", "经办人(客户)", "是否我方中标","项目描述"];
        const filterVal = ["projectName", "createTime", "industry", "significance", "state", "proprietor", "mainManager", "fenManager", "agent", "bidding", "details"];

        // 导出表格字段名
        const data = that.formatJson(filterVal, that.tableData);
        // 导出的表格名称
        export_json_to_excel(tHeader, data, "项目信息表");
      });
    },
    //格式转换
    formatJson(filterVal, jsonData) {
      return jsonData.map(v => 
        filterVal.map(j => { 
          if(j == "significance"){
            return this.significances.find(e => e.value == v[j]).label
          }else if(j == "state"){
            return this.states.find(e => e.value === v[j]).label
          }{
           return v[j]
          }
        })
      );
    },
  },
};
</script>

<style scoped>

.project {
  text-align: left;
}
.project >>> .el-form-item{
  width: 324px;
  display: inline-block;
}
.dialogForm >>> .el-form-item{
  width: 375px;
}
.clumnIN2{
  width: 59%;
}
.clumnIN2 >>> .el-form-item__content{
  width: calc(100% - 160px);
}

.popBtns{
  display: contents;
}
.popBtns button{
  width: 100%;
  margin-left: 0;
  border: none;
}

.stageDialog{
  height: 880px;
  overflow: hidden;
}
.stageAddBtn{
  margin: 10px;
  font-size: 20px;
  font-weight: 600
}
.stageDialog >>> .el-dialog__body{
  height: 626px;
  overflow: auto;
}
.el-card__body:hover .cardBtn{
  display: block
}
.cardBtn{
  display: none;
  float: right;
  margin-top: -88px;
}

.details{
  width: 100%;
  display: flex;
  margin: 10px 0;
}
.detail_label{
  float: left;
  width: 150px;
  height: 100%;
  color: gray;
  text-align: left;
}
.detail_label_time{
  width: 100px !important;
}
.detail_value{
  width: 100%;
  float: right;
  color: black;
  text-indent: 20px;
  text-align: left;
  word-break: break-all;
}

.memberlist{
  display: flex;
  padding: 10px;
}
.memberlist .el-input, .memberlist .el-select {
  margin-right: 10px
}

.el-table >>> .hover-row{
  cursor: pointer;
}

.levelImg{
  width: 20px;
  height: 20px;
}
</style>