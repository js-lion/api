<h1 align="center">@js-lion/api</h1>

<div align="center">
<h3>基于 Axios 而封装的 Http 请求</h3>
<p>简化 Http 请求, 不会对 Axios 做任何改变</p>
<p>简单配置，快讯开发</p>
</div>

## 功能

- 支持 URL 动态变量解析
- 支持使用装饰器进行 Http 请求

## 安装

**Npm**
```
$ npm install @js-lion/api lodash-es axios reflect-metadata
```

**yarn**
```
$ yarn add @js-lion/api lodash-es axios reflect-metadata
```

**pnpm**
```
$ pnpm install @js-lion/api lodash-es axios reflect-metadata
```

**可以通过 import 导入方式使用**

```
import { API, get, post } from "@js-lion/api";
```

**或则通过 require 导入方式使用**

```
const { API, get, post } = require("@js-lion/api");
```

## 案例

```
import { API, get } from "@js-lion/api";

interface UserInfo {
  id?: string | number;
  nikeName?: string;
}

class Http extends API {
  // get 注解(装饰器)
  @get("/user/:id")
  getUserInfo<T = UserInfo>(userId: string | number): Promise<T> {
    // 准备请求参数
    const params = { id: userId };
    // 该返回值被注解接收用于发起 http 请求, 然后在将结果正常返回
    return { params } as any;
  }

  @post("/user/create")
  createUser(data: UserInfo): Promise<boolean> {
    // 处理接口返回的数据，按业务需求进行处理
    const callback = function(result: object) {
      // todo
      // 该返回值会直接返回给 createUser 方法
      return result ? true : false;
    };
    // 注解在发起 http 请求会，会将结果传给 callback 进行处理
    return { data, callback } as any;
  }

  // 其余情况
  other<T>(query: object): Promise<T> {
    const params = {
      // todo
    };
    // 可以使用 Axios 的所有方法 [get / post / put / delete ...]
    return this.delete("/xxx", { params });
  }
}

const http = new Http();
const getUser = async function() {
  const userId = 1;
  const userInfo = await http.getUserInfo(userId);
  console.log(userInfo);
}

const createUser = async function() {
  const user: UserInfo = {
    nikeName: "xx"
  };
  const status = await http.createUser(user);
  console.log(status);
}
```

## 配置

```
import { API } from "@js-lion/api";
import type { AxiosRequestConfig, AxiosResponse } from "axios";

API.setEnv({
  // 配置全局的变量，用于 url 宏变量替换
});

API.setConfig({
  baseURL: "/",
  // 配置全局的 Axios Config
});

API.addRequest(function(req: AxiosRequestConfig) {
  // 请求前处理
  return req;
});

API.addResponse(function(res: AxiosResponse) {
  // 请求完成时处理
  return res;
});


class Http extends API {
  constructor() {
    // 配置 Axios 默认参数
    const config: AxiosRequestConfig = {
      // todo
    };
    super(config);
  }
}
```

## 装饰器列表

装饰器名称 | 描述
-- | --
@get | 创建一个 Http Get 请求
@post | 创建一个 Http Post 请求
@validate | 对方法的参数断言
@required | 设置参数为必填，不允许为空
@tryError | 监听方法异常，异常时返回默认值


```
import { API, get, validate, required, tryError } from "@js-lion/api";

class Http extends API {
  @get("/user/:id")
  @validate
  getUserInfo<T = UserInfo>(@required userId: string | number): Promise<T> {
    // todo
  }
  @tryError(false)
  @post("/user/create")
  createUser(data: UserInfo): Promise<boolean> {
    // 处理接口返回的数据，按业务需求进行处理
    const callback = function(result: object) {
      // todo
      return true;
    };
    return { data, callback } as any;
  }
}
```