function ServiceHandler() {
   	this.myboxes = {};
    this.num = 0;
    var listSensorValue = {};

    var servicesDescription = {};
    var tree = {}; //tree is used to know connections from box node.
    var levels = {}; //id = number of levels - value: list of boxID in there level - used to know function order to invoke

    var productionList = {};
    var blockList = [];


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

        servicesDescription.actuator = {
            function_name:"setActuatorState",
            inputBoxes:1,
            outputBoxes:0,
            inputArgs:["value","actuator"],
            outputArgs:[]
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



/*****************     ORDINAMENTO   ******************/

    var isInsideProductionsList = function(source, target){
        for( i in productionList){
            if(productionList[i].source==source && productionList[i].target==target)
                return true;
        }
        return false;
    }


    var addRootProductions = function(){
        var n = 0;
        //I take an input box at a time and find all its productions (connessions)
        for(var i=0; i<listInputBoxes.length; i++){
            for(var j=0; j<connections.length;j++){
                if(connections[j].sourceId == listInputBoxes[i]){
                    productionList[n] = {
                        id:n,
                        source:connections[j].sourceId,
                        target:connections[j].targetId
                    };
                    n++;
                }
            }
        }
    }

    var addDependencies = function(elementID){
        var n = Object.keys(productionList).length;
        //to find dependencies, i roll all connection and take only that with targetId = elementID
        //obviously, i add production only if it doesn't exist in productionsList
        for(var j=0; j<connections.length;j++){
            if(connections[j].targetId == elementID && isInsideProductionsList(connections[j].sourceId,connections[j].targetId)==false){
                productionList[n] = {
                    id:n,
                    source:connections[j].sourceId,
                    target:connections[j].targetId
                };
                n++;
            }
        }
    }

    var addChildren = function(elementID){
        var n = Object.keys(productionList).length;
        //to find children, i roll all connenctions and take only that with sourceID = elementID
        //obviously, i add production only if it doesn't exist in productionsList
        for(var j=0; j<connections.length;j++){
            if(connections[j].sourceId == elementID && isInsideProductionsList(connections[j].sourceId,connections[j].targetId)==false){
                productionList[n] = {
                    id:n,
                    source:connections[j].sourceId,
                    target:connections[j].targetId
                };
                n++;
            }
        }
    }


    this.createProductions = function(){
        //STEP 1: Create list of productions:
        //  - add input productions
        //  - add dependencies for element on DX of input productions
        //  - add children for element on DX of input productions
        //  - repete 2-3 steps while productionList.length == connections.length

        addRootProductions();

        while(Object.keys(productionList).length != connections.length){
            for( h in productionList){
                addDependencies(productionList[h].target);
                addChildren(productionList[h].target);
            }
        }

        //alert(Object.keys(productionList).length);
        //alert(JSON.stringify(productionList));
    }

    this.groupByDXElements = function(){
        //STEP 2: Group productions in block. Every Block have DX elements in common.
        //  - get first element of productionList and its DX elements
        //  - find all procudtions that have the same DX elements and create a new block ({id:[list of production id inside the block]})
        //  - repete 1-2 step while sum of elemnts for all block (inside list) == connections.length

        for(var n in productionList){
            exist = false;

            //if productionList[n].target is inside blockList -> i search block and insert id of production "n-esima"
            for(var i=0; i<blockList.length; i++){
                if(blockList[i].elementTarget==productionList[n].target){
                    exist=true;
                    blockList[i].idProdList.push(productionList[n].id);
                    break;
                }
            }

            //if productionList[n].target isn't inside blockList -> i create a new block in blockList
            if(exist==false){
                blockList.push({
                    elementTarget:productionList[n].target,
                    idProdList:[productionList[n].id]
                });
            }
        }

        //alert("Num Block: " + blockList.length);
        //alert("Original Block List" + JSON.stringify(blockList));
    }


    var getDependenciesBlock = function(block, bList){

        var changeOrder = false;

        for(var n=0; n<block.idProdList.length; n++){
            //find production that have id = block.idProdList[n]
            //ES: 
            //  - n=0  -->  production = a-->L
            //  - n=1  -->  production = i-->L
            var production = productionList[block.idProdList[n]];

            //i take SX element of production and find block with elementTarget==production.source
            //if this block not exist --> production.source is an "input" box
            //and also i must check that i don't have before insert this block (in blockList).
            isInputBox = true;
            exist = false;
            for(var h=0; h<bList.length; h++){
                if(bList[h].elementTarget == production.source){
                    //if i'm here, production.source isn't an "input" box
                    isInputBox = false;
                    //is bList[h] before insert in blockList?
                    for(var i=0; i<blockList.length; i++){
                        if(bList[h].elementTarget == blockList[i].elementTarget){
                            exist=true;
                            break;
                        }
                    }
                    if(exist==false){
                        blockList.push(bList[h]);
                        changeOrder = true;
                    }
                }
            }
            if(isInputBox==true){
                //nothing todo
            }
        }

        //insert original block
        blockList.push(block);

        return changeOrder;
    }


    this.orderBlocks = function(){
        //STEP 3: I must to order block in base of its dependencies.
        //ES: 
        //Image that i have this connections:
        //          a-->L -  Block_0
        //          i-->L -  Block_0
        //          h-->i -  Block_1
        //With "a" and "h" input boxes.
        //Because "L" depend by "i", i must order Block_1 before Block_0 (put before the dependencies).

        var changeOrder=true;

        while(changeOrder==true){
            var orderTMP = [];

            //copy blockList in a tmp list and remove its contents.
            var blockTMP = blockList;
            blockList = [];

            for(var i=0; i<blockTMP.length; i++){
                exist = false;
                for(var h=0; h<blockList.length; h++){
                    if(blockTMP[i].elementTarget == blockList[h].elementTarget){
                        exist=true;
                        break;
                    }
                }
                if(exist==false){
                    orderTMP.push(getDependenciesBlock(blockTMP[i],blockTMP));
                }
            }

            //count numFalse and set changeOrder variable --> used to stop while cycle
            var numFalse = 0;
            for(var t=0;t<orderTMP.length; t++){
                if(orderTMP[t]==false)
                    numFalse++;
            }

            if(numFalse==orderTMP.length)
                changeOrder = false;
            else
                changeOrder = true;

        }

        //alert("BlockList Modified: "+ JSON.stringify(blockList));

    }


/*****************     COMBINED SERVICE   ******************/



    this.createCombinedService = function(serviceName, configList){

        var listVariables = {};

        var variableReturned = {};

        var functionContent = "";
        var functionArguments = "";
        var objReturned = "" ;

        var variableNumber = 0;


        //INPUT BOXES
        for(var i=0; i<listInputBoxes.length; i++){

            //Insert variable in list
            listVariables[listInputBoxes[i]] = "variable" + variableNumber;

            var boxID = listInputBoxes[i];

            var boxType = listInputBoxes[i].split("_")[0];

            switch(boxType){
                case "input":
                    functionArguments += "variable" + variableNumber + ",";
                    variableNumber++;
                break;
                case "sensorGUI":
                    if(servicesDescription.sensor.inputArgs.length==Object.keys(configList[boxID]).length){
                        //start
                        getSensorValue(configList[boxID].time,configList[boxID].rates,configList[boxID].interval,configList[boxID].sensor);
                        functionContent += "variable" + variableNumber + " = getSensorValue("+configList[boxID].time+","+configList[boxID].rates+",'"+configList[boxID].interval+"','"+configList[boxID].sensor+"');";
                        variableNumber++;
                    }else
                        return -1;
                break;
                case "userInputGUI":
                    if(Object.keys(configList[boxID]).length==1 && configList[boxID]!=[]){
                        functionContent += "variable" + variableNumber + " = "+configList[boxID].ui +";";
                        variableNumber++;
                    }else
                        return -1;
                break;
                default:
                break;
            }
        }


        //MIDLE BOXES
        for(var j=0; j<blockList.length; j++){

            var production = productionList[blockList[j].idProdList[0]];

            var boxID = production.target;

            var boxType = production.target.split("_")[0];

            switch(boxType){
                case "operationGUI":
                    //verify that connection are ok --> infact i must have 2 input connection
                    if(servicesDescription.operation.inputBoxes==blockList[j].idProdList.length){
                        var left = "";
                        var right = "";

                        for (var k=0; k<connections.length; k++) {
                            if(connections[k].targetId==boxID){
                                var params = connections[k].getParameters();
                                if(params.position=="left")
                                    left = listVariables[connections[k].sourceId];
                                else
                                    right = listVariables[connections[k].sourceId];
                            }
                        }
                        
                        listVariables[boxID] = "variable" + variableNumber;
                        functionContent += "variable" + variableNumber + " = executeOperation("+left+","+right+",'"+configList[boxID].operation+"');";
                        variableNumber++;                         

                    }else
                        return -1;
                break;
                case "actuatorGUI":
                    if(blockList[j].idProdList.length==1){
                        //get name of variable in up level
                        var variableUPlevel = listVariables[production.source]; 
                        functionContent += "variable" + variableNumber + " = setActuatorState("+variableUPlevel+",'"+configList[boxID].actuator+"');";
                        listVariables[boxID] = "variable" + variableNumber;
                        variableNumber++;
                    }
                break;
                case "output":
                    for(var f=0; f<blockList[j].idProdList.length; f++){
                        var productionTMP = productionList[blockList[j].idProdList[f]];
                        objReturned += "'" + productionTMP.source + "':" +listVariables[productionTMP.source] +",";
                    }
                break;
                default:
                break;
            }
        }


        //remove the last ","
        functionArguments = functionArguments.substr(0, functionArguments.length-1);
        alert("functionArguments: " + functionArguments);
        alert("functionContent: " + functionContent);

        //remove the last ","
        objReturned = objReturned.substr(0, objReturned.length-1);
        objReturned = "{" + objReturned + "}";
        alert("RETURN: " + JSON.stringify(objReturned));

        var serviceFunction = "ServiceHandler.prototype."+ serviceName + " = function("+functionArguments+"){ "+ functionContent +" return "+ objReturned +"; }";
        eval(serviceFunction);

        return 0;

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

        //this.setLevels(0, listInputBoxes);

        //var num_level0 = levels["0"].push();


        

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

/*
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

        //var serviceFunction = "function " + serviceName + "("+functionArguments+"){"+ functionContent +" return "+ objReturned +";}";
        var serviceFunction = "ServiceHandler.prototype."+ serviceName + " = function("+functionArguments+"){ "+ functionContent +" return "+ objReturned +"; }";
        eval(serviceFunction);

        return 0;
    }


    this.createNewService = function(serviceName, configList){

        var variableReturned = {};

        var functionContent = "";
        var functionArguments = "";

        var variableNumber = 0;

        var numCycle = Object.keys(listInputBoxes).length;

        while(numCycle!=0){

        }

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

/*****************     ACTUATOR   ******************/

    var setActuatorState = function(state,aid){
        actuator = services.actuators[aid];
        actuator.bind({
            onBind:function(){
                var val_array=new Array(); 
                val_array[0]=parseFloat(state);
                try{
                    actuator.setValue(val_array,
                        function(actuatorEvent){
                            alert("[ACTUATOR SET STATE] "+JSON.stringify(actuatorEvent));
                        },
                        function(actuatorError){
                            alert("[ERROR] on actuators set state: "+JSON.stringify(actuatorError));
                        }
                    );
                }
                catch(err){
                    console.log("Not a valid webinos actuator: " + err.message);
                }
            }
        });
    }


};


