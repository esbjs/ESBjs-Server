var path = require('path');
var mongo = require(path.join(__dirname, "mongo.js"));
var utilitario = require(path.join(__dirname, '..', '..', 'api', "utilitario.js"));

var contador_execucoes = 0;
exports.Execute = function (envelopeLog, req, res) {
    try {
        if (envelopeLog.envelope == undefined) {
            return;
        }

        var envelope = envelopeLog.envelope;
        var driver = envelopeLog.driver;

        //console.log(envelope)

        if (envelope.operation != undefined && envelope.operation == 'count') {

            mongo.Count(envelope.table, envelope.key, envelope, function (retorno) {
                try {
                    //console.error(retorno);
                    res.end(JSON.stringify(retorno));
                }
                catch (e) {
                    console.error(e.stack);
                }
            });
            return;
        }

        if (envelopeLog.operation != undefined && envelopeLog.operation == 'drop') {
            mongo.DropCollection(envelope.table, function (result) {
                res.end(JSON.stringify({"result": result}));
            });
            return;
        }

        if (envelopeLog.operation != undefined && envelopeLog.operation == 'insertlog') {
            contador_execucoes += 1;
            var collection = "log_";
            if (envelopeLog.collection != undefined) {
                collection = envelopeLog.collection;
            }
            var retorno = driver.Log(envelope);
            if (retorno == undefined) {
                return undefined;
            }

            var ip = req.headers['x-forwarded-for'] ||
                req.connection.remoteAddress ||
                req.socket.remoteAddress ||
                req.connection.socket.remoteAddress;


            var transactionId = '';
            var sessionId = '';
            var tokenId = '';

            var rotulo = utilitario.DataFormatada(undefined, "YYYYMMDDHH");
            if (envelope.trasactionId != undefined) {
                transactionId = envelope.trasactionId;
            }
            if (envelope.sessionId != undefined) {
                sessionId = envelope.sessionId;
            }
            if (envelope.tokenId != undefined) {
                tokenId = envelope.tokenId;
            }
            var chave_registro = ip + "_" + tokenId + '_' + sessionId + '_' + transactionId + "_" + utilitario.DataFormatada(undefined, "YYYYMMDDHHMM") + contador_execucoes;

            try {
                mongo.UpdateAsync(collection + rotulo,
                    {'chave': chave_registro}, {
                        'chave': chave_registro,
                        'sessionId': sessionId,
                        'transactionId': transactionId,
                        'tokenId': tokenId,
                        'log': retorno,
                        'date': new Date(),
                        'ip': ip
                    }, {}, function (retornar) {
                        //console.log(retornar);
                    });
            } catch (e) {
                console.error(e.stack);
            }
            return;
        }

        if (envelope.operation != undefined && envelope.operation == 'testinsert') {
            try {
                mongo.UpdateAsync(envelope.table, envelope.key, envelope.data, {}, function (retornar) {
                    res.end(JSON.stringify(retornar));
                });
            } catch (e) {
                console.error(e.stack);
            }
            return;
        }

        if (envelope.operation != undefined && envelope.operation == 'select') {

            mongo.ConsultarAsync(envelope.table, envelope.key, undefined, envelope, function (resultadojs) {
                try {

                    res.end(JSON.stringify(resultadojs));
                }
                catch (e) {
                    console.error(e.stack);
                }
            });
            return;
        }

    }
    catch(e){
        console.error(e.stack);
    }
}






exports.Init = function () {
    console.error('Driver do Service Bus será desenvolvido.')
}


exports.Log = function (envelope) {
    return undefined;
}



