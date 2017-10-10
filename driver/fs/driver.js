var path = require('path');
var fs = require('fs');
var utilitario = require(path.join(__dirname, '..', '..', 'api', "utilitario.js"));


var CONFIG = JSON.parse(fs.readFileSync(path.join(__dirname, 'config.json')))

exports.Repositorio = function(envelope){
    var repostiorio = undefined;
    for (var i in CONFIG.repositorios) {
        var buffer = CONFIG.repositorios[i];

        if (buffer.name == envelope.repositorio) {
            repostiorio = buffer;
            break;
        }
    }
    return repostiorio;
}



exports.Execute = function (envelope, req, res) {

}

exports.Init = function () {

}

exports.Log = function (envelope) {
    return undefined;
}




