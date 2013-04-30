var listSensorValue = {};

ServiceHandler = function() {
   	this.myboxes = {};
    this.num = 0;
};



ServiceHandler.prototype.executeOperation = function(parameter_1, parameter_2, operation){
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

var onSensorEvent = function(event){
    var sensor = services && services[event.sensorId];
    if (sensor) {
        if (!sensor.values) {
            sensor.values = [];
        }
        console.log(event);
        console.log("[VALUE]" + event.sensorValues[0]);

        var item = {
            sid: event.sensorId,
            value: event.sensorValues[0] || 0,
            timestamp: event.timestamp,
            unit: event.unit
        };

        try{
            listSensorValue[event.sensorId] = {};
            listSensorValue[event.sensorId] = item;
        }catch(err){
            console.log("[Event Sensor Value is undefined]: " + err.message);
        }
    }

}


var addEventListenerForSensor = function(time, rates, interval, sensor){
	sensor.bind({
		onBind:function(){
			console.log("[SENSOR] "+sensor.api+" bound");
			sensor.configureSensor({timeout: 120, rate: 500, eventFireMode: "fixedinterval"},
				function(){
					sensor.addEventListener('sensor', onSensorEvent, false);
  /*                  
        			sensor.addEventListener('sensor', 
            			function(event){
                  
            				console.log(event);
            				console.log("[VALUE]" + event.sensorValues[0]);

                            var item = {
                                sid: event.sensorId,
                                value: event.sensorValues[0] || 0,
                                timestamp: event.timestamp,
                                unit: event.unit
                            };

                            try{
                                listSensorValue[event.sensorId] = {};
                                listSensorValue[event.sensorId] = item;
                            }catch(err){
                                console.log("[Event Sensor Value is undefined]: " + err.message);
                            }

                		},
            			false
            		);
*/

				},
				function (){
					console.error('Error configuring Sensor ' + sensor.api);
				}
			);
		}
	});
}


var getSensorValue = function(time, rates, interval, sensor){
    if(typeof(listSensorValue[sensor.id])!=="undefined"){
        //var service = services[sensor.id];
        alert("VALUE: " + listSensorValue[sensor.id].value);
        sensor.removeEventListener('sensor', onSensorEvent, false);
    }else{
        addEventListenerForSensor(time, rates, interval, sensor);
        //recursive
        setTimeout(function(){this.getSensorValue(120,500,"fixedinterval",sensor)},1000);
    }
}
