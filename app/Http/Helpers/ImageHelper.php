<?php
namespace App\Http\Helpers;

use App\Image;
use App\ImageElement;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Storage;
use Mews\Purifier\Facades\Purifier;

class ImageHelper
{    
    /**
     * Calculate orientation of image element for displaying name tag
     * @param int $startX
     * @param int $imageWidth
     * 
     * @return string
     */
    public static function calcOrientation($startX, $imageWidth) {
        if($startX < ($imageWidth/3)*0.9) {
            $orientation = "leftImage";
        } elseif($startX < ($imageWidth/1.5015)*1.1) {
            $orientation = "centreImage";
        } else {
            $orientation = "rightImage";
        }
        return $orientation;
    }
    
    /**
     * Calculate z-index of image element giving precedence
     * to smaller elements (minimise overlap)
     * @param int $elementArea
     * @param int $imageArea
     *
     * @return int
     */
    public static function calcZIndex($elementArea, $imageArea) {
        $min = 0;
        $max = 998;
        $bigEl = $imageArea*0.075;
        return max($min, round((1-($elementArea/$bigEl))*$max));
    }
    
    /**
     * Create Image and store uploaded file
     * @param String $name
     * @param \Illuminate\Http\UploadedFile $upload
     * 
     * @return int|boolean
     */
    public static function createImage($name, $upload, $userID) {
        $path = $upload->store('public/images');
        $size = getimagesize(storage_path().'/app/'.$path);
        if ($size) {
            $file = explode('/', $path);
            $filename = array_pop($file);
            //shared server (no symlinks) workaround
            if (App::environment('prod')) {
                Storage::disk('shared')->put($filename, file_get_contents($upload));
            }
            $image = new Image(array('name' => $name, 'filePath' => $filename, 'height' => $size[1], 
                                'width' => $size[0], 'user_id' => $userID));
            if($image->save()) {
                return $image->id;
            }
        }
        return false;
    }
    
    /**
     * Create ImageElement
     * @param int $imgID
     * @param array $attr
     * 
     * @return int|boolean
     */
    public static function createImageElement($imgID, array $attr) {
        $element = new ImageElement(self::sanitiseInput($attr));
        $element->image_id = $imgID;
        if($element->save()) {
            return $element->id;
        }
        return false;
    }
    
    /**
     * Update ImageElement
     * @param array $attr
     * @param String $where
     * 
     * @return int
     */
    public static function updateImageElement(array $attr, $where) {
        $element = ImageElement::where($where)->first();
        $element->fill(self::sanitiseInput($attr));
        return $element->save();
    }
    
    /**
     * Delete Image
     * @param Image $image
     * 
     * @return int
     */
    public static function deleteImage(Image $image)
    {
        $file = $image->getFilePath();
        $ok = Image::destroy($image->id);
        if ($ok) {
            Storage::delete('public/images/'.$file);
            //shared server (no symlinks) workaround
            if (App::environment('prod') && file_exists(public_path('/storage/images/'.$file))) {
                Storage::disk('shared')->delete($file);
            }
        }
        return $ok;
    }
    
    /**
     * Delete ImageElement
     * @param int $id
     *
     * @return int
     */
    public static function deleteElement($id)
    {
        return ImageElement::destroy($id);
    }
    
    public static function sanitiseInput($attr)
    {
        return Purifier::clean($attr);
    }
}