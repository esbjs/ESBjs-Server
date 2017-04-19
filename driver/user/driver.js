var path = require('path');
var mongo = require(path.join(__dirname, "mongo.js"));
var utilitario = require(path.join(__dirname, '..', '..', 'api', "utilitario.js"));

exports.Execute = function (envelope, req, res) {
    try {

        if (envelope.operation == 'new') {
            try {
                mongo.ConsultarAsync('users', {"email" : envelope.user.email}, undefined, envelope, function (resultadojs) {
                    try {
                        if(resultadojs.length == 0){
                            mongo.UpdateAsync("users", {"email" : envelope.user.email}, envelope.user, {}, function (retornar) {
                                console.log(retornar)
                                res.end(JSON.stringify(retornar));
                            });
                        }
                        else{
                            res.end(JSON.stringify({"ok" : 0}));
                        }
                    }
                    catch (e) {
                        console.error(e.stack);
                        res.end(JSON.stringify({"ok" : 0, "error" : e.stack}));
                    }
                });
            } catch (e) {
                console.error(e.stack);
                res.end(JSON.stringify({"ok" : 0, "error" : e.stack}));
            }
        }

        else if (envelope.operation == 'select') {

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

        else if (envelope.operation == 'count') {

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

        else if (envelope.operation == 'update') {
            try {
                mongo.UpdateAsync(envelope.table, envelope.key, envelope.data, {}, function (retornar) {
                    res.end(JSON.stringify(retornar));
                    //console.log(retornar);
                });
            } catch (e) {
                console.error(e.stack);
            }
        }

        else if (envelope.operation == 'remove') {
            try {
                mongo.Remove(envelope.table, envelope.key, {}, function (retornar) {
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





