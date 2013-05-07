jsPlumb.bind("ready", function() {
	jsPlumb.reset();
	jsPlumb.setRenderMode(jsPlumb.SVG);
	jsPlumbDemo.init();

    var gui = new GUIBoxHandler();
    gui.init();

    var sh = new ServiceHandler();
    sh.init();

	$('#btnCreateService').click(function() {
		var serviceName = prompt("What is service name?", "Insert service name here");
		if(serviceName){
			sh.createTree();

			var configList = {};
			levels = sh.getLevels();
			for(var level in levels){
				for(var i=0; i<levels[level].length; i++){
					var config = {};
					var boxType = levels[level][i].split("_")[0];
					switch(boxType){
						case "operationGUI":
							config = gui.getOperationConfig(levels[level][i]);
							break;
						case "sensorGUI":
							config = gui.getSensorConfig(levels[level][i]);
							break;
						case "userInputGUI":
							config = gui.getUIConfig(levels[level][i]);
							break;
						default:
							break;
					}
					configList[levels[level][i]] = config;	
				}
			}

			sh.createCombinedService(serviceName, configList);
			

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

