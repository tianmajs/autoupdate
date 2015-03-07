# autoupdate


autoupdate 赋予模块自动更新版本的能力。

## 安装

		$ npm install autoupdate

## 使用

#### 模块文件:index.js

```
var update = require('autoupdate');
// 模块入口
module.exports = function (type, config) {
	update(function () {
		require('./conf/' + type)(config);
	});
};

```

## 授权协议

[MIT](https://github.com/tianmajs/tianmajs.github.io/blob/master/LICENSE)
