/**
 * Created by Administrator on 2017/8/24 0024.
 */
import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex);

export default new Vuex.Store({
	state: {
		alltype: 3,
		secondary_type: '0302',
		islogin: localStorage.getItem("islogin") ? localStorage.getItem("islogin") : sessionStorage.getItem("islogin"),
		username: localStorage.getItem("username") ? localStorage.getItem("username") : sessionStorage.getItem("username"),
		realname: localStorage.getItem("realname") ? localStorage.getItem("realname") : sessionStorage.getItem("realname"),
		userid: localStorage.getItem("userid") ? localStorage.getItem("userid") : sessionStorage.getItem("userid"),
		showwhich: sessionStorage.getItem('changeshow') ? sessionStorage.getItem('changeshow') : 0,
		daycount: {}
	},
	mutations: {
		chooseatype(state, atype) {
			state.alltype = atype
		},
		choosestype(state, stype) {
			state.secondary_type = stype;
		},
		userlogin(state, user) {
			state.islogin = '1';
			state.username = user;
		},
		userexit(state) {
			state.islogin = '0';
			state.username = null;
		},
		saverealname(state, realname1) {
			state.realname = realname1;
		},
		saveid(state, id) {
			state.userid = id;
		},
		changeshow(state, num) {
			state.showwhich = num;
		},
		savedaycount(state, day) {
			state.daycount = day;
		}

	},
	actions: {
		chooseatype(context, atype) {
			context.commit("chooseatype", atype)
		},
		choosestype(context, stype) {
			context.commit("choosestype", stype)
		},
		userlogin(context, user) {
			context.commit('userlogin', user);
		},
		userexit(context) {
			context.commit('userexit');
		},
		saverealname(context, realname1) {
			context.commit('saverealname', realname1);
		},
		saveid(context, id) {
			context.commit('saveid', id);
		},
		changeshow(context, num) {
			context.commit('changeshow', num)
		},
		savedaycount(context, day) {
			context.commit('savedaycount', day)
		}

	}
})
