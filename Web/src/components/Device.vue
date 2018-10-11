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
	let deviceCommand = '';
	let showTips = false;
	let devices = [{
		"name": "开关",
		"mac": "123456",
		"type": 1
	}, {
		"name": "窗帘",
		"mac": "12345612",
		"type": 2
	}, {
		"name": "插座",
		"mac": "123456123",
		"type": 3
	}]
	export default {
		data() {
			return {
				devices,
				deviceCommand,
				showTips
			}
		},
		methods: {
			pushCommand(deviceCommand) {
				console.log(deviceCommand);
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