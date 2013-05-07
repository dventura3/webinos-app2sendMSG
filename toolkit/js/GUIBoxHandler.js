function GUIBoxHandler() {
   	var num_boxes = 0;
   	var services = {};
   	var that = this;
   	var start_coord = {};

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

				//salve coord of: start position of box - actual mouse coord
				var elem = document.getElementById(this.id);
				var rect = elem.getBoundingClientRect();
	    		h = rect.left  - event.clientX;
	    		k = rect.top - event.clientY;
				
				start_coord[this.id] = {
					xcood:h,
					ycood:k
				};

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
			event.preventDefault();
			return false;
		}

		target.ondrop = function(event){

			// -250 because offset on demo-new.css for "leftcol" div
    		xx = (event.clientX + start_coord[event.dataTransfer.getData("box")].xcood - 250);
    		yy = (event.clientY + start_coord[event.dataTransfer.getData("box")].ycood);

			var coord = {
				x:xx,
				y:yy
			}

			//remove class "valid"
			this.className = "";

			var box_selected = event.dataTransfer.getData("box").split("box_")[1];

			switch(box_selected){
				case "sensor":
					that.GUISensorBox(coord);
					break;
				case "operation":
					that.GUIOperationBox(coord);
					break;
				case "userInput":
					that.GUIUserInputBox(coord);
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
		GUIOutputBox();
	}

/*****************   TO CREATE INPUT/OUTPUT DESIGN   ******************/

	var greeCircle = function(){

		var exampleDropOptions = {
		    tolerance:"touch",
		    hoverClass:"dropHover"
		};
		var color2 = "#316b31";
	    var exampleEndpoint2 = {
	        endpoint:["Dot", { radius:15 }],
            paintStyle:{ fillStyle:color2 },
            isSource:false,
            isTarget:true,
            scope:"idem",
            connectorStyle:{ strokeStyle:color2, lineWidth:8 },
            connector: ["Bezier", { curviness:63 } ],
            maxConnections:-1, //unlimited
            beforeDetach:function(conn) {
            	//alert("#beforeDetach *** SourceEndpoint: " + conn.sourceEndpoint + " - TargetEndpoint: " + conn.targetEndpoint);
                return confirm("Detach connection?"); 
            },
            dropOptions : exampleDropOptions
	    };

	    return exampleEndpoint2;
	}

	var blueRectangle = function(){

		var exampleDropOptions = {
		    tolerance:"touch",
		    hoverClass:"dropHover"
		};

		var exampleColor = "#00f";
	    var exampleEndpoint = {
	        endpoint:"Rectangle",
            paintStyle:{ width:25, height:21, fillStyle:exampleColor },
            isSource:true,
            isTarget:false,
            //reattach:true,
            scope:"idem",
            connectorStyle : {
                gradient:{stops:[[0, exampleColor], [0.5, "#09098e"], [1, exampleColor]]},
                lineWidth:5,
                strokeStyle:exampleColor,
                dashstyle:"2 2"
            },
            maxConnections:-1, //unlimited            
            dropOptions : exampleDropOptions
	    };
	    return exampleEndpoint;      
	}


/*****************     OUTPUT   ******************/

	var GUIOutputBox = function(){

		idbox = "output_0";

		var html="";
		html += "<div class='window' id='"+idbox+"'>";
		html += "Output<br/><br/>";
		html += "</div>";

		$("#main").append(html);

		var d = document.getElementById(idbox);
		d.style.left = '330px';
		d.style.top = '430px';
		
		var endpoint = jsPlumb.addEndpoint(idbox, { anchor:"TopCenter" }, greeCircle());

    	var divsWithWindowClass = jsPlumb.CurrentLibrary.getSelector(".window");
        jsPlumb.draggable(divsWithWindowClass);

	}

/*****************     OPERATION   ******************/

	this.GUIOperationBox = function(coord){
		//increment num_boxes add on target
		num_boxes++;

		idbox = "operationGUI_"+num_boxes;

		var html="";
		html += "<div class='window' id='"+idbox+"'>";
		html += "Operation<br/><br/>";
		html += "<select id='operation_select'>";
		html += "<option value='sum'> + </option>";
	    html += "<option value='subtraction'> - </option>";
	    html += "<option value='multiplication'> * </option>";
	    html += "<option value='division'> / </option>";
		html += "</select>";
		html += "</div>";

		$("#main").append(html);

		var d = document.getElementById(idbox);
		d.style.left = coord.x+'px';
		d.style.top = coord.y+'px';
		
		jsPlumb.addEndpoint(idbox, { 
			anchor:"TopRight",
			parameters:{
				position:"right"
			} 
		}, greeCircle());
		jsPlumb.addEndpoint(idbox, { 
			anchor:"TopLeft",
			parameters:{
				position:"left"
			} 
		}, greeCircle());
		jsPlumb.addEndpoint(idbox, { anchor:"BottomCenter" }, blueRectangle());
    	
    	var divsWithWindowClass = jsPlumb.CurrentLibrary.getSelector(".window");
        jsPlumb.draggable(divsWithWindowClass);

	}

	this.getOperationConfig = function(id){
		var config = {};
		var child = $("#"+id).children();
        for(var j = 0;j<child.length; j++){
			if(child[j].id == "operation_select"){
        		config.operation = child[j].value;             
            }
        }
        return config;
	}


/*****************     SENSOR   ******************/

	this.GUISensorBox = function(coord){

		//increment num_boxes add on target
		num_boxes++;

		idbox = "sensorGUI_"+num_boxes;

		var html = "";
		html += "<div class='window' id='"+idbox+"' >";
		html += "Sensor<br/><br/>";
	    html += "Timeout: <input type='text' id='timeout_sensor' value='120' style='width:40px;' /><br/>";
	    html += "Rate: <input type='text' id='rate_sensor' value='500' style='width:40px;' /><br/>";
	    html += "Interval: <input type='text' id='interval_sensor' value='fixedinterval' style='width:70px;' /><br/>";
	    html += "Sensors: <select id='sensor_select'></select> ";
	    html += "</div>";

	    $("#main").append(html);

	    //add sensor list on "sensor_select"
	    var child = $("#"+idbox).children();
	    for(var i = 0;i<child.length; i++){
	    	if(child[i].id == "sensor_select"){
	    		for(var sid in services["sensors"]){
	    			var optTMP = document.createElement("option");
	    			optTMP.text = services.sensors[sid].description;
	    			optTMP.value = sid;
	    			child[i].options.add(optTMP);
	    		}
	    	}
	    }

	    var d = document.getElementById(idbox);
		d.style.left = coord.x+'px';
		d.style.top = coord.y+'px';
		
		jsPlumb.addEndpoint(idbox, { anchor:"BottomCenter" }, blueRectangle());
    	
    	var divsWithWindowClass = jsPlumb.CurrentLibrary.getSelector(".window");
        jsPlumb.draggable(divsWithWindowClass);
	}


	this.getSensorConfig = function(id){
		var config = {};
		var child = $("#"+id).children();
        for(var j = 0;j<child.length; j++){
        	if(child[j].id == "timeout_sensor"){
        		config.timeout_sensor = child[j].value;
        	}else if(child[j].id == "rate_sensor"){
        		config.rate_sensor = child[j].value;             
            }else if(child[j].id == "interval_sensor"){
        		config.interval_sensor = child[j].value;             
            }else if(child[j].id == "sensor_select"){
        		config.sensor = services["sensors"][child[j].value];             
            }
        }
        return config;
	}


/*****************     USER INPUT VALUE    ******************/

	this.GUIUserInputBox = function(coord){

		//increment num_boxes add on target
		num_boxes++;

		idbox = "userInputGUI_"+num_boxes;

		var html = "";
		html += "<div class='window' id='"+idbox+"' >";
		html += "Input value<br/><br/>";
	    html += "<input type='text' id='input_val' /> ";
	    html += "</div>";

	    $("#main").append(html);

	    var d = document.getElementById(idbox);
		d.style.left = coord.x+'px';
		d.style.top = coord.y+'px';
		
		jsPlumb.addEndpoint(idbox, { anchor:"BottomCenter" }, blueRectangle());
    	
    	var divsWithWindowClass = jsPlumb.CurrentLibrary.getSelector(".window");
        jsPlumb.draggable(divsWithWindowClass);
	}

	this.getUIConfig = function(id){
		var config = {};
		var child = $("#"+id).children();
        for(var j = 0;j<child.length; j++){
			if(child[j].id == "input_val"){
        		config.ui = child[j].value;             
            }
        }
        return config;
	}

};



