/**
 * @file 封装数据请求
 * @author svon.me@gmail.com
 */

import _ from "lodash-es";
import AxiosHttp from "axios";
import { regExpTest, template } from "./template";
import type { Axios, AxiosRequestConfig, AxiosResponse } from "axios";

type reqCallback = (req: AxiosRequestConfig) => AxiosRequestConfig;
type resCallback = (res: AxiosResponse) => AxiosResponse;

const requestList: reqCallback[] = [];
const responseList: resCallback[] = [];
const env = new Map<string, string | number>();
const axiosConfig: AxiosRequestConfig = {};

class Basis {
  public env: object;
  constructor(value = {}) {
    this.env = value;
    this.CallbackError = this.CallbackError.bind(this);
    this.requestCallback = this.requestCallback.bind(this);
  }
  static addRequest(callback: reqCallback) {
    if (callback) {
      requestList.push(callback);
    }
  }
  static addResponse(callback: resCallback) {
    if (callback) {
      responseList.push(callback);
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
  async CallbackError(value: any) {
    const code: number = _.get<object, string>(value, "code");
    if (code === 0) {
      return value;
    }
    return Promise.reject(value);
  }
  // 响应前拦截
  async requestCallback(req: AxiosRequestConfig) {
    // 替换 url 中的宏变量
    if (req.url && regExpTest(req.url)) {
      
      const data = Object.assign({}, Object.fromEntries(env), this.env, req.params || {});
      if (req.data && (req.data instanceof FormData === false)) {
        Object.assign(data, req.data);
      }

      req.url = template(req.url, function($1: string, $2: string) {
        const value = _.get<object, string>(data, $2);
        if (value && _.isString(value) && value.includes("/")) {
          return value;
        }
        return `/${value}`;
      });
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
    axios.interceptors.request.use(this.requestCallback, this.CallbackError);
    for (const callback of requestList) {
      axios.interceptors.request.use(callback, this.CallbackError);
    }
    for (const callback of responseList) {
      axios.interceptors.response.use(callback, this.CallbackError);
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