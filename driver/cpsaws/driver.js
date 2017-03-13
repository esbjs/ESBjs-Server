var path = require('path');
var utilitario = require(path.join(__dirname, '..', '..', 'api', "utilitario.js"));
var request = require('request');

var sessions = {};
exports.Execute = function (envelope, req, res) {
    console.error('Dentro do CPs, ', envelope.operation)

    if(envelope.operation == 'uni0002'){
        // AUTENTICAÇÃO NO SERVIÇO AWS <---------------------
        if(sessions[envelope.tokenId] == undefined){
            console.error('O token informado não possui chave de acesso, acessar primeiro o serviço de Logon.')
            var url = 'https://apps5.genexus.com/Idfd73801a5a460a49314888e9a30c55e3/oauth/access_token';
            var options = {
                headers: {'content-type' : 'application/x-www-form-urlencoded'},
                method : "POST",
                url:     url,
                body:    'client_id=3bf94b41dc9d4802b7cf5bfb34786c51&grant_type=password&scope=FullControl&username=admin&password=admin123'
            };
            request(options, function (error, response, body) {
                sessions[envelope.tokenId] = {"access_token" : JSON.parse(body).access_token, "data" : new Date()};
                Processar(sessions[envelope.tokenId], envelope, req, res);
            });
        }
        else{
            Processar(sessions[envelope.tokenId], envelope, req, res);
        }
    }
    else{
        res.end(JSON.stringify({"return" : false}));
    }

}

exports.Init = function () {

}

exports.Log = function (envelope) {
    return undefined;
}


function Processar(chave, envelope, req, res){
    console.error('Processando')
    var url = 'http://apps5.genexus.com/Idfd73801a5a460a49314888e9a30c55e3/rest/service.'+ envelope.operation +'?Id=0&Cod=0';
    var options = {
        headers: {'content-type' : 'application/json',
                  Authorization : chave.access_token},
        method : "GET",
        url:     url

    };
    request(options, function (error, response, body) {
        console.error('Retornado')
        res.end(body);
    });



}

