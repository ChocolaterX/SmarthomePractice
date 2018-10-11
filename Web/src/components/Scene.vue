<template>
	<div>
		<p>scene</p>

		<!-- scene list -->
		<div>
			<table>
				<tr>
					<td>序号</td>
					<td>名称</td>
					<td>创建时间</td>
					<td>所含设备</td>
					<td>执行</td>
					<td>其他操作</td>
				</tr>
				<tr v-for="(scene,index) in scenes">
					<td>{{index}}</td>
					<td>{{scene.name}}</td>
					<td>{{scene.createdTime}}</td>
					<td>{{scene.devices}}</td>
					<td><button v-on:click="runScene(scene._id)">执行情景模式</button></td>
					<td>
						<button v-on:click="updateScene(scene._id)">修改情景模式</button>
						<button v-on:click="deleteScene(scene._id)">删除情景模式</button>
					</td>
				</tr>

			</table>

			<button>添加情景模式</button>

		</div>

		<!-- device list -->
		<div v-show="onAddingScene">

		</div>
	</div>
</template>

<script>
	let onAddingScene = false;
	let scenes = [{
		_id: 1,
		name: 'scene001',
		createdTime: 20181011,
		devices: 12345
	},
	{
		_id: 2,
		name: 'scene002',
		createdTime: 20181011,
		devices: 12345
	},{
		_id: 3,
		name: 'scene003',
		createdTime: 20181011,
		devices: 12345
	},{
		_id: 4,
		name: 'scene004',
		createdTime: 20181011,
		devices: 12345
	}];
	let devices = [];
	export default {
		data() {
			return {
				scenes,
				devices
			}
		},
		methods: {
			runScene(sceneId) {
				console.log('run scene');
			},
			updateScene(sceneId) {
				console.log('update scene');
			},
			deleteScene(sceneId) {
				console.log('delete scene');
			}
		}
	}
</script>

<style>

</style>