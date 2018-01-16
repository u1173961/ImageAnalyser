<?php
use Illuminate\Support\Facades\Auth;

Breadcrumbs::register('home', function ($breadcrumbs) {
    $breadcrumbs->push('Images', route('home'));
});
Breadcrumbs::register('listImages', function ($breadcrumbs) {
    $breadcrumbs->push('Images', route('listImages'));
});

Breadcrumbs::register('imageOptions', function ($breadcrumbs, $id) {
    $breadcrumbs->parent('listImages');
    $breadcrumbs->push('Options', route('imageOptions', $id));
});

Breadcrumbs::register('viewImage', function ($breadcrumbs, $id) {
    if (checkEditRights($id)) {
        $breadcrumbs->parent('imageOptions', $id);
    } else {
        $breadcrumbs->parent('listImages');
    }
    $breadcrumbs->push('View', route('viewImage', $id));
});
    
Breadcrumbs::register('updateElements', function ($breadcrumbs, $id) {
    $breadcrumbs->parent('imageOptions', $id);
    $breadcrumbs->push('Update', route('updateElements', $id));
});


function checkEditRights($id) {    
    $image = \App\Image::where('id', $id)->first();
    if ($image) {
        if (Auth::check() && (Auth::user()->admin || $image->user_id == Auth::user()->id)) {
            return true;
        }
    }
    return false;
}