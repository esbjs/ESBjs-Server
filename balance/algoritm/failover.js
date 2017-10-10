var path = require('path');
var generico = require(path.join(__dirname, "generic.js"));

exports.ExecuteV2 = function(req, res, processRequest, parameters){
    if(req.body.failover.array == undefined){
        processRequest(req, res, false, undefined);
        return;
    }
    Executar(req, res, 0, processRequest, parameters);
}

function Valid(req, res, sucess, processRequest, data, parameters){

    if(sucess){
        processRequest(req, res, true, data);
    }
    else{
        Executar(req, res, parameters.index, processRequest, parameters);
    }
}

function Executar(req, res, start, processRequest, parameters){
    var chave = req.body.tokenId + "_" + req.body.driver + "_" + req.body.operation;
    if(global.SERVICOS_DISPONIVEIS[ chave ] == undefined || global.SERVICOS_DISPONIVEIS[ chave ].servers == undefined
        || global.SERVICOS_DISPONIVEIS[ chave ].servers.length == 0){

        processRequest(req, res, false, "Sem servidor localizado.");
        return;
    }

    for(var i = start; i < req.body.failover.array.length; i++){
        var index = Contem(req.body.failover.array[i].bus, req.body.failover.array[i].element, global.SERVICOS_DISPONIVEIS[chave].servers);
        if (index >= 0 && global.SERVICOS_DISPONIVEIS[chave].servers[index].status == true) {
            generico.Process(req, res, global.SERVICOS_DISPONIVEIS[chave].servers[index], Valid, processRequest, { "index" : i});
            return;
        }
    }

    // Ferrou, não achou um servidor disponível
    processRequest(req, res, false, "Não há servidor disponível");
}



function Contem(name, element, array){
    for(var i = 0; i < array.length; i++){
        if(array[i].name == name && array[i].element == element) return i;
    }
    return -1;
}
