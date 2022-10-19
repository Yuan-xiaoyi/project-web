
import instance from './index';
const task = {
  /**
   * 若要传参
   * GET 用 params
   * POST 用 data
   */

  findTaskBySelection: (data) => {
    // if(data.param)
    return instance({
      url: `/findTaskBySelection?taskName=${data.param.taskName}&state=${data.param.state}&createTime=${data.param.createTime}&isTask=${data.param.isTask}`,
      method: 'post',
      data: data.arr, 
    })
  },
  findTaskByProjectId: (data) => {
    return instance({
      url: '/findTaskByProjectId',
      method: 'get',
      params: data, 
    })
  },
  addTask: (data) => {
    return instance({
      url: `/addTask?projectId=${data.projectId}`,
      method: 'post',
      data: data.task, 
    })
  },
  updateTask: (data) => {
    return instance({
      url: `/updateTask`,
      method: 'get',
      params: data,
    })
  },
  deleteTask: (data) => {
    return instance({
      url: `/deleteTask`,
      method: 'get',
      params: data, 
    })
  },
  findByTaskId: (data) => {
    return instance({
      url: `/findByTaskId`,
      method: 'get',
      params: data, 
    })
  },

  addTaskRecord: (data) => {
    return instance({
      url: '/addTaskRecord',
      method: 'post',
      data: data, 
    })
  },
  findTaskRecordByTaskId: (data) => {
    return instance({
      url: '/findTaskRecordByTaskId',
      method: 'get',
      params: data, 
    })
  },
  updateTaskRecord: (data) => {
    return instance({
      url: '/updateTaskRecord',
      method: 'post',
      data: data, 
    })
  },
  deleteTaskRecord: (data) => {
    return instance({
      url: '/deleteTaskRecord',
      method: 'get',
      params: data, 
    })
  },
  finishedFindByUserId: (data) => { // 用于个人已办任务统计
    return instance({
      url: '/finishedFindByUserId',
      method: 'get',
      params: data, 
    })
  },
  backlogFindByUserId: (data) => { // 用于个人待办任务统计
    return instance({
      url: '/backlogFindByUserId',
      method: 'get',
      params: data, 
    })
  },

  inTimeByUserId: (data) => { // 用于个人按时完成任务统计
    return instance({
      url: '/inTimeByUserId',
      method: 'get',
      params: data, 
    })
  },
  setBackByUserId: (data) => { // 用于个人任务被退回情况统计
    return instance({
      url: '/setBackByUserId',
      method: 'get',
      params: data, 
    })
  },
}
export default task;