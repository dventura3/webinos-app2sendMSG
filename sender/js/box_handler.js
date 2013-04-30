BoxHandler = function() {
   	num_boxes = 0;
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
				GUIOperationBox();
				break;
			case "userInput":
				GUIUserInputBox();
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

/*****************     OPERATION   ******************/

var GUIOperationBox = function(){
	//inctement num_boxes add on target
	this.num_boxes++;

	var html = "";
	html += "<div id='operationGUI_"+this.num_boxes+"' style='clear:both; border: 1px solid #0000ff; border-radius: 5px; margin:5px 5px 0px 5px;'>";
	html += "Level: <input type='number' id='level' value='1' style='width:40px;' /> ";
	html += "Operation: <select id='sensor_select'>";
	html += "<option value='sum'> + </option>";
    html += "<option value='subtraction'> - </option>";
    html += "<option value='multiplication'> * </option>";
    html += "<option value='division'> / </option>";
	html += "</select>";
	html += "</div>";

	$("#target").append(html);

}




/*****************     SENSOR   ******************/

var GUISensorBox = function(){

	//increment num_boxes add on target
	this.num_boxes++;

	var html = "";
	html += "<div id='sensorGUI_"+this.num_boxes+"' style='clear:both; border: 1px solid #ff0000; border-radius: 5px; margin:5px 5px 0px 5px;'>";
	html += "Level: <input type='number' id='level' value='1' style='width:40px;' /> ";
    html += "Timeout: <input type='text' id='timeout_sensor' value='120' style='width:40px;' /> ";
    html += "Rate: <input type='text' id='rate_sensor' value='500' style='width:40px;' /> ";
    html += "Interval: <input type='text' id='interval_sensor' value='fixedinterval' /> ";
    html += "Sensors: <select id='sensor_select'></select> ";
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

BoxHandler.prototype.sensorBoxHandler = function(sid){
	//var idSensor_selected = document.getElementById('sensor_select_x').value;
	alert("esiste!");

	//operazione: funzione che prende in ingresso due valori, fa l'operazione e resituisce il risultato
	//sensore: funzione che fa il bind del sensore selezionato dall'utente e l'event handler restituisce il valore letto
	//input user: funzione che legge l'input immesso dall'utente e lo restituisce
}

/*****************     USER INPUT VALUE    ******************/

var GUIUserInputBox = function(){

	//increment num_boxes add on target
	this.num_boxes++;

	var html = "";
	html += "<div id='userInputGUI_"+this.num_boxes+"' style='clear:both; border: 1px solid #ff0000; border-radius: 5px; margin:5px 5px 0px 5px;'>";
	html += "Level: <input type='number' id='level' value='1' style='width:40px;' /> ";
    html += "Input value: <input type='text' id='input_val' /> ";
    html += "</div>";

    $("#target").append(html);

}