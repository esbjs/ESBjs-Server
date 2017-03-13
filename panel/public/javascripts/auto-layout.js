function mount(div_name, json) {
    var i = 0;
    //$('#' + div_name).attr('class', 'container-fluid');
    for (var key in json) {
        var objeto = $('#' + div_name).append($('<div>').attr('id', 'div_row_' + i++).attr('class', 'row'));
        mountLine(objeto, json[key].field, json[key].caption, json[key].value);
    }
    $('#' + div_name).attr('class', 'container-fluid');
}

function mountLine(div, propriedade, caption, valor) {
    div.append($('<div>').attr('class', 'col-md-1').append($('<label>').attr("for", "input_" + propriedade).append(caption)))
        .append($('<div>').attr('class', 'col-md-11').append($('<input>').attr("id", "input_" + propriedade).attr("class", "form-control")
            .attr("field", propriedade).attr('value', valor)));
}

function save(div_name, rota) {
    var json = {};
    var inputs = getinput(div_name);
    for (var i = 0; i < inputs.length; i++) {
        json[$(inputs[i]).attr('field')] = $(inputs[i]).val();
    }
    EnviarJsonPost(rota, json, savereturn);

}

function savereturn(path, entrada, data) {
    if (data.status) {
        FecharPopup();
    }
    else {
        alert('Erro ao salvar');
    }
}

function getinput(div_name) {
    var panel = $("#" + div_name);
    return panel.find("input");
}