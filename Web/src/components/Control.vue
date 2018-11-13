<template>
  <div>
    <p>device</p>

    <!-- device list and button-->
    <div>
      <table>
        <tr>
          <td>序号</td>
          <td>设备名称</td>
          <td>mac地址</td>
          <td>设备类型</td>
          <td>控制命令</td>
          <td>其他操作</td>
        </tr>
        <tr v-for="(device,index) in devices">
          <td>{{index+1}}</td>
          <td>{{device.name}}</td>
          <td>{{device.mac}}</td>

          <td v-if="device.type===0">智能网关</td>
          <td v-if="device.type===1">智能窗帘</td>
          <td v-if="device.type===2">智能插座</td>
          <td v-if="device.type===3">智能开关</td>

          <td v-if="device.type===0"></td>
          <td v-if="device.type===1">
            <button v-on:click="commandControl(device._id,'CurtainOpen')">打开</button>
            <button v-on:click="commandControl(device._id,'CurtainClose')">关闭</button>
          </td>
          <td v-if="device.type===2">
            <button v-on:click="commandControl(device._id,'PowerOn')">通电</button>
            <button v-on:click="commandControl(device._id,'PowerOff')">断电</button>
          </td>
          <td v-if="device.type===3">
            <button v-on:click="commandControl(device._id,'SwitchLeftOn')">左路通电</button>
            <button v-on:click="commandControl(device._id,'SwitchLeftOff')">左路断电</button>
            <button v-on:click="commandControl(device._id,'SwitchRightOn')">右路通电</button>
            <button v-on:click="commandControl(device._id,'SwitchRightOff')">右路断电</button>
          </td>
          <td>
            <button v-on:click="updateDevice(device._id,deviceName)">更新设备</button>
            <button v-on:click="deleteDevice(device._id)">删除设备</button>
          </td>
        </tr>
      </table>
    </div>

    <br><br>

    <div>
      <textarea v-model="deviceMac" placeholder="请输入要添加的设备mac地址"></textarea>
      <textarea v-model="deviceName" placeholder="请输入要添加的设备名称"></textarea>
      <button v-on:click="addDevice(deviceMac,deviceName)">添加设备</button>
      <button v-on:click="retrievalDeviceList()">获取设备</button>
    </div>

    <!-- command control area -->
    <div>
      <p>当前指令：{{instruction}}</p>
      <textarea v-model="instruction" placeholder="请输入指令"></textarea>
      <button v-on:click="instructionControl(instruction)">发送指令</button>
      <button v-on:click="changeShowTips">开关提示</button>
      <p v-show="showTips">提示：待更新</p>
    </div>
  </div>
</template>

<script>
  let deviceMac, deviceName, instruction = '', showTips = false, devices;
  export default {
    data() {
      return {
        devices, deviceMac, deviceName, instruction, showTips
      }
    },

    methods: {
      addDevice(mac, name) {
        if (mac === '' || name === '') {
          this.$message({
            type: 'info',
            message: 'MAC地址和设备名称不能为空'
          });
        }
        else if (sessionStorage.getItem('userid') == null) {
          console.log('未登录');
          this.$message({
            type: 'info',
            message: '请登录'
          });
        }
        else {
          this.$axios.post(BASEPATH + '/device/control/create', {
            mac, name
          }, {
            headers: {'userid': sessionStorage.getItem('userid')}
          }).then(response => {
            console.log(response);
            if (response.data.errorCode === 0) {
              this.$message({
                message: '添加设备成功',
                type: 'info'
              });
              this.retrievalDeviceList();
            }
            else {
              this.$message({
                message: '添加设备失败:' + response.data.message,
                type: 'error'
              });
            }
          }).catch(error => {
            console.log(error);
            this.$message({
              message: '添加设备失败，服务器异常',
              type: 'error'
            });
          });
        }
      },

      retrievalDeviceList() {
        this.$axios.get(BASEPATH + '/device/control/list/retrieval', {
          headers: {'userid': sessionStorage.getItem('userid')}
        }).then(response => {
          console.log(response);
          if (response.data.errorCode === 0) {
            this.devices = response.data.controlDevices;
          }
          else {
            this.$message({
              message: '查找设备失败',
              type: 'error'
            });
          }
        }).catch(error => {
          this.$message({
            message: '查找设备失败，服务器异常 ' + error,
            type: 'error'
          });
        });
      },

      updateDevice(deviceId, name) {
        if (deviceId === '' || name === '') {
          this.$message({
            type: 'info',
            message: '设备ID和设备名称不能为空'
          });
        }
        else if (sessionStorage.getItem('userid') == null) {
          console.log('未登录');
          this.$message({
            type: 'info',
            message: '请登录'
          });
        }
        else {
          this.$axios.post(BASEPATH + '/device/control/update', {
            deviceId, name
          }, {
            headers: {'userid': sessionStorage.getItem('userid')}
          }).then(response => {
            console.log(response);
            if (response.data.errorCode === 0) {
              this.$message({
                message: '更新设备成功',
                type: 'info'
              });
              this.retrievalDeviceList();
            }
            else {
              this.$message({
                message: '更新设备失败:' + response.data.message,
                type: 'error'
              });
            }
          }).catch(error => {
            console.log(error);
            this.$message({
              message: '更新设备失败，服务器异常',
              type: 'error'
            });
          });
        }
      },

      deleteDevice(deviceId) {
        if (deviceId === '') {
          this.$message({
            type: 'info',
            message: '设备ID不能为空'
          });
        }
        else if (sessionStorage.getItem('userid') == null) {
          console.log('未登录');
          this.$message({
            type: 'info',
            message: '请登录'
          });
        }
        else {
          this.$axios.post(BASEPATH + '/device/control/delete', {
            deviceId
          }, {
            headers: {'userid': sessionStorage.getItem('userid')}
          }).then(response => {
            console.log(response);
            if (response.data.errorCode === 0) {
              this.$message({
                message: '删除设备成功',
                type: 'info'
              });
              this.retrievalDeviceList();
            }
            else {
              this.$message({
                message: '删除设备失败:' + response.data.message,
                type: 'error'
              });
            }
          }).catch(error => {
            console.log(error);
            this.$message({
              message: '更新设备失败，服务器异常',
              type: 'error'
            });
          });
        }
      },

      commandControl(deviceId, command) {
        if (deviceId === '' || command === '') {
          this.$message({
            type: 'info',
            message: '设备ID或控制命令有误'
          });
        }
        else if (sessionStorage.getItem('userid') == null) {
          console.log('未登录');
          this.$message({
            type: 'info',
            message: '请登录'
          });
        }
        else {
          this.$axios.post(BASEPATH + '/device/control/command', {
            deviceId,
            command
          }, {
            headers: {'userid': sessionStorage.getItem('userid')}
          }).then(response => {
            console.log(response);
          }).catch(error => {
            this.$message({
              message: '更新设备失败，服务器异常',
              type: 'error'
            });
          });
        }
      },

      instructionControl(instruction) {
        if (instruction === '') {
          this.$message({
            type: 'info',
            message: '指令不能为空'
          });
        }
        else if (sessionStorage.getItem('userid') == null) {
          console.log('未登录');
          this.$message({
            type: 'info',
            message: '请登录'
          });
        }
        else {
          this.$axios.post(BASEPATH + '/device/control/instruction', {
            instruction
          }, {
            headers: {'userid': sessionStorage.getItem('userid')}
          }).then(response => {
            console.log(response);
          }).catch(error => {
            this.$message({
              message: '发送控制指令失败，服务器异常:'+error,
              type: 'error'
            });
          });
        }
      },

      changeShowTips() {
        console.log('change show tips');
        this.showTips = !this.showTips;
      },

    },

    //此处使用mounted:()=>{} 就不正常，原因不明
    //加载设备列表
    mounted() {
      this.$axios.get(BASEPATH + '/device/control/list/retrieval', {
        headers: {'userid': sessionStorage.getItem('userid')}
      }).then(response => {
        console.log(response);
        if (response.data.errorCode === 0) {
          this.devices = response.data.controlDevices;
          // console.log(vm.devices);
        }
        else {
          this.$message({
            message: '查找设备失败',
            type: 'error'
          });
        }
      }).catch(error => {
        this.$message({
          message: '查找设备失败，服务器异常',
          type: 'error'
        });
      });
    },

    beforeMount() {
    }
  }
</script>

<style>

</style>
