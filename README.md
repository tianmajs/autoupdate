# autoupdate

autoupdate 赋予模块自动更新版本的能力。

### usage

模块入口文件:index.js

```
var update = require('autoupdate');

module.exports = function (type, config) {
	update(function () {
		require('./conf/' + type)(config);
	});
};

```
