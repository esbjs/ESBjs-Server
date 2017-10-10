var path = require('path');
var async = require("async");
var express = require('express');
var bodyParser = require('body-parser')
var fs = require("fs");
var http = require('http');
var https = require('https');
var request = require("request");



exports.Execute = function(req, res, CONFIG, processa){
    try {

        var bus = undefined;
        for (var i in CONFIG.others) {
            if (CONFIG.others[i].name == req.body.bus) {
                bus = CONFIG.others[i];
            }
        }
        //console.log(bus)
        var url = 'http://' + bus.ip + ':' + bus.http.port + '/request';
        //console.log(url);
        var options = {
            uri: url,
            method: 'POST',
            timeout: 25000,
            json: req.body
        };
        request(options, function (error, response, body) {
            res.writeHead(200, {"Content-Type": "application/json"});
            res.end(JSON.stringify(body));
            //console.log('Resposta é:', body);
        });
    }catch(e){
        //req, res, status, data
        processa(req, res, true, e + (e.stack != undefined ? e.stack : ""));
    }
}



