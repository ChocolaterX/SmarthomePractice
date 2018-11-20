<template>
  <div>
    <p>networking</p>

    <!-- 用户的网关 -->
    <div>
      <p>网关</p>
      <table>
        <tr>
          <td>序号</td>
          <td>设备名称</td>
          <td>mac地址</td>
          <td>操作</td>
        </tr>
        <tr v-for="(gateway,index) in gateways">
          <td>{{index+1}}</td>
          <td>{{gateway.name}}</td>
          <td>{{gateway.mac}}</td>
          <td>
            <button v-on:click="openNetwork(gateway._id)">开放组网</button>
          </td>
        </tr>
      </table>
    </div>

    <br>
    <!-- 已添加设备 控制设备-->
    <div>
      <table>
        <tr>
          <td>序号</td>
          <td>mac地址</td>
          <td>端口号</td>
          <td>设备ID</td>
          <td>更多操作</td>
        </tr>
        <tr v-for="(device,index) in devices">
          <td>{{index+1}}</td>
          <td>{{device.mac}}</td>
          <td>{{device.port}}</td>
          <td>{{device.deviceId}}</td>
          <td>
            <button v-on:click="addDevice()">添加到数据库</button>
          </td>
        </tr>
      </table>
    </div>
    <div>
      <p></p>
      <button v-on:click="retrievalGatewayList">查询网关</button>
      <button v-on:click="retrievalDeviceList">查询设备</button>
      <!--<button v-on:click="retrievalDeviceList">刷新设备</button>-->
      <!--<button v-on:click="deleteDevice">删除设备</button>-->
    </div>
  </div>
</template>

<script>
  let devices, gateways;
  export default {
    data() {
      return {
        devices, gateways
      }
    },
    methods: {

      retrievalGatewayList() {
        if (sessionStorage.getItem('userid') == null) {
          console.log('未登录');
          this.$message({
            type: 'info',
            message: '请登录'
          });
        }
        else {
          this.$axios.get(BASEPATH + '/networking/gateway/list/retrieval', {
            headers: {'userid': sessionStorage.getItem('userid')}
          }).then(response => {
            console.log(response);
            if (response.data.errorCode === 0) {
              this.gateways = response.data.gateways;
            }
            else {
              this.$message({
                message: '查询网关失败:' + response.data.message,
                type: 'error'
              });
            }
          }).catch(error => {
            console.log(error);
            this.$message({
              message: '查询网关失败，服务器异常',
              type: 'error'
            });
          });
        }
      },

      openNetwork(gatewayId) {
        if (sessionStorage.getItem('userid') == null) {
          console.log('未登录');
          this.$message({
            type: 'info',
            message: '请登录'
          });
        }
        else {
          this.$axios.post(BASEPATH + '/networking/open', {gatewayId}, {
            headers: {'userid': sessionStorage.getItem('userid')}
          }).then(response => {
            console.log(response);
            if (response.data.errorCode === 0) {
              this.$message({
                message: '成功发送开放网络命令',
                type: 'info'
              });
            }
            else {
              this.$message({
                message: '发送开放网络命令失败:' + response.data.message,
                type: 'error'
              });
            }
          }).catch(error => {
            console.log(error);
            this.$message({
              message: '发送开放网络命令失败，服务器异常',
              type: 'error'
            });
          });
        }
      },

      retrievalDeviceList() {
        if (sessionStorage.getItem('userid') == null) {
          console.log('未登录');
          this.$message({
            type: 'info',
            message: '请登录'
          });
        }
        else {
          this.$axios.get(BASEPATH + '/networking/device/list/retrieval', {
            headers: {'userid': sessionStorage.getItem('userid')}
          }).then(response => {
            console.log(response);
            if (response.data.errorCode === 0) {
              this.devices = response.data.devices;
            }
            else {
              this.devices = [];
              this.$message({
                message: '查询设备失败:' + response.data.message,
                type: 'error'
              });
            }
          }).catch(error => {
            console.log(error);
            this.$message({
              message: '查询设备失败，服务器异常',
              type: 'error'
            });
          });
        }
      },

      deleteDevice() {
        console.log('delete device');
      },

      addDevice(mac, name) {

      }
    },

    mounted() {
      if (sessionStorage.getItem('userid') == null) {
        console.log('未登录');
        this.$message({
          type: 'info',
          message: '请登录'
        });
      }
      else {
        this.$axios.get(BASEPATH + '/networking/gateway/list/retrieval', {
          headers: {'userid': sessionStorage.getItem('userid')}
        }).then(response => {
          console.log(response);
          if (response.data.errorCode === 0) {
            this.gateways = response.data.gateways;
          }
          else {
            this.$message({
              message: '查询网关失败:' + response.data.message,
              type: 'error'
            });
          }
        }).catch(error => {
          console.log(error);
          this.$message({
            message: '查询网关失败，服务器异常',
            type: 'error'
          });
        });
      }
    }


  }
</script>

<style>

</style>
