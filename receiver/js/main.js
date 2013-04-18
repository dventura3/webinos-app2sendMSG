//receiver

var app2app;
var creatorChannelProxy;

jQuery(document).ready(function() {

	webinos.discovery.findServices({"api": "http://webinos.org/api/app2app"}, {
		onFound: function (service) {
			//alert("[CREATOR]  App2App");
			service.bindService({
                onBind: function () {
                    app2app = service;
                }
            });
		},
        onError: function (error) {
            alert("Error finding service: " + error.message + " (#" + error.code + ")");
        }
	});


	$('#btnCreateChannel').click(function() {
    	var urn = $('#txtNamespaceChannel').val();
    	createChannel(urn);
	});

	$('#btnSendMessage').click(function() {
    	var message = $('#txtMessage').val();
    	sendMessageTo(message);
	});

});


function createChannel(urn){

	var num_msg = 0;

	// Properties currently contain "mode" and optionally "canDetach" and "reclaimIfExists".
	var properties = {};
    // we allow all channel clients to send and receive. Other Possibility is "receive-only".
    properties.mode = "send-receive";
    // if canDetach is true it allows the channel creator to disconnect from the channel without closing the channel.
    properties.canDetach = true;
    // If the channel namespace already exists the error callback (see you later) is invoked, unless the reclaimIfExists property is set to true, 
    // in which case it is considered a reconnect of the channel creator. 
    properties.reclaimIfExists = true;

	// The configuration object should contain "namespace", "properties" and optionally "appInfo".
	var config = {};
    // Namespace is a valid URN which uniquely identifies the channel in the personal zone.
    config.namespace = urn;
    config.properties = properties;
    // we can attach application-specific information to the channel. 
    config.appInfo = {};

    app2app.createChannel(
            config,
            // callback invoked to allow or deny clients access to a channel. So it invoked when a client want to connect to the channel.
            // The channel creator can decide which clients are allowed to connect to the channel. For each client which wants to
   			// connect to the channel the requestCallback is invoked which should return true (if allowed to connect) or false.
   			// If no requestCallback is defined all connect requests are granted.
            function(request) {
                // we allow all clients to connect (we could also for example check some application-
                // specific information in the request.requestInfo to make a decision)
                return confirm("[CREATOR] Do you allow the client to connect?");
            },
            // callback invoked to receive messages
            function(message) {
            	num_msg++;
            	printMSG(message,num_msg);
            },
            // callback invoked on success, with the client's channel proxy as parameter
            function(channelProxy) {
            	console.log("[CREATOR] channel created with success ");
            	//var creatorChannelProxy --> reference to channel
                creatorChannelProxy = channelProxy;
            },
            // callback invoked if the channel namespace already exists.
            // if reclaimIfExists = true --> channel is recovered. Reclaiming only succeeds when the request originates from the same session 
            // as the original channel creator. If so, its bindings are refreshed (the mode and appInfo of the existing channel are not modified).
            function(error) {
                alert("[CREATOR] Could not create channel: " + error.message);
            }
    );	
}

function printMSG(msg, num_msg){
	console.log("[CREATOR] New MSG received");
	$('#messagesReceived').append(num_msg+' - ' + JSON.stringify(msg.from) + ' : ' + msg.contents + "\n");
}

function sendMessageTo(message) {
	
	if (typeof creatorChannelProxy === "undefined") {
        alert("[CREATOR] You first have to connect to the channel.");
        return;
    }

    //send to all client connected to channel
    creatorChannelProxy.send(
        message,
        // callback invoked when the message is accepted for processing
        function(success) {
            // ok, but no action needed in our example
            //alert("Msg SEND - to all client connected!");
            $('#txtMessage').val("");
        },
        function(error) {
            alert("[CREATOR] Could not send message: " + error.message);
        }
    );
}