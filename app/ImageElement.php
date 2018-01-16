<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class ImageElement extends Model
{
    protected $fillable = ['name', 'subtitle', 'x1', 'x2', 'y1', 'y2', 'height', 'width', 
                            'appearance', 'searchTerms', 'description', 'orientation', 'zIndex'];
    
    /**
     * Get image
     */
    public function image()
    {
        return $this->belongsTo('App\Image');
    }
}
