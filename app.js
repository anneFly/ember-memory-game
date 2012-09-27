var Memory = Em.Application.create({
	version: '0.0.2',
	ready: function(){
		console.log('version: ' + this.version + "\n to do: \n    add more cool stuff");
	}
});

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


Memory.cardController = Em.ArrayController.create({
	content: [],
	init: function(){
		this._super();
		var self = this;
		$.getJSON('data/cards.json', function(data){
			data.forEach(function(item){
				self.pushObject(Memory.Card.create(item));
			});
			self.shuffle();
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
	turnAround: function(m){
		if(!m.found){
			if (Memory.moveManager.get('currentState.name') === 'startGame'){
				m.setProperties({display: m.name, open: true});
				Memory.pairController.pushObject(m);
				Memory.moveManager.transitionTo('inbetweenMove');
			} else if (Memory.moveManager.get('currentState.name') === 'newMove'){
				Memory.pairController.forEach(function(e){
					e.setProperties({open: false, display: e.back});
				});
				Memory.pairController.clear();
				m.setProperties({display: m.name, open: true});
				Memory.pairController.pushObject(m);
				Memory.moveManager.transitionTo('inbetweenMove');		
			} else if (Memory.moveManager.get('currentState.name') === 'inbetweenMove'){
				if(m.open === false){
					m.setProperties({display: m.name, open: true});
					Memory.pairController.pushObject(m);
					this.compare();
					Memory.moveManager.transitionTo('newMove');
				} 
			}
		}
	},
	compare: function(){
		var match = Memory.pairController.compare();
		Memory.msgController.result(match);
		if (match) {
			Memory.pairController.forEach(function(e){
				e.set('found', true);
			});
			Memory.pairController.clear();
		} 
	},
	restart: function(){
        this.forEach(function(e){
            e.setProperties({found: false, display: e.back, open: false});
        });
        Memory.pairController.clear();
        this.shuffle();
        Memory.msgController.restart();
        Memory.moveManager.transitionTo('startGame');
    }
});

Memory.pairController = Em.ArrayController.create({
	content: [],
	compare: function(){
		var a = this.content[0].name;
		return (this.everyProperty('name', a));
	}
});

Memory.msgController = Em.Controller.create({
	message: 'Have Fun!',
	points: 0,
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
		this.setProperties({message: 'Match!', points: this.points+1, msgColor: 'green'});
	},
	fail: function(){
		this.setProperties({message: 'Try again!', msgColor: 'red'});
	},
	restart: function(){
		this.setProperties({message: 'Game restarted. Have Fun!', points: 0, tries: 0, msgColor: null});
	}
});

Memory.moveManager = Em.StateManager.create({
	initialState: 'startGame',
	startGame: Em.State.create({}),
	newMove: Em.State.create({
		enter: function(){
			Memory.msgController.incrementProperty('tries');
		}
	}),
	inbetweenMove: Em.State.create({})
});

Memory.GameView = Em.CollectionView.extend({
    tagName: 'div',
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

Memory.MsgView = Em.View.create({
	templateName: 'Messages',
	messageBinding: 'Memory.msgController.message',
	scoreBinding: 'Memory.msgController.points',
	triesBinding: 'Memory.msgController.tries',
	msgColorBinding: 'Memory.msgController.msgColor'
});

Memory.MsgView.appendTo('.message-box');




