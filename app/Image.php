<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Image extends Model
{
    protected $fillable = ['name', 'filePath', 'height', 'width', 'user_id'];
    
    /**
     * Get path to image inside public/images
     * 
     * @return string
     */
    public function getFilePath()
    {
        return $this->filePath;
    }
    
    /**
     * Get image elements
     */
    public function elements()
    {
        return $this->hasMany('App\ImageElement');
    }
    
    /**
    * Get owner
    */
    public function owner()
    {
        return $this->belongsTo('App\User');
    }
}
