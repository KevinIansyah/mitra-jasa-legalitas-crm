<?php

namespace App\Providers;

use App\Models\Blog;
use App\Models\City;
use App\Models\Expense;
use App\Models\ProjectInvoice;
use App\Models\ProjectPayment;
use App\Models\Service;
use App\Models\ServiceCategory;
use App\Models\ServiceCityPage;
use App\Models\ServiceFaq;
use App\Models\ServicePackage;
use App\Models\ServiceProcessStep;
use App\Models\SiteSetting;
use App\Observers\BlogObserver;
use App\Observers\CityObserver as ObserversCityObserver;
use App\Observers\ExpenseObserver;
use App\Observers\ProjectInvoiceObserver;
use App\Observers\ProjectPaymentObserver;
use App\Observers\ServiceCategoryObserver;
use App\Observers\ServiceCityPageObserver;
use App\Observers\ServiceFaqObserver;
use App\Observers\ServiceObserver;
use App\Observers\ServicePackageObserver;
use App\Observers\ServiceProcessStepObserver;
use App\Observers\SiteSettingObserver;
use App\Services\AI\AiServiceInterface;
use App\Services\AI\GeminiAiService;
use App\Services\AI\LovableAiService;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        if (file_exists($path = app_path('helpers.php'))) {
            require_once $path;
        }

        $this->app->bind(AiServiceInterface::class, function () {
            return match (config('ai.provider', 'gemini')) {
                'lovable' => new LovableAiService,
                default => new GeminiAiService,
            };
        });
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
        Service::observe(ServiceObserver::class);
        ServiceCategory::observe(ServiceCategoryObserver::class);
        ServiceFaq::observe(ServiceFaqObserver::class);
        ServiceProcessStep::observe(ServiceProcessStepObserver::class);
        ServicePackage::observe(ServicePackageObserver::class);
        ServiceCityPage::observe(ServiceCityPageObserver::class);
        City::observe(ObserversCityObserver::class);
        Blog::observe(BlogObserver::class);
        SiteSetting::observe(SiteSettingObserver::class);
    }

    protected function configureDefaults(): void
    {
        Date::use(CarbonImmutable::class);

        \Carbon\Carbon::setLocale('id');
        \Carbon\CarbonImmutable::setLocale('id');

        DB::prohibitDestructiveCommands(
            app()->isProduction(),
        );

        Password::defaults(
            fn (): ?Password => app()->isProduction()
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
