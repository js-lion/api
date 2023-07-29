const shell = require("shelljs");
// 生成声明文件
shell.exec("tsc --declaration --noEmit false --target ESNext --emitDeclarationOnly --declarationDir ./types ./src/libs/index", {
  silent: true
});