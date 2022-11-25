/**
 * @file 装饰器
 * @author svon.me@gmail.com
 */
 import _ from "lodash-es";

 export type ErrCatch = (e: Error, ...args: any[]) => void;
 
 // 处理异常返回值
 const runCallback = function <T>(callback?: any, args: any[] = []): T | undefined {
   if (callback && _.isFunction(callback)) {
     // @ts-ignore
     return callback.apply(this, args);
   } else if (callback) {
     return callback;
   }
   return void 0;
 };
 
 
 /**
  * 监听异常
  * @param errCatch 异常时处理方式，发生异常时返回
  */
 export const tryError = function (errCatch?: any) {
   return function (target: any, methodName: string, descriptor: PropertyDescriptor) {
     const app = descriptor.value;
     descriptor.value = async function (...args: any[]) {
       try {
         return await app.apply(this, args);
       } catch (e) {
         return runCallback.call(this, errCatch, args);
       }
     };
   };
 };
 