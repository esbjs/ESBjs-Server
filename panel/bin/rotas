var fs = require('fs');
var path = require('path');
var requires = [];

function carregarRotas(arquivo, app){
    //console.log(arquivo);
    var re = /(get|post)\s*\('(.*?)'/igm;
    var texto = fs.readFileSync(path.join(__dirname, '..', 'routes', arquivo)).toString();
    var primeira_linha = texto.split('\n')[0];
    if(primeira_linha.indexOf('//rota:') < 0) {
        return;
    }
    //requires.push(require(path.join(__dirname, '..', 'routes', arquivo)));
    var buffer_require = require(path.join(__dirname, '..', 'routes', arquivo));
    var rota = '/'+ primeira_linha.split(':')[1];
    var retorno = texto.match(re);
    for(var i = 0; i < retorno.length; i++){
        var start = retorno[i].indexOf('\'') + 1;
        var finish = retorno[i].lastIndexOf('\'');
        var sub_rota = retorno[i].substring(start, finish );
        console.log('Usar rota:', rota + sub_rota, 'para: ', buffer_require);
        //app.use(rota + sub_rota, requires[requires.length - 1]);
        app.use(rota + sub_rota, buffer_require);
    }
}

exports.routes = function(app){
    var arquivos_rotas = fs.readdirSync(path.join(__dirname, '..', 'routes'));
    var requires = [];

    for(var irotas = 0; irotas < arquivos_rotas.length; irotas++) {
        carregarRotas(arquivos_rotas[irotas], app);
    }
}



