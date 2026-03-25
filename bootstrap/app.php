<?php

use App\Helpers\ApiResponse;
use App\Http\Middleware\HandleAppearance;
use App\Http\Middleware\HandleInertiaRequests;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Database\QueryException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Exceptions\ThrottleRequestsException;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Symfony\Component\HttpKernel\Exception\MethodNotAllowedHttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->encryptCookies(except: ['appearance', 'sidebar_state']);

        $middleware->web(append: [
            HandleAppearance::class,
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
        ]);

        $middleware->alias([
            'role' => \Spatie\Permission\Middleware\RoleMiddleware::class,
            'permission' => \Spatie\Permission\Middleware\PermissionMiddleware::class,
            'role_or_permission' => \Spatie\Permission\Middleware\RoleOrPermissionMiddleware::class,
            'restrict_user' => \App\Http\Middleware\RestrictUserRole::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {

        $exceptions->render(function (Throwable $e, $request) {

            if (! $request->is('api/*')) {
                return null;
            }

            /**
             * 401 Unauthorized
             */
            if ($e instanceof AuthenticationException) {
                return ApiResponse::unauthorized('Anda belum terautentikasi');
            }

            /**
             * 403 Forbidden
             */
            if ($e instanceof AuthorizationException) {
                return ApiResponse::forbidden(
                    $e->getMessage() ?: 'Akses ditolak'
                );
            }

            /**
             * 404 Resource Not Found
             */
            if ($e instanceof ModelNotFoundException) {
                return ApiResponse::notFound('Data tidak ditemukan');
            }

            /**
             * 404 Endpoint Not Found
             */
            if ($e instanceof NotFoundHttpException) {
                return ApiResponse::notFound('Rute tidak ditemukan');
            }

            /**
             * 405 Method Not Allowed
             */
            if ($e instanceof MethodNotAllowedHttpException) {
                return ApiResponse::methodNotAllowed(
                    'Metode tidak diizinkan',
                    405
                );
            }

            /**
             * 422 Validation Failed
             */
            if ($e instanceof ValidationException) {
                return ApiResponse::validationError(
                    $e->errors(),
                    'Validasi gagal'
                );
            }

            /**
             * 429 Too Many Requests
             */
            if ($e instanceof ThrottleRequestsException) {
                $retryAfter = $e->getHeaders()['Retry-After'] ?? null;
                $message = $retryAfter
                    ? "Terlalu banyak percobaan. Silakan coba lagi dalam {$retryAfter} detik."
                    : 'Terlalu banyak percobaan. Silakan coba lagi beberapa saat.';

                return ApiResponse::rateLimited($message, 429, [
                    'retry_after' => $retryAfter,
                ]);
            }

            /**
             * 409 Conflict (Database Errors)
             */
            if ($e instanceof QueryException && ! config('app.debug')) {

                if ($e->getCode() === '23000') {
                    return ApiResponse::conflict('Conflict', 409);
                }

                if (str_contains($e->getMessage(), 'foreign key constraint')) {
                    return ApiResponse::conflict('Conflict', 409);
                }

                return ApiResponse::serverError('Internal server error', 500);
            }

            /**
             * Other HTTP Exceptions
             */
            if ($e instanceof HttpException) {
                return ApiResponse::error(
                    $e->getMessage() ?: 'Error',
                    $e->getStatusCode()
                );
            }

            /**
             * 500 Internal Server Error
             */
            if (! config('app.debug')) {

                Log::error('Unhandled exception', [
                    'exception' => get_class($e),
                    'message' => $e->getMessage(),
                    'file' => $e->getFile(),
                    'line' => $e->getLine(),
                ]);

                return ApiResponse::serverError(
                    'Internal server error',
                    500
                );
            }

            return null;
        });
    })->create();
