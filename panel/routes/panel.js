//rota:panel
var express = require('express');
var path = require('path');
var router = express.Router();
var sbdb = require(path.join(__dirname, '..', 'api', 'request.js'));


router.get('/', function(req, res, next) {
    try {
        //sbdb.Select('climas', {"localidade.chave" : "linhares_es"}, "clima", "home", "127.0.0.1", Listar);



        res.render('teste', {title: 'Service Bus Data Base Panel'});
    }catch(e)
    {
        console.error(e.stack);
    }
});


function Listar(retorno){
    console.error(retorno)
}

module.exports = router;
