@if(isset($imageElements))
    @foreach ($imageElements as $el)
    	<div id="{{$el->id}}" class="imageElement notNew" 
            style="height: {{$el->height}}px; width: {{$el->width}}px; 
             z-index: {{$el->zIndex}}; margin-left: {{$el->x1}}px; margin-top: {{$el->y1}}px;"
            data-name="{{$el->name}}"  data-subtitle="{{$el->subtitle}}" data-appearance="{{$el->appearance}}" 
            data-searchterms="{{$el->searchTerms}}" data-description="{{$el->description}}" data-zindex="{{$el->zIndex}}" >
        	<span class="nameTag textShadow1 hidden {{$el->orientation}}">{{$el->name}}</span>
        </div>
    @endforeach
@endif