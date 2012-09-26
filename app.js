var Memory = Em.Application.create({
	version: '0.0.1',
	ready: function(){
		console.log('version: ' + this.version + "\n to do: \n    load card data from json \n    randomize cards \n    handle moves better");
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
		var card1 = Memory.Card.create({
			name: 'Foo'
		});
		var card2 = Memory.Card.create({
			name: 'Bar'
		});
		var card3 = Memory.Card.create({
			name: 'Foo'
		});
		var card4 = Memory.Card.create({
			name: 'Bar'
		});
		var card5 = Memory.Card.create({
			name: 'Baz'
		});
		var card6 = Memory.Card.create({
			name: 'Baz'
		});
		this.pushObjects([card1, card2, card3, card4, card5, card6]);
	},
	turnAround: function(m){
		if(!m.found){
			if(m.open === false){
				if (this.counter < 2){
					m.set('display', m.name);
					m.set('open', true);
					Memory.pairController.pushObject(m);
					this.counter++;
					if(this.counter === 2){
						this.compare();
					}
				}
			} else {
				if (this.counter > 0){
					m.set('display', m.back);
					m.set('open', false);
					Memory.pairController.removeObject(m);
					this.counter--;
				}
			}
		}
	},
	counter: 0,
	compare: function(){
		var result = Memory.pairController.compare();
		if (result) {
			this.match();
		} else {
			this.fail();
		};
	},
	match: function(){
		console.log('match');	
		 Memory.pairController.forEach(function(e){
			e.set('found', true);
		});
		Memory.pairController.clear();
		this.counter = 0;
	},
	fail: function(){
		console.log('try again');
	},
	restart: function(){
        this.forEach(function(e){
            e.set('found', false);
            e.set('display', e.back);
            e.set('open', false)
        });
        Memory.pairController.clear();
        this.counter = 0;
    }
});

Memory.pairController = Em.ArrayController.create({
	content: [],
	compare: function(){
		var a = this.content[0].name;
		return (this.everyProperty('name', a));
	}
});


Memory.TestView = Em.CollectionView.extend({
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



