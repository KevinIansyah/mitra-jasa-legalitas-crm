<?php

namespace App\Providers;

use App\Actions\Fortify\CreateNewUser;
use App\Actions\Fortify\ResetUserPassword;
use App\Models\User;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Laravel\Fortify\Features;
use Laravel\Fortify\Fortify;

class FortifyServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->configureActions();
        $this->configureViews();
        $this->configureRateLimiting();
    }

    /**
     * Configure Fortify actions.
     */
    private function configureActions(): void
    {
        Fortify::resetUserPasswordsUsing(ResetUserPassword::class);
        Fortify::createUsersUsing(CreateNewUser::class);

        Fortify::authenticateUsing(function (Request $request) {
            $user = User::where('email', $request->email)->first();

            if (! $user || ! \Illuminate\Support\Facades\Hash::check($request->password, $user->password)) {
                return null;
            }

            if ($user->status === 'suspended') {
                throw ValidationException::withMessages([
                    Fortify::username() => __('Akun Anda telah disuspend. Hubungi administrator.'),
                ]);
            }

            return $user;
        });
    }

    /**
     * Configure Fortify views.
     */
    private function configureViews(): void
    {
        Fortify::loginView(fn(Request $request) => Inertia::render('auth/login', [
            'canResetPassword' => Features::enabled(Features::resetPasswords()),
            'canRegister' => Features::enabled(Features::registration()),
            'status' => $request->session()->get('status'),
        ]));

        Fortify::resetPasswordView(fn(Request $request) => Inertia::render('auth/reset-password', [
            'email' => $request->email,
            'token' => $request->route('token'),
        ]));

        Fortify::requestPasswordResetLinkView(fn(Request $request) => Inertia::render('auth/forgot-password', [
            'status' => $request->session()->get('status'),
        ]));

        Fortify::verifyEmailView(fn(Request $request) => Inertia::render('auth/verify-email', [
            'status' => $request->session()->get('status'),
        ]));

        Fortify::registerView(fn() => Inertia::render('auth/register'));

        Fortify::twoFactorChallengeView(fn() => Inertia::render('auth/two-factor-challenge'));

        Fortify::confirmPasswordView(fn() => Inertia::render('auth/confirm-password'));
    }

    /**
     * Configure rate limiting.
     */
    private function configureRateLimiting(): void
    {
        RateLimiter::for('two-factor', function (Request $request) {
            return Limit::perMinute(5)->by($request->session()->get('login.id'));
        });

        RateLimiter::for('login', function (Request $request) {
            $throttleKey = Str::transliterate(Str::lower($request->input(Fortify::username())) . '|' . $request->ip());

            return Limit::perMinute(5)->by($throttleKey);
        });

        RateLimiter::for('auth-register', function (Request $request) {
            return [
                Limit::perMinute(3)->by('auth-reg:ip:' . $request->ip()),
                Limit::perDay(10)->by('auth-reg:ip-day:' . $request->ip()),
            ];
        });

        RateLimiter::for('auth-otp', function (Request $request) {
            $email = Str::lower((string) $request->input('email', ''));

            return [
                Limit::perMinute(5)->by('auth-otp:email:' . $email),
                Limit::perMinute(10)->by('auth-otp:ip:' . $request->ip()),
                Limit::perDay(20)->by('auth-otp:ip-day:' . $request->ip()),
            ];
        });

        RateLimiter::for('auth-login', function (Request $request) {
            $email = Str::lower((string) $request->input('email', ''));

            return [
                Limit::perMinute(5)->by('auth-login:email:' . $email),
                Limit::perMinute(20)->by('auth-login:ip:' . $request->ip()),
                Limit::perDay(100)->by('auth-login:ip-day:' . $request->ip()),
            ];
        });

        RateLimiter::for('contact-form', function (Request $request) {
            $waKey = (string) $request->input('whatsapp_number', '');
            $waNormalized = (string) Str::of($waKey)->replaceMatches('/[^0-9]/', '');

            return [
                Limit::perMinute(5)->by('contact:ip:' . $request->ip()),
                Limit::perMinute(3)->by('contact:wa:' . ($waNormalized !== '' ? $waNormalized : 'none')),
                Limit::perDay(30)->by('contact:ip-day:' . $request->ip()),
            ];
        });

        RateLimiter::for('blog-subscribe', function (Request $request) {
            $email = Str::lower((string) $request->input('email', ''));

            return [
                Limit::perMinute(3)->by('blog-sub:email:' . $email),
                Limit::perMinute(10)->by('blog-sub:ip:' . $request->ip()),
                Limit::perDay(20)->by('blog-sub:ip-day:' . $request->ip()),
            ];
        });
    }
}
