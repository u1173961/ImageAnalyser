@extends('layouts.default')
@auth
    @push('scripts')
        <script src="{{ asset('js/deleteImage.js') }}"></script>
    	<script src="{{ asset('js/common.js') }}"></script>
    @endpush
@endauth
@section('title', $image->name)
@section('breadcrumbs')
	{{ Breadcrumbs::render('imageOptions', $image->id) }}
@endsection
@section('content')
    <div id="contents">
        <div class="links">
    		<a href="/viewImage/{{$image->id}}">View Image</a>
        	@auth
        		@if (Auth::user()->admin || $image->user_id == Auth::user()->id)
            		<a href="/updateElements/{{$image->id}}">Add/Edit Elements</a>
        			<span id="deleteImage" class="button delete" data-image="{{$image->id}}">Delete</span>
    			@endif
    		@endauth
        </div>
    </div>
@endsection
@section('footer')
	<div class="footer">
        <div class="container">
			<a href="/">Image List &#10226;</a>
		</div>
	</div>
@endsection