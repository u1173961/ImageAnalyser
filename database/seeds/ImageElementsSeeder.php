<?php

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ImageElementsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $path = 'database/imageTables.sql';
        DB::unprepared(file_get_contents($path));
        $this->command->info('Image Elements seeded!');
    }
}
