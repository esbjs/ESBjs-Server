/**
 * Created by wellington on 15/03/16.
 */
var path = require('path');
var async = require("async");
var express = require('express');
var bodyParser = require('body-parser')
var fs = require("fs");
var http = require('http');
var https = require('https');

var privateKey = fs.readFileSync(path.join(__dirname, '..', 'sslcert', 'key.pem'), 'utf8');
var certificate = fs.readFileSync(path.join(__dirname, '..', 'sslcert', 'server.crt'), 'utf8');

var credentials = {key: privateKey, cert: certificate};

var utilitario = require(path.join(__dirname, '..', 'api', 'utilitario.js'));
var request = require('request');
var log = require(path.join(__dirname, '..', 'api', 'log.js'));

global.CONFIG = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'config.json')))
var PORTA = global.CONFIG.balance.http.port;
var PORTAS = global.CONFIG.balance.https.port;
global.TOKENS = {};
// CRIAR TOKENS POR UNIDADES PARA FACILITAR A BUSCA......
for(var i = 0; i < global.CONFIG.others.length; i++){
    //TOKENS[global.CONFIG.tokens[i].name] = global.CONFIG.tokens[i];
}
var ALGORITMOS = { "roundrobin" : require(path.join(__dirname, "algoritm", "roundrobin.js")),
                    "failover" : require(path.join(__dirname, "algoritm", "failover.js")),
                     "replication" : require(path.join(__dirname, "algoritm", "replication.js"))};

domain = require('domain'),
    d = domain.create();

d.on('error', function (err) {

});

// APLICATIVO
var app = express();
app.set('port', process.env.PORT || PORTA);
app.set('ports', process.env.PORTS || PORTAS);

// parse application/json
app.use(bodyParser.json({limit: '100mb'}));
app.use(bodyParser.urlencoded({limit: '100mb', extended: true}));
app.use(bodyParser.json())

// --------------------------------- versao 1 do barramento não avalia no primeiro nível a operação ---------------

app.use(function (req, res, next) {
    res.header("Content-Type", "application/json;charset=utf-8");
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.post('/request', processarRequisicao);

// PROCESSA RESPONSE PARA AS VERSÕES ACIMA DE 1
function processResponseV2(req, res, status, data) {

    //if(req.body.log != undefined){
        //var total = ((Date.parse(new Date())) - (Date.parse(req.body.log.start)));
        //console.log("Total de segundos entre requisição e resposta:", status, total, req.body.operation)
    //}
    if(status)  res.end(JSON.stringify({"version": 2, "data": data, "status": status}));
    else {
        res.end(JSON.stringify({"version": 2, "data": data , "status": false}));
        if(data != undefined) log.Log(req, res, data);
    }
}


app.get('/ping', function (req, res) {
    try {

    }
    catch (e) {
        //console.error(e)
    }
});

// --------------------- PROCESSAMENTO DAS RQUISIÇOES ---------------
function processarRequisicao(req, res) {
    try {
        // Iniciando variaveis de Log
        req.body.log = {};
        req.body.log.start = new Date();

        var envelope = req.body;
        contador_requisicoes = contador_requisicoes + 1;

        //1 - Pegar o envelope                                              ok
        //2 - ir em SERVICOS_DISPONIVEIS procurar a chave TOKEN_DRIVER_OPERATION
        //3 - pegar do envelope o driver que está solicitando, se for undefined, etnão é roudrobin
        //4 - executar
        if(global.SERVICOS_DISPONIVEIS[ envelope.tokenId + "_" + envelope.driver + "_" + envelope.operation ] != undefined){
            var servers_selecionados = global.SERVICOS_DISPONIVEIS[ envelope.tokenId + "_" + envelope.driver + "_" + envelope.operation ].servers;
            if(servers_selecionados != undefined)
            {
                var algoritmo = "roundrobin"; // driver padrao
                if(envelope.algoritm != undefined){
                    algoritmo = envelope.algoritm;
                }
                console.log(envelope.algoritm);
                ALGORITMOS[algoritmo].ExecuteV2(req, res, processResponseV2);
            }
            else{

                processResponseV2(req, res, false, "Não existe servidor disponível.");
            }
        }
        else{

            processResponseV2(req, res, false, "Não existe acesso para este serviço.");
        }
    }
    catch (e) {
        console.error(e + (e.stack != undefined ? e.stack :  ""))
        processResponseV2(req, res, false, e + (e.stack != undefined ? e.stack :  ""));

    }
}





// ------------------ CARREGAMENTO DE SERVIDORES -------------------

//1 - Carregar o Config
//2 - Peguntar para Others quais drivers tem
//3 - Montar uma lista com SERVIDORES[NOMEBARRAMENTO_DRIVER] = [ip_servidor, ip_servidor]
//4 - zerar o ponteiro de todos os elementos SERVIDORES_COUNT[NOMEBARRAMENTO_DRIVER] = 0

var contador_requisicoes = 0;
global.SERVICOS_DISPONIVEIS = {};

function monitorarServico(other) {
    var options = {
        hostname: other.ip,
        port:     other.http.port,
        path: '/request',
        method: 'POST',
        other : other,
        headers: {
            'Content-Type': 'application/json'
        }
    };

    var retorno_funcao = '';
    var req = http.request(options, function (res) {
        res.setEncoding('utf8');
        res.on('data', function (body) {
            retorno_funcao += body;
        });
        res.on('end', function (body_end) {
            retorno_funcao = JSON.parse(retorno_funcao);
            if(!retorno_funcao.status)
                return;

            var keys = getKeys(retorno_funcao.data.tokens);
            for(var i = 0; i < keys.length; i++){
                if(global.SERVICOS_DISPONIVEIS[keys[i]] == undefined){
                    global.SERVICOS_DISPONIVEIS[keys[i]] = {};
                    global.SERVICOS_DISPONIVEIS[keys[i]].roundrobin = {"indice" : -1}
                    global.SERVICOS_DISPONIVEIS[keys[i]].servers = [];
                }

                //TODO: Melhoar, validar se o servidor já está na lista......
                var index = -1;
                try {

                    if (global.SERVICOS_DISPONIVEIS[keys[i]].servers != undefined && typeof (global.SERVICOS_DISPONIVEIS[keys[i]].servers) == typeof ([]) && global.SERVICOS_DISPONIVEIS[keys[i]].servers.length > 0) {
                        index = Contem(other.name, other.element, global.SERVICOS_DISPONIVEIS[keys[i]].servers);
                    }
                }
                catch (e){
                    // nao vou parar o barramento só por isso
                    //console.error(e.stack);
                }
                if (index < 0) {
                    other.status = true;
                    global.SERVICOS_DISPONIVEIS[keys[i]].servers.push(other);
                } else {
                    global.SERVICOS_DISPONIVEIS[keys[i]].servers[index].status = true;
                }


            }


        });
    });
    req.on('error', function (e) {
        //console.log('problem with request: ' + e.message);
    });
    req.write(JSON.stringify({"tokenId" : global.CONFIG.balance.tokenId, "driver" : "bus", "bus" : other.name,
        "version" : 2, "operation" : "listtokens"}));
    req.end();

    //var url = "http://" + other.ip + ":" + other.http.port + "/drivers";


}


function carregarServidores() {
    global.CONFIG.others.forEach(function (other) {
        monitorarServico(other);
        setInterval(monitorarServico, 60 * 1000, other, '');
    });
}
carregarServidores();

// -----------------
var serverhttp = http.createServer(app);
serverhttp.listen(app.get('port'), function () {
    console.error('Express server listening on port (HTTP) ' + app.get('port'));
});
var serverhttps = https.createServer(credentials, app);
serverhttps.listen(app.get('ports'), function () {
    console.error('Express server listening on port (HTTPS) ' + app.get('ports'));
});

// ------------------ funçoees de apoio
var getKeys = function(obj){
    var keys = [];
    for(var key in obj){
        keys.push(key);
    }
    return keys;
}

function Contem(name, element, array){
    for(var i = 0; i < array.length; i++){
        if(array[i].name == name && array[i].element == element) return i;
    }
    return -1;
}

// ----------------------------------------------------CODIGO DE ATUALIZAÇÃO ---------------------------
function reloadApp(event, filename) {

    if (key_file != utilitario.KeyFilePath(path.join(__dirname, 'app.js'))) {
        setInterval(function () {
            fs.writeFileSync('/tmp/' + utilitario.DataFormatada(undefined, "FULL"),
                JSON.stringify(event) + JSON.stringify(filename));
            process.exit(0);
        }, 60 * 1000);
        console.error('Agendar para daqui a 60 segundos. Arquivo:', filename)
    }
}

var key_file = utilitario.KeyFilePath(path.join(__dirname, 'app.js'));
fs.watchFile(path.join(__dirname, 'app.js'), reloadApp);