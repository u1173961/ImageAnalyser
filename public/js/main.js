$(document).ready( function() {
	if ($('.message').length) {
		setTimeout(function() {
			$('.message').addClass('hidden');
		}, 3700);		
	}
});

//---------------------------------------------- AJAX ----------------------------------------------

function handleAjaxFailures(xhr) {
	xhr.fail(function(e) {
		if(e.status == 419) {
			//get login window & fresh CSRF
			$.get('/getAjaxLogin', function(data) {
				if (!data['loggedIn']) {
					showLoginWindow(data['html']);
					$.ajaxSetup({ headers: { 'X-CSRF-TOKEN' : $('form#ajaxLogin').find('input[name="_token"]').val() } });
					addLoginListener();
				} else {
					window.location.href = '/';
				}
			});
		}
	});	
}

//---------------------------------------- Session Expiration ---------------------------------------

function showLoginWindow(html) {
	$('#loginWindow').html(html);
	$('#loginWindow').removeClass('hidden');
	showWarning('Session Expired!', $('.loginPanel'));	
}
function hideLoginWindow() {
	$('#loginWindow').html('');
	$('#loginWindow').addClass('hidden');	
}
function addLoginListener() {
	$('form#ajaxLogin').on('submit', function(e) {
		e.preventDefault();
		ajaxLogin();
	});
}
function ajaxLogin() {
	var action = $('form#ajaxLogin').attr('action');
	var post = { username: $('form#ajaxLogin input#username').val(), password: $('form#ajaxLogin input#password').val() };
	var xhr = $.post(action, post, function(data) {
		if (data['valid'] !== true) {
			showError('Invalid Credentials!', $('.loginPanel'));
		} else {
			hideLoginWindow();
		}
	}, 'json');
}

//---------------------------------------------- Alerts -----------------------------------------------

function showError(msg, focus) {
	focus = typeof focus !== 'undefined' ? focus : $('#wrapper');
	var error = focus.find('.error-msg');
	error.find('p').text(msg);
	error.removeClass('hidden');
	focus.addClass('errorOutline');
	setTimeout(function() {
		error.addClass('hidden');
		focus.removeClass('errorOutline');
	}, 3700);
}
function showSuccess(msg, focus) {
	showMessage(msg, focus, '.success-msg');
}
function showWarning(msg, focus) {
	showMessage(msg, focus, '.warning-msg');
}
function showMessage(msg, focus, typeSelector) {
	focus = typeof focus !== 'undefined' ? focus : $('#wrapper');
	var message = focus.find(typeSelector);
	message.find('p').text(msg);
	message.removeClass('hidden');
	setTimeout(function() {
		message.addClass('hidden');
	}, 3700);
}

function scrollToMessage(holder) {
	holder = typeof holder !== 'undefined' ? holder : $('#wrapper');
	var messagePos = holder.offset().top;
	if (messagePos < $(document).scrollTop()) {
	    $('html, body').animate({
	        scrollTop: messagePos
	    }, 500);
	}
}

function warningConfirmation() {
	return confirm("--------------- Warning! ---------------\n     Action cannot be reversed.\n                Are you sure?");
}