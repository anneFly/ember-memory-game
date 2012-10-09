/*
 * State Managers
 */

Memory.moveManager = Em.StateManager.create({
	initialState: 'startGame',
	startGame: Em.State.create({
		enter: function(){
			Memory.msgController.newGame();
			Memory.pairController.clear();
			Memory.PlayerCollection.clear();
			Memory.playerController.clear();
			Memory.MyGame.set('isVisible', false);
			Memory.MsgView.set('isVisible', false);
			Memory.MyPlayers.set('isVisible', false);
		},
		exit: function(){
			Memory.MyGame.set('isVisible', true);
			Memory.MsgView.set('isVisible', true);
			Memory.MyPlayers.set('isVisible', true);
		}
	}),
	newGame: Em.State.create({}),
	newMove: Em.State.create({}),
	inbetweenMove: Em.State.create({
		exit: function(){
			var p = Memory.playerController.get('activePlayer');
			p.incrementProperty('tries');
		}
	}),
	gameOver: Em.State.create({
		enter: function(){
			Memory.playerController.result();
			Memory.msgController.setProperties({message: Memory.playerController.get('winner') + ' wins the game', msgColor: 'blue'});
		}
	})
});
