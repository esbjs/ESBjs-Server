var path = require('path');
var fs = require("fs")
var mongo = require(path.join(__dirname, "mongo.js"));
var utilitario = require(path.join(__dirname, '..', '..', 'api', "utilitario.js"));
var email = require(path.join(__dirname, '..', '..', 'api', "email.js"));
const uuidV4 = require('uuid/v4');

exports.Execute = function (envelope, req, res) {
    try {
        //console.log(envelope);

        if (envelope.operation == 'select') {
            console.log('A chave é:',  envelope.key)
            mongo.ConsultarAsync(envelope.table, envelope.key, undefined, envelope, function (resultadojs) {
                try {
                    console.log(resultadojs);
                    Retornar(resultadojs, res);
                }
                catch (e) {
                    console.error(e.stack);
                }
            });
        }
        else if (envelope.operation == 'forgot') {
            var key = {"registro": envelope.key};
            mongo.ConsultarAsync('person', key, undefined, envelope, function (resultadojs) {
                resultadojs = JSON.parse(JSON.stringify(resultadojs));

                try {
                    if (resultadojs.length > 0) {
                        var mensagem = "<h2>TCC FATEC ZL</h2><br/>Seu registro é:" + resultadojs[0].registro +
                            "<br/>Sua senha é:" + resultadojs[0].senha +
                            "<br/><br/>Acesse: http://tcc.fateczl.com.br";

                        //console.error(mensagem)
                        console.log(resultadojs)
                        resultadojs = utilitario.FormataObjeto(resultadojs);
                        console.log(resultadojs)

                        email.Enviar({"nome": "Wellington Pinto de Oliveira", "email": "wellington.aied@gmail.com"},
                            resultadojs[0], "TCC-FATEC", "Recuperação de senha", mensagem, function (retornoemail) {
                                //console.error(retornoemail);
                                res.end(JSON.stringify(retornoemail));
                            });
                    }
                    else {
                        res.end(JSON.stringify({"return": true, "error": "Não existe um usuário com este registro."}));
                    }
                }
                catch (e) {
                    res.end(JSON.stringify({"return": false, "error": e.stack}));
                    console.error(e.stack);
                }
            });
        }

        else if (envelope.operation == 'newperson') {
            var key = {"registro": envelope.data.registro};
            mongo.ConsultarAsync('person', key, undefined, envelope, function (resultadojs) {
                try {
                    if (resultadojs.length == 0) {
                        if(envelope.data.chave == undefined) {
                            envelope.data.chave = uuidV4();
                        }
                        envelope.data.senha = Math.random().toString(36).slice(-8);
                        mongo.InsertAsync("person", key, envelope.data, function (resultadoinsert) {
                            res.end(JSON.stringify(resultadoinsert));

                            if(envelope.email != undefined) {

                                /*email.Enviar({
                                        "nome": "Wellington Pinto de Oliveira",
                                        "email": "wellington.aied@gmail.com"
                                    },
                                    envelope.data, envelope.email.rotulo, envelope.email.assunto, envelope.email.mensagem, function (retornoemail) {
                                        res.end(JSON.stringify({"return": true, "envio": true}));
                                    });*/
                            }
                        });


                    }
                    else {
                        res.end(JSON.stringify({"return": true, "error": "O usuário já está cadastrado."}));
                    }
                }
                catch (e) {
                    res.end(JSON.stringify({"return": false, "error": e.stack}));
                    console.error(e.stack);
                }
            });
        }

        else if (envelope.operation == 'login') {
            var key = {"registro": envelope.registro, "senha" : envelope.senha};
            mongo.ConsultarAsync('person', key, undefined, envelope, function (resultadojs) {
                try {
                    if (resultadojs.length > 0) {
                        Retornar( { "isAdmin" : true,  "return" : true, "data" : resultadojs[0]}, res)
                    }
                    else {
                        res.end(JSON.stringify({"return": false, "error": "O usuário não existe."}));
                    }
                }
                catch (e) {
                    res.end(JSON.stringify({"return": false, "error": e.stack}));
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

        else if (envelope.operation == 'testinsert') {
            try {
                //console.log('------------ TEST INSERT DRIVER SIGNON-----------------------')
                //console.error(envelope.data);
                //console.error('A chave vai ser:', { "chave" : envelope.data.chave });
                mongo.UpdateAsync(envelope.table, { "chave" : envelope.data.chave }, envelope.data, {}, function (retornar) {
                    res.end(JSON.stringify(retornar));
                });
            } catch (e) {
                console.error(e.stack);
            }
        }

        else if (envelope.operation == 'set') {
            try {
                mongo.UpdateAsync('person', envelope.chave , envelope.data, {}, function (retornar) {
                    console.log(retornar)
                    res.end(JSON.stringify(retornar));
                });
            } catch (e) {
                console.error(e.stack);
            }
        }


        else if (envelope.operation == "layout"){
            var retorno = {"css": "", "html" : {}, "js" : "" };

            var path_file = path.join(__dirname, "layout", envelope.page + (envelope.div != undefined ? "_" + envelope.div : "" ) + ".css");
            if(fs.existsSync(path_file)){
                retorno.css = fs.readFileSync(path_file).toString();
            }
            path_file = path.join(__dirname, "layout", envelope.page + (envelope.div != undefined ? "_" + envelope.div : "" ) + ".js");
            if(fs.existsSync(path_file)){
                retorno.js =  fs.readFileSync(path_file).toString();

            }
            path_file = path.join(__dirname, "layout", envelope.page + (envelope.div != undefined ? "_" + envelope.div : "" ) + ".json");
            if(fs.existsSync(path_file)){
                retorno.html = JSON.parse(fs.readFileSync(path_file).toString());
            }


            res.end(JSON.stringify(retorno));
        }
    }
    catch (e) {
        console.error(e.stack);
    }
}

function Retornar(json, res){
    if(typeof(json) == []){
        for(var i = 0; i < json.length; i++){
            delete json[i].senha;
        }
    }
    else{
        delete json.senha;
    }
    res.end(JSON.stringify(json));
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





