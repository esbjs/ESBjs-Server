exports.ExecuteV2 = function (req, res, processResponse) {
    try{
        console.log('Entrou no print')
        var chave = "";
        if(req.body.tokenId_find != undefined){
            chave = req.body.tokenId_find;
        }

        if(req.body.driver_find != undefined){
            chave += (chave != "" ? "_" : "") + req.body.driver_find;
        }

        if(req.body.operation_find != undefined){
            chave += (chave != "" ? "_" : "") + req.body.operation_find;
        }

        if(chave == ''){
            chave = "requisicoes";
        }
        console.log('Chave:', chave, "sucesso:", global.statistic.contatdor_sucesso_driver_operacao[chave]);
        console.log("Estatística", global.statistic)
        processResponse(req, res, true,
            {"sucess" : global.statistic.contatdor_sucesso_driver_operacao[chave],
             "fail"   : global.statistic.contatdor_falha_driver_operacao[chave],
             "start" : global.statistic.start_time,
              "now" : new Date()
            });
    }
    catch (e){
        processResponse(req, res, false, e + (e.stack ? e.stack : ""));
    }
}

