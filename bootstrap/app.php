<?php

use App\Helpers\ApiResponse;
use App\Http\Middleware\HandleAppearance;
use App\Http\Middleware\HandleInertiaRequests;
use Illuminate\Database\QueryException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;
use Illuminate\Http\Exceptions\ThrottleRequestsException;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Symfony\Component\HttpKernel\Exception\MethodNotAllowedHttpException;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__ . '/../routes/web.php',
        api: __DIR__ . '/../routes/api.php',
        commands: __DIR__ . '/../routes/console.php',
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
                return ApiResponse::unauthorized('Unauthorized');
            }

            /**
             * 403 Forbidden
             */
            if ($e instanceof AuthorizationException) {
                return ApiResponse::forbidden(
                    $e->getMessage() ?: 'Forbidden'
                );
            }

            /**
             * 404 Resource Not Found
             */
            if ($e instanceof ModelNotFoundException) {
                return ApiResponse::notFound('Resource not found');
            }

            /**
             * 404 Endpoint Not Found
             */
            if ($e instanceof NotFoundHttpException) {
                return ApiResponse::notFound('Endpoint not found');
            }

            /**
             * 405 Method Not Allowed
             */
            if ($e instanceof MethodNotAllowedHttpException) {
                return ApiResponse::methodNotAllowed(
                    'Method not allowed',
                    405
                );
            }

            /**
             * 422 Validation Failed
             */
            if ($e instanceof ValidationException) {
                return ApiResponse::validationError(
                    $e->errors(),
                    'Validation failed'
                );
            }

            /**
             * 429 Too Many Requests
             */
            if ($e instanceof ThrottleRequestsException) {
                return ApiResponse::rateLimited(
                    'Too many requests',
                    429,
                    [
                        'retry_after' => $e->getHeaders()['Retry-After'] ?? null,
                    ]
                );
            }

            /**
             * 409 Conflict (Database Errors)
             */
            if ($e instanceof QueryException && !config('app.debug')) {

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
            if (!config('app.debug')) {

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
