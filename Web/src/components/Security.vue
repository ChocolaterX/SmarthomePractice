<template>
  <div>
    <p>security</p>

    <!-- device list and button-->
    <div>
      <table>
        <tr>
          <td>序号</td>
          <td>设备名称</td>
          <td>mac地址</td>
          <td>设备类型</td>
          <td>状态</td>
          <td>其他操作</td>
        </tr>
        <tr v-for="(device,index) in devices">
          <td>{{index+1}}</td>
          <td>{{device.name}}</td>
          <td>{{device.mac}}</td>

          <td v-if="device.type===1">智能门磁</td>
          <td v-if="device.type===2">智能红外感应</td>
          <td v-if="device.type===3">智能门锁</td>

          <td v-if="device.type===1">
            <label v-if="device.state==='01'">打开</label>
            <label v-if="device.state==='00'">关闭</label>
            <label v-if="device.state!=='01' && device.state!=='00'">状态未知</label>
          </td>
          <td v-if="device.type===2">
            <label v-if="device.state==='01'">有人</label>
            <label v-if="device.state==='00'">无人</label>
            <label v-if="device.state!=='01' && device.state!=='00'">状态未知</label>
          </td>
          <td v-if="device.type===3">
            <label>正常</label>
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
      <button v-on:click="setRefreshing(keepRefreshing)" v-if="!keepRefreshing">持续刷新设备</button>
      <button v-on:click="setRefreshing(keepRefreshing)" v-if="keepRefreshing">停止刷新设备</button>
    </div>

    <!-- console -->
    <div>
      <p>{{consoleInstructions}}
      </p>
      <button v-on:click="getConsole()">获取控制台指令</button>
      <button v-on:click="setKeepGettingConsole(keepGettingConsole)" v-if="!keepGettingConsole">持续获取控制台</button>
      <button v-on:click="setKeepGettingConsole(keepGettingConsole)" v-if="keepGettingConsole">停止获取控制台</button>
    </div>

    <!-- command security area -->
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
  let deviceMac, deviceName, deviceCommand = '', devices, consoleInstructions;
  let showTips = false, keepRefreshing = false, keepGettingConsole = false;
  export default {
    data() {
      return {
        devices, deviceMac, deviceName, deviceCommand, consoleInstructions,
        showTips, keepRefreshing, keepGettingConsole
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
          this.$axios.post(BASEPATH + '/device/security/create', {
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
        this.$axios.get(BASEPATH + '/device/security/list/retrieval', {
          headers: {'userid': sessionStorage.getItem('userid')}
        }).then(response => {
          console.log(response);
          if (response.data.errorCode === 0) {
            this.devices = response.data.securityDevices;
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
          this.$axios.post(BASEPATH + '/device/security/update', {
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
          this.$axios.post(BASEPATH + '/device/security/delete', {
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

      getConsole() {
        if (sessionStorage.getItem('userid') == null) {
          console.log('未登录');
          this.$message({
            type: 'info',
            message: '请登录'
          });
        }
        else {
          this.$axios.get(BASEPATH + '/device/security/console', {
            headers: {'userid': sessionStorage.getItem('userid')}
          }).then(response => {
            console.log(response);
            if (response.data.errorCode === 0) {
              //未考虑多个网关的情况
              this.consoleInstructions = response.data.consoleResult[0].instructions;
            }
            else {
              this.$message({
                message: '无法获取控制台输出',
                type: 'error'
              });
            }
          }).catch(error => {
            this.$message({
              message: '获取控制台输出失败，服务器异常:' + error,
              type: 'error'
            });
          });
        }
      },

      //设定是否需要定时刷新设备状态
      //点击停止按钮之后，依然会运行少数几次轮询
      setRefreshing(setting) {
        this.keepRefreshing = !setting;

        let polling = setInterval(() => {
          this.retrievalDeviceList();
          if (!this.keepRefreshing) {
            clearInterval(polling);
          }
        }, 2000);
      },

      //设定是否需要持续获取控制台
      setKeepGettingConsole(setting) {
        this.keepGettingConsole = !setting;

        let polling = setInterval(() => {
          this.getConsole();
          if (!this.keepGettingConsole) {
            clearInterval(polling);
          }
        }, 2000)
      },

      // commandSecurity(deviceId, command) {
      //   if (deviceId === '' || command === '') {
      //     this.$message({
      //       type: 'info',
      //       message: '设备ID或控制命令有误'
      //     });
      //   }
      //   else if (sessionStorage.getItem('userid') == null) {
      //     console.log('未登录');
      //     this.$message({
      //       type: 'info',
      //       message: '请登录'
      //     });
      //   }
      //   else {
      //     this.$axios.post(BASEPATH + '/device/security/command', {
      //       deviceId,
      //       command
      //     }, {
      //       headers: {'userid': sessionStorage.getItem('userid')}
      //     }).then(response => {
      //       console.log(response);
      //     }).catch(err => {
      //       this.$message({
      //         message: '更新设备失败，服务器异常',
      //         type: 'error'
      //       });
      //     });
      //   }
      // },
      //
      // instructionSecurity(instruction) {
      //
      // },

      changeShowTips() {
        console.log('change show tips');
        this.showTips = !this.showTips;
      },

    },

    //此处使用mounted:()=>{} 就不正常，原因不明
    //加载设备列表
    mounted() {
      this.$axios.get(BASEPATH + '/device/security/list/retrieval', {
        headers: {'userid': sessionStorage.getItem('userid')}
      }).then(response => {
        console.log(response);
        if (response.data.errorCode === 0) {
          this.devices = response.data.securityDevices;
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
