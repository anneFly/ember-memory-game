/*
 * Models
 */

Memory.Card = Em.Object.extend({
	name: null,
	back: "<img src='images/back.png' />".htmlSafe(),
	display: null,
	open: false,
	found: false,
	init: function(){
		this._super();
		this.set('display', this.back);
	}
});
/*
Memory.Player = Em.Object.extend({
	name: null,
	score: 0,
	tries: 0,
	turn: false,
	isWinner: false
});
*/

Memory.Player = Em.Object.extend({
	name: null,
	score: 0,
	tries: 0,
	turn: false,
	isWinner: false
});

var player1 = Memory.Player.create({
	name: 'Carl'
});

var player2 = Memory.Player.create({
	name: 'John'
});

var player3 = Memory.Player.create({
	name: 'Anne'
});
