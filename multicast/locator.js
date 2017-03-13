const dgram = require('dgram');
const server = dgram.createSocket('udp4');
var operacoes = 0;

server.on('error', function (err) {
    console.log('server error:\n${err.stack}');
    server.close();
});


function EnviarMensagemV1(server, rinfo, retornar) {
    try {
        //console.log(retornar);
        var dados = JSON.stringify(retornar) + '                                                                                                                         \n';
        var msg = '001' + leftPad((dados.length + 13).toString()) + dados;

        //console.log(msg.length)
        server.send(msg, 0, msg.length, rinfo.port, rinfo.address);
        //console.log('Enviado.')
    }
    catch (e) {
        console.error(e.stack);
    }
}


server.on('message', function (msg, rinfo) {
    var envelope = JSON.parse(msg.toString());
    if(envelope.mecanismo == undefined){
        interfaceMongo(msg, envelope, rinfo);
    }
    else if(envlope.mecanismo == 'fs'){

    }
});

function interfaceMongo (msg, envelope, rinfo) {

    try {
        if (envelope.operation == "who") {
            var retorno = {"function": "db"};
            EnviarMensagemV1(server, rinfo, retorno);
        }

    }
    catch (e) {
        console.error(e.stack);
    }

    operacoes = operacoes + 1;
}

server.on('listening', function () {
    var address = server.address();
    console.log('server listening', address.address, address.port);
});

function leftPad(str){
    var pad = "0000000000"
    return pad.substring(0, pad.length - str.length) + str
}

server.bind(5006);
