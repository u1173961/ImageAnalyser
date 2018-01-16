<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Auth;
use App\Http\Helpers\ImageHelper as Helper;
use App\ImageElement;

class ImageManagementController extends Controller
{
    private $user = null;
    
    public function __construct()
    {
        $this->middleware('auth');
        $this->middleware(function ($request, $next) {
            $this->user= Auth::user();
            return $next($request);
        });
    }
    
    public function addImage()
    {
        $request = request();
        $ok = false;
        if($request->hasFile('imageUpload')) {
            $post = $request->post();
            $image = $request->file('imageUpload');
            $ok = Helper::createImage($post['name'], $image, $this->user->id);
        }        
        if ($ok) {
            return redirect('/listImages/s');
        }
        return redirect('/listImages/e');
    }
    
    public function updateElements($id)
    {
        $image = \App\Image::where('id', $id)->first();
        if (!$image) {
            return redirect('/listImages');
        } else if (!$this->authUpdates($image->user_id)) {
            return redirect('/imageOptions/'.$id);
        }
        $imageElements = $image->elements;
        return view('addEditElements', ['image' => $image, 'imageElements' => $imageElements]);
    }
    
    public function addEditImgElements($imgID) {
        $post = request()->post();
        $response = array();
        $image = \App\Image::where('id', $imgID)->first();
        if ($image && $this->authUpdates($image->user_id)) {            
            $fieldsAndValues = $post['fieldsAndValues'];
            $fieldsAndValues['orientation'] = Helper::calcOrientation($fieldsAndValues['x1'], $image->width);
            $fieldsAndValues['zIndex'] = Helper::calcZIndex($fieldsAndValues['width']*$fieldsAndValues['height'], $image->width*$image->height);
            if (!empty($post['where'])) {
                $ok = Helper::updateImageElement($fieldsAndValues, $post['where']);
                $response['message'] = !$ok ? 'Error: element not updated!' : 'Success: element updated!';
                $response['error'] = !$ok;
            } else {
                $id = Helper::createImageElement($imgID, $fieldsAndValues);
                $ok = $id !== false;
                if ($ok) {
                    $response['error'] = false;
                    $response['message'] = 'Success: element created!';
                    $response['id'] = $id;
                } else {
                    $response['error'] = true;
                    $response['message'] = 'Error: element not created!';
                }
            }
            if ($ok) {
                $response['orientation'] = $fieldsAndValues['orientation'];
                $response['zIndex'] = $fieldsAndValues['zIndex'];
            }
        } else {
            $response = $this->getDeniedResponse();
        }
        header('Content-Type: application/json');
        echo json_encode($response);
    }
    
    public function deleteImage()
    {
        $post = request()->post();
        $image = \App\Image::where('id', $post['id'])->first();
        if ($image && $this->authUpdates($image->user_id)) {  
            $ok = Helper::deleteImage($image);
            $message = !$ok ? 'Error: image not deleted!' : 'Success: image deleted!';
            $response = array('error' => !$ok, 'message' => $message);
        } else {
            $response = $this->getDeniedResponse();
            
        }
        header('Content-Type: application/json');
        echo json_encode($response);
    }
    
    public function deleteElement()
    {
        $post = request()->post();
        $id = $post['id'];
        $element = ImageElement::where('id', $id)->first();
        if ($element && $this->authUpdates($element->image->user_id)) {  
            $ok = Helper::deleteElement($id);
            $message = !$ok ? 'Error: element not deleted!' : 'Success: element deleted!';
            $response = array('error' => !$ok, 'message' => $message);
        } else {
            $response = $this->getDeniedResponse();
            
        }
        header('Content-Type: application/json');
        echo json_encode($response);
    }
    
    private function authUpdates($owner) {
        return $this->user->id == $owner || $this->user->admin;
    }
    
    private function getDeniedResponse() {
        return ['error' => true, 'message' => 'Error: Access Denied!'];
    }
}
