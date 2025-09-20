import { createStore } from 'vuex'

export default createStore({
  state: {
    //存储token
    Authorization: localStorage.getItem('token') ? localStorage.getItem('token') : '',
    //存储用户信息
    user: JSON.parse(localStorage.getItem('user')) ? localStorage.getItem('user') : ''
  },
  getters: {
  },
  mutations: {
    //注册处理函数,在login组建的login方法撒谎给你使用 this.$store.commit('login',data)
    login(state,token){
      state.Authorization = token;
      localStorage.setItem('token',token)
    },
    //设置用户信息
    setUser(state,user){
      state.user = user;
      localStorage.setItem('user',JSON.stringify(user))
    }
  },
  actions: {
  },
  modules: {
  }
})
