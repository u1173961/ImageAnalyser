@extends('layouts.default')
@auth
    @push('scripts')
        <script src="{{ asset('js/listImages.js') }}"></script>
    @endpush
@endauth
@section('title', 'Image Selection')
@section('content')
    <div id="contents">
    	@auth
    		@if ($userHasImages)
        		<div class="topControls">
            		<span class="toggleMyImages"><input type="radio" name="toggleMyImages" class="toggleButton" value="0" checked="checked">My Images</span>
            		<span class="toggleMyImages"><input type="radio" name="toggleMyImages" class="toggleButton" value="1"> All Images</span>
        		</div>
        	@endif
    	@endauth
        <div class="links thumbs">
            <div class="row">
                @foreach ($images as $image)
                	<div class="{{ $userHasImages ? $image->user_id == Auth::user()->id ? ' mine' : ' notMine' : '' }} col-xs-12 col-sm-6 col-md-3 thumbHolder">
                        <a href="/imageOptions/{{$image->id}}" class="thumbnail">
                        	{{ $image->name }}
                    		<img src="{{asset('storage/images/'.$image->getFilePath())}}" alt="{{ $image->name }}">
                        </a>
                	</div>
                @endforeach          
            </div>
        </div>
    	@auth
    		<div id="addImageHolder">
    			<div id="showAddImage">
        			<span id="addImageLabel">Add Image</span>        			
					@if ($upload)
            			<span class="arrow hidden">&#8690;</span>
            			<span class="arrow">&#8689;</span>
    				@else
            			<span class="arrow">&#8690;</span>
            			<span class="arrow hidden">&#8689;</span>
    				@endif
    			</div>
				@if ($upload)
        			<div id="addImage">
				@else
        			<div id="addImage" class="hidden">
				@endif
        			<form id="addImageForm" action="/addImage" method="post" enctype="multipart/form-data">
    					{{ csrf_field() }}
        				<span>Display Name: </span> <input id="name" class="field" type="text" name="name" value="">
        				<input type="file" name="imageUpload" id="imageUpload" accept=".png, .jpg, .jpeg">
        				<input type="submit" value="Upload">
        			</form>
        		</div>
        	</div>
		@endauth
    </div>
@endsection