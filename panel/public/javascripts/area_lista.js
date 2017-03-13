
function Render(key, value, dataRow) {
    if (key == '_id') return null;
    if (key == 'nome') return "<a href='JavaScript:Abrir(\"" + dataRow['_id'] + "\")'>" + value + "</a>";
    return value;
}
PreencherTabela('/area/datalista', 'tab_areas', ['Nome'], Render, null);

function Nova() {
    AbrirPopup('/area/cadastro', "Cadastro de Área");
}

