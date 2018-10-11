<template>
	<div>
		<p>security</p>

		<!-- device list and state-->
		<div>
			<table>
				<tr>
					<td>序号</td>
					<td>设备名称</td>
					<td>mac地址</td>
					<td>设备类型</td>
					<td>状态</td>
				</tr>
				<tr v-for="(device,index) in devices">
					<td>{{index+1}}</td>
					<td>{{device.name}}</td>
					<td>{{device.mac}}</td>
					<td>{{device.type}}</td>
					<td>state</td>
				</tr>
			</table>
		</div>

		<div>
			<p>当前指令：{{deviceMessage}}</p>
			<textarea v-model="deviceMessage" placeholder="当前设备消息"></textarea>
			<button v-on:click="changeShowMessage">开关接收消息</button>
			<button v-on:click="changeShowTips">开关提示</button>
			<br>
			<p v-show="showTips">提示：待更新</p>
		</div>
	</div>
</template>

<script>
	let deviceMessage = '';
	let showTips = false;
	let showMessage = false;
	let devices = [{
		"name": "门磁",
		"mac": "123456",
		"type": 1
	}, {
		"name": "红外感应",
		"mac": "12345612",
		"type": 2
	}];
	export default {
		data() {
			return {
				devices,
				deviceMessage,
				showTips
			}
		},
		methods: {
			changeShowMessage() {
				console.log('change show message');
				this.showMessage = !this.showMessage;
			},
			changeShowTips() {
				console.log('change show tips');
				this.showTips = !this.showTips;
			}
		}
	}
</script>

<style>

</style>