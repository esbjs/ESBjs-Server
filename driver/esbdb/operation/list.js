var path = require('path');
var fs = require('fs');
var driver = require(path.join(__dirname, '..', "driver.js"));
var utilitario = require(path.join(__dirname, '..', '..', "..", 'api', "utilitario.js"));
const CONFIG = JSON.parse(fs.readFileSync(path.join(__dirname, "..", 'config.json')));

exports.ExecuteV2 = function (req, res, processResponse) {
    try{
        var repositorio = CONFIG.repositories.find(function(value){ return value.token == req.body.repository;})
        const path_dir = path.join(repositorio.path, req.body.project, req.body.domain) + '/';
        processResponse(req, res, true, walkSync(path_dir, path.join( repositorio.path,  req.body.project)));
    }
    catch (e){
        console.error(e.stack);
        processResponse(req, res, false, e);
    }

}
// List all files in a directory in Node.js recursively in a synchronous fashion
var walkSync = function(dir, raiz, filelist) {
    var fs = fs || require('fs'),
        files = fs.readdirSync(dir);
    filelist = filelist || [];
    files.forEach(function(file) {
        if (fs.statSync(dir + file).isDirectory()) {
            filelist = walkSync(dir + file + '/', raiz , filelist);
        }
        else {
            var file_path = dir + file;
            filelist.push(file_path.substring(raiz.length));
        }
    });
    return filelist;
};


