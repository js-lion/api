/**
 * @file 参数校验
 * @author svon.me@gmail.com
 */

import * as _ from "lodash-es";
import "reflect-metadata";

const requiredMetadataKey = Symbol("required");

const isEmpty = function(value: any): boolean {
  if (value) {
    return false;
  }
  // 空字符串与0在实际业务中属于有意义的数据
  if (_.isString(value) || value === 0) {
    return false;
  }
  // 判断 undefined, null, NaN
  if (_.isNil(value) || _.isNaN(value)) {
    return true;
  }
  return false;
}

/** 参数装饰器，必填参数 */
export const required = function (target: object, propertyKey: string | symbol, parameterIndex: number) {
  // @ts-ignore
  const existingRequiredParameters: number[] = Reflect.getOwnMetadata(requiredMetadataKey, target, propertyKey) || [];
  existingRequiredParameters.push(parameterIndex);
  // @ts-ignore
  Reflect.defineMetadata(requiredMetadataKey, existingRequiredParameters, target, propertyKey);
};

/** 参数校验装饰器 */
export const validate = function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
  const fun = descriptor.value;
  descriptor.value = function (...args: any[]) {
    // @ts-ignore
    const requiredParameters: number[] = Reflect.getOwnMetadata(requiredMetadataKey, target, propertyName);
    if (requiredParameters) {
      for (const parameterIndex of requiredParameters) {
        if (parameterIndex >= args.length || isEmpty(args[parameterIndex])) {
          const message = new Error("Missing required argument.");
          console.log(message);
          throw message;
        }
      }
    }
    // @ts-ignore
    return fun.apply(this, args);
  };
};