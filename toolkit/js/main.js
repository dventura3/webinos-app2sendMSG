var services = {};

var inputBoxes = {
    input:0,
    sensorGUI:1,
    userInputGUI:2
};

var outputBoxes = {
    output:0,
    actuatorGUI:1
};

var servicesName = [];

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

			services = gui.getService("*");
		
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
						case "actuatorGUI":
							config = gui.getActuatorConfig(levels[level][i]);
							break;
						default:
							break;
					}
					configList[levels[level][i]] = config;	
				}
			}

			//sh.createCombinedService(serviceName, configList);

			//servicesName.push(serviceName);


			sh.createProductions();
			sh.groupByDXElements();
			sh.orderBlocks();

		}
	});


	$('#btnStartService').click(function() {
		for(var x=0; x<servicesName.length; x++){
			var str = "sh." + servicesName[x] + "(10)";
			var result = eval(str);
			alert("result: "+ JSON.stringify(result));
		}
	});

});

