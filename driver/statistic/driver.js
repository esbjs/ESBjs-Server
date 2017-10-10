var path = require('path');
var utilitario = require(path.join(__dirname, '..', '..', 'api', 'utilitario.js'));
var fs = require('fs');

//------------------- VERSAO 1 --------------------------
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
        "inicio" : utilitario.DataFormatada(global.statistic.start_time, "DD/MM/YYYY HH:MM")}));
}

//------------------- VERSAO 2 --------------------------

exports.ExecuteV2 = function(req, res, status){

    if(global.statistic == undefined) {
        global.statistic = {};
    }
    if(global.statistic.contatdor_sucesso_driver_operacao == undefined){
        global.statistic.contatdor_sucesso_driver_operacao = {};
    }
    if(global.statistic.contatdor_falha_driver_operacao == undefined){
        global.statistic.contatdor_falha_driver_operacao = {};
    }

    if(status){
        if(global.statistic.contatdor_sucesso_driver_operacao[req.body.tokenId + "_" + req.body.driver + '_' + req.body.operation] == undefined){
            global.statistic.contatdor_sucesso_driver_operacao[req.body.tokenId + "_" + req.body.driver + '_' + req.body.operation] = 0;
        }
        if(global.statistic.contatdor_sucesso_driver_operacao[req.body.driver + '_' + req.body.operation] == undefined){
            global.statistic.contatdor_sucesso_driver_operacao[req.body.driver + '_' + req.body.operation] = 0;
        }
        if(global.statistic.contatdor_sucesso_driver_operacao[req.body.driver] == undefined){
            global.statistic.contatdor_sucesso_driver_operacao[req.body.driver] = 0;
        }
        if(global.statistic.contatdor_sucesso_driver_operacao[req.body.tokenId] == undefined){
            global.statistic.contatdor_sucesso_driver_operacao[req.body.tokenId] = 0;
        }
        if(global.statistic.contatdor_sucesso_driver_operacao["requisicoes"] == undefined){
            global.statistic.contatdor_sucesso_driver_operacao["requisicoes"] = 0;
        }
        global.statistic.contatdor_sucesso_driver_operacao[req.body.tokenId + "_" + req.body.driver + '_' + req.body.operation] += 1;
        global.statistic.contatdor_sucesso_driver_operacao[req.body.driver + '_' + req.body.operation] += 1;
        global.statistic.contatdor_sucesso_driver_operacao[req.body.driver] += 1;
        global.statistic.contatdor_sucesso_driver_operacao[req.body.tokenId] += 1;
        global.statistic.contatdor_sucesso_driver_operacao["requisicoes"] += 1;
    }
    else{

        if(global.statistic.contatdor_falha_driver_operacao[req.body.tokenId + "_" + req.body.driver + '_' + req.body.operation] == undefined){
            global.statistic.contatdor_falha_driver_operacao[req.body.tokenId + "_" + req.body.driver + '_' + req.body.operation] = 0;
        }
        if(global.statistic.contatdor_falha_driver_operacao[req.body.driver + '_' + req.body.operation] == undefined){
            global.statistic.contatdor_falha_driver_operacao[req.body.driver + '_' + req.body.operation] = 0;
        }
        if(global.statistic.contatdor_falha_driver_operacao[req.body.driver ] == undefined){
            global.statistic.contatdor_falha_driver_operacao[req.body.driver] = 0;
        }
        if(global.statistic.contatdor_falha_driver_operacao[req.body.tokenId ] == undefined){
            global.statistic.contatdor_falha_driver_operacao[req.body.tokenId] = 0;
        }
        if(global.statistic.contatdor_falha_driver_operacao["requisicoes"] == undefined){
            global.statistic.contatdor_falha_driver_operacao["requisicoes"] = 0;
        }
        global.statistic.contatdor_falha_driver_operacao[req.body.tokenId + "_" + req.body.driver + '_' + req.body.operation] += 1;
        global.statistic.contatdor_falha_driver_operacao[req.body.driver + '_' + req.body.operation] += 1;
        global.statistic.contatdor_falha_driver_operacao[req.body.driver] += 1;
        global.statistic.contatdor_falha_driver_operacao[req.body.tokenId] += 1;
        global.statistic.contatdor_falha_driver_operacao["requisicoes"] += 1;
    }
    if(global.statistic.contatdor_falha_driver_operacao["requisicoes"] % 1000 == 0){
        fs.writeFile(path.join(__dirname, "tmp", "statistic.json"), JSON.stringify(global.statistic), function(err)
        {
           // Salvo ou nao salvo, nao importa, não é minha funçao principal.
        });
    }
    //console.error("Total de sucesso para ",req.body.tokenId, req.body.driver, req.body.operation, "é", global.contatdor_sucesso_driver_operacao[req.body.tokenId + "_" +req.body.driver + '_' + req.body.operation] )
}

exports.Init = function(){

    if(global.statistic == undefined){
        //if(fs.existsSync(path.join(__dirname, "tmp", "statistic.json"))){
        //    global.statistic = JSON.parse(fs.readFileSync(path.join(__dirname, "tmp", "statistic.json")));
        //}
    }

    // PAU DE LEITURA, RESETA TUDO E COMEÇA DE NOVO.
    if(global.statistic == undefined){
        global.statistic = {};
        global.statistic.contatdor_sucesso_driver_operacao = {};
        global.statistic.contatdor_falha_driver_operacao = {};

    }

    if(global.statistic.contatdor_sucesso_driver_operacao  == undefined){
        global.statistic.contatdor_sucesso_driver_operacao = {};
    }
    if(global.statistic.contatdor_falha_driver_operacao == undefined){
        global.statistic.contatdor_falha_driver_operacao = {};
    }
    global.statistic.start_time = new Date();
    console.log(global.statistic);

}


exports.Log = function(envelope){
    return undefined;
}



