<template>
  <div class="helloWorld">
    <div class="header">
      <Header @childMsg="showChildMsg"/>
    </div>

    <div class="main">
      <component :is="componentName" ></component>
    </div>
  </div>
</template>

<script>
import Header from './Header.vue'
export default {
  name: 'HelloWorld',
  components: {
    Header
  },
  data(){
    return{
      componentName: '',
      list: [
        {
          index: "1",
          path: "firstPage"
        },{
          index: "2",
          path: "projectPage"
        },{
          index: "3",
          path: "taskPage"
        },{
          index: "4",
          path: "userCenter"
        },{
          index: "5",
          path: "managePage"
        },
      ]
    }
  },
  created(){},
  methods:{
    showChildMsg(param){
      let parampath = this.list.find(e => e.index == param).path
      this.componentName = () => import(`./content/${parampath}`)
    }
  }

}
</script>

<style scoped>
  .helloWorld{
    display: block;
    padding: 0;
    margin: 0;
    height: 100%;
    width:100%;
    overflow: hidden;
    background:rgba(0,0,0,0.8);
    background-position: center center;
    background-repeat: no-repeat;
    background-size: cover;
  }

  .header{
    text-align: center;
    height: 66px;
    color: white;
    background-color: var(--headerBgColor)

  }

  .layout {
  }
  .main{
    height: calc(100% - 86px);
    overflow-y: auto;
    overflow-x: hidden;
    /* margin:0 200px; */
    background-color: whitesmoke ;
    font-size: var(--fontSize);
    color: var(--fontColor);
    padding: 10px;
  }
  
</style>
