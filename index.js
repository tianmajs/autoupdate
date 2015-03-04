var fs = require('fs'),
	path = require('path'),
	http = require('http'),
	exec = require('child_process').exec;

var LOG_PREFIX = '[autoupdate]: ';

var pkg = (function find(dir) {

	var pkg = path.join(dir, 'package.json'),
			parent;

	if (fs.existsSync(pkg)) {
		return JSON.parse(fs.readFileSync(pkg, 'utf8')||{});
	}
	parent = path.join(dir, '../');
	if (parent === dir) {
		throw new Error('package.json not found');
	}
	return find(parent);

}(path.dirname(module.parent.filename)));

module.exports = function (callback) {
	var registry = (pkg.publishConfig && pkg.publishConfig.registry) || 'http://registry.npmjs.org',
			pkgUrl = registry + '/' + pkg.name;

	http.get(pkgUrl, function (res) {
		var data = [] ;

		if (res.statusCode !== 200) {
			return console.error(LOG_PREFIX + 'Failed to check the new version(%s)', pkg.name);
		}

		res.on('data', function (chunk) {
			data.push(chunk);
		});
		res.on('end', function () {
			var command,
					latest = JSON.parse(Buffer.concat(data).toString())['dist-tags']['latest'] ;

			if (latest == pkg.version) {
				return callback();
			}
			command = 'npm install ' + pkg.name + '@' + latest + ' --registry=' + registry ;
			console.log(LOG_PREFIX + 'New version found (%s@%s)', pkg.name, latest);
			exec(command, function (err) {
				if (err) {
					throw err;
				}
				console.log(LOG_PREFIX + 'Updated to %s (%s)', latest, pkg.name);
				callback();
			});
		});


	});
};
