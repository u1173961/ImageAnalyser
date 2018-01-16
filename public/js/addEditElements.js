$(document).ready( function() {
	var imgContainer = $('#imageContainer');
	var imageElement = null;
	imgContainer.on('contextmenu', function(e) {
		e.preventDefault();
	});
	//handle resizes
	origWidth = parseInt(imgContainer.data('owidth'));
	origHeight = parseInt(imgContainer.data('oheight'));
	setImageDimensions(imgContainer, origHeight, origWidth);
	origPositions = getAllPositions(); //allow resets
	currAbsPositions = $.extend({}, origPositions); //minimise rounding errors
	scale = getScale();
	minDistrWidth = 0;
	handleResizes(imgContainer);
	$(window).resize(function() {
		handleResizes(imgContainer);
	});
	//allow element toggling
	distributedTags = false;
	adjustedStyles = { nameTags: {} }; //store new styles to avoid recalculation
	addToggleListeners();
	//highlight elements on hover
	addHoverListeners();
	//handle selections
	var startPos = {};
	var endPos = {};
	var drag = false;
	newElements = []; //allow removal of last new element on escape 
	newElIndices = {};
	$(document).mousedown(function(e) {
		if (!$(e.target).hasClass('field')) {
			e.preventDefault();
		}
		if (e.which == 1 && !$('div.imageElement.selected').length) {
			startPos = {
			    x: e.pageX - imgContainer.offset().left,
			    y: e.pageY - imgContainer.offset().top
		    };
			$(document).mousemove(function(e) {
				drag = true;
				hideElementsInDOM();
				$('#dragOutline').remove();
				endPos = {
				    x: e.pageX - imgContainer.offset().left,
				    y: e.pageY - imgContainer.offset().top
			    };
				if (drawSelection(imgContainer, startPos, endPos, 'imageElement bordered', 'dragOutline')) {
					focusOffElement($('div.imageElement.notNew.bordered'));					
				} else if (!$('div.imageElement.new').length) {
					showElementsInDOM();
				}
			});
		}
	}).mouseup(function(e) {
		$(document).off('mousemove');
		if(drag) {
			endPos = {
			    x: e.pageX - imgContainer.offset().left,
			    y: e.pageY - imgContainer.offset().top
		    };
			var newElID = drawSelection(imgContainer, startPos, endPos, 'imageElement bordered new highlighted');
			addNewElement(newElID);
			$('#dragOutline').remove();
			drag = false;
		} else {
			var target = $(e.target);
			if (target.hasClass('nameTag') || (target.hasClass('imageElement') &&  target.attr('id') != 'dragOutline')) {
				imageElement = target.hasClass('imageElement') ? target : target.closest('div.imageElement');
				if(e.which === 1) {
					selectElement(imgContainer, imageElement);
					//prevent highlight of elements while editing
					hideElementsInDOM();
				} else {
					e.preventDefault();
					handleEscapes(imageElement, imageElement);
				}
			}			
		}
	});
	//show realtime changes to positions
	$('input.field').keyup(function(e) {
		showNewPosition(e, $(this));
	});
	$('input.field.scalable').on('change', function(e) {
		showNewPosition(e, $(this));
	});
	$('#name').keyup('change', function() {
		if ($(this).val()) {
			$(this).removeClass('errorOutline');
		}
	});
	
	//allow reset of details
	$('#resetDetails').on('click', function(e) {
		e.preventDefault();
		resetDetails(imgContainer, imageElement);		
	});
	//save on ctrl-s
	$(window).keydown(function(e) {
		if ($('#imgElementDetails').is(':visible')) {
			if (e.ctrlKey && e.which == 83) {
				e.preventDefault();
				$('form#addEditImgElements').submit();				
			}
		}
	});
	//ajax updates
	$('form#addEditImgElements').submit(function(e) {
		e.preventDefault();
		addEditImgElement();
	});
	$('#deleteElement').on('click', function(e) {
		e.preventDefault();
		deleteElement(imgContainer, imageElement);		
	});
	//close popup on escape
	$(window).keydown(function(e) {
		if (e.which == 27) {
			var lastNew = newElements.length > 0 ? newElements.pop() : null;
			if (lastNew) {
				delete newElIndices[lastNew.attr('id')];
			}
			handleEscapes(lastNew, $('div.imageElement.notNew.bordered'));
		}
	});
	$('.closeButton').on('click', function(e) {
		closePopUp();
	});
	fixEdgeIE();
});

//--------------------------------------- Element Creation -----------------------------------------

/**
 * Draw box on mouse drag
 * @param $(image)
 * @param startPos
 * @param endPos
 * @param classes
 * @param selectionID
 * 
 * @returns bool
 */
function drawSelection(image, startPos, endPos, classes, selectionID) {
	if (typeof classes === 'undefined') {
		classes = 'imageElement bordered';
	}
	var startX = startPos['x'];
	var startY = startPos['y'];
	var endX = endPos['x'];
	var endY = endPos['y'];
	var positions = resolvePositions(image, startX, startY, endX, endY);
	if (positions) {
		startX = positions['startX'];
		startY = positions['startY'];
		endX = positions['endX'];
		endY = positions['endY'];
		var height = Math.round(endY - startY);
		var width = Math.round(endX - startX);
		if (typeof selectionID === 'undefined') {
			selectionID = Math.round(startX) + '-' + Math.round(startY) + '-' + Math.round(endX) + '-' + Math.round(endY);
		}
		imageElement = $('<div id="'+selectionID+'" class="'+classes+'" '
						+ 'style="height: '+height+'px; width: '+width+'px; margin-left: '+Math.round(startX)
						+ 'px; margin-top: ' + Math.round(startY)+'px; z-index:998;" data-name=""'
				        + 'data-subtitle="" data-appearance="" data-searchterms="" data-description="" data-zindex="998">'
			        	+ '<span class="nameTag hidden"></span></div>') ;
		image.prepend(imageElement);
		return selectionID;
	}
	return false;
}

/**
 * Ensures selections are within image bounds.
 * Forces exceeding/intersecting selections within bounds.
 * @param $(image)
 * @param int startX
 * @param int startY
 * @param int endX
 * @param int endY
 * 
 * @returns bool|array
 */
function resolvePositions(image, startX, startY, endX, endY) {
	//handle backwards selections
	var t;
	if (endX < startX) {
		t = startX;
		startX = endX;
		endX = t;
	}
	if (endY < startY) {
		t = startY;
		startY = endY;
		endY = t;
	}
	//check bounds
	var limitX = image.outerWidth();
	var limitY = image.outerHeight();
	startX = resolveBounds(startX, limitX);
	startY = resolveBounds(startY, limitY);
	endX = resolveBounds(endX, limitX);
	endY = resolveBounds(endY, limitY);
	if (startX === endX || startY === endY) {
		return false;
	}
	
	return { startX: startX, startY: startY, endX: endX, endY: endY }; 
}

function resolveBounds(pos, limit) {
	if (pos < 0) {
		return 0;
	} else if (pos > limit) {
		return limit;
	}
	return pos;
}

function inBounds(posX, posY, limitX, limitY) {
	return posX >= 0 && posX <= limitX && posY >= 0  && posY <= limitY;
}

function addNewElement(newElID) {
	newElements.push($('#'+newElID));
	newElIndices[newElID] = newElements.length - 1;
}
function removeNewElement(newElID) {
	newElements.splice(newElIndices[newElID], 1);
	delete newElIndices[newElID];
}

//--------------------------------------- Element Saving ----------------------------------------------

function addEditImgElement() {
	var action = $('form#addEditImgElements').attr('action');
	var fields = getFields($('div.imageElement.selected').attr('id'));
	if (fields['name']) {
		var post = { fieldsAndValues: fields };
		var id = $('input#id').val();
		if (id) {
			post['where'] = { id: id };		
		}
		var xhr = $.post(action, post, function(data) {
			handleResponse(data);
			if (!data['error']) {
				applySavedData(data, id, fields);
			}
		}, 'json');
		handleAjaxFailures(xhr);		
	}
}

function applySavedData(data, id, fields) {
	var element = $('div.imageElement.selected');
	var nameTag = element.find('.nameTag');
	if (typeof data['orientation'] !== 'undefined') {
		nameTag.addClass(data['orientation']);
		fields['orientation'] = data['orientation'];
	}
	if (typeof data['zIndex'] !== 'undefined') {
		element.css('z-index', data['zIndex']);
		fields['zindex'] = data['zIndex'];
	}
	nameTag.text(fields['name']);
	if (typeof data['id'] !== 'undefined') {
		//create
		id = data['id'];
		var origID = element.attr('id');
		origPositions[id] = origPositions[origID];
		delete origPositions[origID];
		currAbsPositions[id] = currAbsPositions[origID];
		delete currAbsPositions[origID];
		$('input#id').val(id);
		element.attr('id', id);
		element.removeClass('new');
		element.addClass('notNew');
		addHoverListeners(element);
		showDeleteElement();
		if ($('div.permBorder').length) {
			element.addClass('permBorder');
		}
		removeNewElement(origID);
	}
	updateDataAttributes(element, fields);
	adjustDistributedTags();
}

function deleteElement(imgContainer, imageElement) {
	if (warningConfirmation()) {
		var action = '/deleteElement';
		var id = $(imageElement).attr('id');
		var xhr = $.post(action, { id: id }, function(data) {
			handleResponse(data);
			if (!data['error']) {
				delete origPositions[id];
				delete currAbsPositions[id];
				//allow message to show briefly
				setTimeout(function() {
					closePopUp();
					$(imageElement).remove();
				}, 1600);
			}
		}, 'json');
		handleAjaxFailures(xhr);
	}
}

function getFields(elementID) {
	var fields = {};
	var val;
	var element = currAbsPositions[elementID];
	$('input.field').each(function(k) {
		val = $(this).val();
		if (val) {
			val = $(this).hasClass('scalable') ? Math.round(element[$(this).attr('name')]) : val;
			fields[$(this).attr('name')] = val;
		}
	});
	fields['description'] = $('textarea#description').val();
	
	return fields;
}

function handleResponse(data) {
	var holder = $('#imgElementDetails');
	if (!data['error']) {
		showSuccess(data['message'], holder);
	} else {
		showError(data['message'], holder);
	}
	scrollToMessage(holder);
}

/**
 * Ensure html data is valid after update
 * @param jQObj|String selector
 * @param array fields
 * @returns
 */
function updateDataAttributes(selector, fields) {
	$.each(fields, function(k, v) {
		$(selector).data(k.toLowerCase(), v);
	});
}

//--------------------------------------- Show/Hide Popup ---------------------------------------------

function handleEscapes(imageElement, focusOff) {
	if ($('#imgElementDetails').is(':visible')) {
		closePopUp();
	} else {
		if (imageElement && $(imageElement).hasClass('new')) {
			$(imageElement).remove();
		} else {
			focusOffElement(focusOff);
		}
		if (!$('div.imageElement.new').length) {
			showElementsInDOM();
		}
	}	
}

function hideElementsInDOM() {
	var imageElement = $('div.imageElement.selected');
	$('div.imageElement.notNew').hide();
	if (imageElement) {
		imageElement.show();		
	}
}

function showElementsInDOM() {
	$('div.imageElement.notNew').show();
}

/**
 * Show pop-up positioned below element
 * @param $(imgContainer)
 * @param $(imageElement)
 */
function showPopUp(imgContainer, imageElement) {
	hideElementsInDOM();
	var details = $('#imgElementDetails');
	var height = imageElement.height();
	var width = imageElement.width();
	var startPos = {};
	var endPos = {};
	var id = imageElement.attr('id');
	startPos['x'] = getPixelValueFromCSS('margin-left', imageElement);
	startPos['x'] = startPos['x'] < 0 ? 0 : startPos['x'];
	endPos['x'] = startPos['x'] + width;
	startPos['y'] = getPixelValueFromCSS('margin-top', imageElement);
	endPos['y'] = startPos['y'] + height;
	details.css('margin-top', (endPos['y']) + 'px');
	//store original positions for resets/store current for resizes
	if (origPositions[id] === undefined) {
		origPositions[id] = getAbsPositions(startPos, endPos, height, width);
		currAbsPositions[id] = $.extend({}, origPositions[id]);
	}
	if (imageElement.hasClass('new') && !imageElement.hasClass('edited')) {
		populatePopUp('', '', '', '', '', startPos, endPos, height, width, 1);
		$('#deleteElement').hide();
	} else {
		populatePopUp(
			id, imageElement.data('name'), imageElement.data('subtitle'), imageElement.data('searchterms'), 
			imageElement.data('description'), startPos, endPos, height, width, imageElement.data('appearance')
		);
		$('#deleteElement').show();
	}
	imageElement.after(details);
	details.show();
	repositionPopUp(imageElement);
}

function closePopUp() {
	var imageElement = $('div.imageElement.selected');
	if (!$('div.imageElement.new').length) {
		showElementsInDOM();
	}
	imageElement.removeClass('selected');
	var permTags = $('span.permNameTag');
	if (permTags.length) {
		setDistributedStyles(imageElement.find('span.nameTag'));
		unfadeName(permTags);
	}
	hidePopUp();
}

function populatePopUp(id, name, subtitle, search, desc, startPos, endPos, height, width, num) {
	$('#id').val(id);
	$('#name').val(name);
	$('#subtitle').val(subtitle);
	$('#searchTerms').val(search);
	$('#description').val(desc);
	$('#x1').val(startPos['x']);
	$('#x2').val(endPos['x']);
	$('#y1').val(startPos['y']);
	$('#y2').val(endPos['y']);
	$('#height').val(height);
	$('#width').val(width);
	$('#appearance').val(num);
}

/**
 * Undo unsaved edits
 * @param $(imgContainer)
 * @param $(imageElement)
 */
function resetDetails(imgContainer, imageElement) {
	resetPositions(imageElement);
	showPopUp(imgContainer, imageElement);	
}

function showDeleteElement() {
	$('#deleteElement').show();
	$('div#wrapper').css('height', (getPixelValueFromCSS('height', $('div#wrapper'))+$('#deleteElement').height())+'px');
}

//----------------------------------------- Resizing/Positioning ---------------------------------------

function handleResizes(imgContainer) {
	scale = getScale();
	setImageDimensions(imgContainer, Math.round(origHeight*scale), Math.round(origWidth*scale), origWidth);
	resizeImageSelectors();
	repositionPopUp($('div.imageElement.selected'));
	distributedTags = false;
	if (checkElementsShowing()) {
		toggleElements();
	}
}

/**
 * Unscale positions
 * @param array startPos
 * @param array endPos
 * @param int height
 * @param int width
 * 
 * @returns array
 */
function getAbsPositions(startPos, endPos, height, width) {
	var positions = {
		x1: Math.round(startPos['x']/scale),
		y1: Math.round(startPos['y']/scale),
		x2: Math.round(endPos['x']/scale),
		y2: Math.round(endPos['y']/scale),
		height: Math.round(height/scale),
		width: Math.round(width/scale)
	};
	return positions;
}

/**
 * Show realtime edits to element positions
 * @param Event key
 * @param $(field)
 */
function showNewPosition(key, field) {
	var heightChanged = false;
	var imageElement = $('div.imageElement.selected');
	var id = imageElement.attr('id');
	var keyUp = key.which;
	//only update on numeric input(&up/down)/ctrl-(z/y/v) & mousewheel = undefined
	if (keyUp === undefined || keyUp == 8 || keyUp == 46 || keyUp == 38 || keyUp == 40 || (keyUp > 47 && keyUp < 58) || (keyUp > 95 && keyUp < 106) 
		|| (key.ctrlKey && (keyUp == 89 || keyUp == 90 || keyUp == 86))) {
		//46 = delete, 8 = backspace, 38 = up, 40 = down, 48-57 = 0-9, 96-105 = 0-9 (num), 89-90 = y-z
		var val = Math.round(field.val());
		if (field.attr('id') == 'x1') {
			imageElement.css('margin-left', val + 'px');
			showNewWidth(imageElement, id);
			setCurrAbsPosition(id, 'x1', val);
		} 
		else if (field.attr('id') == 'x2') {
			showNewWidth(imageElement, id);
			setCurrAbsPosition(id, 'x2', val);
		} 
		else if (field.attr('id') == 'y1') {
			imageElement.css('margin-top', val + 'px');
			showNewHeight(imageElement, id);
			setCurrAbsPosition(id, 'y1', val);
			heightChanged = true;
		} 
		else if (field.attr('id') == 'y2') {
			showNewHeight(imageElement, id);
			setCurrAbsPosition(id, 'y2', val);
			heightChanged = true;
		} 
		else if (field.attr('id') == 'height') {
			imageElement.css('height', val + 'px');
			setCurrAbsPosition(id, 'height', val);
			heightChanged = true;
			var y2 = parseInt($('#y1').val()) + val;
			$('#y2').val(y2);
			setCurrAbsPosition(id, 'y2', y2);
		} 
		else if (field.attr('id') == 'width') {
			imageElement.css('width', val + 'px');
			setCurrAbsPosition(id, 'width', val);
			var x2 = parseInt($('#x1').val()) + val;
			$('#x2').val(x2);
			setCurrAbsPosition(id, 'x2', x2);
		}
		if (heightChanged) {
			repositionPopUp(imageElement, false);
		}
		//retain changes to new elements before save
		imageElement.addClass('edited');
	}
}
function showNewWidth(imageElement, id) {
	var newWidth = Math.round(parseInt($('#x2').val()) - parseInt($('#x1').val()));
	imageElement.css('width', newWidth + 'px');
	$('#width').val(newWidth);
	setCurrAbsPosition(id, 'width', newWidth);
}
function showNewHeight(imageElement, id) {
	var newHeight = Math.round(parseInt($('#y2').val()) - parseInt($('#y1').val()));
	imageElement.css('height', newHeight + 'px');
	$('#height').val(newHeight);
	setCurrAbsPosition(id, 'height', newHeight);
}
function setCurrAbsPosition(id, pos, value) {
	var element = currAbsPositions[id];
	if (element) {
		element[pos] = value/scale;
	}
}

/**
 * Reposition pop-up on load and resize
 * @param $(imageElement)
 * @param bool scaleInputs
 */
function repositionPopUp(imageElement, scaleInputs) {
	if(typeof scaleInputs === 'undefined') {
		scaleInputs = true;
	}
	var popUp = $('#imgElementDetails');
	if (popUp.is(':visible')) {
		var popUpStartY = getPixelValueFromCSS('margin-top', imageElement) + imageElement.height() + 2;
		popUp.css('margin-top', (popUpStartY) + 'px');
		popUp.css('width', ($('#imageContainer').outerWidth()-1) + 'px');
		setWrapper();
		scrollToObject(imageElement, 1);
		if (scaleInputs) {
			scaleInputValues(imageElement.attr('id'));			
		}
	} else {
		resetWrapper();
	}
}

/**
 * Scale positioning input on resize
 * @param String elementID
 * @returns
 */
function scaleInputValues(elementID) {
	var element = currAbsPositions[elementID];
	if (element) {
		$('input.field').each(function(k) {
			if ($(this).hasClass('scalable')) {
				$(this).val(Math.round((element[$(this).attr('name')]*scale)));
			}
		});
	}
}

/**
 * Restore original element position
 * @param $(imageElement)
 * @returns
 */
function resetPositions(imageElement) {
	var id = $(imageElement).attr('id');
	var element = origPositions[id];
	currAbsPositions[id] = $.extend({}, origPositions[id]);
	$(imageElement).css('margin-top', Math.round(element['y1']*scale) + 'px');
	$(imageElement).css('margin-left', Math.round(element['x1']*scale) + 'px');	
	$(imageElement).css('height', Math.round(element['height']*scale) + 'px');
	$(imageElement).css('width', Math.round(element['width']*scale) + 'px');
}

//---------------------------------------- Element Toggling --------------------------------------------

function toggleElements() {
	if (checkElementsShowing()) {
		var spaceForDistr = checkSpaceForDistribution();
		if (spaceForDistr) {
			showToggleOptions();
		} else {
			hideToggleOptions();
		}
		showElements(spaceForDistr);
	} else {
		hideToggleOptions();
		hideElements();
	}
}
function showElements(spaceForDistr) {
	var elements = $('div.imageElement');
	var nameTags = elements.find('span.nameTag');
	if (checkBoxesShowing(spaceForDistr)) {
		elements.addClass('permBorder');
	} else {
		elements.removeClass('permBorder');
	}
	removeDistributedStyles();
	if (checkNamesShowing(spaceForDistr)) {
		nameTags.addClass('permNameTag');
		if (!distributedTags) {
			distributedTags = distributeNameTags();
			if (!distributedTags) {
				hideToggleOptions();
				removeDistributedStyles();
			}
		} else {
			setSavedStyles(nameTags, 'nameTags');
		}
	}
}
function hideElements() {
	$('div.imageElement').removeClass('permBorder');
	$('div.imageElement span.permNameTag').removeClass('permNameTag').attr('style', '');	
}

function showToggleOptions() {
	$('#showNames').closest('span').removeClass('hidden');
	$('#showBoxes').closest('span').removeClass('hidden');	
}
function hideToggleOptions() {
	$('#showNames').closest('span').addClass('hidden');
	$('#showBoxes').closest('span').addClass('hidden');	
}

function getSortedNameTags() {
	return $('div.imageElement span.nameTag').toArray().sort(sortByOffsetTop);
}

/**
 * Simple top-down distribution of tags
 * @todo: proper traversal e.g. DFT
 * must also be efficient
 */
function distributeNameTags() {
	var nameTag;
	var lowOverlap;
	var sorted = getSortedNameTags();
	adjustNameTagWidths(sorted);
	for (var i = 0; i < sorted.length; i++) {
		if (adjustOverlaps($(sorted[i]), sorted, i+1, sorted.length - 1)) {
			//store new styles to avoid recalculation
			adjustedStyles['nameTags']['nt'+i] = $(sorted[i]).attr('style');
			$(sorted[i]).attr('id', 'nt'+i);
		} else {
			//tags shifted outside element - abort until better traversal
			minDistrWidth = $(window).width() + 10;
			return false;
		}
	}
	return true;
}

function adjustOverlaps(baseEl, baseSet, startIndex, endIndex) {
	var checkEl;
	var checkPos;
	var basePos = getElementPositions(baseEl);
	//var overlaps = sortByXProximity(getOverlaps(baseEl, baseSet, startIndex, endIndex), baseEl.offset().left);
	var overlaps = getOverlaps(baseEl, baseSet, startIndex, endIndex);
	var ieOffset = checkIEBrowser() ? 3 : 1;
	if (overlaps.length > 0) {
		var offset = baseEl.offset().top;
		var checkOff;
		var newSortPos;
		var holder;
		for (var i = 0; i < overlaps.length; i++) {
			checkEl = overlaps[i]['el'];
			checkOff = checkEl.offset().top;
			margin = getPixelValueFromCSS('margin-top', checkEl) + offset + baseEl.height() - checkOff - ieOffset;
			checkEl.css('margin-top', margin+'px');
			newSortPos = setNewSortPos(checkEl, baseSet, overlaps[i]['index']+1, endIndex, overlaps);
			//check tags fit elements
			holder = checkEl.closest('.imageElement');
			holderEndY = holder.offset().top + holder.height();
			if (checkEl.offset().top > holderEndY) {
				//abort for now
				return false;
			}
			offset = checkOff;
		};
	}
	return true;
}

function getOverlaps(baseEl, baseSet, startIndex, endIndex) {
	var overlaps = [];
	var checkEl;
	var checkPos;
	var basePos = getElementPositions(baseEl);
	for (var i = startIndex; i <= endIndex; i++) {
		checkEl = $(baseSet[i]);
		checkPos = getElementPositions(checkEl);
		if (checkOverlap(basePos, checkPos)) {
			overlaps.push({ el:checkEl, index: i });
		} else if (checkPos['y1'] > basePos['y2']) {
			break;
		}
	}
	return overlaps;
}
function setNewSortPos(baseEl, baseSet, startIndex, endIndex, overlaps) {
	overlapIndices = [];
	for (var j = 0; j < overlaps.length; j++) {
		overlapIndices.push(overlaps[j]['index']);
	}
	var offsetY = baseEl.offset().top;
	var checkEl;
	var conflict;
	for (var i = startIndex; i <= endIndex; i++) {
		checkEl = $(baseSet[i]);
		if (checkEl.offset().top < offsetY) {
			baseSet[i-1] = checkEl;
			baseSet[i] = baseEl;
			conflict = overlapIndices.indexOf(i);
			if (conflict !== -1) {
				overlaps[conflict]['index']--;;
			}
		} else {
			return i-1;
		}
	}
	return startIndex;
}
function sortByXProximity(set, target) {
	for (var i = 0; i < set.length; i++) {
		if (Math.abs($(set[i]).offset().left - target)) {
		}
	}
	return set;
}
function checkOverlaps(baseEl, baseSet) {
	var checkEl;
	var checkPos;
	var basePos = getElementPositions(baseEl);
	var y1 = basePos['y1'];
	var y2 = basePos['y2'];
	baseSet.sort(sortByOffsetTop);
	for (var i = 0; i < baseSet.length; i++) {
		checkEl = $(baseSet[i]);
		checkPos = getElementPositions(checkEl);
		if (checkPos['y2'] < y1) {
			continue;
		} else if (checkOverlap(basePos, checkPos)) {
			return true;
		} else if (checkPos['y1'] > y2) {
			return false;
		}
	}
	return false;
}
function checkOverlap(el1Pos, el2Pos) {
	if (checkOverlapOnAxis(el1Pos['x1'], el1Pos['x2'], el2Pos['x1'], el2Pos['x2']) 
		&& checkOverlapOnAxis(el1Pos['y1'], el1Pos['y2'], el2Pos['y1'], el2Pos['y2'])) {
		return true;
	}
	return false;
}

function getElementPositions(element) {
	var startX = element.offset().left;
	var startY = element.offset().top;
	return { x1: startX, x2: startX + element.width(), y1: startY, y2: startY + element.height() };	
}

function logOutsideBoundsElements() {
	var baseSet = getSortedNameTags();
	var baseEl;
	var holder;
	var checkEl;
	var checkPos;
	var basePos;
	var overlaps = [];
	var overlapX;
	var overlapY;
	var startX;
	var done = 0;
	for (var i = 0; i < baseSet.length; i++) {
		baseEl = $(baseSet[i]);
		holder = baseEl.closest('.imageElement');
		if (baseEl.offset().top > holder.offset().top + holder.height()) {
			console.group('y-axis:'+baseEl.text());
			console.log('el:' + baseEl.offset().top);
			console.log('holder:' + (holder.offset().top + holder.height()));
			console.groupEnd();
		}
		if ((baseEl.offset().left + baseEl.width()) < holder.offset().left || baseEl.offset().left > holder.offset().left + holder.width()) {
			console.group('x-axis:'+baseEl.text());
			console.log('el:' + baseEl.offset().top);
			console.log('holder:' + (holder.offset().top + holder.height()));
			console.groupEnd();
		}
	}
}

/**
 * Adjust tags (naive)
 * @todo: optimise
 */
function adjustDistributedTags() {
	if (distributedTags) {
		var distributed = $('span.permNameTag').length;
		var elementsShowing = $('div.imageElement.notNew:visible:not(.selected)').length;
		if (!elementsShowing) {
			showElementsInDOM();
		}
		setDistributedStyles();
		var ok = distributeNameTags();
		if (!elementsShowing) {
			hideElementsInDOM();
		}
		if (!(distributed && ok)) {
			removeDistributedStyles();
		}
	}
}

/**
 * Set name tag width to fit text
 * @param nameTag
 * @returns true if moved to fit container
 */
function adjustNameTagWidth(nameTag) {
	var width = Math.min(Math.max(59, getTextWidthInSpan(nameTag.text())) + 1, 150);
	nameTag.css('width', width+'px');
	var overflow = (nameTag.offset().left  + width) - ($('#imageContainer').offset().left + $('#imageContainer').width());
	if (overflow > 0) {
		nameTag.css('margin-left', (-overflow + getPixelValueFromCSS('margin-left', nameTag))+'px');
		return true;
	}
	return false;
}
function adjustNameTagWidths(nameTags) {
	createWidthCalculator();
	for (var i = 0; i < nameTags.length; i++) {
		adjustNameTagWidth($(nameTags[i]));
	}
	removeWidthCalculator();
}
function getLowestOverlapIndexY(baseSet, baseIndex) {
	var basePos = getElementPositions(baseSet[baseIndex]);
	var checkPos;
	var lowest = false;
	for (var i = baseIndex-1; i > -1; i--) {
		checkPos = getElementPositions(baseSet[i]);
		if (checkOverlapOnAxis(basePos['y1'], basePos['y2'], checkPos['y1'], checkPos['y2'])) {
			lowest = i;
		} else {
			return lowest;
		}		
	}
	return lowest;
}

function getOrientation(el) {
	var orientation;
	if (el.hasClass('leftImage')) {
		orientation = 'left';
	} else if (el.hasClass('rightImage')) {
		orientation = 'right';
	} else {
		orientation = 'centre';
	}
	return orientation
}

function sortByStartY(a, b) {
	return a['startY'] - b['startY'];
}

function sortByOffsetTop(a, b) {
	return $(a).offset().top - $(b).offset().top;
}

function sortByOffsetLeft(a, b) {
	return $(a).offset().left - $(b).offset().left;
}

function createWidthCalculator() {
	if (!$('span#calcWidth').length) {
		$('body').append('<span id="calcWidth" class="nameTag" style="width:auto; position:absolute; opacity:0;"></span>');
	}    
}
function removeWidthCalculator() {
	$('span#calcWidth').remove();
}

/**
 * Use span to calculate text width
 * dependent on createWidthCalculator()
 * @param String text
 * @returns int - width in px
 */
function getTextWidthInSpan(text) {
	$('#calcWidth').text(text);
	return $('#calcWidth').width();
}

/**
 * Use Canvas TextMetrics to calculate text width
 * @param String font
 * @param int size
 * @param String text
 * @returns int - width in px
 */
function getTextWidth(font, size, text) {
    if(getTextWidth.c === undefined){
    	getTextWidth.c = document.createElement('canvas');
    	getTextWidth.ctx = getTextWidth.c.getContext('2d');
    }
    getTextWidth.ctx.font = size + ' ' + font;
    
    return getTextWidth.ctx.measureText(text).width;
}

function getCentredTextPositionsX(offset, textWidth, tagWidth) {
	var x1;
	var x2;
	var space = Math.round((tagWidth - textWidth)/2);
	x1 = offset + space;
	x2 = x1 + textWidth;
	return { x1: x1, x2: x2 };
}

function getTextPositionsX2(offset, orientation, textWidth, tagWidth) {
	var x1;
	var x2;
	if (orientation == 'left') {
		x1 = offset;
		x2 = offset + textWidth;
	} else if (orientation == 'right') {
		x2 = offset + tagWidth;
		x1 = x2 - textWidth;		
	} else {
		var space = Math.round((tagWidth - textWidth)/2);
		x1 = offset + space;
		x2 = x1 + textWidth;
	}
	return { x1: x1, x2: x2 };
}

function checkOverlapOnAxis(a1, a2, b1, b2) {
	return ((a1+1 <= b1+1 && a2 >= b1+1) || (a1+1 <= b2 && a1+1 >= b1+1)); 
}

function addToggleListeners() {
	$('input[name="toggleElements"]').change(function(e) {
		toggleElements();
	});
	$('.toggleButton').on('click', function(e) {
		if ($('#imgElementDetails').is(':visible')) {
			e.preventDefault();
		}
	});
	$('#showNames').click(function(e) {
		if (!$('#showBoxes:checked').length || $('#imgElementDetails').is(':visible')) {
			e.preventDefault();
		} else {
			toggleElements();
		}
	});
	$('#showBoxes').click(function(e) {
		if (!$('#showNames:checked').length || $('#imgElementDetails').is(':visible')) {
			e.preventDefault();
		} else if ($('#showBoxes:checked').length) {
			$('div.imageElement').addClass('permBorder');
		} else {
			$('div.imageElement').removeClass('permBorder');	
		}
	});
	$('.toggleLabel').on('click', function(e) {
	    if (!$(e.target).hasClass('toggleButton')) {
	    	$(this).find('.toggleButton').click();
	    }
	});
}
