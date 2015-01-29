var npm = require('npm'),
    Promise = require('promise'),
    co = require('co'),

    _Util = {
        /**
         * 检查模块是否有更新版本
         * @param {Array}   package        需要检查的模块的名称，可以,分割的数组，可以为数组
         * @param {Function} callback      回调方法，返回为一个对象，key为模块的名称（小写）,val为对象，包含属性,package,current,wanted,latesed
         * @yield {[type]}   [description]
         */
        check: function(packageList, callback) {
            if (typeof(packageList) == 'string') {
                packageList = packageList.split(',');
            }

            co(function*() {
                yield Promise.denodeify(npm.load)({});

                var list = [];
                packageList.forEach(function(packageName) {
                    var data = Promise.denodeify(npm.outdate)(packageName);
                    list.push(data);
                });


                list =
                    yield list;

                var map = {};
                list.forEach(function(item) {
                    item = getInfoData(item);
                    map[item.package] = item;
                });

                callback && callback(null, map);
            });
        },
        /**
         * 更新
         * @param  {[type]} package [description]
         * @return {[type]}         [description]
         */
        update: function(packageList, callback) {
            if (typeof(packageList) == 'string') {
                packageList = packageList.split(',');
            }

            co(function*() {
                var map =
                    yield Promise.denodeify(_Util.check)(packageList);

                var list = [];
                for (var packageName in map) {
                    var item = map[packageName];

                    if (item.isOutdated) {
                        list.push(Promise.denodeify(npm.commands.update)(packageName));
                    }
                }

                list =
                    yield list;

                callback && callback(list);
            });
        }
    };



/**
 * 将数组数据转换成对象
 * @param  {[type]} arr [description]
 * @return {[type]}     [description]
 */
function getInfoData(data) {
    data = data[0];

    var attrName = ['', 'package', 'current', 'wanted', 'latest', 'location'],
        obj = {},
        i = 0;

    attrName.forEach(function(key) {
        if (i) {
            var val = data[i];
            obj[key] = val;
        }
        i++;
    });

    obj.isOutdated = obj.current < obj.wanted;

    return obj;
}

module.exports = _Util;
