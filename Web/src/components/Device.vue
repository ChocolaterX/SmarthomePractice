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
        </tr>
        <tr v-for="(device,index) in devices">
          <td>{{index+1}}</td>
          <td>{{device.name}}</td>
          <td>{{device.mac}}</td>
          <td>{{device.type}}</td>
          <td>command</td>
        </tr>
      </table>
    </div>

    <br><br>

    <div>
      <textarea v-model="deviceMac" placeholder="请输入要添加的设备mac地址"></textarea>
      <textarea v-model="deviceName" placeholder="请输入要添加的设备名称"></textarea>
      <button v-on:click="addDevice(deviceMac,deviceName)">添加设备</button>
      <button v-on:click="getList()">获取设备</button>
    </div>

    <!-- command control area -->
    <div>
      <p>当前指令：{{deviceCommand}}</p>
      <textarea v-model="deviceCommand" placeholder="请输入指令"></textarea>
      <button v-on:click="pushCommand(deviceCommand)">发送指令</button>
      <button v-on:click="changeShowTips">开关提示</button>
      <p v-show="showTips">提示：待更新</p>
    </div>
  </div>
</template>

<script>
  import Axios from 'axios'

  let deviceMac, deviceName, deviceCommand = '', showTips = false, devices;
  // let devices = [{
  //   "name": "开关",
  //   "mac": "123456",
  //   "type": 1
  // }, {
  //   "name": "窗帘",
  //   "mac": "12345612",
  //   "type": 2
  // }, {
  //   "name": "插座",
  //   "mac": "123456123",
  //   "type": 3
  // }];
  export default {
    data() {
      return {
        devices, deviceMac, deviceName, deviceCommand, showTips
      }
    },

    methods: {
      addDevice(mac, name) {
        // console.log(mac);
        // console.log(name);
        // console.log(sessionStorage.getItem('userid'));
        // console.log(sessionStorage.getItem('userid') == null);
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
            }
            else {
              this.$message({
                message: '添加设备失败，服务器异常',
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

      updateDevice(deviceId, name) {
      },

      deleteDevice(deviceId) {
      },

      pushCommand(deviceCommand) {
        console.log(deviceCommand);
        //				axios.defaults.baseURL = 'https://api.example.com';
        //				axios.defaults.headers.common['Authorization'] = AUTH_TOKEN;
        //				axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';

        Axios({
          method: 'post',
          url: BASEPATH + '/device/control/add',
          data: {
            name: '123',
            number: 45
          }
        }).then((response) => {
          console.log(response);
        }).catch(function (error) {

        });

        //				axios.post('http://localhost:3000/device/control/add').then(function(res) {
        //					// /device/list/get
        //					console.log('control add res');
        //					console.log(res);
        //				}).catch(function(error) {
        //					console.log('error:' + error);
        //				});
      },

      changeShowTips() {
        console.log('change show tips');
        this.showTips = !this.showTips;
      },

      getList() {
        console.log('abcdefg12345');
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
      }

    },

    //此处使用mounted:()=>{} 就不正常，原因不明
    mounted() {
      this.$axios.get(BASEPATH + '/device/control/list/retrieval', {
        headers: {'userid': sessionStorage.getItem('userid')}
      }).then(response => {
        console.log(response);
        if (response.data.errorCode === 0) {
          this.devices = response.data.controlDevices;
          console.log(vm.devices);
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
