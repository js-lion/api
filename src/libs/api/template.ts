/**
 * @file 字符串替换
 * @author svon.me@gmail.com
 */

type Replace = (key: string) => string;

export const regExpA = function() {
  return /{([\w]+)}/g;
}
export const templateA = function<T = object>(text: string, replace: T | Replace): string {
  return text.replace(regExpA(), function($1: string, $2: string): string {
    if (typeof replace === "function") {
      // @ts-ignore
      return replace($1, $2);
    }
    // @ts-ignore
    return replace[$2];
  });
};

export const regExpB = function() {
  return /\/:(\w+)/ig;
}
export const templateB = function<T = object>(text: string, replace: T | Replace): string {
  return text.replace(regExpB(), function($1: string, $2: string): string {
    if (typeof replace === "function") {
      // @ts-ignore
      return replace($1, $2);
    }
    // @ts-ignore
    return replace[$2];
  });
};

export const regExpText = function(text: string) {
  const reg1 = regExpA();
  const reg2 = regExpB();
  if (reg1.test(text) || reg2.test(text)) {
    return true;
  }
  return false;
}


export const template = function<T = object>(text: string, replace: T | Replace) {
  const value = templateA(text, replace);
  return templateB(value, replace);
};