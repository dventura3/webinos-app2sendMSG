jsPlumb.bind("ready", function() {
	jsPlumb.reset();
	jsPlumb.setRenderMode(jsPlumb.SVG);
	jsPlumbDemo.init();

    var gui = new GUIBoxHandler();
    gui.init();

	$('#btnCreateService').click(function() { 

	});
});

