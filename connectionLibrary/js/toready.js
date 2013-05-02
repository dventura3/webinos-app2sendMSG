
jsPlumb.bind("ready", function() {
	jsPlumb.reset();
	jsPlumb.setRenderMode(jsPlumb.SVG);
	//jsPlumb.setRenderMode(jsPlumb.CANVAS);
	jsPlumbDemo.init();
       
});