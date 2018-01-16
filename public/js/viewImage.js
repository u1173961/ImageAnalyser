$(document).ready( function() {
	var imgContainer = $("#imageContainer");
	var imageElement = null;
	imgContainer.on("contextmenu", function(e) {
		e.preventDefault();
	});
	//handle resizes/zooms
	origWidth = parseInt(imgContainer.data('owidth'));
	origHeight = parseInt(imgContainer.data('oheight'));
	origPositions = getAllPositions();
	scale = getScale();
	extracts = {};
	/** 
	 * Image zoom mode
	 * 0 - Original size
	 * 1 - Fit width, scale height
	 * 2 - Fit screen
	 */
	zoomMode = parseInt($('input[name="resize"]:checked').val());
	modeChanged = true;
	previousMode = null;
	$(window).on('load resize', function() {
		handleResizes($("#imageContainer"));		
	});
	$('input[name="resize"]').change(function() {
		modeChanged = true;
		previousMode = zoomMode;
		zoomMode = parseInt($(this).val());
		handleResizes(imgContainer);
		modeChanged = false;
	});
	$('.resizeLabel').on('click', function(e) {
	    if (!$(e.target).hasClass('resizeButton')) {
	    	$(this).find('.resizeButton').click();
	    }
	});
	//keep footer centered when screen smaller than content (mode 0)
	var scrollX = 0;
	$(window).scroll(function() {
	    var currX = $(document).scrollLeft();
	    if (scrollX != currX) {
			scrollFooter();
			scrollX = currX;
	    }
	});
	//show element name on hover
	addHoverListeners();
	//show details popup on click	
	$(document).mouseup(function(e) {
		if ($(e.target).hasClass('imageElement') || $(e.target).hasClass('nameTag')) {
			imageElement = $(e.target).hasClass('imageElement') ? $(e.target) : $(e.target).closest('div.imageElement');
			if(e.which === 1) {
				if (!imageElement.hasClass('selected')) {
					selectElement(imgContainer, imageElement);
				}
			} else {
				e.preventDefault();
				closePopUp(imageElement);
			}
		
		}
	});
	//close popup on escape
	$(window).keydown(function(e) {
		if (e.which === 27) {
			if ($('#imgElementDetails').is(':visible')) {
				closePopUp(imageElement);
			} else {
				focusOffElement($('div.imageElement.bordered'));
			}
		}
	});
	$('.closeButton').on('click', function(e) {
		closePopUp(imageElement);
	});
	fixEdgeIE();
});

//---------------------------------------- Show/Hide Popup -------------------------------------------

function showPopUp(imgContainer, imageElement) {
	var waitingForAjax = addPopUpDetails(imgContainer, imageElement);
	//show popup below selected image
	imageElement.after($('#imgElementDetails'));
	scrollToObject(imageElement);
	if (!waitingForAjax) {
		resizePopUp(imgContainer, imageElement);
		$('#imgElementDetails').show();		
	}
}

/**
 * Add Pop-up details
 * @param imgContainer
 * @param imageElement
 * 
 * @returns bool waitingForAjax
 */
function addPopUpDetails(imgContainer, imageElement) {
	var name = imageElement.data('name');
	var subtitle = imageElement.data('subtitle');
	var appearance = imageElement.data('appearance');
	if (appearance > 1) {
		name = name + ' (' + resolveNumbering(appearance)+ ' appearance)';
	}
	$('#popUpTitle').text(name);
	$('#popUpSubtitle').text(subtitle);
	return setDescription(imgContainer, imageElement);
}

/**
 * Set description from database or fallback to Wikipedia
 * @param imgContainer
 * @param imageElement
 * 
 * @returns bool
 */
function setDescription(imgContainer, imageElement) {
	var id = imageElement.attr('id');
	var description = imageElement.data('description');
	var searchTerms = imageElement.data('searchterms');
	var ajax = false;
	if (extracts[id] !== undefined) {
		//load cache
		description = extracts[id];
	    $('#popUpDetails').html(description);
	} else {
		if (description) {
			//use db description
	    	description = '<p style="padding: 5px;">'+ description +'</p>';	
	        $('#popUpDetails').html(description);
	    	extracts[id] = description;			
		} else if (searchTerms) {
			ajax = true;
			//use wikipedia
			searchTerms = searchTerms.replace(' ', '+');
		    $.ajax({
		        url: 'http://en.wikipedia.org/w/api.php?action=opensearch&origin=*&search=' + searchTerms + '&limit=1&callback=?',
		        jsonp: "callback",
		        dataType: "jsonp",
		        type: "GET",
		        beforeSend: function(xhrObj) {
		            xhrObj.setRequestHeader("Access-Control-Allow-Origin", "*");
		            xhrObj.setRequestHeader("Api-User-Agent", 'SgtPep/1.1');
		        },
		    })
		    .done(function(data) {
		    	description = data[2][0];
		    	if (description == undefined) {
			    	description = '<p style="padding: 5px;">No further details.</p>';
		    	} else {
			    	description = '<p style="padding: 5px;">'+ description +'</p>';
			    	description += '<a style="padding: 5px;" href="'+data[3][0]+'" target="_blank">'+data[3][0]+'</a>';
		    	}
		        $('#popUpDetails').html(description);
		    	extracts[id] = description;
				resizePopUp(imgContainer, imageElement);
				$('#imgElementDetails').show();	
		    })
		    .fail(function(xhr, status, error) {
		        alert(status + ':' + error);
		    });	
		} else {
	    	description = '<p style="padding: 5px;">No further details.</p>';
	        $('#popUpDetails').html(description);
	    	extracts[id] = description;		
		}
	}
    
	return ajax;
}

function resolveNumbering(order) {
	var res = ['1st', '2nd', '3rd'];
	return res[order-1];
}

function closePopUp(imageElement) {
	focusOffElement(imageElement);
	imageElement.removeClass('selected');
	hidePopUp();	
}

//------------------------------------- Resizing/Positioning -----------------------------------------

/** 
 * Handle resizes
 * 0 - Original/Full size
 * 1 - Fit width, scale height
 * 2 - Fit screen
 */
function handleResizes(imgContainer) {
	if (zoomMode === 0) {
		scale = 1;
		setWrapperWidth(origWidth);
		$('div.topControls').show();
		scrollFooter();
	} else {
		if ($(window).width() < 360) {
			$('div.topControls').hide();
		} else {
			$('div.topControls').show();
		}
		if (modeChanged && previousMode === 0) {
			//reset containers
			$('div#wrapper').css('width', 'auto');
			$('.footer').css('margin-left', '0px');
		}
		scale = $('#contents').width() / origWidth;
		if (zoomMode === 2) {
			var spaceY = $(window).innerHeight() - $(imgContainer).offset().top - 5 + $('.topControls').offset().top;
			if ((origHeight*scale) > spaceY) {
				scale = spaceY/origHeight;
			}
		}
	}
	setImageDimensions(imgContainer, Math.round(origHeight*scale), Math.round(origWidth*scale));
	resizeImageSelectors();
	var selected = $('div.imageElement.selected');
	if (selected.length) {
		resizePopUp($(imgContainer), selected);
		setTimeout(function() {
			scrollToObject(selected, 1);			
		}, 500);
	} else {
		resetWrapper();
	}
}

function resizePopUp(imgContainer, imageElement) {
	var endPos = {};
	var height = $(imageElement).height();
	var width = $(imageElement).width();
	var startX = getPixelValueFromCSS('margin-left', imageElement) + 2;
	startX = startX < 0 ? 0 : startX;
	var startY = getPixelValueFromCSS('margin-top', imageElement) + 2;
	var popUpStartY = startY + $(imageElement).find('span.nameTag').height() + 5;
	//set position/size
	var imgDetails = $('#imgElementDetails');
	imgDetails.css('margin-top', (popUpStartY) + 'px');
	var popUpWidth = ($(window).width() > $(imgContainer).width() ? $(imgContainer).width() : $(window).width());
	var mLeft = 0;
	if (zoomMode == 0) {
		mLeft = $(window).scrollLeft();
		if ($(window).width() < $(imgContainer).width()) {
			mLeft -= getPixelValueFromCSS('margin-left', $('#contents')) + 1;
		}
	}
	if (popUpWidth > 1200) {
		//limit width & centre
		popUpWidth = 1200;
		mLeft = Math.round(($(imgContainer).width() - popUpWidth)/2);
	}
	imgDetails.css('width', (popUpWidth) + 'px');
	imgDetails.css('margin-left', mLeft+'px');
	drawZoomedImage(imgContainer, width, height, startX, startY);
	//force footer to bottom
	setWrapper();
}

/**
 * Slice thumbnail from main image & zoom/scale
 * @param imgContainer
 * @param int width
 * @param int height
 * @param int x
 * @param int y
 */
function drawZoomedImage(imgContainer, width, height, x, y) {
	var zoom = getOptimumZoom(width/scale, height/scale);
	var zoomedWidth = $('#imgElementDetails').width() * zoom;
	var zoomedHeight = height * zoomedWidth / width;
	var img = $('img.mainImage')[0];
	var canvas = $('#zoomedImage')[0];
	var ctx = canvas.getContext("2d");
	$(canvas).attr('width', zoomedWidth+'px');
	$(canvas).attr('height', zoomedHeight+'px');
	//slice image
	ctx.drawImage(img, x/scale, y/scale, width/scale, height/scale, 0, 0, zoomedWidth, zoomedHeight);
	centreZoomedImage(zoomedWidth);
	//limit image height
	var crop = zoomedHeight * getOptimumCrop(zoomedHeight);
	$('div#zoomedImageHolder').css('height', crop+'px');
}

function getOptimumZoom(width, height) {
	var optimum = $(window).width() < 398 ? 0.98 : 0.45;
	var detailsWidth = $('#imgElementDetails').width();
	var zw = detailsWidth * optimum;
	var limit = width * 4.2;
	if (zw > limit) {
		//limit deterioration
		optimum = limit/detailsWidth;
	}
	return optimum;
}

function getOptimumCrop(zoomedHeight) {
	var optimum = 1;
	var screen = $(window);
	var limit = screen.width() < 398 ? screen.height()*0.667 : screen.height()*0.82;
	if (zoomedHeight > limit) {
		optimum = limit/zoomedHeight;
	}
	return optimum;
}

function centreZoomedImage(imageWidth) {
	var imgHolder = $('div#zoomedImageHolder');
	if ($(window).width() < 398) {
		var mLeft = ($('#imgElementDetails').width() - imageWidth - 2)/2;
		imgHolder.css('margin-left', mLeft+'px');
		imgHolder.css('margin-right', mLeft+'px');
	} else {
		imgHolder.css('margin-left', '3px');
		imgHolder.css('margin-right', '10px');
	}	
}

function setWrapperWidth(width) {
	$('div#wrapper').css('width', calcWrapperWidth(width)+'px');	
}

/**
 * Get increased wrapper size, if needed
 * @param width
 * @returns
 */
function calcWrapperWidth(width) {
	var contents = $('#contents');
	width = width + getPixelValueFromCSS('margin-left', contents) + getPixelValueFromCSS('margin-right', contents);
	if ($(window).width() > width) {
		return $(window).width();
	}
	return width;
}

/**
 * Keep footer in center of screen
 * when scrolling full size image at small screen sizes
 * @returns
 */
function scrollFooter() {
	if (zoomMode == 0) {
		var footPos = 0;
		if ($(window).width() < origWidth) {
			footPos = $(window).scrollLeft();	
		}
		$('.footer').css('margin-left', footPos+'px');
	}
}