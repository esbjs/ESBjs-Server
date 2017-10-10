var path = require('path');
var generico = require(path.join(__dirname, "generic.js"));

exports.ExecuteV2 = function(req, res, processRequest, parameters){

    var chave = req.body.tokenId + "_" + req.body.driver + "_" + req.body.operation;
    if(global.SERVICOS_DISPONIVEIS[ chave ] == undefined || global.SERVICOS_DISPONIVEIS[ chave ].servers == undefined ||
        global.SERVICOS_DISPONIVEIS[ chave ].servers.length == 0){
        processRequest(req, res, false, "Sem servidor localizado.");
        return;
    }

    var parameters = {"servers" : [], "pos" : 0, "results" : [], "chave" : chave };
    for(var i = 0; i < global.SERVICOS_DISPONIVEIS[ chave ].servers.length; i++){
        if(!global.SERVICOS_DISPONIVEIS[ chave ].servers[i].status) continue;
        parameters.servers.push(global.SERVICOS_DISPONIVEIS[ chave ].servers[i]);
    }

    if(parameters.servers.length == 0){
        processRequest(req, res, false, "Sem servidor localizado.");
        return;
    }
    generico.Process(req, res, parameters.servers[parameters.pos], Valid, processRequest, parameters);

}

function Valid(req, res, sucess, processRequest, data, parameters){
    parameters.results.push(data);
    parameters.pos += 1;

    if(parameters.pos >= parameters.servers.length){
        processRequest(req, res, true, parameters.results);
        return;
    }

    generico.Process(req, res, parameters.servers[parameters.pos], Valid, processRequest, parameters);
}