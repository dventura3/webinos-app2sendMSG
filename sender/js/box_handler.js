BoxHandler = function() {
   	num_boxes = 0;
   	myboxes = {};
   	this.findAllServices();
   	this.setInitBoxes();
};

// Find all services available
BoxHandler.prototype.findAllServices = function(){
	webinos.discovery.findServices(new ServiceType("http://webinos.org/api/*"), {
			onFound: function (service) {
				console.log("Service "+service.serviceAddress+" found ("+service.api+")");
				if(service.api.indexOf("sensors.") !== -1){
					services[service.id] = service;
					//$("#sensor_select_x").append("<option value='"+service.id+"'>"+service.description+"</option>");
				}
			}
	});
}

//set onDragStart for all types of boxes
var addOnDragStart = function(){
	var boxes = $("#boxes").children();
	for(var i = 0;i<boxes.length; i++) {
		boxes[i].ondragstart = function(event) {
			event.dataTransfer.setData("box", this.id);
		}
	}
}

var addDragEventsForTarget = function(){

	var target = document.getElementById("target");

	target.ondragenter = function(event){
		//add class "valid"
		this.className = "valid";
	}

	target.ondragleave = function(event){
		//remove class "valid"
		this.className = "";
	}

	target.ondragover = function(event){
		return false;
	}

	target.ondrop = function(event){

		//remove class "valid"
		this.className = "";

		var box_selected = event.dataTransfer.getData("box").split("box_")[1];

		switch(box_selected){
			case "sensor":
				GUISensorBox();
				break;
			case "operation":
				alert("operation");
				break;
			default:
				alert("Error");
		}

	}
}

//init Grafical and Features
BoxHandler.prototype.setInitBoxes = function(){

	addOnDragStart();

	addDragEventsForTarget();
	
}



BoxHandler.prototype.make_operation = function(parameter_1, parameter_2, operation){
    switch (operation){
        case "sum":
            return parseInt(parameter_1) + parseInt(parameter_2);
        case "subtraction":
            return parseInt(parameter_1) - parseInt(parameter_2);
        case "multiplication":
            return parseInt(parameter_1) * parseInt(parameter_2);
        case "division":
            return parseInt(parameter_1) / parseInt(parameter_2);
        default:
            return 0;
    }
}


var GUISensorBox = function(){

	//inctement num_boxes add on target
	this.num_boxes++;

	var html = "";
	html += "<div id='sensorGUI_"+this.num_boxes+"' style='clear:both; border: 1px solid #ff0000; border-radius: 5px; margin:5px 5px 0px 5px;'>";
    html += "Timeout: <input type='text' id='timeout_sensor' />";
    html += "Rate: <input type='text' id='rate_sensor' />";
    html += "Interval: <input type='text' id='interval_sensor' />";
    html += "Sensors: <select id='sensor_select'></select>";
    html += "<div id='sensor_value'></div>";
    html += "</div>";

    $("#target").append(html);

    //add sensor list on "sensor_select"
    var child = $("#sensorGUI_"+this.num_boxes).children();
    for(var i = 0;i<child.length; i++){
    	if(child[i].id == "sensor_select"){
    		for(var sid in services){
    			var optTMP = document.createElement("option");
    			optTMP.text = services[sid].description;
    			optTMP.value = sid;
    			child[i].options.add(optTMP);
    		}
    	}
    }
}

BoxHandler.prototype.sensorBoxHandler = function(){
	var idSensor_selected = document.getElementById('sensor_select_x').value;

		
}