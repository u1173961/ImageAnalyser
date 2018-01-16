<?php

use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return redirect('/listImages');
})->name('home');

Route::get('/listImages/{upload?}', function ($upload = false) {
    $images = orderImages();
    $userHasImages = Auth::check() && count(Auth::user()->images) > 0;
    $params = ['images' => $images, 'userHasImages' => $userHasImages, 'upload' => $upload];
    if ($upload) {
        if ($upload === 'e') {
            $params['message'] = 'Error: image not created!';
            $params['error'] = true;
        } else {
            $params['message'] = 'Success: image created!';
            $params['error'] = false;
        }
    }
    return view('listImages', $params);
})->name('listImages');

Route::get('/imageOptions/{id}', function ($id) {
    $image = \App\Image::where('id', $id)->first();
    if (!$image) {
        return redirect('/listImages');
    }
    if (Auth::check() && (Auth::user()->admin || $image->user_id == Auth::user()->id)) {
        return view('imageOptions', ['image' => $image]);
    }
    return redirect('/viewImage/'.$id);
})->name('imageOptions'); 

Route::get('/viewImage/{id}', function ($id) {
    $imageElements = \App\ImageElement::where('image_id', $id)->get();
    $image = \App\Image::where('id', $id)->first();
    if (!$image) {
        return redirect('/listImages');
    }
    return view('viewImage', ['imageElements' => $imageElements, 'image' => $image]);
})->name('viewImage');

Route::get('/updateElements/{id}', 'ImageManagementController@updateElements')->name('updateElements');
Route::post('/addEditImgElements/{imgID}', 'ImageManagementController@addEditImgElements')->name('addEditElements');
Route::post('/deleteElement', 'ImageManagementController@deleteElement')->name('deleteElement');
Route::post('/addImage', 'ImageManagementController@addImage')->name('addImage');
Route::post('/deleteImage', 'ImageManagementController@deleteImage')->name('deleteImage');

Auth::routes();
Route::post('/ajaxLogin', 'Auth\LoginController@ajaxLogin')->name('ajaxLogin');
Route::get('/getAjaxLogin', function () {
    $loggedIn = Auth::check();
    $html = !$loggedIn ? view('auth\loginAjax')->render() : '';
    return ['loggedIn' => $loggedIn, 'html' => $html];
})->name('getAjaxLogin');


function orderImages() {
    if (Auth::check()) {
        $images = \App\Image::orderBy(DB::raw('ABS(CAST(user_id AS SIGNED)-'.Auth::user()->id.')'),'ASC')->get();
    } else {
        $images = \App\Image::orderBy('updated_at')->get();
    }
    return $images;
}
