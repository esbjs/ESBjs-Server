
var request = require("request");

exports.Process = function(req, res, server, valid, processRequest, parameters){
    try {
        var url = 'http://' + server.ip + ":" + server.http.port + '/request';
        var options = {
            timeout : 30000,
            uri: url,
            method: 'POST',
            json: req.body
        };
        request(options, function (error, response, body) {
            if (error) {
                valid(req, res, false, processRequest, error, parameters);
            } else {
                console.log('Serviço ', req.body.operation ,' respondido por:', server.name, server.element, body);
                valid(req, res, true, processRequest, body.data, parameters);
                return true;
            }
        });
    } catch (e) {
        valid(req, res, false, processRequest, e + (e.stack ? e.stack : ""), parameters);
    }
}