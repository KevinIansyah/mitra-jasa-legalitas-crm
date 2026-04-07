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
use Illuminate\Session\TokenMismatchException;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
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
            'customer.owns.project' => \App\Http\Middleware\EnsureProjectOwnedByCustomer::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {

        $exceptions->render(function (Throwable $e, $request) {

            $isApi = $request->is('api/*');

            // ----------------------------------------------------------------
            // API Exceptions
            // ----------------------------------------------------------------
            if ($isApi) {

                if ($e instanceof AuthenticationException) {
                    return ApiResponse::unauthorized('Anda belum terautentikasi');
                }

                if ($e instanceof AuthorizationException) {
                    return ApiResponse::forbidden($e->getMessage() ?: 'Akses ditolak');
                }

                if ($e instanceof ModelNotFoundException || $e instanceof NotFoundHttpException) {
                    return ApiResponse::notFound(
                        $e instanceof ModelNotFoundException ? 'Data tidak ditemukan' : 'Rute tidak ditemukan'
                    );
                }

                if ($e instanceof MethodNotAllowedHttpException) {
                    return ApiResponse::methodNotAllowed('Metode tidak diizinkan', 405);
                }

                if ($e instanceof ValidationException) {
                    return ApiResponse::validationError($e->errors(), 'Validasi gagal');
                }

                if ($e instanceof ThrottleRequestsException) {
                    $retryAfter = $e->getHeaders()['Retry-After'] ?? null;
                    $message = $retryAfter
                        ? "Terlalu banyak percobaan. Silakan coba lagi dalam {$retryAfter} detik."
                        : 'Terlalu banyak percobaan. Silakan coba lagi beberapa saat.';

                    return ApiResponse::rateLimited($message, 429, ['retry_after' => $retryAfter]);
                }

                if ($e instanceof QueryException && ! config('app.debug')) {
                    if ($e->getCode() === '23000' || str_contains($e->getMessage(), 'foreign key constraint')) {
                        return ApiResponse::conflict('Conflict', 409);
                    }

                    return ApiResponse::serverError('Internal server error', 500);
                }

                if ($e instanceof HttpException) {
                    return ApiResponse::error($e->getMessage() ?: 'Error', $e->getStatusCode());
                }

                if (! config('app.debug')) {
                    Log::error('Unhandled API exception', [
                        'exception' => get_class($e),
                        'message' => $e->getMessage(),
                        'file' => $e->getFile(),
                        'line' => $e->getLine(),
                    ]);

                    return ApiResponse::serverError('Internal server error', 500);
                }

                return null;
            }

            // ----------------------------------------------------------------
            // Web Exceptions (Inertia)
            // ----------------------------------------------------------------

            // Biarkan Laravel handle sendiri
            if (
                $e instanceof ValidationException
                || $e instanceof AuthenticationException
                || $e instanceof ThrottleRequestsException
            ) {
                return null;
            }

            // 419
            if ($e instanceof TokenMismatchException) {
                return Inertia::render('errors/419')
                    ->toResponse($request)
                    ->setStatusCode(419);
            }

            // 404
            if ($e instanceof ModelNotFoundException) {
                return Inertia::render('errors/404', ['message' => null])
                    ->toResponse($request)
                    ->setStatusCode(404);
            }

            // 403
            if ($e instanceof AuthorizationException) {
                return Inertia::render('errors/403', ['message' => $e->getMessage() ?: null])
                    ->toResponse($request)
                    ->setStatusCode(403);
            }

            if ($e instanceof HttpException) {
                $status = $e->getStatusCode();
                $msg = $e->getMessage();

                return match (true) {
                    $status === 404 => Inertia::render('errors/404', ['message' => $msg ?: null])
                        ->toResponse($request)->setStatusCode(404),
                    $status === 403 => Inertia::render('errors/403', ['message' => $msg ?: null])
                        ->toResponse($request)->setStatusCode(403),
                    $status === 419 => Inertia::render('errors/419')
                        ->toResponse($request)->setStatusCode(419),
                    $status === 503 => Inertia::render('errors/503', [
                        'message' => $msg && $msg !== 'Service Unavailable' ? $msg : null,
                    ])
                        ->toResponse($request)->setStatusCode(503),
                    $status >= 500 && ! config('app.debug') => Inertia::render('errors/500', ['message' => null])
                        ->toResponse($request)->setStatusCode($status),
                    default => null,
                };
            }

            if (! config('app.debug')) {
                Log::error('Unhandled web exception', [
                    'exception' => get_class($e),
                    'message' => $e->getMessage(),
                    'file' => $e->getFile(),
                    'line' => $e->getLine(),
                ]);

                return Inertia::render('errors/500', ['message' => null])
                    ->toResponse($request)
                    ->setStatusCode(500);
            }

            return null;
        });
    })->create();
