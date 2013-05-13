function ServiceHandler() {
   	this.myboxes = {};
    this.num = 0;
    var listSensorValue = {};

    var servicesDescription = {};
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

    this.init = function(){
        servicesDescription.sensor = {
            function_name:"getSensorValue",
            inputBoxes:0,
            outputBoxes:1,
            inputArgs:["timeout","rate","interval","sensor"],
            outputArgs:["sensorValues"]
        };

        servicesDescription.operation = {
            function_name:"executeOperation",
            inputBoxes:2,
            outputBoxes:1,
            inputArgs:["parameter_1", "parameter_2", "operation"],
            outputArgs:["resultOperation"]
        };

        servicesDescription.userInput = {
            function_name:null,
            inputBoxes:0,
            outputBoxes:1,
            inputArgs:[],
            outputArgs:[]
        };
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


    this.createCombinedService = function(serviceName, configList){

        var variableReturned = {};

        var functionContent = "";
        var functionArguments = "";

        var variableNumber = 0;
        var max_level = Object.keys(levels).length - 1;

        for(var level in levels){
            for(var i=0; i<levels[level].length; i++){

                var boxID = levels[level][i];

                var boxType = levels[level][i].split("_")[0];

                switch(boxType){
                    case "input":
                        if(!variableReturned.hasOwnProperty(level)){
                            variableReturned[level] = [];
                        }
                        //devo creare tante variabili/argomenti quanti sono le connessioni tra inputBOX - altriBOX
                        if (connections.length > 0) {
                            for (var j=0; j<connections.length; j++) {
                                //variableReturned["0"] = arguments of service function
                                if(connections[j].sourceId==boxID){
                                    functionArguments = "variable" + variableNumber + ",";
                                    variableReturned[level].push({
                                                                name: "variable" + variableNumber,
                                                                source:connections[j].sourceId,
                                                                target:connections[j].targetId
                                                            });
                                    variableNumber++;
                                }
                            }
                        }
                        break;
                    case "operationGUI":
                        if(!variableReturned.hasOwnProperty(level)){
                            variableReturned[level] = [];
                        }
                        //verify that connection are ok --> what are variable of superior level to input of operation?
                        //pass all to function
                        //return value to save in variableReturned
                        if(servicesDescription.operation.inputBoxes==tree[boxID].length){
                            var left = "";
                            var right = "";
                            //i create variables and obtain variable left and right
                            if (connections.length > 0) {
                                for (var j=0; j<connections.length; j++) {
                                    //se il box è source di un altro box, creo la variabile
                                    if(connections[j].sourceId==boxID){
                                        variableReturned[level].push({ 
                                                                    name: "variable" + variableNumber,
                                                                    source:connections[j].sourceId,
                                                                    target:connections[j].targetId
                                                                });
                                    }
                                    //se il box è target di altro box di livello superiore, devo prendere la variabile del livello superiore
                                    if(connections[j].targetId==boxID){
                                        var params = connections[j].getParameters();
                                        for(var f=0; f<variableReturned[(level-1)].length;f++){
                                            if(variableReturned[(level-1)][f].source==connections[j].sourceId){
                                                if(params.position=="left")
                                                    left = variableReturned[(level-1)][f].name;
                                                else
                                                    right = variableReturned[(level-1)][f].name;

                                                if(variableReturned[(level-1)][f].target==null){
                                                    variableReturned[(level-1)][f].target = boxID;
                                                }
                                            }
                                        }
                                    }
                                }
                            }

                            functionContent += "variable" + variableNumber + " = executeOperation("+left+","+right+",'"+configList[boxID].operation+"');";
                            variableNumber++;                         

                        }else{
                            return -1;
                        }
                        break;
                    case "sensorGUI":
                        //SENSOR is a box only in output, it don't have inputs
                        if(servicesDescription.sensor.inputArgs.length==Object.keys(configList[boxID]).length){
                            if(!variableReturned.hasOwnProperty(level)){
                                variableReturned[level] = [];
                            }

                            //start
                            getSensorValue(configList[boxID].time,configList[boxID].rates,configList[boxID].interval,configList[boxID].sensor);

                            functionContent += "variable" + variableNumber + " = getSensorValue("+configList[boxID].time+","+configList[boxID].rates+",'"+configList[boxID].interval+"','"+configList[boxID].sensor+"');";

                            variableReturned[level].push({
                                                        name: "variable" + variableNumber,
                                                        source:boxID,
                                                        target:null
                                                    });
                            variableNumber++;

                        }else{
                            return -1;
                        }
                        break;
                    case "userInputGUI":
                        if(Object.keys(configList[boxID]).length==1 && configList[boxID]!=[]){
                            if(!variableReturned.hasOwnProperty(level)){
                                variableReturned[level] = [];
                            }

                            functionContent += "variable" + variableNumber + " = "+configList[boxID].ui +";";

                            variableReturned[level].push({ 
                                                            name: "variable" + variableNumber,
                                                            source:boxID,
                                                            target:null
                                                        });
                            variableNumber++;

                        }else{
                            return -1;
                        }
                        break;
                    default:
                        break;
                }
            }
        }

        functionArguments = functionArguments.substr(0, functionArguments.length-1);
        //alert("functionArguments: " + functionArguments);
        //alert("functionContent: " + functionContent);


        /*

            TODO:
            Problema dell'objReturned --> chiave/valore avrà come valore la stringa "variablex" e non il valore della variabile!

        */

        objReturned = "" ;
        //create Output of service
        for(var f=0; f<variableReturned[(max_level-1)].length;f++){
            if(variableReturned[(max_level-1)][f].target=="output_0"){
                objReturned += "'" + variableReturned[(max_level-1)][f].source + "':" +variableReturned[(max_level-1)][f].name +",";
            }
        }

        objReturned = objReturned.substr(0, objReturned.length-1);
        objReturned = "{" + objReturned + "}";

        alert("RETURN: " + JSON.stringify(objReturned));

        /*

            TODO:
            Combine and create string content service function.

        */

        //var serviceFunction = "function " + serviceName + "("+functionArguments+"){"+ functionContent +" return "+ objReturned +";}";
        var serviceFunction = "ServiceHandler.prototype."+ serviceName + " = function("+functionArguments+"){ "+ functionContent +" return "+ objReturned +"; }";
        eval(serviceFunction);

        //var func = "function "+ serviceName + " (){ alert('DENTRO FUNZIONE NUOVA!');} ";
        //this.registerFunction(serviceFunction);

        //window[serviceName]();
        //eval(serviceInvoked);


        return 0;
    }


    this.registerFunction = function(functionBody) {
        "use strict";
        var script = document.createElement("script");
       /* script.innerHTML = "function " + functionBody;
        document.body.appendChild(script);
        */

        script.innerHTML = functionBody;
        document.body.appendChild(script);
    }

/*
    this.modifyFunction = function(functionName,functionBody){
        var old_someFunction = functionName;

        var func = "var " + functionName + " = function(){ "++" alert('DENTRO FUNZIONE INIZIALE!');} ";
        this.registerFunction(func);


    }
*/

/*****************     OPERATION   ******************/

    var executeOperation = function(parameter_1, parameter_2, operation){
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


    var getSensorValue = function(time, rates, interval, ids){

        sensor = services.sensors[ids];
        alert(JSON.stringify(sensor));
        if(typeof(listSensorValue[ids])!=="undefined"){
            //var service = services[sensor.id];
            alert("VALUE: " + listSensorValue[ids].value);
            //sensor.removeEventListener('sensor', onSensorEvent, false);
            return listSensorValue[ids].value;
        }else{
            addEventListenerForSensor(time, rates, interval, sensor);
            //recursive
            //setTimeout(function(){getSensorValue(120,500,"fixedinterval",sensor)},2000);
        }

        return 0;
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