import Vue from 'vue'
import Router from 'vue-router'
import hello from '@/components/HelloWorld.vue'
// import header from '../components/Header.vue'
// import footer from '../components/Footer.vue'
import login from '../components/Login.vue'
import main from '../components/Main.vue'
import device from '../components/Control.vue'
import scene from '../components/Scene.vue'
import security from '../components/Security.vue'
import networking from '../components/Networking.vue'

Vue.use(Router);

export default new Router({
	routes: [{
			path: '/',
			name: 'main',
			component: main
		},
		{
			path: '/hello',
			name: 'hello',
			component: hello
		},
		{
			path: '/login',
			name: 'login',
			component: login
		},
		{
			path: '/device',
			name: 'device',
			component: device
		},
		{
			path: '/scene',
			name: 'scene',
			component: scene
		},
		{
			path: '/networking',
			name: 'networking',
			component: networking
		},
		{
			path: '/security',
			name:'security',
			component: security
		}
	]
})
