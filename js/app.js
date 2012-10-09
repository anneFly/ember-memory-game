/*
 * Application
 */

var Memory = Em.Application.create({
	version: '0.0.3',
	ready: function(){
		Memory.MsgView.appendTo('#message-box');
		Memory.MyPlayers.appendTo('#player-box');
		Memory.MyGame.appendTo('#gameContainer');
		Memory.InputFieldsController.content.forEach(function(e) {
			e.appendTo('#InputFields');
		});
	}
});
