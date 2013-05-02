function GUIBoxHandler() {
   	var num_boxes = 0;
   	var services = {};
   	var that = this;

   	this.incrementNumBoxes = function(){
		num_boxes++;
	}

	this.getNumBoxes = function(){
		return num_boxes;
	}

	this.getService = function(type,id){
		var service_type = services[type];
		for(var i in service_type){
			if(id==i)
				return service_type[i];
		}
		return {};
	}

/*****************     INITIALIZATION   ******************/

	//find all services available
	var findAllServices = function(){
		webinos.discovery.findServices(new ServiceType("http://webinos.org/api/*"), {
				onFound: function (service) {
					console.log("Service "+service.serviceAddress+" found ("+service.api+")");
					//found a new sensors
					if(service.api.indexOf("sensors.") !== -1){
						if(!services.hasOwnProperty("sensors")){
							services.sensors = {};
						}
						services.sensors[service.id] = service;
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

			var coord = {
				x:window.event.clientX,
				y:window.event.clientY
			}

			//remove class "valid"
			this.className = "";

			var box_selected = event.dataTransfer.getData("box").split("box_")[1];

			switch(box_selected){
				case "sensor":
					alert("sensor");
					//GUISensorBox(coord);
					break;
				case "operation":
					alert("operation");
					//that.GUIOperationBox(coord);
					break;
				case "userInput":
					alert("userInput");
					//GUIUserInputBox(coord);
					break;
				default:
					alert("Error");
			}

		}
	}

	this.init = function(){
		findAllServices();
		addOnDragStart();
		addDragEventsForTarget();
	}



/*****************     OPERATION   ******************/

	this.GUIOperationBox = function(coord){
		//increment num_boxes add on target
		this.num_boxes++;

		var html="";
		html += "<div class='window' id='myWindow'>";
		html += "two<br/><br/>";
		html += "<a href='#' class='cmdLink hide' rel='window2'>toggle connections</a><br/>";
		html += "</div>";
/*
		var html = "";
		html += "<div id='operationGUI_"+this.num_boxes+"' style='clear:both; border: 1px solid #0000ff; border-radius: 5px; margin:5px 5px 0px 5px;'>";
		html += "Operation: <select id='sensor_select'>";
		html += "<option value='sum'> + </option>";
	    html += "<option value='subtraction'> - </option>";
	    html += "<option value='multiplication'> * </option>";
	    html += "<option value='division'> / </option>";
		html += "</select>";
		html += "</div>";
*/
		$("#target").append(html);

		var d = document.getElementById('myWindow');
		d.style.left = coord.x;
		d.style.top = coord.y;
		
		var e2 = jsPlumb.addEndpoint('myWindow', { anchor:"TopCenter" }, greeCircle());
    	jsPlumb.draggable($(".window"));

	}


/*****************     SENSOR   ******************/



/*****************     USER INPUT VALUE    ******************/



};



