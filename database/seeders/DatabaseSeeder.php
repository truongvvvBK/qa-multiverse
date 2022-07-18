<?php

namespace Database\Seeders;

use App\Models\Post;
use App\Models\PostTag;
use App\Models\Tag;
use App\Models\User;
use App\Models\Vote;
use Illuminate\Database\Seeder;
use Faker\Factory as Faker;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     *
     * @return void
     */
    public function run()
    {
        $faker = Faker::create();

        $this->call([UniversitySeeder::class]);
        User::factory(50)->create();
        Tag::factory(150)->create();
        Post::factory(300)->create();

        DB::table('users')->insert([
            'display_name' => 'Admin',
            'email' => 'admin@qa.com',
            'password' => Hash::make('123123123')
        ]);

        foreach (range(1, 300) as $postId) {
            PostTag::factory()->create([
                'post_id' => $postId,
                'tag_id' => rand(1, 150)
            ]);
            $post = Post::find($postId);

            $acceptedAnswerPost = null;
            foreach (range(1, 5) as $i) {
                $childPosts = Post::factory()->create([
                    'user_id' => rand(1, 50),
                    'university_id' => $post->university_id,
                    'title' => $faker->sentence(),
                    'body' => $faker->paragraph(5),
                    'parent_id' => $postId
                ]);

                if ($i === 1) {
                    $acceptedAnswerPost = $childPosts;
                }
            }

            $post->accepted_answer_id = $acceptedAnswerPost->id;
            $post->save();
        }

        $voteTypes = ['upvote', 'downvote'];
        foreach (range(1, 10000) as $i) {
            Vote::factory()->create([
                'user_id' => rand(1, 51),
                'post_id' => rand(1, 1800),
                'vote_type' => $voteTypes[rand(0, 1)]
            ]);
        }
    }
}
