var path = require('path');
var fs = require('fs');
var sys = require('sys')
var exec = require('child_process').exec;

var CONFIG = JSON.parse(fs.readFileSync(path.join(__dirname, 'config.json')))

exports.Execute = function(envelope, req, res){

    var repostiorio = undefined;
    for(var i in CONFIG.repositorios){
        var buffer = CONFIG.repositorios[i];
        console.log(buffer.name);
        if(buffer.name == envelope.repositorio){
            repostiorio = buffer;
            break;
        }
    }
    if(repostiorio == undefined){
        res.end(JSON.stringify({"return": false, "error" : "Repositório não localizado."}));
        console.error("Repositório " + envelope.repositorio +  " não localizado.")
        return;
    }

    if (envelope.operation == 'read') {
        try {

            fs.readFile(repostiorio.path +  envelope.path, function (err, data) {
                if (err) res.end(JSON.stringify({"return": false, "error" : err}));
                else res.end(JSON.stringify({"return": false, "data": data.toString()}));
            });

        } catch (e) {
            console.error(e);
            res.end(JSON.stringify({"return": false, "error" : e.stack}));
        }
    }

    else if (envelope.operation == 'write') {
        try {
            //console.log(envelope.data);
            fs.writeFile(repostiorio.path + envelope.path, envelope.data, function (err) {
                if (err) res.end(JSON.stringify({"return": false, "error" : err}));
                else res.end(JSON.stringify({"return": true}));
            });

        }catch(e){
            console.error(e);
            res.end(JSON.stringify({"return": false, "error" : e.stack}));
        }
    }

    else if (envelope.operation == 'find') {
        try {
            //find /backups/ -name 'linhares_es' -exec grep -i -l 'linhares_es_2017_02_05' {} \
            //console.log(CONFIG.repositorios[envelope.repositorio]);
            var child;
            //console.log("find "+ repostiorio.path +" -name '"+ envelope.name +"' -exec grep -i -l '"+ envelope.key +"' {} \\;")
            child = exec("find "+ repostiorio.path +" -name '"+ envelope.name +"' -exec grep -i -l '"+ envelope.key +"' {} \\;", function (error, stdout, stderr) {
                //console.log(stdout);
                if (error !== null) {
                    res.end(JSON.stringify({"return": false, "error" : stderr}));
                }
                else{
                    res.end(JSON.stringify({"return": true, "output" : stdout.split('\n')}));
                }
            });

        }catch(e){
            console.error(e.stack);
            res.end(JSON.stringify({"return": false, "error" : e.stack}));
        };
    }

    else if (envelope.operation == 'list') {
        try {
            var walkSync = function(dir, filelist) {
                var fs = fs || require('fs'),
                    files = fs.readdirSync(dir);
                filelist = filelist || [];
                files.forEach(function(file) {
                    if (fs.statSync(dir + '/' + file).isDirectory()) {
                        filelist = walkSync(dir + '/' + file, filelist);
                    }
                    else {
                        filelist.push( dir.substr(repostiorio.path.length) + "/" + file);
                    }
                });
                return filelist;
            };
            res.end(JSON.stringify({"return": true, "files" : walkSync(repostiorio.path + envelope.path, [])}));


        }catch(e){
            console.error(e.stack);
            res.end(JSON.stringify({"return": false, "error" : e.stack}));
        };
    }
}

exports.Init = function(){

}

exports.Log = function(envelope){
    return undefined;
}




