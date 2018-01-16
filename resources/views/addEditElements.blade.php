@extends('layouts.default')
@push('scripts')
    <script src="{{ asset('js/addEditElements.js') }}"></script>
    <script src="{{ asset('js/common.js') }}"></script>
@endpush
@section('title', $image->name)
@section('breadcrumbs')
	{{ Breadcrumbs::render('updateElements', $image->id) }}
@endsection
@section('content')
    <div id="contents">
    	<div class="topControls">
    		<span class="toggleLabel"><input type="radio" name="toggleElements" class="toggleButton" value="0"> Show Elements</span>
    		<span class="toggleLabel hidden"><input id="showBoxes" type="checkbox" class="toggleButton" checked="checked"> Show Boxes</span>
    		<span class="toggleLabel hidden"><input id="showNames" type="checkbox" class="toggleButton" checked="checked"> Show Names</span>
    		<span class="toggleLabel"><input type="radio" name="toggleElements" class="toggleButton" value="1" checked="checked"> Hide Elements</span>
    	</div>
    	<div id="imageContainer" data-owidth="{{$image->width}}" data-oheight="{{$image->height}}">
            @include('imageElements')
    		<img id="{{$image->id}}" class="mainImage" src="{{asset('storage/images/'.$image->getFilePath())}}">
    		<div id="imgElementDetails" class="popUp">
    			<span class="closeButton">&#x274C;</span>
    			<div class="error-msg hidden"><p></p></div>
    			<div class="success-msg hidden"><p></p></div>
    			<form id="addEditImgElements" action="{{'/addEditImgElements/'.$image->id}}" method="POST">
					{{ csrf_field() }}
    				<input id="id" type="hidden" name="id" value="">
    				<div><span>Name: </span> <input id="name" class="field" type="text" name="name" value="" required="required"></div>
    				<div><span>Subtitle: </span> <input id="subtitle" class="field" type="text" name="subtitle" value=""></div>
    				<div><span>Search Terms: </span> <input id="searchTerms" class="field" type="text" name="searchTerms" value=""></div>
    				<div><span>Description: </span> 
        				<textarea id="description" class="field"></textarea>
    				</div>
    				<div><span>x1: </span> <input id="x1" class="field scalable" type="number" name="x1" value="" required="required"></div>
    				<div><span>x2: </span> <input id="x2" class="field scalable" type="number" name="x2" value="" required="required"></div>
    				<div><span>y1: </span> <input id="y1" class="field scalable" type="number" name="y1" value="" required="required"></div>
    				<div><span>y2: </span> <input id="y2" class="field scalable" type="number" name="y2" value="" required="required"></div>
    				<div><span>Height: </span> <input id="height" class="field scalable" type="number" name="height" value="" required="required"></div>
    				<div><span>Width: </span> <input id="width" class="field scalable" type="number" name="width" value="" required="required"></div>
    				<div><span>Appearance: </span> <input id="appearance" class="field" type="number" name="appearance" value=1></div>
    				<input type="submit" value="Save">
    				<button id="resetDetails">Reset</button>
    				<button id="deleteElement">Delete</button>
    			</form>
    		</div>
    	</div>
    </div>
@endsection
@section('footer')
	<div class="footer">
        <div class="container">
			<a href="{{'/imageOptions/'.$image->id}}">Image Options &#10226;</a>
		</div>
	</div>
@endsection