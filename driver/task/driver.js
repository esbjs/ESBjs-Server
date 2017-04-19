var path = require('path');
var fs = require('fs');
var path = require('path');
var mongo = require(path.join(__dirname, "mongo.js"));
var utilitario = require(path.join(__dirname, '..', '..', 'api', "utilitario.js"));

var versao = fs.readFileSync(path.join(__dirname, 'version')).toString();
var maquinas_atualizando = [];

exports.Execute = function (envelope, req, res) {
    try {
        if (envelope.operation == 'select') {
            mongo.ConsultarAsync(envelope.table, envelope.key, undefined, envelope, function (resultadojs) {
                try {
                    res.end(JSON.stringify(resultadojs));
                }
                catch (e) {
                    console.error(e.stack);
                }
            });
        }
        else if (envelope.operation == 'drop') {
            console.log('Dropar a tabela:', envelope.table);
            mongo.DropCollection(envelope.table, function (result) {
                res.end(JSON.stringify({"result": result}));
            });
        } else if (envelope.operation == 'next') {
            versao = fs.readFileSync(path.join(__dirname, 'version')).toString();

            // PRIMERIA COISA, VERSAO, SE TIVER DESATUALIZADO -- ATUALIZAR COM SCRIPT UPDATE.PY NA RAIZ
            if (envelope.versao != '0') {
                if (envelope.no_update != true && envelope.versao != undefined && versao.replace(/\n$/, '') != envelope.versao.replace(/\n$/, '')) {
                    var data_agora = new Date();
                    for (var i in maquinas_atualizando) {
                        if (maquinas_atualizando[i].name == envelope.system.nome && maquinas_atualizando[i].data > data_agora) {
                            res.end(JSON.stringify({"message": "máquina em atualização."}));
                            return;
                        }
                    }

                    console.error('A versão do cliente é ', envelope.versao.replace(/\n$/, ''), ' e a do servidor é', versao.replace(/\n$/, ''), 'A maquina é:', envelope.system);
                    res.end(JSON.stringify({"rotina": "update.py", "chave": "none", "_id": "none"}));
                    data_agora.setMinutes(data_agora.getMinutes() + 5);
                    maquinas_atualizando.push({"name": envelope.system.nome, "data": data_agora})
                    return;
                }
            }

            // ETÁ EM ORDEM, ENTÃO VAMOS CONTINUAR
            var label = Decidir();
            if (label == undefined) {
                res.end(JSON.stringify({}));
                //console.error('Retornando vazio para o cliente.')
                return;
            }

            var tabela = 'tasks_' + utilitario.DataFormatada(undefined, label);

            var buffer_contador = contador_envios[label];
            contador_envios[label] += 1;
            var retorno = tarefas_listadas[label][buffer_contador];
            //console.log(retorno);
            res.end(JSON.stringify(retorno));

            // Atualizar o banco de dados para controlar a tarefa.
            var data = new Date();
            data.setMinutes(data.getMinutes() + 2);
            var aux = utilitario.DataFormatada(undefined, "YYYYMMDDHHMM");
            var data = {"status": {"status": "processando", "data": parseInt(aux)}};

            chave_tarefa = JSON.parse(JSON.stringify(retorno)).chave;
            mongo.UpdateAsync(tabela, {"chave": chave_tarefa}, data, {}, function (retornar) {

            });
        } else if (envelope.operation == 'testinsert') {
            try {
                //console.error(envelope.table);
                if (envelope.data.sequencia == undefined) {
                    envelope.data.sequencia = Math.floor(Math.random() * 32000) + 1
                }
                mongo.UpdateAsync(envelope.table, envelope.key, envelope.data, {}, function (retornar) {
                    res.end(JSON.stringify(retornar));
                });
            } catch (e) {
                console.error(e.stack);
            }
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
    }
    catch (e) {
        console.error(e.stack);
    }
}

exports.Log = function (envelope) {
    if (envelope.operation == 'testinsert' || envelope.operation == 'next')
        return {"operacao": envelope.operation, 'chave': envelope.key}
    return undefined;
}

// GAMBIARRA --------------------------------- GAMBIARRA -------------------------------- GAMBIARRA
var tarefas_listadas = [];
var contador_envios = [];
var ultima_hora = 0;

function AtualizarListas(formato) {

    //if (formato.length <= 8 && new Date().getHours() < 10) {
    //    return;
    //}

    var data = utilitario.DataFormatada(undefined, "YYYYMMDDHHMM");
    var key = {
        "$or": [
            {
                "status.status": "processando",
                "status.data": {"$lt": parseInt(data)}
            },
            {"status": {"$exists": false}}]
    };

    var hora_texto = utilitario.DataFormatada(undefined, formato);
    var sort = '_id';
    mongo.ConsultarAsync('tasks_' + hora_texto, key, sort, {"limit": 1000}, function (resultadojs) {
        try {
            ultima_hora[formato] = (new Date()).getHours()
            tarefas_listadas[formato] = resultadojs;
            contador_envios[formato] = 0;
            //console.error(contador_envios[formato]);
        } catch (e) {

        }
    });
}

exports.Init = function () {
    //console.log('Rodando INIT')
    AtualizarListas("YYYY");
    AtualizarListas("YYYYMM");
    AtualizarListas("YYYYMMDD");
    AtualizarListas("YYYYMMDDHH");
    AtualizarListas("YYYYMMDDHHMM");
}


function Decidir() {
    var labels = ['YYYYMMDDHHMM', 'YYYYMMDDHH', 'YYYYMMDD', 'YYYYMM', 'YYYY'];
    var vazios = true;
    for (i in labels) {


        //console.log(labels[i], 'Tamanho dos dados:', tarefas_listadas[labels[i]].length, 'Contador:', contador_envios[labels[i]] )
        if (tarefas_listadas[labels[i]] != undefined && tarefas_listadas[labels[i]].length > contador_envios[labels[i]]) {
            vazios = true;
            return labels[i];
        }

    }

    AtualizarListas("YYYY");
    AtualizarListas("YYYYMM");
    AtualizarListas("YYYYMMDD");
    AtualizarListas("YYYYMMDDHH");
    AtualizarListas("YYYYMMDDHHMM");


    return undefined;

}
// ---------------- FIM DA GAMBIARRA ---------------- FIM DA GAMBIARRA ---------------- FIM DA GAMBIARRA ---------------- FIM DA GAMBIARRA





