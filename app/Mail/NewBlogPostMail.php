<?php

namespace App\Mail;

use App\Models\Blog;
use App\Models\BlogSubscriber;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class NewBlogPostMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(
        public readonly Blog $blog,
        public readonly BlogSubscriber $subscriber,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "Artikel Baru: {$this->blog->title}",
        );
    }

    public function content(): Content
    {
        $r2Url = rtrim(config('filesystems.disks.r2_public.url', ''), '/');

        return new Content(
            view: 'emails.client.new-blog-post',
            with: [
                'name' => $this->subscriber->name,
                'title' => $this->blog->title,
                'excerpt' => $this->blog->short_description,
                'url' => url("/blog/{$this->blog->slug}"),
                'featuredImage' => $this->blog->featured_image ? "{$r2Url}/{$this->blog->featured_image}" : null,
                'unsubscribeUrl' => url("/blog/unsubscribe/{$this->subscriber->token}"),
            ],
        );
    }
}
