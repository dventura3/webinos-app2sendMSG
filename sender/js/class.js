
a)
su Sender:
- creare una classe con dentro il metodo "make_operation" che implementa realemnte il metodo.
su Receiver:
-  creare una classe con dentro il metodo "make_operation" ma che in realtà invia un messaggio RPC al Sender e si mette in attesa della risposta.

b)
- senza usare RPC ma tipi di messaggi preimpostati

// DOPO:

servizio == funzione con un nome uguale al nome servizio.
tale funzione deve essere un contenitore, e in essa ci sono in ordine le funzioni da invocare una per ogni blocco....prendendo in 
considerazione anche cosa restituiscono ognuna di queste funzioni.


//------------------

1) aggiungere istruzioni a un metodo già esistente:

someFunction = function(str){
    alert(str);
}

var old_someFunction = someFunction;

someFunction = function(){
    alert('Hello');
    old_someFunction("CIAO!!!");
    alert('Goodbye');
}

//CON ARGOMENTI: si usa apply

someFunction = function(str){
    alert(str);
}

var old_someFunction = someFunction;

someFunction = function(mystr){
    alert('Hello');
    old_someFunction.apply(this, arguments);
    alert('Goodbye');
}

//------------------

2) aggiungere una funzione con un nome=stringa:

var func = serviceName + " (){ alert('DENTRO FUNZIONE NUOVA!');} ";
registerFunction(func);

window[func]();

function registerFunction(functionBody) {
    "use strict";
    var script = document.createElement("script");
    script.innerHTML = "function " + functionBody;
    document.body.appendChild(script);
}