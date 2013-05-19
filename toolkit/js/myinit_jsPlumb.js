//(function() {

//giuseppe ficili
//funzioni inline
//incapsulamento

    var listInputBoxes = []; //boxes on 0 level
    var listOutputBoxes = []; //boxes on the last level

    var _initialised = false,
        connections = [],
        updateConnections = function(conn, remove) {
            if (!remove){
                connections.push(conn);
                var sid = conn.sourceId.split("_")[0];
                var tid = conn.targetId.split("_")[0];
                if(typeof inputBoxes[sid] !== "undefined"){
                    listInputBoxes.push(conn.sourceId);
                    listInputBoxes = listInputBoxes.uniq();
                }
                if(typeof outputBoxes[tid] !== "undefined"){
                    listOutputBoxes.push(conn.targetId);
                    listOutputBoxes = listOutputBoxes.uniq();
                }

                //alert("[INSERT] Numero degli input boxes: " + listInputBoxes.length);
                //alert("[INSERT] numero degli output boxes: " + listOutputBoxes.length);
            }
            else {
                var s = 0;
                while(s!=listInputBoxes.length){
                    if(listInputBoxes[s]==conn.sourceId)
                        break;
                    s++;
                }
                if(s!=listInputBoxes.length) listInputBoxes.splice(s, 1);

                var t = 0;
                while(t!=listOutputBoxes.length){
                    if(listOutputBoxes[t]==conn.targetId)
                        break;
                    t++;
                }
                if(t!=listOutputBoxes.length) listOutputBoxes.splice(t, 1);

                var idx = -1;
                for (var i = 0; i < connections.length; i++) {
                    if (connections[i] == conn) {
                        idx = i; break;
                    }
                }
                if (idx != -1) connections.splice(idx, 1);
            }

            if (connections.length > 0) {
                for (var j = 0; j < connections.length; j++) {
                    s = "Source: " + connections[j].sourceId + " - Target: " + connections[j].targetId;
                    //alert(s);

                    /*
                    Is it possible to set parameters for an endpoints.
                    The functions available are:
                    - getParameter(String)
                    - setParameter(String, Object)
                    - Object getParameters()
                    - setParameters(Object)
                    The behaviour when establishing a connection between two endpoints is to merge the endpoint's parameters in to the connections parameters object
                    note that here, if they all have some parameter with the same name, the precedence is as follows:
                    1. connection's value
                    2. target endpoint's value
                    3. source endpoint's value
                    */
                    var params = connections[j].getParameters();
                    //alert(params.position);
                }
            }
        };
    
    window.jsPlumbDemo = {
        init : function() {
        
            // setup jsPlumb defaults.
            jsPlumb.importDefaults({
                //DragOptions : { cursor: 'pointer', zIndex:2000 },
                PaintStyle : { strokeStyle:'#666' },
                EndpointStyle : { width:20, height:16, strokeStyle:'#666' },
                Endpoint : "Rectangle",
                Anchors : ["TopCenter", "TopCenter"]
            });                                             

            // bind to connection/connectionDetached events, and update the list of connections on screen.
            jsPlumb.bind("connection", function(info, originalEvent) {
                //alert(" *** SourceEndpoint: " + info.sourceEndpoint.id + " - TargetEndpoint: " + info.targetEndpoint.id);
                updateConnections(info.connection);
            });
            jsPlumb.bind("connectionDetached", function(info, originalEvent) {
                updateConnections(info.connection, true);
            });
/*

            // setup some empty endpoints.  again note the use of the three-arg method to reuse all the parameters except the location
            // of the anchor (purely because we want to move the anchor around here; you could set it one time and forget about it though.)
            var e1 = jsPlumb.addEndpoint('window1', { anchor:"TopCenter" },  greeCircle());

            // setup some DynamicAnchors for use with the blue endpoints            
            // and a function to set as the maxConnections callback.
            var anchors = [[1, 0.2, 1, 0], [0.8, 1, 0, 1], [0, 0.8, -1, 0], [0.2, 0, 0, -1] ],
                maxConnectionsCallback = function(info) {
                    alert("Cannot drop connection " + info.connection.id + " : maxConnections has been reached on Endpoint " + info.endpoint.id);
                };
                
            var e1 = jsPlumb.addEndpoint("window1", { anchor:"BottomCenter" }, blueRectangle(2));
            // you can bind for a maxConnections callback using a standard bind call, but you can also supply 'onMaxConnections' in an Endpoint definition - see exampleEndpoint3 above.
            e1.bind("maxConnections", maxConnectionsCallback);

*/
            // three ways to do this - an id, a list of ids, or a selector (note the two different types of selectors shown here...anything that is valid jquery will work of course)
            var divsWithWindowClass = jsPlumb.CurrentLibrary.getSelector(".window");
            jsPlumb.draggable(divsWithWindowClass);



            // init         
            if (!_initialised) {
                $(".hide").click(function() {
                    jsPlumb.toggle($(this).attr("rel"));
                });
    
                $(".drag").click(function() {
                    var s = jsPlumb.toggleDraggable($(this).attr("rel"));
                    $(this).html(s ? 'disable dragging' : 'enable dragging');
                    if (!s)
                        $("#" + $(this).attr("rel")).addClass('drag-locked');
                    else
                        $("#" + $(this).attr("rel")).removeClass('drag-locked');
                    $("#" + $(this).attr("rel")).css("cursor", s ? "pointer" : "default");
                });
    
                $(".detach").click(function() {
                    jsPlumb.detachAllConnections($(this).attr("rel"));
                });
    
                $("#clear").click(function() { 
                    jsPlumb.detachEveryConnection();
                    showConnectionInfo("");
                });
                
                _initialised = true;
            }
        }
    };


    Array.prototype.uniq = function uniq() {
        return this.reduce(function(accum, cur) { 
            if (accum.indexOf(cur) === -1) accum.push(cur); 
                return accum; 
            }, [] );
    }


    
//})();


