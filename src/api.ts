/**
 * @file 封装数据请求
 * @author svon.me@gmail.com
 */

import * as _ from "lodash-es";
import AxiosHttp from "axios";
import { regExpTest, template } from "@js-lion/template";
import type { Axios, AxiosRequestConfig, AxiosResponse } from "axios";

type reqHook = (req: AxiosRequestConfig) => AxiosRequestConfig;
type resHook = (res: AxiosResponse) => AxiosResponse;
type useReject = ((error: any) => any) | ((error: any) => Promise<any>);

const requestList: Array<Array<reqHook | useReject>> = [];
const responseList: Array<Array<resHook | useReject>> = [];
const env = new Map<string, string | number>();
const axiosConfig: AxiosRequestConfig = {};


const CallbackError = function(value: any) {
  const code: number = _.get<object, string>(value, "code");
  if (code === 0) {
    return value;
  }
  return Promise.reject(value);
}

class Basis {
  public env: object;
  constructor(value = {}) {
    this.env = value;
    this.requestCallback = this.requestCallback.bind(this);
  }
  /**
   * 设置响应前拦截器
   * @param hook 
   * @param reject 
   */
  static addRequest(hook: reqHook, reject?: useReject) {
    if (hook) {
      requestList.push([hook, reject || CallbackError]);
    }
  }
  /**
   * 设置响应后拦截器
   * @param hook 
   * @param reject 
   */
  static addResponse(hook: resHook, reject?: useReject) {
    if (hook) {
      responseList.push([hook, reject || CallbackError]);
    }
  }
  static setEnv (data = {}) {
    for (const key of Object.keys(data)) {
      // @ts-ignore
      const value = data[key];
      env.set(key, value);
    }
  }
  static setConfig (config: AxiosRequestConfig = {}) {
     Object.assign(axiosConfig, config);
  }
  // 响应前拦截
  requestCallback(req: AxiosRequestConfig) {
    // 替换 url 中的宏变量
    if (req.url && regExpTest(req.url)) {
      const data = Object.assign({}, Object.fromEntries(env), this.env, req.params || {});
      const omits: string[] = [];
      req.url = template(req.url, function($1: string, key: string) {
        if (data.hasOwnProperty(key)) {
          omits.push(key);
          return data[key];
        }
      });
      req.params = _.omit(req.params || {}, omits);
    }
    return req;
  }

  protected getAxios(config: AxiosRequestConfig = {}): Axios {
    const option: AxiosRequestConfig = Object.assign({
      baseURL: "/",
      timeout: 1000 * 5, // 超时时间
      maxRedirects: 3,   // 支持三次重定向
      withCredentials: false,
    }, axiosConfig, config);
    const axios = AxiosHttp.create(option);
    // 响应时拦截
    axios.interceptors.request.use(this.requestCallback as any, CallbackError);
    for (const [callback, reject] of requestList) {
      axios.interceptors.request.use(callback as any, reject);
    }
    for (const [callback, reject] of responseList) {
      axios.interceptors.response.use(callback, reject);
    }
    return axios;
  }
}

export default class API extends Basis{
  public axios: Axios;
  constructor(config: AxiosRequestConfig = {}, env = {}) {
    super(env);
    this.axios = this.getAxios(config);
  }
  get<T = any, R = AxiosResponse<T>, D = any>(url: string, config?: AxiosRequestConfig<D>) {
    return this.axios.get<T, R, D>(url, config);
  }
  delete<T = any, R = AxiosResponse<T>, D = any>(url: string, config?: AxiosRequestConfig<D>) {
    return this.axios.delete<T, R, D>(url, config);
  }

  getUri(config?: AxiosRequestConfig): string {
    return this.axios.getUri(config);
  }

  head<T = any, R = AxiosResponse<T>, D = any>(url: string, config?: AxiosRequestConfig<D>) {
    return this.axios.head<T, R, D>(url, config);
  }

  options<T = any, R = AxiosResponse<T>, D = any>(url: string, config?: AxiosRequestConfig<D>) {
    return this.axios.options<T, R, D>(url, config);
  }

  patch<T = any, R = AxiosResponse<T>, D = any>(url: string, data?: D, config?: AxiosRequestConfig<D>) {
    return this.axios.patch<T, R, D>(url, data, config);
  }

  post<T = any, R = AxiosResponse<T>, D = any>(url: string, data?: D, config?: AxiosRequestConfig<D>) {
    return this.axios.post<T, R, D>(url, data || ({} as D), config);
  }

  put<T = any, R = AxiosResponse<T>, D = any>(url: string, data?: D, config?: AxiosRequestConfig<D>) {
    return this.axios.put<T, R, D>(url, data, config);
  }

  request<T = any, R = AxiosResponse<T>, D = any>(config: AxiosRequestConfig<D>) {
    return this.axios.request<T, R, D>(config);
  }
}