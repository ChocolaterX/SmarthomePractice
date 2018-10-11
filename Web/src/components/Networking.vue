<template>
	<div>
		<p>networking</p>

		<!-- 已添加设备 控制设备-->
		<div>
			<table>
				<tr>
					<td>序号</td>
					<td>设备名称</td>
					<td>mac地址</td>
					<td>设备类型</td>
					<td>操作</td>
				</tr>
				<tr v-for="(device,index) in devices">
					<td>{{index+1}}</td>
					<td>{{device.name}}</td>
					<td>{{device.mac}}</td>
					<td>{{device.type}}</td>
					<td>添加到数据库</td>
				</tr>
			</table>
		</div>
		<div>
			<button v-on:click="openNetwork">开放组网</button>
			<button v-on:click="refreshDeviceList">刷新设备</button>
			<button v-on:click="deleteDevice">删除设备</button>
		</div>
	</div>
</template>

<script>
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
				devices: devices
			}
		},
		methods: {
			openNetwork() {
				console.log('open network');
			},
			refreshDeviceList() {
				console.log('refresh device list');
			},
			deleteDevice() {
				console.log('delete device');				
			}
		}

	}
</script>

<style>

</style>