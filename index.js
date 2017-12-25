var source_files = require('./source_files.json'),
    webapi_path = require('./package.json').webapi_path,
    template = require('simple-replace-template'),
    namespace = require('./namespace'),
    modules_path_list,
    module_init;

for (var module_type in source_files) {
    modules_path_list = source_files[module_type];

    modules_path_list.forEach(function(path) {
        path = template(path, {webapi_path:webapi_path});
        module_init = require(path);

        if (typeof module_init === "function" && !module_init.isNamespace) {
            module_init(namespace);
        }
    });
}

module.exports = namespace;