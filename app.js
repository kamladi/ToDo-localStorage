/*
TODO:
	- before rendering list, prepend all urgent tasks to the front,
		and append completed tasks to the end
	- implement HTML5 draggable feature (SCHWEET)
*/

/* Constants */
var list;
var taskObject;
$(function() {	
	renderList();
	
	//When task is swiped...
	$('#list li').live('swiperight', function(event) {
		var item = $(event.currentTarget);
		var parent = item.parent();
		console.log(parent);
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
			taskObject[id].status = 'complete';
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
			taskObject[id].status = 'incomplete';
		}
		saveData();
	   });
	
	//trigger autofocus for 'add' dialog
	$('#add form input[autofocus]').trigger('focus');
	
	//when 'save' button is clicked
	$('#add-task').bind('tap', function(event) {
		var newTitle = $('input#title').val();
			if(newTitle == '') {
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
		taskObject.unshift(newTask);
		console.log('new task added to taskObject');
		//save updated object to localStorage
		saveData();
		
		//reload task list
		renderList();
		$.mobile.changePage( $('#home') );
		
		//reset form
		$('#title').val("");
		$('#description').val("");
		$("input#checkbox-urgent").attr("checked",false).checkboxradio("refresh");
	});
	
	//Confirmation for 'DELETE'
	//if user taps yes...
	$('#delete-confirm .btn-confirm').click(function() {
	   resetSampleData();
	   renderList();
	   $.mobile.changePage( $('#home') );
	});
	
	//Confirmation for 'PURGE'
	//if user taps yes...
	$('#purge-confirm .btn-confirm').click(function() {
		purgeCompleted();
		$.mobile.changePage( $('#home') );
	});
	
});


/*
* Retrieve data from localStorage
* returns the retrieved data as an object
*/
function loadData() {
	if(!localStorage) { //if localStorage is not compatible
		alert('localStorage is not compatible with your browse');
		return null;
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
		return newTaskObject;
   }
	if(localStorage.getItem('todoData')) {
		console.log('retrieving existing tasks...');
		retrievedObject = JSON.parse(localStorage.getItem('todoData'));
		console.log('data retrieved from localStorage: '+retrievedObject);
		return retrievedObject;
	}	
}

/*
* Renders list by traversing through tasks and
* appending list items into DOM
*/
function renderList() {
	taskObject = loadData();
	var htmlString = '';
	$('#list').empty();
	for (x in taskObject) { 
		var title = taskObject[x].title;
		var status = taskObject[x].status;
		var description = taskObject[x].description;
		var priority = taskObject[x].priority;
		var listClass= priority + ' ' + status;
		$('#list').append(
			'<li id="'+x+'" class="'+listClass+'">'+
			'<h3>'+title+'</h3>'+
			'<p>'+description+'</p></li>'
		);
		$('#list li.complete').appendTo('#list');
		$('#list li.urgent.incomplete').prependTo('#list');
	}
	$('#home').page();
	$('#list').listview('refresh');
}

/*
* Saves tasks data into localStorage
*/
function saveData() {
	if(taskObject == null) {
		console.log('Error: task data not defined');
		return false;
	}
	localStorage.setItem('todoData', JSON.stringify(taskObject));
	console.log('Data saved into localStorage');
}

/*
* Reset function: Clears todoData and resets sample tasks
*/
function resetSampleData() {
   taskObject =	 [
	{title: "sample task", description: "sample description", priority: "none", status: "incomplete"},
	{title: "sample IMPORTANT task", description: "sample IMPORTANT description", priority: "urgent", status: "incomplete"},
	{title: "sample completed task", description: "sample completed description", priority: "none", status: "complete"}
   ];
   localStorage.removeItem('todoData');
	console.log('old localStorage data cleared');
   localStorage.setItem('todoData', JSON.stringify(taskObject));
	console.log('new data in localStorage: ' + localStorage.getItem('todoData'));
}

/*
* transfer incomplete tasks to new array, 
* and set taskObject to new array
*/
function purgeCompleted() {
	var numItemsPurged = 0;
	var newTaskObject = [];
	for (x in taskObject) {
		if(taskObject[x].status == 'incomplete') {
			newTaskObject.push(taskObject[x]);
		}
	}
	console.log('new taskObject: ' + newTaskObject);
	taskObject = newTaskObject;
	saveData();
	renderList();
}

/*
sample object layout...
   taskObject =	 [
	{title: "sample task", description: "sample description", priority: "none", status: "incomplete"},
	{title: "sample IMPORTANT task", description: "sample IMPORTANT description", priority: "urgent", status: "incomplete"},
	{title: "sample completed task", description: "sample completed description", priority: "none", status: "complete"}
   ]
*/