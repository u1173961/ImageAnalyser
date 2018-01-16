<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Foundation\Auth\AuthenticatesUsers;
use Illuminate\Support\Facades\Auth;

class LoginController extends Controller
{
    use AuthenticatesUsers;

    /**
     * Where to redirect users after login.
     *
     * @var string
     */
    protected $redirectTo = '/';

    /**
     * Create a new controller instance.
     *
     * @return void
     */
    public function __construct()
    {
        $this->middleware('guest')->except('logout');
    }
    
    public function username()
    {
        return 'username';
    }
    
    /**
     * Allow ajax login for expired sessions
     */
    public function ajaxLogin()
    {
        $request = request();
        
        $this->validateLogin($request); 
        
        if ($this->hasTooManyLoginAttempts($request)) {
            $this->fireLockoutEvent($request);
        } else if ($this->attemptLogin($request)) {
            echo json_encode(['valid' => true]);
        } else {
            $this->incrementLoginAttempts($request);
            echo json_encode(['valid' => false]);
        }
    }
}
