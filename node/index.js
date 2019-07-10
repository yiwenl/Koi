// index.js

console.log('KOI - server');


// index.js
var http = require('http');
var express = require('express');
var OscReceiver = require('osc-receiver');
var receiver = new OscReceiver();
var app = express();
var server = http.createServer(app);

var io = require('socket.io').listen(server);
server.listen(9876);
receiver.bind(32000);
var _position = {
    x: 0,
    y: 0
};

receiver.on('/position', function(x, y) {
    if(Math.random() > .9) console.log('Position :', x, y);

    _position.x = x;
    _position.y = y;
    io.sockets.emit('position', _position);
});




io.on('connection', (socket)=>_onConnected(socket));

function _onConnected(socket) {
	console.log('A user is connected : ', socket.id);
	socket.on('disconnect', ()=>_onDisconnected() );

	socket.on('useTexture', ()=>{
		console.log('useTexture');
		io.emit('useTexture');
	});

	socket.on('useColor', ()=>{
		console.log('useColor');
		io.emit('useColor');
	});

	socket.on('changeColor', ()=>{
		console.log('changeColor');
		io.emit('changeColor');
	});
}



function _onDisconnected() {
	console.log(' A user has disconnected');
}

/*

x : 50 ~ 
*/