ServiceHandler = function() {
   	myboxes = {};
   	listSensorValue = [];
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



var getSensorValue = function(time, rates, interval, sensor){
	sensor.bind({
		onBind:function(){
			console.log("[SENSOR] "+sensor.api+" bound");
			sensor.configureSensor({timeout: 120, rate: 500, eventFireMode: "fixedinterval"}, 
				function(){
					var service = sensor;
        			service.addEventListener('sensor', 
            			function(event){
            				console.log(event);
            				console.log("[VALUE]" + event.sensorValues[0]);
                    		//alert("[SENSOR] event: "+event);
                    		value = event.sensorValues[0];
                    		//return value;
                		},
            			false
            		);
				},
				function (){
					console.error('Error configuring Sensor ' + sensor.api);
				}
			);
		}
	});
}



