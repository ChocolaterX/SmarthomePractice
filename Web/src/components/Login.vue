<template>
  <div>
    <div v-if="$store.state.islogin=='1'">
			<span>
				欢迎，{{$store.state.username}}
            </span>
      <div>
        <button v-on:click="logout()">退出登录</button>
      </div>
    </div>
    <br>

    <div v-if="!($store.state.islogin=='1')">
      <div>
        <input v-model="username" type="text" placeholder="请输入账号" name="username">
      </div>
      <div>
        <input v-model="password" type="password" placeholder="请输入密码" name="password">
      </div>
      <div>
        <button v-on:click="login(username, password)">登录</button>
      </div>
    </div>

    <!--for test-->
    <div>
      <button v-on:click="info()">查看个人信息</button>
    </div>

  </div>
</template>

<script>
  let username = '';
  let password = '';

  export default {
    data() {
      return {
        username,
        password,
        dialogVisible: false,
//	      user_name:sessionStorage.getItem("username"),
        username: localStorage.getItem("username") ? localStorage.getItem("username") : sessionStorage.getItem("username"),
        // user_password: localStorage.getItem("userpass"),
        // login_msg: '',
//	      islogin:sessionStorage.getItem("islogin"),
        islogin: localStorage.getItem("islogin") ? localStorage.getItem("islogin") : sessionStorage.getItem("islogin"),
        // remember: false,
        // options: {
        //   account: '',
        //   password: ''
        // },
        realname: localStorage.getItem("realname") ? localStorage.getItem("realname") : sessionStorage.getItem("realname"),
        userid: localStorage.getItem("userid") ? localStorage.getItem("userid") : sessionStorage.getItem("userid"),
        // user_account: '',
        // user_realname: '',
        // user_pass: '',
        // user_pass2: '',
        // reg_msg: '',
        // showclass: sessionStorage.getItem("showclass"),
        // curtime: ''
      };
    },
    methods: {
      login(username, password) {
        let obj = this;
        if (username == '' || password == '') {
          console.log('用户名或密码不能为空');
          this.$message({
            message: '用户名或密码不能为空',
            type: 'error'
          });
        } else {
          // console.log('username:  ' + username);
          // console.log('password:  ' + password);
          this.$axios({
            method: 'post',
            url: BASEPATH + '/user/login',
            data: {
              "username": username,
              "password": password
            }
          }).then(response => {
            console.log(response);
            if (response.data.errorCode === 0) {
              obj.username = username;
              obj.realname = response.data.user.realname;
              obj.userId = response.data.user._id;
              obj.$store.dispatch('saverealname', obj.realname);
              obj.$store.dispatch('saveid', obj.userId);
              obj.$store.dispatch('userlogin', obj.username);

              sessionStorage.setItem("realname", obj.realname);
              sessionStorage.setItem("userid", obj.userId);
              sessionStorage.setItem('changeshow', 1);
              //登录成功 将session的值改变
              sessionStorage.setItem("islogin", '1');
              sessionStorage.setItem("username", obj.username);
              //sessionStorage.setItem("userpass", obj.user_password);
              //将变化的用户状态存入vuex

              //window.location.reload();
            } else {
              this.$message({
                message: '登录失败，请检查用户名与密码',
                type: 'error'
              });
            }
          }).catch(error => {
            console.log(error);
            this.$message({
              message: '登录失败，服务器异常',
              type: 'error'
            })
          });
        }
      },

      logout() {
        let vm = this;
        let userId = sessionStorage.getItem('userId');
        vm.$confirm('确认注销账户？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          vm.$axios.get(BASEPATH + '/user/logout', {
            headers: {'userid': userId}
          }).then(function (response) {
//            console.log(res);
            if (response.data.errorCode === 0) {
              vm.$message({
                message: '注销成功',
                type: 'success'
              });
              vm.islogin = 0;
              sessionStorage.clear();
              // localStorage.clear();
              vm.$store.dispatch('userexit');
              // setTimeout(function () {
              //   vm.$router.push({path: '/'})
              // }, 1000)
            }
          })
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消注销'
          });
        });
      },

      info() {
        let userId = sessionStorage.getItem('userid');
        let user = {};
        console.log(userId);
        this.$axios.get(BASEPATH + '/user/info', {
          headers: {'userid': userId}
        }).then(response => {
          console.log(response);
          if (response.data.errorCode === 0) {
            user = response.data.user;
          }
          else {
            this.$message({
              message: response.data.message,
              type: 'error'
            });
          }
        }).catch(error => {
          console.log(error);
          this.$message({
            type: 'error',
            message: '查询个人信息失败，服务器异常'
          });
        });

      }
    },
    mounted: function () {
      this.area_class = this.$route.name;
      // this.showclass = sessionStorage.getItem('showclass');

      //用户记住登录状态 下次登录时 有localstorage 没有 sessionstorage 再次登录一下
      /*if (localStorage.getItem("username") && !sessionStorage.getItem("username")) {
        let obj = this;
        /!*this.$axios.post(BASEPATH + '/admin/userLogin/login?account=' + obj.user_name + '&password=' + obj.user_password).then((response) => {
          let msg = response.data;
          if (msg.code == 1) {
            //登录成功 查询用户的个人信息
            obj.$axios.post(BASEPATH + '/admin/user/info/list?account=' + obj.user_name).then((res) => {
              if (res.data.code == 1) {
                //获取用户的真实姓名
                obj.realname = res.data.userInfoList[0].name
              }
            });
            //登录成功 将session的值改变
            sessionStorage.setItem("islogin", '1');
            sessionStorage.setItem("username", obj.user_name);
            sessionStorage.setItem("realname", obj.realname);
            //将变化的用户状态存入vuex
            obj.$store.dispatch('userlogin', obj.user_name);
          }
        })*!/

      }*/
    }
  }
</script>

<style>

</style>
