/*
 * Application
 */

var Memory = Em.Application.create({
	version: '0.0.2',
	ready: function(){
		Memory.MsgView.appendTo('#message-box');
		Memory.MyGame.appendTo('#gameContainer');
		console.log('version: ' + this.version + "\n to do: \n    add multiplayer");
	}
});

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
			$('.settingsPanel').hide();
		}
	},
	newGame: function(){
		 this.shuffle();
		 this.set('pairsLeft', this.numCards()/2);
		 Memory.moveManager.transitionTo('newGame');
	},
	startNewGame: function(){
		this.set('content', this.deck);
		$('.settingsPanel').show();
	  	this.hideCards();
	  	Memory.moveManager.transitionTo('startGame');
  	},
	restart: function(){
        this.hideCards();
       	this.newGame();
       	Memory.pairController.clear();
        Memory.msgController.restart();
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
					this.compare();
					Memory.moveManager.transitionTo('newMove');
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
			if (this.pairsLeft == 0){
				Memory.moveManager.transitionTo('gameOver');
			}
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
	tries: 0,
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
		this.setProperties({message: 'Game restarted. Have Fun!', tries: 0, msgColor: null});
	},
	newGame: function(){
		this.setProperties({message: 'Have Fun!', tries: 0, msgColor: null});
	}
});


/*
 * Views
 */

Memory.GameView = Em.CollectionView.extend({
    tagName: 'div',
    isVisible: false,
    content: Memory.cardController,
    itemViewClass: Em.View.extend({
        tagName: 'span',
        classNames: 'single-card',
        classNameBindings: 'this.content.found',
        template: Em.Handlebars.compile("{{view.content.display}}"),
        click: function(){
            Memory.cardController.turnAround(this.content);
        }
    })
}); 

Memory.MyGame = Memory.GameView.create({});

Memory.MsgView = Em.View.create({
	templateName: 'Messages',
	messageBinding: 'Memory.msgController.message',
	triesBinding: 'Memory.msgController.tries',
	msgColorBinding: 'Memory.msgController.msgColor',
	isVisible: false
});

/*
 * State Managers
 */

Memory.moveManager = Em.StateManager.create({
	initialState: 'startGame',
	startGame: Em.State.create({
		enter: function(){
			Memory.msgController.newGame();
			Memory.pairController.clear();
			Memory.MyGame.set('isVisible', false);
			Memory.MsgView.set('isVisible', false);
		},
		exit: function(){
			Memory.MyGame.set('isVisible', true);
			Memory.MsgView.set('isVisible', true);
		}
	}),
	newGame: Em.State.create({}),
	newMove: Em.State.create({
		enter: function(){
			Memory.msgController.incrementProperty('tries');
		}
	}),
	inbetweenMove: Em.State.create({}),
	gameOver: Em.State.create({
		enter: function(){
			Memory.msgController.setProperties({message: 'You won!', msgColor: 'blue'});
		}
	})
});
