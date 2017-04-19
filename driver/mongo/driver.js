var path = require('path');
var mongo = require(path.join(__dirname, "generic_mongo.js"));
var utilitario = require(path.join(__dirname, '..', '..', 'api', "utilitario.js"));

exports.Execute = function (envelope, req, res) {
    try {
        if (envelope.operation == 'select') {

            mongo.ConsultarAsync(envelope.instancia, envelope.table, envelope.key, undefined, envelope, function (resultadojs) {
                try {
                    //console.log(resultadojs);
                    res.end(JSON.stringify(resultadojs));
                }
                catch (e) {
                    console.error(e.stack);
                }
            });
        }

        else if (envelope.operation == 'count') {

            mongo.Count(envelope.instancia,envelope.table, envelope.key, envelope, function (retorno) {
                try {
                    //console.error(retorno);
                    res.end(JSON.stringify(retorno));
                }
                catch (e) {
                    console.error(e.stack);
                }
            });
        }

        else if (envelope.operation == 'testinsert') {
            try {
                mongo.UpdateAsync(envelope.instancia,envelope.table, envelope.key, envelope.data, {}, function (retornar) {
                    res.end(JSON.stringify(retornar));
                    //console.log(retornar);
                });
            } catch (e) {
                console.error(e.stack);
            }
        }

        else if (envelope.operation == 'remove') {
            try {
                mongo.Remove(envelope.instancia,envelope.table, envelope.key, {}, function (retornar) {
                    res.end(JSON.stringify(retornar));
                    //console.log(retornar);
                });
            } catch (e) {
                console.error(e.stack);
            }
        }
    }
    catch (e) {
        console.error(e.stack);
    }
}

exports.Log = function (envelope) {
    if (envelope.operation == 'testinsert')
        return {"table": envelope.table, "operacao": envelope.operation, 'chave': envelope.key, 'data': envelope}
    return undefined;
}

exports.InterfaceInterna = function (envelope, callback) {
}

exports.Init = function () {
}





