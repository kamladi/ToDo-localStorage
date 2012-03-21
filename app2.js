/*
sample object layout...
   taskObject =	 [
	{title: "sample task", description: "sample description", priority: "none", status: "incomplete"},
	{title: "sample IMPORTANT task", description: "sample IMPORTANT description", priority: "urgent", status: "incomplete"},
	{title: "sample completed task", description: "sample completed description", priority: "none", status: "complete"}
   ]
*/

var App = {
	init: function( config ) {
		this.taskObject = [];
		this.list = config.list;
		this.homePage = config.homePage;
		this.renderList();
		this.bindFunctions();
	},
	
	bindFunctions: function() {
		this.list.delegate('li', 'swiperight swipeleft', App.taskSwiped);
		this.list.delegate('li', 'keyup', App.updateTask);
		$('#add').on('pageshow', function(e, data) {
			$('#add form input#title').trigger('focus');
		});
		$('#add form').submit(App.addTask);
		$('#delete-confirm .btn-confirm').on('tap', App.reset);
		$('#purge-confirm .btn-confirm').on('tap', App.purgeCompleted);
		//trigger autofocus for 'add' dialog
		$('#add form input[autofocus]').trigger('focus');
		this.list.on('swipe', function(event) {
			console.log(event);
		});
	},
	
	/*
	* Retrieve data from localStorage
	* returns the retrieved data as an object
	*/
	loadData: function() {
		if(!localStorage) { //if localStorage is not compatible
			alert('localStorage is not compatible with your browse');
			this.taskObject = null;
		}   
		if(localStorage.getItem('todoData') == null) {//first time site is accessed, set up sample tasks...
			console.log('creating sample tasks');
			var newTaskObject =	 [
				{title: "sample task", description: "sample description", priority: "none", status: "incomplete"},
				{title: "sample IMPORTANT task", description: "sample IMPORTANT description", priority: "urgent", status: "incomplete"},
				{title: "sample completed task", description: "sample completed description", priority: "none", status: "complete"}
			];
			localStorage.setItem('todoData', JSON.stringify(newTaskObject));
			console.log('localStorage for new ToDo list created');
			this.taskObject = newTaskObject;
	   }
		if(localStorage.getItem('todoData')) {
			console.log('retrieving existing tasks...');
			retrievedObject = JSON.parse(localStorage.getItem('todoData'));
			console.log('data retrieved from localStorage: ');
			console.log(retrievedObject);
			this.taskObject = retrievedObject;
		}	
	},
	
	/*
	* Renders list by traversing through tasks and
	* appending list items into DOM
	*/
	renderList: function() {
		this.loadData();
		var htmlString = '';
		this.list.empty();
		for (x in this.taskObject) { 
			var title = this.taskObject[x].title;
			var status = this.taskObject[x].status;
			var description = this.taskObject[x].description;
			var priority = this.taskObject[x].priority;
			var listClass= priority + ' ' + status;
			this.list.append(
				'<li id="'+x+'" class="'+listClass+'">'+
				'<h3 contenteditable>'+title+'</h3>'+
				'<p contenteditable>'+description+'</p></li>'
			);
			$('#list li.complete').appendTo('#list');
			$('#list li.urgent.incomplete').prependTo('#list');
		}
		this.homePage.page();
		this.list.listview('refresh');
	},
	
	/*
	* Saves tasks data into localStorage
	*/
	saveData: function() {
		if(this.taskObject == null) {
			console.log('Error: task data not defined');
			return false;
		}
		localStorage.setItem('todoData', JSON.stringify(this.taskObject));
		console.log('Data saved into localStorage');
	},
	
	taskSwiped: function(event) {
		var item = $(event.currentTarget);
		var parent = item.parent();
		var id = item.attr('id');
		console.log('swiped:');
		console.log(item);
		if(item.hasClass('incomplete')) {
			item.fadeOut('slow', function() {
				item.addClass('complete')
					.removeClass('incomplete')
					.appendTo(parent)
					.fadeIn('slow');
			});
			App.taskObject[id].status = 'complete';
		}
		else {
			item.fadeOut('slow', function() {
				item.addClass('incomplete')
					.removeClass('complete');
				if(($(".urgent.incomplete").length > 0) && item.hasClass('none')) {
					item.insertAfter('.urgent.incomplete').fadeIn('slow');
				}
				else {
					item.prependTo('ul#list').fadeIn('slow');
				}
			});
			App.taskObject[id].status = 'incomplete';
		}
		App.saveData();
	},

	/*
	* event handler for adding a new task
	*/
	addTask: function(event) {
		var newTitle = $('input#title').val();
		if(newTitle === '') {
			alert('Please enter a title for the task');
			return false;
		}
		var newPriority = 'none';
		if( $('input#checkbox-urgent ').is(':checked') ) {
			newPriority = 'urgent';
		}
		var newDescription = $('#description').val();
			console.log('User has entered new task...');
			console.log('title: ' + newTitle);
			console.log('description: ' + newDescription);
			console.log('priority: ' + newPriority);
		var newTask = {
			title: newTitle,
			description: newDescription,
			priority: newPriority,
			status: 'incomplete'
		}
		//Prepend new task to array -- the unshift method prepends, push appends
		App.taskObject.unshift(newTask);
		console.log('new task added to taskObject');
		
		//save updated object to localStorage
		App.saveData();
		
		//reload task list
		App.renderList();
		$.mobile.changePage(App.homePage, {
			transition: 'pop',
			reverse: true
		});
		
		//reset form
		$('#title').val("");
		$('#description').val("");
		$("input#checkbox-urgent").attr("checked",false).checkboxradio("refresh");
		
		return false;
	},
	
	updateTask: function(event) {
		console.log('updating task...');
		var id = event.currentTarget.id;
		var newText = event.originalEvent.target.innerText;
		//if user cleared text, replace with empty spaces to
			//make it easier to edit again
		if(newText === "") {
			newText = "       ";
		}
		//save text to appropriate place in taskObject
		if(event.originalEvent.target.tagName === "H3") {
			App.taskObject[id].title = newText;
		}
		else if(event.originalEvent.target.tagName === "P") {
			App.taskObject[id].description = newText;
		}
		App.saveData();
	},

	reset: function(event) {
		App.resetSampleData();
		App.renderList();
		$.mobile.changePage( App.homePage );
	},
	
	/*
	* transfer incomplete tasks to new array, 
	* and set taskObject to new array
	*/
	purgeCompleted: function(event) {
		var numItemsPurged = 0;
		var newTaskObject = [];
		for (x in App.taskObject) {
			console.log(x);
			if(App.taskObject[x].status == 'incomplete') {
				newTaskObject.push(App.taskObject[x]);
			}
		}
		console.log('new taskObject: ' + newTaskObject);
		App.taskObject = newTaskObject;
		console.log(this);
		App.saveData();
		App.renderList();
		$.mobile.changePage( App.homePage );
		
	},
	
	/*
	* Reset function: Clears todoData and resets sample tasks
	*/
	resetSampleData: function() {
	   this.taskObject = [
		{title: "sample task", description: "sample description", priority: "none", status: "incomplete"},
		{title: "sample IMPORTANT task", description: "sample IMPORTANT description", priority: "urgent", status: "incomplete"},
		{title: "sample completed task", description: "sample completed description", priority: "none", status: "complete"}
	   ];
	   localStorage.removeItem('todoData');
		console.log('old localStorage data cleared');
	   localStorage.setItem('todoData', JSON.stringify(this.taskObject));
		console.log('new data in localStorage: ' + localStorage.getItem('todoData'));
	},
	
	
};
$(function() {
	App.init({
		homePage: $('#home'),
		list: $('ul#list')
	});
});
