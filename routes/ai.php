<?php

use App\Http\Controllers\ChatSessionController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| ARTIFICIAL INTELLIGENCE MODULE
|--------------------------------------------------------------------------
|
| All master data-related endpoints:
|   - Cities
|
| Middleware: auth, verified (where required)
|--------------------------------------------------------------------------
*/

Route::middleware(['auth', 'verified', 'restrict_user'])->group(function () {
    Route::prefix('ai')->name('ai.')->group(function () {

        /*
        |--------------------------------------------------------------------------
        | CHAT SESSIONS
        |--------------------------------------------------------------------------
        | GET    /ai/chat-sessions                     -> List chat sessions
        | GET    /ai/chat-sessions/create              -> Show create form
        | DELETE /ai/chat-sessions/{chatSession}       -> Delete chat session
        |--------------------------------------------------------------------------
        */
        Route::prefix('chat-sessions')->name('chat-sessions.')->group(function () {
            Route::get('/', [ChatSessionController::class, 'index'])
                ->middleware('permission:view-ai-chat-sessions')
                ->name('index');

            Route::get('/{chatSession}', [ChatSessionController::class, 'show'])
                ->middleware('permission:view-ai-chat-sessions')
                ->name('show');

            Route::delete('/{chatSession}', [ChatSessionController::class, 'destroy'])
                ->middleware('permission:delete-ai-chat-sessions')
                ->name('destroy');
        });
    });
});
