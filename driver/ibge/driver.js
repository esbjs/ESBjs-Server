var path = require('path');
var mongo = require(path.join(__dirname , "mongo.js"));
var utilitario = require(path.join(__dirname , '..', '..', 'api', "utilitario.js"));

exports.Execute = function(envelope, req, res){
    if (envelope.operation == 'select') {

        mongo.ConsultarAsync(envelope.table, envelope.key, undefined, envelope, function (resultadojs) {
            try {
                //console.log(resultadojs);
                res.end(JSON.stringify(resultadojs));
            }
            catch (e) {
                console.error(e.stack);
            }
        });
    }

    if (envelope.operation == 'count') {

        mongo.Count(envelope.table, envelope.key, envelope, function (retorno) {
            try {
                //console.error(retorno);
                res.end(JSON.stringify(retorno));
            }
            catch (e) {
                console.error(e.stack);
            }
        });
    }

    if (envelope.operation == 'testinsert') {
        try {
            mongo.UpdateAsync(envelope.table, envelope.key, envelope.data, {}, function (retornar) {
                res.end(JSON.stringify(retornar));
                //console.log(retornar);
            });
        } catch (e) {
            console.error(e.stack);
        }
    }

}

exports.Log = function(envelope){
    if (envelope.operation == 'testinsert')
        return {"table" : envelope.table  ,"operacao" : envelope.operation, 'chave': envelope.key, 'data' : envelope}
    return undefined;
}

exports.Init = function(){

}

exports.InterfaceInterna = function(envelope, callback){
    mongo.ConsultarAsync(envelope.table, envelope.key, undefined, envelope, function (resultadojs) {
        try {
            callback(resultadojs);
        }
        catch (e) {
            console.error(e.stack);
        }
    });
}






