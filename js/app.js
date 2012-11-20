/*
 * Application
 */

var Memory = Em.Application.create({
	version: '0.0.4',
	ready: function(){
		Memory.MyHeader.appendTo('#Header');
		Memory.MsgView.appendTo('#message-box');
		Memory.MyPlayers.appendTo('#player-box');
		Memory.MyGame.appendTo('#gameContainer');
		Memory.MySelection.appendTo('#Selection');
		Memory.MySettings.appendTo('#Buttons');
		Memory.inputFieldsController.content.forEach(function(e) {
			e.appendTo('#InputFields');
		});
	}
});