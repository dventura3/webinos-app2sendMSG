function ServiceHandler() {
   	this.myboxes = {};
    this.num = 0;
    var listSensorValue = {};
    var tree = {}; //tree is used to know connections from box node.
    var levels = {}; //id = number of levels - value: list of boxID in there level - used to know function order to invoke


    this.getTree = function(){
        return tree;
    }

    this.getLevels = function(){
        return levels;
    }

    this.setLevels = function(id, list){
        levels[id] = list;
    }


/*****************     HANDLER TREE   ******************/

    var fillinTree = function(){
        //remove all elements from tree
        tree = {};
        //add elements in tree in base of connections
        if (connections.length > 0) {
            for (var j = 0; j < connections.length; j++) {
                if(!tree.hasOwnProperty(connections[j].targetId)){
                    tree[connections[j].targetId] = [];
                }
                tree[connections[j].targetId].push(connections[j].sourceId);
            }
        }
    }

    var removeLeaves = function(treeModified){
        var treeTMP = {};
        var max_level = Object.keys(levels).length - 1;

        for(var targetId in treeModified){
            list_sourceID = treeModified[targetId];
            newList = [];
            for(var j=0; j<list_sourceID.length; j++){
                var to_remove = false;
                if(typeof levels[max_level] !== "undefined"){
                    for(var h=0; h<levels[max_level].length; h++){
                        if(list_sourceID[j] == levels[max_level][h])
                            to_remove = true;
                    }
                }
                if(to_remove==false){
                    newList.push(list_sourceID[j]);
                }
            }

            if(newList.length!=0 || targetId=="output_0" ){
                treeTMP[targetId] = newList;
            }
        }
        
        return treeTMP;
    }

    var getLeaves = function(nodeID, num_level, treeTMP){
        var leaves = [];
        if(typeof treeTMP[nodeID] === "undefined"){
            //nodeID is a leave because not exist
            leaves.push(nodeID);
        }else{
            for(var h=0; h<treeTMP[nodeID].length; h++){
                kk = getLeaves(treeTMP[nodeID][h], num_level, treeTMP);
                if(kk.length!=0){
                    leaves = leaves.concat(kk);
                }
            }
        }
        return leaves;
    }


    this.createTree = function(){

        fillinTree();

        var num_levels = 0;
        var treeTMP = tree;
        do{
            treeTMP = removeLeaves(treeTMP);
            myleaves = getLeaves("output_0",num_levels,treeTMP);
            this.setLevels(num_levels, myleaves);
            num_levels++;
        }while(myleaves.length!=0);

        //alert(JSON.stringify(levels));
    }


/*****************     COMBINED SERVICE   ******************/


    this.createCombinedService = function(serviceName){

        var functionContent = "";

        alert("numero di livelli" + Object.keys(levels).length);

    }


/*****************     OPERATION   ******************/

    this.executeOperation = function(parameter_1, parameter_2, operation){
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


/*****************     SENSOR   ******************/

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
                    },
                    function (){
                        console.error('Error configuring Sensor ' + sensor.api);
                    }
                );
            }
        });
    }


    this.getSensorValue = function(time, rates, interval, sensor){
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



};





/*

someFunction = function(str){
    alert(str);
}

var old_someFunction = someFunction;

someFunction = function(){
    alert('Hello');
    old_someFunction("CIAO!!!");
    alert('Goodbye');
}

//CON ARGOMENTI: si usa apply

someFunction = function(str){
    alert(str);
}

var old_someFunction = someFunction;

someFunction = function(mystr){
    alert('Hello');
    old_someFunction.apply(this, arguments);
    alert('Goodbye');
}



*/