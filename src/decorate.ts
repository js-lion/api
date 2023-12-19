/**
 * @file http 装饰器
 * @author svon.me@gmail.com
 * @description 根据某些场景做一些处理
 */

import API from "./api";
import * as _ from "lodash-es";
import type { AxiosRequestConfig, Method } from "axios";

type Fun = <T>(...args: any[]) => Promise<T>;

class MakeData {
  params?: object = {};
  data?: object | FormData = {};
  callback?: Fun;
  config?: AxiosRequestConfig;
}

// 获取参数
const makeValue = function(app: Fun) {
  return async function(args: any[]): Promise<MakeData> {
    // @ts-ignore
    const self = this;
    const data = await Promise.resolve(app.apply(self, args));
    if (Array.isArray(data)) {
      const params: object = data[0] || {};
      const callback: Fun = data[1];
      const config: AxiosRequestConfig = data[2] || {};
      return { params, callback, config };
    }
    return data as MakeData;
  }
}


/**
 * @file 请求
 * @param method 请求方式
 * @param url    请求地址
 * @param config Axios 配置
 */
export const Http = function (method: Method | string, url: string, config?: AxiosRequestConfig) {
  return function (target: any, methodName: string, descriptor: PropertyDescriptor) {
    // 缓存被装饰得函数
    const configure = makeValue(descriptor.value);
    descriptor.value = async function (...args: any[]) {
      const api = new API(config);
      // 拿到配置数据
      const data = await configure.call(this, args);
      // 拼接请求参数
      const option = Object.assign({}, data.config ? data.config : {}, {
        params: data.params
      });
      // 发起请求
      let result;
      switch(method.toUpperCase()) {
        case "GET":
          result = await api.get(url, option);
          break;
        case "DELETE":
          result = await api.delete(url, option);
          break;
        case "HEAD":
          result = await api.head(url, option);
          break;
        case "OPTIONS":
          result = await api.options(url, option);
          break;
        case "POST":
          result = await api.post(url, data.data, option);
          break;
        case "PUT":
          result = await api.post(url, data.data, option);
          break;
        case "PATCH":
          result = await api.patch(url, data.data, option);
          break;
        default:
          result = await api.request({ ...option, url, method, data: data.data });
          break;
      }
      
      // 判断是否有回调函数
      if (data.callback && typeof data.callback === "function") {
        return data.callback.call(this, result);
      }
      // 返回结果
      return result;
    };
  };
};

/**
 * @file         GET 请求
 * @param url    请求地址
 * @param config Axios 配置
 */
export const Get = function (url: string, config?: AxiosRequestConfig) {
  return Http("GET", url, config);
};

/**
 * @file         GET 请求
 * @param url    请求地址
 * @param config Axios 配置
 */
export const get = function (url: string, config?: AxiosRequestConfig) {
  console.warn("Deprecated, it is recommended to use Get");
  return Get(url, config);
};

/**
 * @file         POST 请求
 * @param url    请求地址
 * @param config Axios 配置
 */
export const Post = function (url: string, config?: AxiosRequestConfig) {
  return Http("POST", url, config);
};

/**
 * @file         POST 请求
 * @param url    请求地址
 * @param config Axios 配置
 */
export const post = function (url: string, config?: AxiosRequestConfig) {
  console.warn("Deprecated, it is recommended to use Post");
  return Post(url, config);
};

/**
 * @file         DELETE 请求
 * @param url    请求地址
 * @param config Axios 配置
 */
export const Delete = function (url: string, config?: AxiosRequestConfig) {
  return Http("DELETE", url, config);
};

/**
 * @file         PUT 请求
 * @param url    请求地址
 * @param config Axios 配置
 */
export const Put = function (url: string, config?: AxiosRequestConfig) {
  return Http("PUT", url, config);
};