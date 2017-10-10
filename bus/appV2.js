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

//var nodemailer = require('nodemailer');

var privateKey = fs.readFileSync(path.join(__dirname, '..', 'sslcert', 'key.pem'), 'utf8');
var certificate = fs.readFileSync(path.join(__dirname, '..', 'sslcert', 'server.crt'), 'utf8');

var credentials = {key: privateKey, cert: certificate};

var utilitario = require(path.join(__dirname, '..', 'api', 'utilitario.js'));
var request = require('request');

global.CONFIG = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'config.json')))
var PORTA = global.CONFIG.server.http.port;
var PORTAS = global.CONFIG.server.https.port;

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
var diretorio_drivers = utilitario.GetDirectory(path.join(__dirname, '..', 'driver'));
var drivers = [];
var tokens = {};
var tokens_driver = {};
var total_requisicoes = 0;
var proxy = undefined;
var permissionV2 = require(path.join(__dirname, "..", "api", "permissionV2.js"));

for (var i in diretorio_drivers) {
    try {
        console.log('Carregando driver:', diretorio_drivers[i])
        drivers[diretorio_drivers[i]] = require(path.join(__dirname, '..', 'driver', diretorio_drivers[i], 'driver.js'));
        drivers[diretorio_drivers[i]].Init();
    } catch (e) {
        console.error(diretorio_drivers[i]);
        console.error(e.stack);
    }
}

for (var i in global.CONFIG.tokens) {

    for (j in global.CONFIG.tokens[i].drivers) {
        try {
            tokens_driver[global.CONFIG.tokens[i].drivers[j].name] = true;
            tokens[global.CONFIG.tokens[i].id + "_" + global.CONFIG.tokens[i].drivers[j].name] = global.CONFIG.tokens[i].drivers[j].operations;
        } catch (e) {
            console.error(e.stack);
        }
    }

}

// --------------------------------------               VERSAO 2 ------------------------------------------------
var driver_bus = undefined;
var driver_statistic = undefined;
if(fs.exists(path.join(__dirname, "..", "driver", "bus", "driver.js"))){
    driver_bus = require(path.join(__dirname, "..", "driver", "bus", "driver.js"));
}
//if(fs.exists(path.join(__dirname, "..", "driver", "statistic", "driver.js"))){
    driver_statistic = require(path.join(__dirname, "..", "driver", "statistic", "driver.js"));
//}
// --------------------------------------------


app.use(function (req, res, next) {
    res.header("Content-Type", "application/json;charset=utf-8");
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

    next();
});

app.post('/request', processar);
app.get('/request/*', function(req, res){
    var parameters = req.url.split('/');
    var buffer = require(path.join(__dirname, "..", "driver", parameters[3], "operation" , parameters[4] + ".js"));
    buffer.ToPost(req);
    processar(req, res);

});


function processar(req, res) {
    total_requisicoes = total_requisicoes + 1;
    req.body.log = [];

    if (req.body.tokenId == undefined) {

        var ip = req.headers['x-forwarded-for'] ||
            req.connection.remoteAddress ||
            req.socket.remoteAddress ||
            req.connection.socket.remoteAddress;
        NotificarErro(req.body, req, res, "Token indefinido para:" + ip);
    }
    else {
        if (req.body.bus == undefined) {
            NotificarErro(req.body, req, res, "O barramento informado não é acessível.");
        }
        else {
            // caso nao seja para esse barramento
            if (global.CONFIG.server.name != req.body.bus && req.body.bus != "any") {
                // USAR O PROXY ATÉ O BARRAMENTO CORRETO
                if (proxy == undefined) {
                    if (req.body.log != undefined) req.body.log.push("Utilizando o Proxy " + global.CONFIG.server.name + " -> " + req.body.bus);
                    proxy = require(path.join(__dirname, "..", "api", "proxybus.js"));
                }
                proxy.Execute(req, res, global.CONFIG, processResponseV2);
            } else {
                // PROCESSAR REQUISIÇÃO POIS A SOLICITAÇÃO É PARA ESSE BARRAMENTO
                if (req.body.version == undefined || req.body.version == 1 || req.body.version == 0) {
                    if (req.body.log != undefined) req.body.log.push("A versão 1 do barramento será desativada.");
                    processarV1(req, res);
                }
                else if (req.body.version == 2) {
                    permissionV2.Execute(req, res, processarV2, processResponseV2);
                }
            }
        }
    }
}

function processarV2(req, res, driver_operation, callback){
    try{
        driver_operation.ExecuteV2(req, res, processResponseV2);
    }
    catch(e){
        processResponseV2(req, res, false, e + (e.stack ? e.stack : ""));
        console.error(e + (e.stack ? e.stack : ""));
    }


}

function processarV1(req, res) {
    try {
        var negar = false;
        if (tokens_driver[req.body.driver] != undefined) { // Aqui valida se existe uma regra, foda-se o que é ainda
            negar = true; // entrou aqui, é negar sempre
            if (tokens[req.body.tokenId + "_" + req.body.driver]) { //se existe uma regra que junta TokenID_Driver
                for (var index in tokens[req.body.tokenId + "_" + req.body.driver]) { //lista as operações aceitas
                    if (req.body.operation == tokens[req.body.tokenId + "_" + req.body.driver][index]) {
                        negar = false;
                        break;
                    }
                }
            }
        }

        async.parallel([
                function () {
                    // Desabilitar o LOG/Habilitar Log no arquivo de Configuração
                    if (global.CONFIG.log != undefined && global.CONFIG.log && drivers['bus'] != undefined) {
                        drivers['bus'].Execute({
                            "envelope": req.body,
                            "operation": "insertlog",
                            "collection": "log_",
                            "driver": drivers[req.body.driver]
                        }, req, res, processar);
                    }
                },
                function () {
                    if (drivers[req.body.driver] == undefined) {
                        throw "O driver", req.body.driver, 'é indefinido.';
                    }
                    else {
                        console.log(req.body)
                        drivers[req.body.driver].Execute(req.body, req, res, processar);
                    }
                },
                function () {

                    if (drivers['statistic'] != undefined) {
                        drivers['statistic'].Execute(req.body, req, res, undefined);
                    }
                }
            ],
            function (err) {
                //console.error(err);
                NotificarErro(req.body, req, res, err);
            });


    }
    catch (e) {
        processResponseV1(req, res, false, e + "\n" + e + (e.stack ? e.stack : ""));
    }
}

// PROCESSA RESPONSE NA VERSAO 1
function processResponseV1(req, res, status, data) {
    if (req.body.version == undefined || req.body.version == 1) {
        NotificarErro(req.body, req, res, data);
    }
    else if (req.body.version == 2) {
        processResponseV2(req, res, status, data);
    }
}

// PROCESSA RESPONSE PARA AS VERSÕES ACIMA DE 1
function processResponseV2(req, res, status, data) {

    if(status)  {
        res.end(JSON.stringify({"version": 2, "data": data, "status": status}));
    }
    else {
        res.end(JSON.stringify({"version": 2, "data": data , "status": status}));
    }
    driver_statistic.ExecuteV2(req, res, status);
}

var contador_erros = 0;
function NotificarErro(envelope, req, res, erro) {
    contador_erros += 1;
    res.end(JSON.stringify({"status": false, "mensagem": erro}));
    console.error(erro);
}


app.get('/ping', function (req, res) {
    try {
        if (drivers['statistic'] == undefined) {
            res.writeHead(200, {"Content-Type": "application/json"});
            res.end(JSON.stringify({"status": true, "requisicoes": total_requisicoes}));
        }
        else {
            drivers['statistic'].Print(req, res);
        }
    }
    catch (e) {
        //console.error(e)
    }
});

app.get('/drivers', function (req, res) {
    try {
        //TODO: atuar na segurança este trecho.......
        res.writeHead(200, {"Content-Type": "application/json"});
        var drivers = [];

        var buffer_drivers = fs.readdirSync(path.join(__dirname, '..', 'driver'));
        for(var i = 0; i < buffer_drivers.length; i++){
            var driver = {};
            driver.name = buffer_drivers[i];
            driver.operations = [];

            var buffer_drivers_operations = fs.readdirSync(path.join(__dirname, '..', 'driver', "operations", driver.name));
            for(var j = 0; j < buffer_drivers_operations.length; i++){
                if( buffer_drivers_operations[j].indexOf(".js") < 0) continue;
                driver.operations.push(buffer_drivers_operations[j].split('.')[0]);
            }

            if(driver.operations.length > 0){
                drivers.push(driver);
            }
        }

        processResponseV2(req, res, true, drivers)

    }
    catch (e) {
        console.error(e)
    }
});


app.get('/reload', function (req, res) {
    process.exit(0);
});

var serverhttp = http.createServer(app);
serverhttp.listen(app.get('port'), function () {
    console.error('Express server listening on port (HTTP) ' + app.get('port'));
});
var serverhttps = https.createServer(credentials, app);
serverhttps.listen(app.get('ports'), function () {
    console.error('Express server listening on port (HTTPS) ' + app.get('ports'));
});

// ----------------------------------------------------CODIGO DE ATUALIZAÇÃO ---------------------------
function reloadApp(event, filename) {

    if (key_file != utilitario.KeyFilePath(path.join(__dirname, 'appV2.js'))) {
        setInterval(function () {
            fs.writeFileSync('/tmp/' + utilitario.DataFormatada(undefined, "FULL"),
                JSON.stringify(event) + JSON.stringify(filename));
            process.exit(0);
        }, 60 * 1000);
        console.error('Agendar para daqui a 60 segundos. Arquivo:', filename)
    }
}

var key_file = utilitario.KeyFilePath(path.join(__dirname, 'appV2.js'));
fs.watchFile(path.join(__dirname, 'appV2.js'), reloadApp);
