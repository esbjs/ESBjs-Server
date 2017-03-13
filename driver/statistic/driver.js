var path = require('path');
var utilitario = require(path.join(__dirname, '..', '..', 'api', 'utilitario.js'));


var data_inicio = new Date();
var contador_operacoes = {};
var contador_geral = 0;

exports.Execute = function(envelope, req, res){
    try {
        contador_geral += 1;
        if(contador_operacoes[envelope.driver + "_" + envelope.operation] == undefined){
            contador_operacoes[envelope.driver + "_" + envelope.operation] = 0;
        }
        contador_operacoes[envelope.driver + "_" + envelope.operation] += 1;

    }
    catch(e){
        console.error(e.stack);
        // nao requer parar a aaplicação
    }
}

exports.Print = function(req, res){
    res.writeHead(200, {"Content-Type": "application/json"});
    res.end(JSON.stringify({"status": true, "requisicoes" : contador_geral, "operacao" : contador_operacoes,
        "inicio" : utilitario.DataFormatada(data_inicio, "DD/MM/YYYY HH:MM")}));
}

exports.Init = function(){
    console.log('Data:', data_inicio);
}


exports.Log = function(envelope){
    return undefined;
}



