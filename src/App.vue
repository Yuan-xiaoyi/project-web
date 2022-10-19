<template>
  <div id="app" style="height: 100%;">
    <router-view></router-view>
  </div>
</template>

<script>
// eval()
export default {
  name: 'App'
}
</script>

<style>

html, body {
  padding: 0;
  margin: 0;
  height: 100%;
  width:100%;
}
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
}

/*定义滚动条高宽及背景高宽分别对应横竖滚动条的尺寸*/
::-webkit-scrollbar {
  width: 4px;
  height: 3px;
  background-color: white;
}

/*定义滑块颜色+圆角*/
::-webkit-scrollbar-thumb {
  border-radius: 10px;
  background-color: #999999a8;
}

/*定义滚动条轨道内阴影+圆角*/
::-webkit-scrollbar-track {
  border-radius: 10px;
  background-color: white;
}

/*定义 上传的文字描述 样式*/
.el-upload__tip{
  display: contents;
}

/* border-style:dotted solid double dashed; 
上边框是点状
右边框是实线
下边框是双线
左边框是虚线 */
</style>
