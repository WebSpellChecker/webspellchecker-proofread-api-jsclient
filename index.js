 var source_files = require('./source_files.json'),
    webapi_root = require('./package.json').webapi_root,
    template = require('simple-replace-template'),
    namespace, modules_path_list, module_init;

for(var module_type in source_files) {
    modules_path_list = source_files[module_type];
    modules_path_list.forEach(function(path) {
        path = template(path, {webapi_root:webapi_root});
        module_init = require(path);
        if(module_init.isNamespace) {
            namespace = module_init;
        }
        if(typeof module_init === "function" && !module_init.isNamespace) {
            module_init(namespace);
        }
    });
}

module.exports = namespace;