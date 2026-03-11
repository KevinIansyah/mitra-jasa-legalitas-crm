<?php

namespace App\Providers;

use App\Models\Expense;
use App\Models\ProjectDocument;
use App\Models\ProjectInvoice;
use App\Models\ProjectPayment;
use App\Observers\ExpenseObserver;
use App\Observers\ProjectInvoiceObserver;
use App\Observers\ProjectPaymentObserver;
use App\Policies\ProjectDocumentPolicy;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;

class AppServiceProvider extends ServiceProvider
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
        $this->configureDefaults();

        ProjectInvoice::observe(ProjectInvoiceObserver::class);
        ProjectPayment::observe(ProjectPaymentObserver::class);
        Expense::observe(ExpenseObserver::class);
    }

    protected function configureDefaults(): void
    {
        Date::use(CarbonImmutable::class);

        DB::prohibitDestructiveCommands(
            app()->isProduction(),
        );

        Password::defaults(
            fn(): ?Password => app()->isProduction()
                ? Password::min(12)
                ->mixedCase()
                ->letters()
                ->numbers()
                ->symbols()
                ->uncompromised()
                : null
        );
    }
}
