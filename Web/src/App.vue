<template>
	<div id="app">

		<div>
			<header-view></header-view>
		</div>
		<router-view></router-view>
		<div>
			<footer-view></footer-view>
		</div>

	</div>
</template>

<script>
	import headerView from './components/header.vue'
	import footerView from './components/footer.vue'
	//	import mainView from './components/main.vue'
	//	import homeview from './components/home.vue'

	export default {
		name: 'app',
		components: {
			//			mainView,
			headerView,
			footerView
			//			homeview
		},
		data() {
			return {}
		}
	}
</script>

<style scoped>
	* {
		font: "微软雅黑";
	}
	
	#app {
		height: 100%;
	}
	
	body {
		height: 94%;
	}
</style>

<!--<template>
  <div id="app">
    <img src="./assets/logo.png">
    <router-view/>
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
-->