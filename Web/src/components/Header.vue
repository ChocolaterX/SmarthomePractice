<template>
	<div>
		<p>header</p>
		<button v-on:click="jump('main')">主页</button>
		<button v-on:click="jump('networking')">组网</button>
		<button v-on:click="jump('device')">设备</button>
		<button v-on:click="jump('scene')">情景模式</button>
		<button v-on:click="jump('security')">安防</button>
		<button v-on:click="jump('login')">登录</button>
		<button v-on:click="jump('login')">个人信息</button>
		<br><br><br>
	</div>
</template>

<script>
	export default {
		methods: {
			jump(path) {
				// console.log('jump to '+ path);
				let destination = '/'+path;
				this.$router.push(destination);
			}
		}
	}
</script>

<style>

</style>
