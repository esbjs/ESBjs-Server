var path = require('path');
var utilitario = require(path.join(__dirname, '..', '..', 'api', "utilitario.js"));
var request = require('request');

var sessions = {};
exports.Execute = function (envelope, req, res) {
    if(envelope.operation == 'zltcc001'){
        res.end(JSON.stringify({"projetos" : [
            {"nome" : "Manipulação de dados", "ra" : "1111111111", "orientador" : 04642},
            {"nome" : "Anomalias em execuções assincronas", "ra" : "1111111112", "orientador" : 04642},
            {"nome" : "DDoS e DoS", "ra" : "1111111113", "orientador" : 04642}
        ]}));
    }

}

exports.Init = function () {

}

exports.Log = function (envelope) {
    return undefined;
}

