<div class="container login">
    <div class="row">
        <div class="col-md-8 col-md-offset-2 loginPanel">
            <div class="panel panel-default">
                <div class="panel-body">
        			<div class="error-msg hidden"><p></p></div>
        			<div class="success-msg hidden"><p></p></div>
        			<div class="warning-msg hidden"><p></p></div>
                    <form id="ajaxLogin" class="form-horizontal" method="POST" action="{{ route('ajaxLogin') }}">
                        {{ csrf_field() }}
                        <div class="form-group">
                            <label for="username" class="col-md-4 control-label">Username</label>

                            <div class="col-md-6">
                                <input id="username" type="text" class="form-control field" name="username" value="" required autofocus>
                            </div>
                        </div>
                        <div class="form-group">
                            <label for="password" class="col-md-4 control-label">Password</label>

                            <div class="col-md-6">
                                <input id="password" type="password" class="form-control field" name="password" required>
                            </div>
                        </div>
                        <div class="form-group">
                            <div class="col-md-8 col-md-offset-4">
                                <button id="login" type="submit" class="btn btn-primary">
                                    Login
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
</div>