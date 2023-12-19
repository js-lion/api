/**
 * @file 装饰器
 * @author svon.me@gmail.com
 */

export type CatchValue = (e: Error, ...args: any[]) => void;

/**
 * 监听异常
 * @param errCatch 异常时处理方式，发生异常时返回
 */
export const tryError = function (catchValue?: CatchValue | any) {
  return function (target: any, methodName: string, descriptor: PropertyDescriptor) {
    const app = descriptor.value;
    descriptor.value = async function (...args: any[]) {
      try {
        return await app.apply(this, args);
      } catch (e) {
        if (catchValue && typeof catchValue === "function") {
          // @ts-ignore
          return catchValue.apply(this, [e, ...args]);
        }
        return catchValue;
      }
    };
  };
};
