<?php

namespace App\Observers;

use App\Models\Blog;
use App\Services\BlogSchemaBuilderService;

class BlogObserver
{
  public function updated(Blog $blog): void
  {
    if (!$blog->wasChanged(['title', 'slug'])) return;

    $blog->load(['seo', 'category', 'author', 'tags']);
    $blog->seo?->updateQuietly([
      'schema_markup' => BlogSchemaBuilderService::build($blog),
    ]);
  }
}
