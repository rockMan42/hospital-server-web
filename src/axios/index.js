import axios from 'axios'

//统一请求资源地址  http://localhost:8080/   
axios.defaults.baseURL = "http://localhost:8081/"
//统一请求头配置
axios.defaults.headers.post['Content-Type'] = 'application/json;charset=utf-8';


//添加统一认证的请求头token信息
axios.interceptors.request.use(config => {
  config.headers.token = localStorage.getItem('token');
  // 在最后必须return config
  return config;
});

//添加统一拦截response响应，判断token是否过期，如过期则清空登录状态，返回登录页面
axios.interceptors.response.use(response => {
  if (response.data.code == 403) {
    localStorage.clear();
    window.location.reload();
  }
  //最后必须返回response,否则其他请求拿不到响应
  return response;
},
  error => {
    if (error.response && error.response.data && error.response.data.code == 403) {
      localStorage.clear();
      window.location.reload();
    }
    return Promise.reject(error);
  }
);

var http = {
  baseURL:axios.defaults.baseURL,

  /** get 请求
   * @param  {接口地址} url
   * @param  {请求参数} params
   */
  get: function (url, params) {
    return new Promise((resolve, reject) => {
      axios.get(url, { params })
        .then((response) => {
          resolve(response.data);
        })
        .catch((error) => {
          reject(error);
        });
    })
  },
  /** post 请求
   * @param  {接口地址} url
   * @param  {请求参数} params
   */
  post: function (url, params) {
    return new Promise((resolve, reject) => {
      axios.post(url, params)
        .then((response) => {
          resolve(response.data);
        })
        .catch((error) => {
          reject(error);
        });
    });
  },
  /**
   * post 请求 文件上传
   * @param  {接口地址} url
   * @param  {请求参数} formData
   */
  postFile: function (url, formData) {
    return new Promise((resolve, reject) => {
      axios({
        url: url,
        method: 'post',
        data: formData,
        headers: { 'Content-Type': 'multipart/form-data' },
      }).then((response) => {        
        resolve(response.data);
      }).catch((error) => {
        reject(error);
      });      
    });
  },
  /**
   * post 请求 文件上传 带进度条
   * @param  {接口地址} url
   * @param  {请求参数} formData
   * @param  {请求进度} progress
   */
  postFileProgress: function (url, formData, progress) {
    return new Promise((resolve, reject) => {
      axios({
        url: url,
        method: 'post',
        data: formData,
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress:progress,
      }).then((response) => {        
        resolve(response.data);
      }).catch((error) => {
        reject(error);
      });
    });
  },
}
export default http