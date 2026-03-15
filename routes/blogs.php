<?php

use App\Http\Controllers\Blogs\BlogAiGenerateController;
use App\Http\Controllers\Blogs\BlogCategoryController;
use App\Http\Controllers\Blogs\BlogController;
use App\Http\Controllers\Blogs\BlogTagController;
use App\Http\Controllers\Services\ServiceAiGenerateController;
use App\Http\Controllers\Services\ServiceCategoryController;
use App\Http\Controllers\Services\ServiceCityPageController;
use App\Http\Controllers\Services\ServiceController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| BLOGS MODULE
|--------------------------------------------------------------------------
| All blog-related endpoints:
|   - Blogs
|   - Blog Categories
|   - Blog Tags
|
| Middleware: auth, verified, restrict_user
|--------------------------------------------------------------------------
*/

Route::middleware(['auth', 'verified', 'restrict_user'])->group(function () {

  /*
    |--------------------------------------------------------------------------
    | BLOGS
    |--------------------------------------------------------------------------
    | GET    /blogs                -> List blogs
    | GET    /blogs/create         -> Show create form
    | POST   /blogs                -> Store blog
    | GET    /blogs/{blog}/edit    -> Show edit form
    | DELETE /blogs/{blog}         -> Delete blog
    |
    | Blog Content Management
    | POST   /blogs/{blog}/basic-information  -> Update basic information
    | PATCH  /blogs/{blog}/content            -> Update content
    | PATCH  /blogs/{blog}/seo                -> Update SEO
    |
    | AI Generate
    | POST   /blogs/{blog}/ai/generate/content  -> Generate content
    | POST   /blogs/{blog}/ai/generate/seo      -> Generate SEO
    |--------------------------------------------------------------------------
    */

  Route::prefix('blogs')->name('blogs.')->group(function () {

    Route::get('/', [BlogController::class, 'index'])
      ->middleware('permission:view-blogs')
      ->name('index');

    Route::get('/create', [BlogController::class, 'create'])
      ->middleware('permission:create-blogs')
      ->name('create');

    Route::post('/', [BlogController::class, 'store'])
      ->middleware('permission:create-blogs')
      ->name('store');

    Route::get('/{blog}/edit', [BlogController::class, 'edit'])
      ->middleware('permission:edit-blogs')
      ->name('edit');

    Route::delete('/{blog}', [BlogController::class, 'destroy'])
      ->middleware('permission:delete-blogs')
      ->name('destroy');

    Route::prefix('{blog}')->middleware('permission:edit-blogs')->group(function () {

      Route::post('/basic-information', [BlogController::class, 'updateBasicInformation'])
        ->name('update.basic-information');

      Route::patch('/content', [BlogController::class, 'updateContent'])
        ->name('update.content');

      Route::post('/seo', [BlogController::class, 'updateSeo'])
        ->name('update.seo');

      Route::prefix('ai/generate')->middleware('permission:create-ai-generate')->name('ai.generate.')->group(function () {
          Route::post('/content', [BlogAiGenerateController::class, 'content'])->name('content');
          Route::post('/seo', [BlogAiGenerateController::class, 'seo'])->name('seo');
        });
    });

    /*
      |--------------------------------------------------------------------------
      | BLOG CATEGORIES
      |--------------------------------------------------------------------------
      | GET    /blogs/categories                  -> List categories
      | POST   /blogs/categories                  -> Store category
      | PATCH  /blogs/categories/{category}       -> Update category
      | DELETE /blogs/categories/{category}       -> Delete category
      |--------------------------------------------------------------------------
      */

    Route::prefix('categories')->name('categories.')->group(function () {

      Route::get('/', [BlogCategoryController::class, 'index'])
        ->middleware('permission:view-blog-categories')
        ->name('index');

      Route::post('/', [BlogCategoryController::class, 'store'])
        ->middleware('permission:create-blog-categories')
        ->name('store');

      Route::patch('/{category}', [BlogCategoryController::class, 'update'])
        ->middleware('permission:edit-blog-categories')
        ->name('update');

      Route::delete('/{category}', [BlogCategoryController::class, 'destroy'])
        ->middleware('permission:delete-blog-categories')
        ->name('destroy');
    });

    /*
      |--------------------------------------------------------------------------
      | BLOG TAGS
      |--------------------------------------------------------------------------
      | GET    /blogs/tags             -> List tags
      | POST   /blogs/tags             -> Store tag
      | PATCH  /blogs/tags/{tag}       -> Update tag
      | DELETE /blogs/tags/{tag}       -> Delete tag
      |--------------------------------------------------------------------------
      */
    Route::prefix('tags')->name('tags.')->group(function () {
      Route::get('/', [BlogTagController::class, 'index'])
        ->middleware('permission:view-blog-tags')
        ->name('index');

      Route::post('/', [BlogTagController::class, 'store'])
        ->middleware('permission:create-blog-tags')
        ->name('store');

      Route::patch('/{tag}', [BlogTagController::class, 'update'])
        ->middleware('permission:edit-blog-tags')
        ->name('update');

      Route::delete('/{tag}', [BlogTagController::class, 'destroy'])
        ->middleware('permission:delete-blog-tags')
        ->name('destroy');
    });
  });
});
