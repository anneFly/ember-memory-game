/*
 * Controllers
 */

Memory.cardController = Em.ArrayController.create({
	content: [],
	deck: [],
	selectedDiff: null,
	pairsLeft: null,
	init: function(){
		this._super();
		var self = this;
		$.getJSON('../data/cards.json', function(data){
			data.forEach(function(item){
				self.pushObject(Memory.Card.create(item));
				self.deck.pushObject(Memory.Card.create(item));
			});
		});
	},
	initNewGame: function(){
		if (this.selectedDiff) {
			Memory.inputFieldsController.content.forEach(function(e) {
				e.read();
			});
			if (Memory.PlayerCollection.content.length <= 0) {
				console.log('please enter player name');
			} else {
				Memory.playerController.loadPlayers();
				var newArray = this.toArray();
				var len = newArray.length;
				var diff = this.selectedDiff.get('value');
				if (diff === 1){
					newArray = newArray.slice(len-(len/3));
				} else if (diff === 2) {
					newArray = newArray.slice(len/2);
				} else if (diff === 3) {
					newArray = newArray.slice(0);
				}
				this.set('content', newArray);
				this.newGame();
				$('.settings-panel').hide();
			}
		}
	},
	newGame: function(){
		 this.shuffle();
		 this.set('pairsLeft', this.numCards()/2);
		 Memory.moveManager.transitionTo('newGame');
	},
	startNewGame: function(){
		this.set('content', this.deck);
		$('.settings-panel').show();
	  	this.hideCards();
	  	Memory.moveManager.transitionTo('startGame');
  	},
	restart: function(){
        this.hideCards();
       	this.newGame();
       	Memory.pairController.clear();
        Memory.msgController.restart();
        Memory.playerController.restart();
  	},
  	hideCards: function() {
  		this.forEach(function(e){
	    	e.setProperties({found: false, display: e.back, open: false});
	    });
  	},
	shuffle: function(){
		var oldArray = this;
		var newArray = oldArray.slice(0);
		var len = newArray.length;
		this.forEach(function(e, i){
			var p = parseInt(Math.random()*len);
			var t = newArray[i];
			newArray[i] = newArray[p];
			newArray[p] = t;
		});
		this.set('content', newArray);
	},
	numCards: function(){
		return this.content.length;
	},
	turnAround: function(m){
		if(!m.found){
			if (Memory.moveManager.get('currentState.name') === 'newGame'){
				this.unhideCard(m);
				Memory.moveManager.transitionTo('inbetweenMove');
			} else if (Memory.moveManager.get('currentState.name') === 'newMove'){
				Memory.pairController.hide();
				this.unhideCard(m);
				Memory.moveManager.transitionTo('inbetweenMove');		
			} else if (Memory.moveManager.get('currentState.name') === 'inbetweenMove'){
				if(m.open === false){
					this.unhideCard(m);
					Memory.moveManager.transitionTo('newMove');
					this.compare();
				} 
			}
		}
	},
	unhideCard: function(m){
		m.setProperties({display: m.name, open: true});
		Memory.pairController.pushObject(m);
	},
	compare: function(){
		var match = Memory.pairController.compare();
		Memory.msgController.result(match);
		if (match) {
			Memory.pairController.matchDetected();
			this.decrementProperty('pairsLeft');
			var p = Memory.playerController.get('activePlayer');
			p.incrementProperty('score');
			if (this.pairsLeft == 0){
				Memory.moveManager.transitionTo('gameOver');
			}
		} else {
			Memory.playerController.nextPlayer();
		} 
	}
});

Memory.diffController = Em.ArrayController.create({
	content: [],
	init: function(){
		this._super;
		var easy = Em.Object.create({
			label: 'easy',
			value: 1
		});
		var normal = Em.Object.create({
			label: 'normal',
			value: 2
		});
		var hard = Em.Object.create({
			label: 'hard',
			value: 3
		});
		this.pushObjects([easy, normal, hard]);
	}
});

Memory.pairController = Em.ArrayController.create({
	content: [],
	compare: function(){
		var a = this.content[0].name;
		return (this.everyProperty('name', a));
	},
	matchDetected: function(){
		this.forEach(function(e){
			e.set('found', true);
		});
		this.clear();
	},
	hide: function(){
		this.forEach(function(e){
			e.setProperties({open: false, display: e.back});
		});
		this.clear();
	}
});

Memory.msgController = Em.Controller.create({
	message: 'Have Fun!',
	msgColor: null,
	result: function(res){
		if(res){
			this.match();
		} else {
			this.fail();
		}
	},
	match: function(){
		this.setProperties({message: 'Match!', msgColor: 'green'});
	},
	fail: function(){
		this.setProperties({message: 'Try again!', msgColor: 'red'});
	},
	restart: function(){
		this.setProperties({message: 'Game restarted. Have Fun!', msgColor: null});
	},
	newGame: function(){
		this.setProperties({message: 'Have Fun!', msgColor: null});
	}
});

Memory.PlayerCollection = Em.ArrayController.create({
	content: ['Carl', 'John', 'Mr. Smith']
});

Memory.playerController = Em.ArrayController.create({
	content: [],
	loadPlayers: function(){
		var self = this;
		Memory.PlayerCollection.content.forEach(function(e){
			var item = Memory.Player.create({
				name: e
			});
			self.pushObject(item);
		})
		this.start();
		this.setPlayer();
	},
	start: function(){
		this.content[0].set('turn', true);
	},
	getActivePlayer: function(){
		var player = null;
		this.content.forEach(function(e){
	    	if (e.get('turn') === true) {
	    		player = e;
	    	}
	    });
	    return player;
	},
	setPlayer: function(){
		this.set('activePlayer', this.getActivePlayer());
	},
	activePlayer: null,
	now: 0,
	nextPlayer: function(){
		this.content[this.now].set('turn', false);
		if (this.now < this.content.length-1){
			this.now = this.now + 1;
		} else {
			this.now = 0;
		}
		this.content[this.now].set('turn', true);
		this.setPlayer();
	},
	restart: function(){
		this.content.forEach(function(e){
	    	e.setProperties({tries: 0, score: 0, turn: false, isWinner: false});
	    });
	    this.start();
	},
	result: function() {
		var self = this;
		var max = 0;
		this.content.forEach(function(e){
			if (e.get('score') > max) {
				max = e.get('score');
			}
		});
		this.content.forEach(function(e){
			if (e.get('score') === max) {
				e.set('isWinner', true);
				self.set('winner', e.name);
			}
		});
	},
	winner: null
});