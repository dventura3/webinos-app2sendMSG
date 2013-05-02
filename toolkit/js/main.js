

jsPlumb.bind("ready", function() {
	jsPlumb.reset();
	jsPlumb.setRenderMode(jsPlumb.SVG);
	jsPlumbDemo.init();

    var gui = new GUIBoxHandler();
    gui.init();

	$('#btnCreateWindow2').click(function() {
		var html="";
		html += "<div class='window' id='window2'>";
		html += "two<br/><br/>";
		html += "<a href='#' class='cmdLink hide' rel='window2'>toggle connections</a><br/>";
		html += "</div>";
			
    	$("#main").append(html);

    	var e2 = jsPlumb.addEndpoint('window2', { anchor:"TopCenter" }, greeCircle());
    	
        var divsWithWindowClass = jsPlumb.CurrentLibrary.getSelector(".window");
            jsPlumb.draggable(divsWithWindowClass);

	});
});

var greeCircle = function(){

	var exampleDropOptions = {
	    tolerance:"touch",
	    hoverClass:"dropHover"
	};
	var color2 = "#316b31";
    var exampleEndpoint2 = {
        endpoint:["Dot", { radius:15 }],
        paintStyle:{ fillStyle:color2 },
        isSource:true,
        scope:"idem",
        connectorStyle:{ strokeStyle:color2, lineWidth:8 },
        connector: ["Bezier", { curviness:63 } ],
        isTarget:true,
        dropOptions : exampleDropOptions
    };

    return exampleEndpoint2;
}

var blueRectangle = function(maxConn){

	var exampleDropOptions = {
	    tolerance:"touch",
	    hoverClass:"dropHover"
	};

	var exampleColor = "#00f";
    var exampleEndpoint = {
        endpoint:"Rectangle",
        paintStyle:{ width:25, height:21, fillStyle:exampleColor },
        isSource:true,
        reattach:true,
        scope:"idem",
        connectorStyle : {
            gradient:{stops:[[0, exampleColor], [0.5, "#09098e"], [1, exampleColor]]},
            lineWidth:5,
            strokeStyle:exampleColor,
            dashstyle:"2 2"
        },
        maxConnections:maxConn,
        isTarget:true,             
        dropOptions : exampleDropOptions
    };
    return exampleEndpoint;      
}
