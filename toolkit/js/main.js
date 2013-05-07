jsPlumb.bind("ready", function() {
	jsPlumb.reset();
	jsPlumb.setRenderMode(jsPlumb.SVG);
	jsPlumbDemo.init();

    var gui = new GUIBoxHandler();
    gui.init();

    var sh = new ServiceHandler();

	$('#btnCreateService').click(function() {
		var serviceName = prompt("What is service name?", "Insert service name here");
		if(serviceName){
			sh.createTree();

			sh.createCombinedService(serviceName);

/*
			var func = serviceName + " (){ alert('DENTRO FUNZIONE NUOVA!');} ";
			registerFunction(func);

			window[serviceName]();

			var old_func = func;

			var new_func = serviceName + " (){ alert('ByeBye'); "+ old_func +"} ";
			registerFunction(new_func);

			window[serviceName]();
			*/

		}
	});
});

function registerFunction(functionBody) {
    "use strict";
    var script = document.createElement("script");
    script.innerHTML = "function " + functionBody;
    document.body.appendChild(script);
}

