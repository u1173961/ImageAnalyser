@extends('layouts.default')
@push('scripts')
    <script src="{{ asset('js/viewImage.js') }}"></script>
    <script src="{{ asset('js/common.js') }}"></script>
@endpush
@section('title', $image->name)
@section('breadcrumbs')
	{{ Breadcrumbs::render('viewImage', $image->id) }}
@endsection
@section('content')
    <div id="contents">
    	<div class="topControls">
    		<span class="resizeLabel"><input type="radio" name="resize" class="resizeButton" value="0"> Full-sized</span>
    		<span class="resizeLabel"><input type="radio" name="resize" class="resizeButton" value="1"> Fit width</span>
    		<span class="resizeLabel"><input type="radio" name="resize" class="resizeButton" value="2" checked="checked"> Fit screen</span>
    	</div>
    	<div id="imageContainer" data-owidth="{{$image->width}}" data-oheight="{{$image->height}}">
            @include('imageElements')
    		<img id="{{$image->id}}" class="mainImage" src="{{asset('storage/images/'.$image->getFilePath())}}">
    		<div id="imgElementDetails" class="popUp">
    			<span class="closeButton">&#x274C;</span>
    			<div id="zoomedImageHolder">	
    				<canvas id="zoomedImage">			
    				</canvas>
    			</div>
    			<div id="descHolder">
    				<h2 id="popUpTitle"></h2>
    				<p id="popUpSubtitle"></p>
    				<div id="popUpDetails"></div>
    			</div>
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