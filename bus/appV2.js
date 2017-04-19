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

var nodemailer = require('nodemailer');

var privateKey  = fs.readFileSync(path.join(__dirname,'..', 'sslcert','key.pem'), 'utf8');
var certificate = fs.readFileSync(path.join(__dirname,'..','sslcert','server.crt'), 'utf8');

var credentials = {key: privateKey, cert: certificate};

var utilitario = require(path.join(__dirname, '..', 'api', 'utilitario.js'));
var request = require('request');

var CONFIG = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'config.json')))
var PORTA = CONFIG.server.http.port;
var PORTAS = CONFIG.server.https.port;
console.log(CONFIG)

domain = require('domain'),
    d = domain.create();

d.on('error', function (err) {
    //console.error(err);
    NotificarErro(envelope, req, res, err);
});

// APLICATIVO
var app = express();
app.set('port', process.env.PORT || PORTA);
app.set('ports', process.env.PORTS || PORTAS);

// parse application/json
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
app.use(bodyParser.json())

// FUTURO ISSO TEM QUE SER AUTOMATICO
var diretorio_drivers = utilitario.GetDirectory(path.join(__dirname, '..', 'driver'));
var drivers = [];
var tokens = {};
var tokens_driver = {};
var total_requisicoes = 0;
//var versao_inicial = fs.readFileSync(path.join(__dirname, 'driver', 'task', 'version')).toString();

for (i in diretorio_drivers) {
    try {
        //console.error('Carregando DRIVER:', diretorio_drivers[i]);
        drivers[diretorio_drivers[i]] = require(path.join(__dirname, '..', 'driver', diretorio_drivers[i], 'driver.js'));
        //Monitorar(path.join(__dirname, '..', 'driver', diretorio_drivers[i], 'driver.js'));
        drivers[diretorio_drivers[i]].Init();
    } catch (e) {
        console.error(diretorio_drivers[i]);
        console.error(e.stack);
    }
}

for (i in CONFIG.tokens) {

    for (j in CONFIG.tokens[i].drivers) {
        try {
            tokens_driver[CONFIG.tokens[i].drivers[j].name] = true;
            tokens[CONFIG.tokens[i].id + "_" + CONFIG.tokens[i].drivers[j].name] = CONFIG.tokens[i].drivers[j].operations;
            //console.log(CONFIG.tokens[i].id + "_" + CONFIG.tokens[i].drivers[j].name);
        } catch (e) {
            console.error(e.stack);
        }
    }

}

app.use(function (req, res, next) {
    res.header("Content-Type", "application/json;charset=utf-8");
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

    next();
});

app.post('/request', processar);

function processar(req, res){
    //console.log(typeof(req.body))
    console.error(req.body);
    try {
        total_requisicoes = total_requisicoes + 1;
        //console.log('chamado.')
        var envelope = req.body;

        if (envelope.tokenId == undefined) {

            var ip = req.headers['x-forwarded-for'] ||
                req.connection.remoteAddress ||
                req.socket.remoteAddress ||
                req.connection.socket.remoteAddress;
            NotificarErro(envelope, req, res, "Token indefinido para:" + ip);
            return;
        }

        if (envelope.bus != undefined && CONFIG.server.name != envelope.bus) {
            // NAO É PARA ESSE BARRAMENTO, FAZER UM             PROXY       PROXY       PROXY       PROXY
            console.error('Enviando para barramento:', envelope.bus);
            var bus = undefined;
            for (i in CONFIG.others) {
                //console.log(CONFIG.others[i].name);
                if (CONFIG.others[i].name == envelope.bus) {
                    bus = CONFIG.others[i];
                }
            }


            var url = 'http://' + bus.ip + ':'+ bus.port +'/request';
            //console.error(url);
            var options = {
                uri: url,
                method: 'POST',
                timeout : 25000,
                json: envelope
            };
            request(options, function (error, response, body) {
                //console.error('Redirect:', url);
                res.writeHead(200, {"Content-Type": "application/json"});
                //console.log('Retorno de BUS:', body);
                res.end(JSON.stringify(body));
            });
        }
        else {
            // SEGURANÇA DO BARRAMENTO
            var negar = false;
            if (tokens_driver[envelope.driver] != undefined) { // Aqui valida se existe uma regra, foda-se o que é ainda
                negar = true; // entrou aqui, é negar sempre
                if (tokens[envelope.tokenId + "_" + envelope.driver]) { //se existe uma regra que junta TokenID_Driver
                    for (var index in tokens[envelope.tokenId + "_" + envelope.driver]) { //lista as operações aceitas
                        if (envelope.operation == tokens[envelope.tokenId + "_" + envelope.driver][index]) {
                            negar = false;
                            break;
                        }
                    }
                }
            }
            // INICIO DA RESPOSTA
            //res.writeHead(200, {"Content-Type": "application/json"});
            if (!negar) {
                async.parallel([
                        function () {

                            if (drivers['bus'] != undefined) {
                                //envelopeLog.operation
                                drivers['bus'].Execute({
                                    "envelope": envelope,
                                    "operation": "insertlog",
                                    "collection": "log_",
                                    "driver": drivers[envelope.driver]
                                }, req, res, processar);
                            }
                        },
                        function () {
                            //console.error(envelope.driver);
                            drivers[envelope.driver].Execute(envelope, req, res, processar);
                        },
                        function () {

                            if (drivers['statistic'] != undefined) {
                                //envelopeLog.operation
                                drivers['statistic'].Execute(envelope, req, res, processar);
                            }
                        }
                        ],
                    function (err) {
                        //console.error(err);
                        NotificarErro(envelope, req, res, err);
                    });

            }
            else {
                console.error('Operação negada para:', envelope.tokenId, envelope.driver)
                //res.end(JSON.stringify({"status": false, "mensagem": "Operação negada pelo barramento."}));
                NotificarErro(envelope, req, res, "Operação negada pelo barramento.");
            }
        }
    }
    catch (e) {
        console.error(e)
        NotificarErro(envelope, req, res, e.stack);
    }
}

var contador_erros = 0;
function NotificarErro(envelope, req, res, erro) {
    contador_erros += 1;
    fs.writeFile('/tmp/erro_' + contador_erros.toString(), erro, function (err)  {
        console.log(erro);
    });


    if (drivers['bus'] != undefined) {
        //envelopeLog.operation
        drivers['bus'].Execute({
            "envelope": envelope,
            "operation": "insertlog",
            "collection": "err_",
            "error" : erro,
            "driver": drivers[envelope.driver]
        }, req, res, NotificarErro);
    }
    res.end(JSON.stringify({"status": false, "mensagem": erro}));
    console.error(erro);
}


app.get('/ping', function (req, res) {
    try {
        if (drivers['statistic'] == undefined) {
            res.writeHead(200, {"Content-Type": "application/json"});
            res.end(JSON.stringify({"status": true, "requisicoes": total_requisicoes}));
        }
        else{
            drivers['statistic'].Print(req, res);
        }
    }
    catch (e) {
        //console.error(e)
    }
});

app.get('/drivers', function (req, res) {
    try {
        res.writeHead(200, {"Content-Type": "application/json"});
        res.end(JSON.stringify({"drivers": fs.readdirSync(path.join(__dirname, '..', 'driver'))}));
    }
    catch (e) {
        console.error(e)
    }
});


app.get('/reload', function (req, res) {
    process.exit(0);
});



//var httpServer = http.createServer(app);
//var httpsServer = https.createServer(credentials, app);
//httpServer.listen(8080);
//httpsServer.listen(8443);


var serverhttp = http.createServer(app);
serverhttp.listen(app.get('port'), function () {
    console.log('Express server listening on port (HTTP) ' + app.get('port'));
});
var serverhttps = https.createServer(credentials, app);
serverhttps.listen(app.get('ports'), function () {
    console.log('Express server listening on port (HTTPS) ' + app.get('ports'));
});

// ----------------------------------------------------CODIGO DE ATUALIZAÇÃO ---------------------------
function reloadApp(event, filename) {

    if (key_file != utilitario.KeyFilePath(path.join(__dirname, 'app.js'))) {
        setInterval(function(){
            fs.writeFileSync('/tmp/' + utilitario.DataFormatada(undefined, "FULL"),
                                JSON.stringify(event) + JSON.stringify(filename));

            //process.exit(0);
        }, 60 * 1000);
        console.log('Agendar para daqui a 60 segundos. Arquivo:', filename)
    }
}

var key_file = utilitario.KeyFilePath(path.join(__dirname, 'app.js'));
fs.watchFile(path.join(__dirname, 'app.js'), reloadApp);
