#!/usr/bin/env nodejs 
 
 
var WebSocket = require('ws'); 
const express = require('express'); 
const bodyParser = require('body-parser'); 
const restService = express(); 
 
 
 
restService.use(bodyParser.urlencoded({ 
	extended: true 
})); 
 
restService.use(bodyParser.json()); 
 
 
 
restService.post('/echo', function(req, res) {
	//var speech = req.body.result && req.body.result.parameters && req.body.result.parameters.command ? req.body.result.parameters.command : "Seems like some problem. Speak again."
	var speech = "heyyyyyyyyy";
	console.log("This is from webhook: " +speech);
	senddatatows(speech);
	
	return res.json({
		speech: speech,
		displayText: speech,
		source: 'command'
	});
	
});
 
function senddatatows(speech) {
 	var PropertiesReader = require('properties-reader'); 
	var ROSLIB = require('roslib'); 
	var url = require('url'); 
	var WebSocket = require('ws');
 
	/* Load application settings */ 
	var properties = PropertiesReader(__dirname + '/settings.properties'); 
	var topics = JSON.parse(properties.get('ros.topics')); 
	var topics_with_counter = new Array(); 
	var no_skipping_factor = 1; 
	/*ROS-bridge endpoint*/ 
	var ros_bridge_endpoint=properties.get('connections.websocket.rosbridge'); 
	var ros = new ROSLIB.Ros({url:ros_bridge_endpoint}); 
	/*webSocket Cloud options*/ 
	var ws_client_state = "offline"; 
	var ws = new WebSocket(properties.get('connections.websocket.cloud.endpoint')); 
 
	ws.on('open', function open() { 
		ws.send(speech); 
	}); 
 
	ws.on('message', function incoming(msg) { 
		console.log("This is from websocket: " +msg); 
	}); 
 
	ws.on('close', function close() { 
  //ws_client_state = "offline"; 
		console.log('websocket cloud client disconnected'); 
	}); 
 
	 
	/* 
	ROS-BRIDGE HANDLDER 
	*/ 
	/*State of ROS-BRIDGE connection*/ 
 
	var ros_bridge_state = 'offline'; 
 
	ros.on('connection', function() { 
	  ros_bridge_state = "Connected"; 
	  console.log('Connected to ROS-Bridge server.'); 
	}); 
 
 
	ros.on('error', function(error) { 
	  console.log('Error connecting to ROS-bridge server: ', error); 
	  ros_bridge_state = 'offline' 
	}); 
 
	ros.on('close', function() { 
	  console.log('Connection to ROS-Bridge server closed.'); 
	  ros_bridge_state = 'offline' 
	}); 
	
	// Publishing a Topic
// ------------------

	var speak = new ROSLIB.Topic({
	  ros : ros,
	  name : '/chatbot',
	  messageType : 'std_msgs/String'
	});

	var str = new ROSLIB.Message({
			data: 'Hey, I am working'
	});

	console.log("Publishing chatbot");
	speak.publish(str);
	 
 
}
