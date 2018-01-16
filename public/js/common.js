//-----------------------------------------Element Selection---------------------------------------------

function addHoverListeners(selector) {
	if (typeof selector === 'undefined') {
		selector = '.imageElement';
	}
	$(selector).mouseover(function(e) {
		focusOnElement($(this));
		if ($('span.permNameTag').length) {
			removeDistributedStyles($(this).find('span.nameTag'));
			//fade other tags
			fadeName($('span.permNameTag'));
			//keep selected element/name at front when showing others
			$(this).css('z-index', '999');
			$(this).mousemove(function(e) {
				//keep focussed element/name at front but allow switch to others on move
				$(this).css('z-index', $(this).data('zindex'));
				setTimeout(function() { $(this).css('z-index', '999'); }, 100);
			});
		}
	});
	$(selector).mouseleave(function(e) {
		if ($(this).hasClass('notNew') && !$(this).hasClass('selected')) {
			focusOffElement($(this));
			$(this).off('mousemove');
			$(this).css('z-index', $(this).data('zindex'));
			if ($('span.permNameTag').length) {
				setDistributedStyles($(this).find('span.nameTag'));
				unfadeName($('span.permNameTag'));
			}
		}
	});	
}
function removeHoverListeners() {
	$('.imageElement').off('mouseover');
	$('.imageElement').off('mouseleave');
}
function focusOnElement(element) {
	focusOffElement($('div.imageElement.notNew.bordered'));
	element.addClass('bordered');
	element.addClass('highlighted');
	showName(element);
}
function focusOffElement(element) {
	if (element.length) {
		element.removeClass('bordered');
		element.removeClass('highlighted');
		hideName(element);
	}
}
function showName(element) {
	element.find('.nameTag').removeClass('hidden');
}
function hideName(element) {
	element.find('.nameTag').addClass('hidden');
}

function selectElement(imgContainer, imageElement) {
	$('div.imageElement.selected').removeClass('selected');
	$(imageElement).addClass('selected');
	focusOnElement(imageElement);
	showPopUp(imgContainer, imageElement);
}
if (typeof showPopUp !== "function") {
	function showPopUp(imgContainer, imageElement) {
		//@override: always 
		var details = $('#imgElementDetails');
		$(imageElement).after(details);
		details.show();
	}
}
function hidePopUp() {
	$('#imgElementDetails').hide();
	resetWrapper();
}

//---------------------------------------Resizing/Positioning-------------------------------------------

function getPixelValueFromCSS(rule, element) {
	return parseInt($(element).css(rule).substr(0, $(element).css(rule).length - 2));
}

function getScale() {
	var imgContainer = $('#imageContainer');
	return imgContainer.outerWidth()/parseInt(imgContainer.data('owidth'));
}

function resizeImageSelectors() {
	var origPos;
	$('.imageElement').each(function() {
		origPos = origPositions[$(this).attr('id')];
		$(this).css('margin-left', Math.round(origPos['x1'] * scale)+'px');
		$(this).css('margin-top', Math.round(origPos['y1'] * scale)+'px');
		$(this).css('width', Math.round(origPos['width'] * scale)+'px');
		$(this).css('height', Math.round(origPos['height'] * scale)+'px');
	});
}

function getAllPositions() {
	var positions = {};
	var x1;
	var y1;
	var height;
	var width;
	$('.imageElement').each(function() {
		x1 = getPixelValueFromCSS('margin-left', $(this));
		y1 = getPixelValueFromCSS('margin-top', $(this));
		height = getPixelValueFromCSS('height', $(this));
		width = getPixelValueFromCSS('width', $(this));
		positions[$(this).attr('id')] = {
			x1: x1,
			y1: y1,
			x2: x1 + width,
			y2: y1 + height,
			height: height,
			width: width
		};
	});
	return positions;
}

function setImageDimensions(imgContainer, height, width, maxWidth) {
	var img = imgContainer.find('img');
	img.css('height', height+'px');
	img.css('width', width+'px');
	maxWidth = typeof maxWidth === 'undefined' ? width : maxWidth;
	imgContainer.css('max-width', maxWidth +'px');
}

function setWrapper() {
	var imgDetails = $('#imgElementDetails');
	var image = $('div#imageContainer');
	var popUpStartY = imgDetails.offset().top - imgDetails.position().top;
	var PopUpEndY = popUpStartY + imgDetails.height() + image.offset().top + $('.footer').height() + 15;
	var origWrap = Math.round(origHeight*scale) + image.offset().top;
	if (PopUpEndY > origWrap) {
		$('div#wrapper').css('height', PopUpEndY+'px');
	} else {
		resetWrapper();	
	}
}
function resetWrapper() {
	var origWrap = Math.round(origHeight*scale) + $('div#imageContainer').offset().top + $('.footer').height();
	$('div#wrapper').css('height', origWrap+'px');
}

//---------------------------------------- Element Toggling --------------------------------------------

function setDistributedStyles(selector) {
	if (typeof selector === 'undefined') {
		selector = 'div.imageElement span.nameTag';
	}
	$(selector).addClass('permNameTag');
	setSavedStyles(selector, 'nameTags');
	unfadeName($(selector));
}
function removeDistributedStyles(selector) {
	if (typeof selector === 'undefined') {
		selector = 'div.imageElement span.nameTag';
	}
	$(selector).removeClass('permNameTag').attr('style', '');
}
function setSavedStyles(selector, key) {
	var id;
	$(selector).each(function() {
		id = $(this).attr('id');
		if (adjustedStyles[key][id] !== undefined) {
			$(this).attr('style', adjustedStyles[key][id]);			
		}
	});
}
function fadeName(element) {
	element.addClass('faded');
	element.removeClass('textShadow1');
}
function unfadeName(element) {
	element.removeClass('faded');
	element.addClass('textShadow1');
}

function checkSpaceForDistribution() {
	return $(window).width() > minDistrWidth;
}

function checkElementsShowing() {
	return parseInt($('input[name="toggleElements"]:checked').val()) === 0;
}
function checkBoxesShowing(space) {
	space = typeof space === 'undefined' ? checkSpaceForDistribution() : space;
	return $('#showBoxes:visible:checked').length || (checkElementsShowing() && !space);
}
function checkNamesShowing(space) {
	space = typeof space === 'undefined' ? checkSpaceForDistribution() : space;
	return $('#showNames:visible:checked').length && space;
}

function countOverlaps() {
	var baseEl;
	var checkEl;
	var basePos;
	var checkPos;
	var sorted = getSortedNameTags();
	var overlaps = 0;
	var distributed = $('span.permNameTag').length;
	if (!distributed) {
		setDistributedStyles();
		adjustNameTagWidths(sorted);
	}
	var elementsShowing = $('div.imageElement.notNew:visible').length;
	if (!elementsShowing) {
		showElementsInDOM();
	}
	for (var i = 0; i < sorted.length; i++) {
		baseEl = $(sorted[i]);
		basePos = getElementPositions(baseEl);
		for (var j = i+1; j < sorted.length; j++) {
			checkEl = $(sorted[j]);
			checkPos = getElementPositions(checkEl);
			if (checkOverlap(basePos, checkPos)) {
				overlaps++;
				break;
			} else if (checkPos['y1'] > basePos['y2']) {
				break;
			}
		}
		
	}
	if (!elementsShowing) {
		hideElementsInDOM();
	}
	if (!distributed) {
		removeDistributedStyles();
	}
	return overlaps;
}

function fixEdgeIE() {
	if (checkIEBrowser() || navigator.userAgent.indexOf('Edge') !== -1) {
		$('#popUpDetails').addClass('edgeFix');
		if (checkIEBrowser()) {
			$("#imageContainer").addClass('ieFix');
		}
	}
}
function checkIEBrowser() {
	return document.documentMode;
}