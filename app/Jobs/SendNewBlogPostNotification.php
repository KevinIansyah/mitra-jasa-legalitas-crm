<?php

namespace App\Jobs;

use App\Mail\NewBlogPostMail;
use App\Models\Blog;
use App\Models\BlogSubscriber;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Mail;

class SendNewBlogPostNotification implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        public readonly Blog $blog
    ) {}

    public function handle(): void
    {
        BlogSubscriber::verified()
            ->chunk(100, function ($subscribers) {
                foreach ($subscribers as $subscriber) {
                    Mail::to($subscriber->email)
                        ->queue(new NewBlogPostMail($this->blog, $subscriber));
                }
            });
    }
}
