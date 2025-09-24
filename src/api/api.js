import http from '@/axios';

//统一接口信息
//所有的请求全部统一在这里配置
//get请求示例,带参数
export const getUserInfo = (param) => http.get('url',param.id);
//get请求示例，不带参数
export const getUserList = () => http.get('url');
//post请求示例 带参数
export const validateLoginApi = (data) => http.post('url',data);
//post请求示例 不带参数
export const userlogout = () => http.post('url');
//建议使用的方法
//将post对象封装在一个form对象里，直接将对象作为参数传入
export const doMothed = (form) => http.post('url',form);

/**
 * 用户管理模块
 */
//用户登录
export const loginUser = (form) => http.post('http://localhost:8081/user/login',form);