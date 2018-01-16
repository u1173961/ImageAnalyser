$(document).ready( function() {
	$('#showAddImage').on('click', function(e) {
		$('#addImage').toggleClass('hidden');
		$('.arrow').toggleClass('hidden');
		scrollToObject($('#addImage'), 200);
	});
	$('#imageUpload').on('change', function(e) {
		if (!$('#name').val()) {
			var fileName = $(this)[0].files[0].name;
			$('#name').val(capitalize(fileName.substring(0, fileName.lastIndexOf('.'))));			
		}
	});
	if ($('.toggleMyImages').length) {
		$('input[name="toggleMyImages"]').change(function() {
			$('div.notMine').toggle();
		});
		$('.toggleMyImages').on('click', function(e) {
		    if (!$(e.target).hasClass('toggleButton')) {
		    	$(this).find('.toggleButton').click();
		    }
		});
	}
});