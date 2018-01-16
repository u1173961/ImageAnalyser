<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateImageTables extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('images', function (Blueprint $table) {
            $table->increments('id');
            $table->string('name', 200);
            $table->string('filePath', 200);
            $table->integer('height');
            $table->integer('width');
            $table->integer('user_id')->unsigned()->nullable();
            $table->timestamps();
        });
            
        Schema::table('images', function($table) {
            $table->foreign('user_id')->references('id')->on('users')->onDelete('set null');
        });
            
        Schema::create('image_elements', function (Blueprint $table) {
            $table->increments('id');
            $table->string('name', 200);
            $table->string('subtitle', 200)->nullable();
            $table->integer('x1');
            $table->integer('x2');
            $table->integer('y1');
            $table->integer('y2');
            $table->integer('height');
            $table->integer('width');
            $table->tinyInteger('appearance');
            $table->string('searchTerms', 100)->nullable();
            $table->string('description', 5000)->nullable();
            $table->string('orientation', 20);
            $table->integer('zIndex');
            $table->integer('image_id')->unsigned();
            $table->timestamps();
        });
        
        Schema::table('image_elements', function($table) {
            $table->foreign('image_id')->references('id')->on('images')->onDelete('cascade');
        });
                
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('image_elements');
        Schema::dropIfExists('images');
    }
}
