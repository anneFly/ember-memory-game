/*
 * Views
 */
Memory.NameTextField = Em.TextField.extend({
	placeholder: 'enter name',
	read: function(){
		var name = this.get('value');
		if (name !== '' || null || undefined) {
			Memory.PlayerCollection.pushObject(name);
		}
	}
});

Memory.inputFieldsController = Em.ArrayController.create({
	content: [],
	init: function(){
		this._super();
		this.pushObject(Memory.NameTextField.create({}));
	},
	addField: function(n){
		var newField = Memory.NameTextField.create({})
		this.pushObject(newField);
		newField.appendTo('#InputFields');
	}
});

Memory.MySelection = Em.Select.create({
	viewName: "select",
  	contentBinding: "Memory.diffController.content",
  	optionLabelPath: "content.label",
  	optionValuePath: "content.value",
  	prompt: "select difficulty:",
  	selectionBinding: "Memory.cardController.selectedDiff"
});

Memory.MySettings = Em.View.create({
	templateName: 'Settings'
});

Memory.MyHeader = Em.View.create({
	templateName: 'Header'
});


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

Memory.PlayerView = Em.CollectionView.extend({
	isVisible: false,
	content: Memory.playerController,
	itemViewClass: Em.View.extend({
		classNameBindings: 'this.content.turn',
		classNames: ['single-player'],
		templateName: 'Players'
	})
});

Memory.MyPlayers = Memory.PlayerView.create({});

Memory.MsgView = Em.View.create({
	templateName: 'Messages',
	messageBinding: 'Memory.msgController.message',
	triesBinding: 'Memory.msgController.tries',
	msgColorBinding: 'Memory.msgController.msgColor',
	isVisible: false
});
