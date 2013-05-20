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

			services = gui.getService("*");

			var listBoxes = gui.getListOfBox();

			var configList = {};

			for(var box in listBoxes){
				var boxType = box.split("_")[0];
				switch(boxType){
					case "operationGUI":
						config = gui.getOperationConfig(box);
						break;
					case "sensorGUI":
						config = gui.getSensorConfig(box);
						break;
					case "userInputGUI":
						config = gui.getUIConfig(box);
						break;
					case "actuatorGUI":
						config = gui.getActuatorConfig(box);
						break;
					default:
						config = {};
						break;
				}
				configList[box] = config;
			}

			sh.createProductions();
			sh.groupByDXElements();
			sh.orderBlocks();
			sh.createCombinedService(serviceName, configList);

			//add service created in service list
			servicesName.push(serviceName);

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

