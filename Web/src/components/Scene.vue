<template>
  <div>
    <!-- scene list -->
    <div>
      <table>
        <tr>
          <td>序号</td>
          <td>名称</td>
          <td>创建时间</td>
          <td>执行</td>
          <td>其他操作</td>
        </tr>
        <tr v-for="(scene,index) in scenes">
          <td>{{index}}</td>
          <td>{{scene.name}}</td>
          <td>{{scene.createdTime}}</td>
          <td>
            <button v-on:click="runScene(scene._id)">执行情景模式</button>
          </td>
          <td>
            <button v-on:click="retrievalSceneDetail(scene._id)">查看情景模式</button>
            <button v-on:click="deleteScene(scene._id)">删除情景模式</button>
          </td>
        </tr>
      </table>
    </div>

    <!--scene detail-->
    <div v-if="showComponent==='onSceneDetail'">
      <p>情景模式详情</p>
      <table>
        <tr>
          <td>序号</td>
          <td>设备名称</td>
          <td>mac地址</td>
          <td>设备类型</td>
          <td>预设操作</td>
        </tr>
        <tr v-for="(device, index) in sceneDevices">
          <td>{{index+1}}</td>
          <td>{{device.name}}</td>
          <td>{{device.mac}}</td>

          <td v-if="device.type===0">智能网关</td>
          <td v-if="device.type===1">智能窗帘</td>
          <td v-if="device.type===2">智能插座</td>
          <td v-if="device.type===3">智能开关</td>

          <!--<td v-if="device.command"></td>-->
        </tr>
      </table>
    </div>

    <!--create scene and choice devices-->
    <div>
      <p>
        <button>添加情景模式</button>
      </p>
      <div v-if="showComponent==='onCreatingOrUpdating'">
        <p>所有可选设备</p>
        <table>
          <tr>
            <td>序号</td>
            <td>设备名称</td>
            <td>mac地址</td>
            <td>设备类型</td>
            <td>预设操作</td>
          </tr>
          <tr v-for="(device, index) in sceneDevices">
            <td>{{index+1}}</td>
            <td>{{device.name}}</td>
            <td>{{device.mac}}</td>

            <td v-if="device.type===1">智能窗帘</td>
            <td v-if="device.type===2">智能插座</td>
            <td v-if="device.type===3">智能开关</td>

            <!--<td v-if="device.command"></td>-->
          </tr>
        </table>
      </div>
    </div>


  </div>
</template>

<script>
  let showComponent = '', scenes, sceneDetail, sceneDevices = [];
  export default {
    data() {
      return {
        scenes, showComponent, sceneDetail, sceneDevices
      }
    },
    methods: {
      createScene(name, commands) {
        if (name === '' || (!commands)) {
          this.$message({
            type: 'info',
            message: '情景模式名称或命令不能为空'
          });
        }
        else if (sessionStorage.getItem('userid') == null) {
          console.log('未登录');
          this.$message({
            type: 'info',
            message: '请先登录'
          });
        }
        else {
          this.$axios.post(BASEPATH + '/scene/create', {name, commands}, {
            headers: {'userid': sessionStorage.getItem('userid')}
          }).then(response => {
            console.log(response);

            this.retrievalSceneList();
          }).catch(err => {
          });
        }
      },

      retrievalSceneList() {
        if (sessionStorage.getItem('userid') == null) {
          console.log('未登录');
          this.$message({
            type: 'info',
            message: '请先登录'
          });
        }
        else {
          this.$axios.get(BASEPATH + '/scene/list/retrieval', {
            headers: {'userid': sessionStorage.getItem('userid')}
          }).then(response => {
            console.log(response);
            if (response.data.errorCode === 0) {
              this.scenes = response.data.scenes;
            }
            else {
              this.$message({
                message: '查找情景模式失败',
                type: 'error'
              });
            }
          }).catch(err => {
            this.$message({
              message: '查询情景模式失败，服务器异常 ' + error,
              type: 'error'
            });
          });
        }
      },

      retrievalSceneDetail(sceneId) {
        if (sceneId === '') {
          this.$message({
            type: 'info',
            message: '情景模式ID有误'
          });
        }
        else if (sessionStorage.getItem('userid') == null) {
          console.log('未登录');
          this.$message({
            type: 'info',
            message: '请先登录'
          });
        }
        else {
          this.$axios.post(BASEPATH + '/scene/detail/retrieval', {sceneId}, {
            headers: {'userid': sessionStorage.getItem('userid')}
          }).then(response => {
            console.log(response);
            if (response.data.errorCode === 0) {
              this.sceneDetail = response.data.scene;
              this.sceneDevices = response.data.sceneDevices;
            }
            else {
              this.$message({
                message: '查找情景模式失败',
                type: 'error'
              });
            }
          }).catch(error => {
            this.$message({
              message: '查询情景模式失败，服务器异常 ' + error,
              type: 'error'
            });
          });
        }
      },

      updateScene(sceneId, name, commands) {
        if (sceneId === '' || name === '' || commands === '') {
          this.$message({
            type: 'info',
            message: '情景模式ID/名称/命令集有误'
          });
        }
        else if (sessionStorage.getItem('userid') == null) {
          console.log('未登录');
          this.$message({
            type: 'info',
            message: '请先登录'
          });
        }
        else {
          this.$axios.post(BASEPATH + '/scene/update', {sceneId, name, commands}, {
            headers: {'userid': sessionStorage.getItem('userid')}
          }).then(response => {
            console.log(response);
            if (response.data.errorCode === 0) {
              this.retrievalSceneList();
            }
            else {
              this.$message({
                message: '更新情景模式失败',
                type: 'error'
              });
            }
          }).catch(error => {
            this.$message({
              message: '更新情景模式失败，服务器异常 ' + error,
              type: 'error'
            });
          });
        }
      },


      deleteScene(sceneId) {
        if (sceneId === '') {
          this.$message({
            type: 'info',
            message: '情景模式ID有误'
          });
        }
        else if (sessionStorage.getItem('userid') == null) {
          console.log('未登录');
          this.$message({
            type: 'info',
            message: '请先登录'
          });
        }
        else {
          this.$axios.post(BASEPATH + '/scene/delete', {}, {
            headers: {'userid': sessionStorage.getItem('userid')}
          }).then(response => {
            console.log(response);
            if (response.data.errorCode === 0) {
              this.retrievalSceneList();
            }
            else {
              this.$message({
                message: '删除情景模式失败',
                type: 'error'
              });
            }
          }).catch(error => {
            this.$message({
              message: '删除情景模式失败，服务器异常 ' + error,
              type: 'error'
            });
          });
        }
      },

      runScene(sceneId) {
        this.$axios.post(BASEPATH + '/scene/run', {sceneId}, {
          headers: {'userid': sessionStorage.getItem('userid')}
        }).then(response => {
          console.log(response);
          if (response.data.errorCode === 0) {
            console.log('情景模式执行');
          }
          else {
            this.$message({
              message: '执行情景模式失败',
              type: 'error'
            });
          }
        }).catch(error => {
          this.$message({
            message: '执行情景模式失败，服务器异常 ' + error,
            type: 'error'
          });
        });
      },
    },

    mounted() {
      this.$axios.get(BASEPATH + '/scene/list/retrieval', {
        headers: {'userid': sessionStorage.getItem('userid')}
      }).then(response => {
        console.log(response);
        if (response.data.errorCode === 0) {
        }
        else {
          this.$message({
            message: '查找情景模式失败',
            type: 'error:' + response.data.message
          });
        }
      }).catch(error => {
        this.$message({
          message: '查找情景模式失败，服务器异常' + error,
          type: 'error'
        });
      });
    }
  }
</script>

<style>

</style>
