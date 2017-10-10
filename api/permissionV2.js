var fs = require('fs');
var path = require('path');
var utilitario = require(path.join(__dirname, "utilitario.js"));


global.tokens_driver_operacao = {}
var drivers_operations = {};
var CONFIG = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'config.json')));
var diretorio_drivers = path.join(__dirname, '..', 'driver');

exports.Init = function () {
    setTimeout(AtualizarDrivers, 1 * 60 * 1000);
    AtualizarTokens();
    AtualizarDrivers();

    fs.watchFile(path.join(__dirname, '..', 'data', 'config.json'), function(){
        CONFIG = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'config.json')));
        AtualizarTokens();
    });
}

exports.Execute = function (req, res, callProcessa, callResponse) {
    if (global.tokens_driver_operacao[req.body.tokenId + "_" + req.body.driver + "_" +
                req.body.operation] != undefined) {
        callProcessa(req, res, drivers_operations[req.body.driver + "_" +
                    req.body.operation], callResponse);
    }
    else {
        callResponse(req, res, false, "O token informado não pode acessar o serviço especificado, entre no catálogo de serviços (" +
            req.body.tokenId + "_" + req.body.driver + "_" + req.body.operation + ").");
        console.error("O token informado não pode acessar o serviço especificado, entre no catálogo de serviços (" +
            req.body.tokenId + "_" + req.body.driver + "_" + req.body.operation + ").");
    }
}

function AtualizarTokens() {
    try {
        for (var i in CONFIG.tokens) {
            for (var j in CONFIG.tokens[i].drivers) {
                for (var k in CONFIG.tokens[i].drivers[j].operations) {
                    try {
                        global.tokens_driver_operacao[CONFIG.tokens[i].id + "_" + CONFIG.tokens[i].drivers[j].name + "_" + CONFIG.tokens[i].drivers[j].operations[k]] = true;
                    } catch (e) {
                        console.error(e.stack);
                    }
                }
            }
        }
    } catch (e) {
        console.error(e.stack);
    }
}

function AtualizarDrivers() {
    try {

        fs.readdir(diretorio_drivers, function (err, drivers) {
            if (drivers) {
                drivers.forEach(function (driver) {
                    try {
                        fs.readdir(path.join(diretorio_drivers, driver, "operation"), function (err, operations) {
                            if (operations) {
                                operations.forEach(function (operation) {
                                    var operation_name = operation.split('.')[0];
                                    if(drivers_operations[driver + "_" + operation_name] == undefined) {
                                        drivers_operations[driver + "_" + operation_name] = require(path.join(diretorio_drivers, driver, "operation", operation));
                                    }
                                });
                            }
                        });
                    }
                    catch (e) {
                        // suprimir
                        console.error(e.stack);
                    }
                });
            }
        });
    } catch (e) {
        console.error(e.stack);
    }
}

exports.Init();





