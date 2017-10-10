var path = require('path');
var generico = require(path.join(__dirname, "generic.js"));

exports.ExecuteV2 = function(req, res, processRequest, parameters){
    var servers_selecionados = global.SERVICOS_DISPONIVEIS[ req.body.tokenId + "_" + req.body.driver + "_" + req.body.operation ].servers;
    var servidor = NextValid(servers_selecionados, req, res);
    if(servidor == undefined){
        processRequest(req, res, false, "Não há servidor disponível.");
    }
    else {
        if (parameters == undefined) {
            parameters = {"name": servidor.name, "element": servidor.element, "count": 1};
        }
        else {
            parameters.count += 1;
        }
        generico.Process(req, res, servidor, Valid, processRequest, parameters);
    }
}

function Valid(req, res, sucess, processRequest, data, parameters){

    if(sucess){

        processRequest(req, res, true, data);
    }
    else{
        var index =  Contem(parameters.name, parameters.element, global.SERVICOS_DISPONIVEIS[ req.body.tokenId + "_" + req.body.driver + "_" + req.body.operation ].servers);
        // Marcar o registro que falhou como FALSE
        if(index >= 0){
            global.SERVICOS_DISPONIVEIS[ req.body.tokenId + "_" + req.body.driver + "_" + req.body.operation ].servers[index].status = false;
        }

        // Se total de execuções foi superior ao total de servidores, então crash
        if(parameters.count < global.SERVICOS_DISPONIVEIS[ req.body.tokenId + "_" + req.body.driver + "_" + req.body.operation ].servers.length){
            exports.ExecuteV2(req, res, processRequest, parameters);
        }
        else{
            processRequest(req, res, false, "Sem serviço. " + data);
        }
    }
}


function NextValid(servers_selecionados, req, res){
    for(var i = 0; i < servers_selecionados.length; i++){
        if(global.SERVICOS_DISPONIVEIS[ req.body.tokenId + "_" + req.body.driver + "_" + req.body.operation ].roundrobin.indice + 1 >= servers_selecionados.length){
            global.SERVICOS_DISPONIVEIS[ req.body.tokenId + "_" + req.body.driver + "_" + req.body.operation ].roundrobin.indice = -1;
        }

        var selecionado = servers_selecionados[global.SERVICOS_DISPONIVEIS[ req.body.tokenId + "_" + req.body.driver + "_" + req.body.operation ].roundrobin.indice + 1];
        global.SERVICOS_DISPONIVEIS[ req.body.tokenId + "_" + req.body.driver + "_" + req.body.operation ].roundrobin.indice += 1;

        if(selecionado.status == true){
            return selecionado;
        }
    }

    console.log("Nenhum selecionado.")
    return null;
}

function Contem(name, element, array){
    for(var i = 0; i < array.length; i++){
        if(array[i].name == name && array[i].element == element) return i;
    }
    return -1;
}

