var path = require('path');
var mongo = require(path.join(__dirname, "mongo.js"));
var utilitario = require(path.join(__dirname, '..', '..', 'api', "utilitario.js"));

exports.Execute = function (envelope, req, res) {
    try {
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

        if (envelope.operation == 'next') {
            if (contador_envios > 1900 || ultima_hora != (new Date()).getHours() || buffer_contador >= tarefas_listadas.length) {
                //console.log('Pedindo para carregar')
                GambiarraTarefas();
            }

            var buffer_contador = contador_envios;
            contador_envios += 1;
            var retorno = tarefas_listadas[buffer_contador];
            if (retorno == undefined) {
                //console.log('Pedindo para carregar por nao ter registros')
                GambiarraTarefas();
            }
            res.end(JSON.stringify(retorno));

            // Atualizar o banco de dados
            var data = new Date();
            data.setMinutes(data.getMinutes() + 2);
            var aux = utilitario.DataFormatada(undefined, "YYYYMMDDHHMM");

            var data = {"status": {"status": "processando", "data": parseInt(aux)}};
            //console.log("A tarefa vai ser:", retorno)
            chave_tarefa = JSON.parse(JSON.stringify(retorno)).chave;
            //console.error(chave_tarefa);
            mongo.UpdateAsync(envelope.table, {"chave": chave_tarefa}, data, {}, function (retornar) {
                //    //res.end(JSON.stringify(retornar));
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

        if (envelope.operation == 'remove') {
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
    if (envelope.operation == 'next')
        return {"operacao": envelope.operation, 'data': envelope}
    return undefined;
}

exports.InterfaceInterna = function (envelope, callback) {
    mongo.ConsultarAsync(envelope.table, envelope.key, undefined, envelope, function (resultadojs) {
        try {
            callback(resultadojs);
        }
        catch (e) {
            console.error(e.stack);
        }
    });
}


// GAMBIARRA --------------------------------- GAMBIARRA -------------------------------- GAMBIARRA
var tarefas_listadas = [];
var contador_envios = 0;
var ultima_hora = 0;
function GambiarraTarefas() {
    var data = utilitario.DataFormatada(undefined, "YYYYMMDDHHMM");
    var key = {
        "$or": [
            {
                "status.status": "processando",
                "status.data": {"$lt": parseInt(data)}
            },
            {"status": {"$exists": false}}]
    };

    var hora_texto = utilitario.DataFormatada(undefined, "YYYYMMDDHH");
    mongo.ConsultarAsync('tasks_' + hora_texto, key, undefined, {"limit": 2000}, function (resultadojs) {
        //console.error('Total de registros carregados:', resultadojs.length);
        try {
            ultima_hora = (new Date()).getHours()
            tarefas_listadas = resultadojs;
            contador_envios = 0;
        } catch (e) {

        }
    });
}

exports.Init = function () {
    //GambiarraTarefas();
}

// ---------------- FIM DA GAMBIARRA ---------------- FIM DA GAMBIARRA ---------------- FIM DA GAMBIARRA ---------------- FIM DA GAMBIARRA





