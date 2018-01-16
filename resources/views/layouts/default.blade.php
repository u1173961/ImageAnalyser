<!DOCTYPE html>
<html lang="{{ app()->getLocale() }}">
    <head>
        <meta charset="utf-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1">
    
        <!-- CSRF Token -->
        <meta name="csrf-token" content="{{ csrf_token() }}">
    
        <title>Images - @yield('title')</title>
    
        <!-- Styles -->
        <link href="{{ asset('css/app.css') }}" rel="stylesheet">
        <link href="{{ asset('css/main.css') }}" rel="stylesheet">
                
        <!-- Scripts -->
        <script src="{{ asset('js/app.js') }}"></script>
		<script src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.3/jquery.min.js"></script>
		<script src="//code.jquery.com/ui/1.11.4/jquery-ui.js"></script>
        <script> $.ajaxSetup({ headers: { 'X-CSRF-TOKEN' : '{{ csrf_token() }}' } }); </script>
        <script src="{{ asset('js/main.js') }}"></script>
        @stack('scripts')
        <script src="{{ asset('js/prototype.js') }}"></script>
    </head>
    <body>
    	<div id="wrapper">
    		<div id="header">
                <div class="container-fluid">
                    <ul class="nav navbar-nav navbar-right login">
                        <!-- Authentication Links -->
                        @guest
                            @if(Route::getFacadeRoot()->current()->uri() != 'login')
                                <li><a href="{{ route('login') }}">Login</a></li>
                            @endif
                            <li><a href="{{ route('register') }}">Register</a></li>
                        @else
                            <li class="dropdown">
                                <a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-expanded="false" aria-haspopup="true">
                                    {{ Auth::user()->name }} <span class="caret"></span>
                                </a>
                                <ul class="dropdown-menu">
                                    <li>
                                        <a href="{{ route('logout') }}"
                                            onclick="event.preventDefault();
                                                     document.getElementById('logout-form').submit();">
                                            Logout
                                        </a>
        
                                        <form id="logout-form" action="{{ route('logout') }}" method="POST" style="display: none;">
                                            {{ csrf_field() }}
                                        </form>
                                    </li>
                                </ul>
                            </li>
                       @endguest
                    </ul>
    			</div>
            	@yield('breadcrumbs')
    			<h1 class="title"><u>@yield('title')</u></h1>
    		</div>
    		<div id="content">
            	@include('messages')
            	@yield('content')
            </div>
            <div id="loginWindow" class="hidden"></div>
        </div>
		@yield('footer')
    </body>
</html>
