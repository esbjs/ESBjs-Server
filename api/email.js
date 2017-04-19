// Enviando e-mails usando o Node.js e o famoso nodemailer
var path = require('path');
var nodemailer = require('nodemailer');
var path = require('path');
var utilitario = require(path.join(__dirname,  "utilitario.js"));

// Vamos criar a conta que irá mandar os e-mails
var conta = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: '@gmail.com', // Seu usuário no Gmail
        pass: '' // A senha da sua conta no Gmail :-)
    }
});

exports.Enviar = function(de, para, rotulo, assunto, mensagem, callback) {
    try {
        para = utilitario.FormataObjeto(para);
        console.error(para);
        var emails = [];
        if (Array.isArray(para.email)) {
            emails = para.email;
        } else {
            emails = [para.email]
        }

        emails.forEach(function (email) {
            conta.sendMail({
                from: de.nome + ' <' + de.email + '>',
                to: para.nome + ' <' + email + '>',
                subject: '[' + rotulo + ']' + assunto,
                html: mensagem,
            }, function (err) {
                console.error('Email enviado para:', email)
                if (err) callback({"return": false, "error": err});
                else callback({"return": true});
            });
        });
    }
    catch(e){
        console.error(e.stack);
    }
}