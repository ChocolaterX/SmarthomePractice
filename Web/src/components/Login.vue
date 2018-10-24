<template>
	<div>
		<div>
			<div>
				<input v-model="username" type="text" placeholder="请输入账号" name="username">
			</div>
		</div>
		<div>
			<div>
				<input v-model="password" type="password" placeholder="请输入密码" name="password">
			</div>
		</div>

		<div>
			<button v-on:click="login(username, password)">登录</button>
		</div>

	</div>
</template>

<script>
	import Axios from 'axios'
	let username = '';
	let password = '';

	export default {
		data() {
			return {
				username,
				password
			}
		},
		methods: {
			login(username, password) {
				console.log('username:  ' + username);
				console.log('password:  ' + password);

				Axios({
					method: 'post',
					url: 'http://localhost:3000/user/login',
					data: {
						"username": username,
						"password": password
					}
				}).then(response => {
					console.log(response);
				}).catch(error => {
					console.log(error);
				});

			}
		}
	}
</script>

<style>

</style>