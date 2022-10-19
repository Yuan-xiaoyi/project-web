
import instance from './index';
const project = {
  /**
   * 若要传参
   * GET 用 params
   * POST 用 data
   */

  findProjectBySelection: (data) => {
    return instance({
      url: '/findProjectBySelection',
      method: 'get',
      params: data, 
    })
  },
  findProjectById: (data) => {
    return instance({
      url: '/findProjectById',
      method: 'get',
      params: data, 
    })
  },
  addProject: (data) => {
    return instance({
      url: '/addProject',
      method: 'post',
      data: data, 
    })
  },
  updateProject: (data) => {
    return instance({
      url: '/updateProject',
      method: 'post',
      data: data, 
    })
  },
  deleteProject: (data) => {
    return instance({
      url: '/deleteProject',
      method: 'get',
      params: data, 
    })
  },
  

  searchStage: (data) => {
    return instance({
      url: '/findSummarizeByProjectId',
      method: 'get',
      params: data, 
    })
  },
  addStage: (data) => {
    return instance({
      url: `/addSummarize?projectId=${data.projectId}`,
      method: 'post',
      data: data.summarize, 
    })
  },
  updateStage: (data) => {
    return instance({
      url: `/updateSummarize`,
      method: 'get',
      params: data, 
    })
  },

  findProjectMember: (data) => {
    return instance({
      url: `/findProjectMember`,
      method: 'get',
      params: data, 
    })
  },
  addProjectMember: (data) => {
    return instance({
      url: `/addProjectMember`,
      method: 'get',
      params: data, 
    })
  },
  deleteProjectMember: (data) => {
    return instance({
      url: `/deleteProjectMember`,
      method: 'get',
      params: data, 
    })
  },

  findProjectByUserId: (data) => { // 用于个人参与项目
    return instance({
      url: '/findProjectByUserId',
      method: 'get',
      params: data, 
    })
  },
}

export default project;