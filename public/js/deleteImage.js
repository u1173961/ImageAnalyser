$(document).ready( function() {
	$('#deleteImage').on('click', function(e) {
		if (warningConfirmation()) {
			var xhr = $.post('/deleteImage', { id: $(this).data('image') }, function(data) {
				if (!data['error']) {
					showSuccess(data['message']);
					setTimeout(function() {
						window.location.href = '/listImages';
					}, 600);
				} else {
					showError(data['message']);
				}
				scrollToMessage();
			}, 'json');
			handleAjaxFailures(xhr);	
		}
	});
});