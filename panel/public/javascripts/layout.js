// ---------------- INPUT CRUD ---------------

function Save(callback){
    if(callback == undefined){
        callback = function(path, entrada, data, err){

            if(err != undefined || (data != undefined && data.ok != 1)){
                err = err || data.mensagem;
                alert(err);
            }
            else{
                alert('Salvo com sucesso.');
            }
        }
    }

    var table = $('form').attr('table');
    var key = $('form').attr('key');
    var keys = {};
    var js = {};
    var aux = true;

    try {
        $(':input').each(
            function (index) {
                var input = $(this);
                if (input.attr('field') != undefined) {

                    if (input.attr('req') != undefined && (input.val() == undefined || input.val() == '')) {
                        ErrorField(input, callback);
                        aux = false;
                        return false;
                    }
                    js[input.attr('field')] = input.val();
                    if (key == input.attr('field')) {
                        keys[input.attr('field')] = input.val();
                        if(input.val() == undefined || input.val() == ''){
                            ErrorField(input, callback);
                            aux = false;
                            return false;
                        }
                    }
                }
            }
        );
        if (aux) {
            EnviarJsonPost('/mongo/generic', {'key': JSON.stringify(keys), 'data': JSON.stringify(js), 'schema': table},
                callback);
        }
    }catch(e){
        callback('/mongo/generic', undefined, undefined, e.stack);
    }
}

function ErrorField(input, callback){
        callback('/mongo/generic', undefined, undefined, 'O campo ' +
            input.attr('caption') + ' deve ser preenchido.');
}



//-------------- BOTAO LOAD -----------------------
function CommutarBotaoLoad(name){
    if($("#li_" + name).hasClass("fa-circle-o-notch")){
        $("#" + name).removeClass("btn-danger");
        $("#" + name).addClass("btn-success");
        $("#li_" + name).removeClass("fa-circle-o-notch");
    }
    else{
        $("#" + name).removeClass("btn-success");
        $("#" + name).addClass("btn-danger");
        $("#li_" + name).addClass("fa-circle-o-notch");
    }
}




//----------------- POPUP ----------------------------
function AbrirPopup(url, titulo) {

    titulo = titulo || 'Diálogo';
    $("#myModal-title").text(titulo);
    $('#myModal').modal('show');
    $(document).ready(function () {
        $("#contentiframe").attr("src", url);
    });
    rescale();
}

function FecharPopup(){
    $('#myModal').modal('hide');
    //$('#myModal').modal('toggle');
}

function rescale() {
    var size = {width: $(window).width(), height: $(window).height() - 50}
    /*CALCULATE SIZE*/
    var offset = 20;
    var offsetBody = 150;
    $('#myModal').css('height', size.height - offset);
    $('.modal-body').css('height', size.height - (offset + offsetBody));
    $('#myModal').css('top', 0);
}
$(window).bind("resize", rescale);

//------------------ TABELA -----------------------
// rota é a URL; table é a tabela que será peeenchida; callitem é a função que reinderiza cada item
function PreencherTabela(rota, table, columns, callitem, callrow) {
    if(callitem == null){
        callitem = function(key, value){
            return value;
        }
    }
    if(callrow == null) callrow =  function (row, data_row, irow, icel) {};
    columns = columns || [];

    EnviarGet(rota, function (path, data) {
        PreencherTabelaRetorno(data, table,  columns, callitem, callrow);
    });
}

function PreencherTabelaRetorno(data, table, columns, callitem, callrow) {

    var table = document.getElementById(table);
    while (table.childNodes.length > 0) {
        table.removeChild(table.lastChild);
    }
    var montarcolunas = columns.length > 0;
    var irow = 0;
    for (item in data) {
        var row = table.insertRow(irow++);
        var icel = 0;
        for(var key in data[item]){
            if(!montarcolunas){
                columns.push(key);
            }
            var buffer = callitem(key, data[item][key], data[item]);
            if(buffer != null) {
                var cell = row.insertCell(icel++);
                cell.innerHTML = buffer;
            }
        }
        callrow(row, data[item], irow, icel);
        montarcolunas = true;
    }

    var header = table.createTHead();
    header['class'] = "thead-inverse";
    var row = header.insertRow(0);
    for(var col in columns) {
        var cell = row.insertCell(col);
        cell.outerHTML = "<th><b>"+ columns[col] +"</b></th>";
    }
    callrow(row, null, -1, -1);
}

// -------------------SELECT -------------------
function PreencherSelect(rota, selectName, keyField, textField) {

    EnviarGet(rota, function (path, data) {
        PreencherSelectRetorno(data, selectName, keyField, textField);
    });
}
function PreencherSelectRetorno(data, selectName, keyField, textField) {
    for (item in data) {
        $('#' + selectName).append($('<option>', {
            value: data[item][keyField],
            text: data[item][textField]
        }).attr('dataItem', JSON.stringify(data[item])));
        //.attr('value2', 'the value');
    }
    $('#' + selectName).multiselect('rebuild')
}


function PegarSelect(nome){
    var retorno = [];
    $('#'+ nome +' option:selected').each(function() {
        //alert($(this).attr('dataItem'));
        retorno.push($(this).val());
    });
    return retorno;
}


function PegarSelectItemData(nome){
    var retorno = [];
    $('#'+ nome +' option:selected').each(function() {
        retorno.push(JSON.parse($(this).attr('dataItem')));
    });
    return retorno;
}

// ---------------- MENSAGENS DE ERRO ----------
function MensagemBotao(nome_div, mensagem){
    $("<div class=\"alert alert-danger\"><strong>Inconsistência</strong> "+ mensagem +"</div>").appendTo("#" + nome_div);
}

function LimparDiv(nome_div){
    $("#" + nome_div).html("");
}


