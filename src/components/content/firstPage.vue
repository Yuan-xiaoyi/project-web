<template>
  <div style="height: calc(100% - 200px);margin: 60px 300px;">
    <div class="border">
      <div class="borderText" style="border-right: 1px lightgray dotted;">
        <span style="color: brown;margin-left: -40px;">项目</span><br>
        <span style="color: teal;margin-left: 40px;">情况</span>
      </div>
      <div class="borderTu">
        <div id="project" class="charts"></div>
      </div>
    </div>
    <div class="border">
      <div class="borderText" style="border-right: 1px lightgray dotted;">
        <span style="color: darkslateblue;margin-left: 40px;">任务</span><br>
        <span style="color: orange;margin-left: -40px;">情况</span>
      </div>
      <div class="borderTu">
        <div id="task" class="charts"></div>
      </div>
    </div>
  </div>
</template>

<script>
import * as echarts from 'echarts';
import apiProject from "../../api/project"
import apiTask from "../../api/task"
export default {
  name: 'firstPage',
  data() {
    return {
      projects: [],
      tasks: []
    };
  },
  mounted() {
    this.getProject();
    this.getTask();
  },
  methods: {
    getProject(){
      let project = document.getElementById('project');
      let myChart = echarts.init(project);
      apiProject.findProjectBySelection().then(res => {
        let notend = 0, getBid = 0, notBid = 0, ProPause = 0;
        for(let i = 0; i < res.length; i++){
          if(res[i].state == 0){
            notend++
          }
          if(res[i].bidding == '是'){
            getBid++
          }
          if(res[i].bidding == '否'){
            notBid++
          }
          if(res[i].state == 3){
            ProPause++
          }

        }
        
        let option;
        option = {
          xAxis: {
            type: 'category',
            data: ['未完结', '已中标', '未中标', '项目停止']
          },
          yAxis: {
            type: 'value'
          },
          series: [
            {
              data: [
                {
                  value: notend,
                  itemStyle: {
                    color: '#409EFF'
                  }
                },
                {
                  value: getBid,
                  itemStyle: {
                    color: '#67C23A'
                  }
                },
                {
                  value: notBid,
                  itemStyle: {
                    color: '#a90000'
                  }
                },
                {
                  value: ProPause,
                  itemStyle: {
                    color: '#CCCCCC'
                  }
                }
              ],
              type: 'bar'
            }
          ]
        };
        option && myChart.setOption(option);
      })
    },

    getTask(){
      let task = document.getElementById('task');
      let myChart = echarts.init(task);
      apiProject.findProjectBySelection().then(res => {
        let arr = []
        res.forEach(e => {
          arr.push(e.projectId)
        })

        let apiArr = [];
        let dataArr = [];
        let data = new Date();
        data.setMonth(data.getMonth()+1, 1)//获取到当前月份,设置月份
        for (let i = 0; i < 12; i++) {
          data.setMonth(data.getMonth() - 1);//每次循环一次 月份值减1
          let m = data.getMonth() + 1;
          m = m < 10 ? "0" + m : m;
          let yearMonth = data.getFullYear() + "-" + (m)
          dataArr.unshift(yearMonth)
          let param = {taskName: '', state: '', createTime: yearMonth, isTask: 1}
          apiArr.unshift(apiTask.findTaskBySelection({"param": param, "arr": arr}))
        }

        Promise.all(apiArr).then(r => {
          let resArr = []
          r.forEach((result,index) => {
            let notend = 0, hasend = 0;
            for(let i = 0; i < result.length; i++){
              if(result[i].state == 0){
                notend++
              }else if(result[i].state == 1){
                hasend++
              }
            }
            resArr.push({notend, hasend, month: dataArr[index]})
          })
          
          let option;
          option = {
            title: {
              text: ''
            },
            tooltip: {
              trigger: 'axis',
              axisPointer: {
                type: 'shadow'
              }
            },
            legend: {},
            grid: {
              left: '3%',
              right: '4%',
              bottom: '3%',
              containLabel: true
            },
            xAxis: {
              type: 'value',
              boundaryGap: [0, 0.01]
            },
            yAxis: {
              type: 'category',
              data: [resArr[0].month, resArr[1].month, resArr[2].month, resArr[3].month, resArr[4].month, resArr[5].month, 
                     resArr[6].month, resArr[7].month, resArr[8].month, resArr[9].month, resArr[10].month, resArr[11].month
              ]
            },
            series: [
              {
                name: '未完结',
                type: 'bar',
                data: [resArr[0].notend, resArr[1].notend, resArr[2].notend, resArr[3].notend, resArr[4].notend, resArr[5].notend, 
                     resArr[6].notend, resArr[7].notend, resArr[8].notend, resArr[9].notend, resArr[10].notend, resArr[11].notend
                ]
              },
              {
                name: '已完结',
                type: 'bar',
                data: [resArr[0].hasend, resArr[1].hasend, resArr[2].hasend, resArr[3].hasend, resArr[4].hasend, resArr[5].hasend, 
                     resArr[6].hasend, resArr[7].hasend, resArr[8].hasend, resArr[9].hasend, resArr[10].hasend, resArr[11].hasend
                ]
              }
            ]
          };
          option && myChart.setOption(option);
        }).catch(e => {
          this.$message.error(e.msg)
        });
      }).catch(e => {
        this.$message.error(e.msg)
      });
    },
  },
};
</script>

<style scoped>
.border{
  width: 100%;
  height: 50%;
  border: 1px lightgray dotted;
  margin-bottom: 5%;
  display: flex
}
.borderTu{
  width: 80%;
}
.borderText{
  width: 20%;
  font-size: 36px;
  font-weight: 600;
  padding-top: 75px;
  line-height: 3;
}
.charts{
  width: 100%;
  height: 100%
}
</style>