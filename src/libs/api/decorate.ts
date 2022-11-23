/**
 * @file http 装饰器
 * @author svon.me@gmail.com
 * @description 根据某些场景做一些处理
 */

import API from "./api";
import _ from "lodash-es";
import type { AxiosRequestConfig } from "axios";

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
 * @file get 请求
 * @param url 请求地址
 * @param config Axios 配置
 */
export const get = function (url: string, config?: AxiosRequestConfig) {
  const api = new API(config);
  return function (target: any, methodName: string, descriptor: PropertyDescriptor) {
    // 缓存被装饰得函数
    const configure = makeValue(descriptor.value);
    descriptor.value = async function (...args: any[]) {
      // 拿到配置数据
      const data = await configure.call(this, args);
      // 拼接请求参数
      const option = Object.assign({}, data.config ? data.config : {}, { 
        params: data.params
      });
      // 发起请求
      const result = await api.get(url, option);
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
 * @file post 请求
 * @param url 请求地址
 * @param config Axios 配置
 */
export const post = function (url: string, config?: AxiosRequestConfig) {
  const api = new API(config);
  return function (target: any, methodName: string, descriptor: PropertyDescriptor) {
    const configure = makeValue(descriptor.value);
    descriptor.value = async function (...args: any[]) {
      const data = await configure.call(this, args);
      const option = Object.assign({}, data.config ? data.config : {}, { 
        params: data.params || {}
      });
      const result = await api.post(url, data.data, option);
      if (data.callback && typeof data.callback === "function") {
        return data.callback.call(this, result);
      }
      return result;
    };
  };
};