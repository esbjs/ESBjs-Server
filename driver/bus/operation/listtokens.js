
exports.ExecuteV2 = function (req, res, processResponse) {
    try{
        //console.log('Vou retornar: ', global.tokens_driver_operacao)
        processResponse(req, res, true, {"server" : global.CONFIG.server, "tokens"  : global.tokens_driver_operacao});
    }
    catch (e){
        processResponse(req, res, false, e);
    }
}
