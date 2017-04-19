/**
 * Created by wellington on 15/03/16.
 */
var async = require("async");
var express = require('express');
var bodyParser = require('body-parser')
var fs = require("fs");
var http = require('http');
var path = require('path');
var utilitario = require(path.join(__dirname, 'api', 'utilitario.js'));
var request = require('request');


var CONFIG = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'config.json')))
var PORTA = CONFIG.balance.port;
var data_inicio = new Date();

domain = require('domain'),
    d = domain.create();

d.on('error', function (err) {
    //console.error(err);
    NotificarErro(envelope, req, res, err);
});

// APLICATIVO
var app = express();
app.set('port', process.env.PORT || PORTA);

// parse application/json
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
app.use(bodyParser.json())

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

//1 - Carregar o Config
//2 - Peguntar para Others quais drivers tem
//3 - Montar uma lista com SERVIDORES[NOMEBARRAMENTO_DRIVER] = [ip_servidor, ip_servidor]
//4 - zerar o ponteiro de todos os elementos SERVIDORES_COUNT[NOMEBARRAMENTO_DRIVER] = 0

var SERVIDORES = [];
//var SERVIDORES_STATUS = [];
var SERVIDORES_EM_MONITORAMENTO = {};
var SERVIDORES_COUNT = [];
var contador_requisicoes = 0;

function monitorarServico(other) {
    //console.log('Monitorando:' + other.name, other.ip);
    var url = "http://" + other.ip + ":" + other.port + "/drivers";
    var options = {
        uri: url,
        timeout : 5000,
        method: 'GET',
        busip: other.ip,
        busname: other.name,
        busport: other.port
    };
    request(options, function (error, response, body) {
        if (response == undefined || response.statusCode != 200 || error) {
            return;
        }

        var bus_name = response.request.busname;
        var bus_ip = response.request.busip;
        var bus_port = response.request.busport;
        var js = JSON.parse(body);

        for (var j = 0; j < js.drivers.length; j++) {

            if (SERVIDORES[bus_name + "_" + js.drivers[j]] == undefined) {
                SERVIDORES[bus_name + "_" + js.drivers[j]] = [];
                //SERVIDORES_STATUS[bus_name + "_" + js.drivers[j]] = [];
            }
            var buffer_url = bus_ip + ":" + bus_port;
            var posicao = SERVIDORES[bus_name + "_" + js.drivers[j]].indexOf(buffer_url);
            if (posicao < 0) {
                SERVIDORES[bus_name + "_" + js.drivers[j]].push(buffer_url);
                //SERVIDORES_STATUS[bus_name + "_" + js.drivers[j]].push(true);
                SERVIDORES_COUNT[bus_name + "_" + js.drivers[j]] = 0;
            }
            else {
                //SERVIDORES_STATUS[bus_name + "_" + js.drivers[j]][posicao] = true;

            }

        }
        //console.log(SERVIDORES)
    });

}


function carregarServidores() {

    CONFIG.others.forEach(function (other) {
        //console.error('Iniciando agendamento de:', other.ip)
        if (SERVIDORES_EM_MONITORAMENTO[other.ip] == undefined) {
            SERVIDORES_EM_MONITORAMENTO[other.ip] = {};
            setInterval(monitorarServico, 5 * 1000, other, '');
        }
        /**/
    });
}

function carregarServidores2() {
    for (var i = 0; i < CONFIG.others.length; i++) {
        console.log(CONFIG.others[i].ip)

        var url = "http://" + CONFIG.others[i].ip + ":" + CONFIG.others[i].port + "/drivers";
        var options = {
            uri: url,
            method: 'GET',
            busip: CONFIG.others[i].ip,
            busname: CONFIG.others[i].name,
            busport: CONFIG.others[i].port
        };
        request(options, function (error, response, body) {
            if (response == undefined || response.statusCode != 200 || error) {
                // tirar o servidor da lista momentaneamente...

                return;
            }
            //console.log(response.statusCode);
            //console.error('Retorno:', response.request.idapp, body);

            var bus_name = response.request.busname;
            var bus_ip = response.request.busip;
            var bus_port = response.request.busport;
            var js = JSON.parse(body);

            for (var j = 0; j < js.drivers.length; j++) {
                if (SERVIDORES[bus_name + "_" + js.drivers[j]] == undefined) {
                    SERVIDORES[bus_name + "_" + js.drivers[j]] = [];
                }
                SERVIDORES[bus_name + "_" + js.drivers[j]].push(bus_ip + ":" + bus_port);
                SERVIDORES_COUNT[bus_name + "_" + js.drivers[j]] = 0;
            }
        });
    }
}

function retornaProximoValido(envelope) {
    // IP único, nem precisa ficar olhando...
    if(SERVIDORES_COUNT[envelope.bus + "_" + envelope.driver].length == 1){
        //console.log('Igual a 1, então, manda o primeiro como próximo.')
        return 0;
    }

    SERVIDORES_COUNT[envelope.bus + "_" + envelope.driver]++;
    if (SERVIDORES_COUNT[envelope.bus + "_" + envelope.driver] >= SERVIDORES[envelope.bus + "_" + envelope.driver].length) {
        SERVIDORES_COUNT[envelope.bus + "_" + envelope.driver] = 0;
    }
    return SERVIDORES_COUNT[envelope.bus + "_" + envelope.driver];
}

app.post('/request', processarRequisicao);

function processarRequisicao(req, res) {
    try {

        var envelope = req.body;
        contador_requisicoes = contador_requisicoes + 1;

        //console.log('ok, antes', envelope.bus)
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


            var url = 'http://' + bus.ip + ':5007/request';
            //console.error(url);
            var options = {
                uri: url,
                method: 'POST',
                json: envelope
            };
            request(options, function (error, response, body) {
                //console.error('Redirect:', url);
                res.writeHead(200, {"Content-Type": "application/json"});
                //console.log(body)
                res.end(JSON.stringify(body));
            });
        }
        else {


            //1 - Pegar o envelope
            //2 - achar o BUS_DRIVER
            //3 - Achar o próximo IP para balancear
            //4 - Fazer uma ponte
            //console.log('Recebido')

            if (SERVIDORES[envelope.bus + "_" + envelope.driver] != undefined) {
                var proximo = retornaProximoValido(envelope);

                if(SERVIDORES[envelope.bus + "_" + envelope.driver][proximo] == undefined){
                    //console.log('Não há serviço disponível no momento.', envelope.bus + "_" + envelope.driver, 'Proximo:', proximo);
                    res.writeHead(200, {"Content-Type": "application/json"});
                    res.end(JSON.stringify({"status" : false, "error": 'Não há serviço disponível no momento.'}));
                    return;
                }

                try {
                    var url = 'http://' + SERVIDORES[envelope.bus + "_" + envelope.driver][proximo] + '/request';
                    //console.log('Enviado ', envelope.driver ,' para:', url, 'Posicao:', proximo);
                    var options = {
                        timeout : 5000,
                        uri: url,
                        method: 'POST',
                        json: envelope
                    };
                    request(options, function (error, response, body) {
                        if (error) {
                            //console.error('Houve uma falha no IP, ', SERVIDORES[envelope.bus + "_" + envelope.driver][proximo], error);
                            //console.error('Desativando:',SERVIDORES[envelope.bus + "_" + envelope.driver][proximo])
                            SERVIDORES[envelope.bus + "_" + envelope.driver].splice(proximo, 1);
                            processarRequisicao(req, res);
                        } else {
                            res.writeHead(200, {"Content-Type": "application/json"});
                            res.end(JSON.stringify(body));
                        }
                    });
                } catch (e) {
                    console.error(e.stack);
                    processarRequisicao(req, res);
                }
            }
            else {
                console.error("Não há barramento para atender a requisição.");
                res.writeHead(200, {"Content-Type": "application/json"});
                res.end(JSON.stringify({"status" : false, "error": "Não há barramento para atender a requisição."}));
            }
        }
    }

    catch (e) {
        console.error(e.stack);
        res.writeHead(200, {"Content-Type": "application/json"});
        res.end(JSON.stringify({"status" : false, "error": e.stack}));
    }
}

app.get('/ping', function (req, res) {
    try {

        //console.log(SERVIDORES);

        res.writeHead(200, {"Content-Type": "application/json"});
        res.end(JSON.stringify({
            "status": true,
            "inicio": utilitario.DataFormatada(data_inicio, "DD/MM/YYYY HH:MM"),
            "requisicoes": contador_requisicoes,
            "servers": JSON.stringify(SERVIDORES)
        }));
    }
    catch (e) {
        //console.error(e)
    }
});

app.get('/reload', function (req, res) {
    process.exit(0);
});


var server = http.createServer(app);
console.error('Iniciando Serviço.')
server.listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});


// ----------------------------------------------------CODIGO DE ATUALIZAÇÃO ---------------------------
function reloadApp(event, filename) {
    //console.log('Reload APP,', filename);
    if (key_file != utilitario.KeyFilePath(path.join(__dirname, 'balance.js'))) {
        setInterval(function(){
            fs.writeFileSync('/tmp/' + utilitario.DataFormatada(undefined, "FULL"),
                JSON.stringify(event) + JSON.stringify(filename));

            //process.exit(0);
        }, 60 * 1000);
        console.log('Agendar para daqui a 60 segundos. Arquivo:')
    }
}
var key_file = utilitario.KeyFilePath(path.join(__dirname, 'balance.js'));
fs.watchFile(path.join(__dirname, 'balance.js'), reloadApp);

carregarServidores();

