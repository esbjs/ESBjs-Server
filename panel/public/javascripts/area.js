function EnviarArea(){
    try {


        LimparDiv("div_mensagem");
        var texto = "";
        var nome = $("#name").val();


        if (nome.trim().length == 0) texto += "Informe o nome completo;</br>";

        if (texto.length > 0) MensagemBotao("div_mensagem", "Por favor:</br>" + texto)
        else{
            EnviarJsonPost('/area/cadastrar', {"name" : nome},
                function(path, entrada, data){
                    if(data.ok == 1){
                        alert('Salvo com sucesso.');
                    }
                    else{
                        alert(data.mensagem);
                    }
                });


        }
    }catch(e){
        alert(e.stack);
    }
}


