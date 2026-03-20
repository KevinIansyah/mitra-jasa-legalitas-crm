<?php

use App\Jobs\ProcessEstimateExpired;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use App\Jobs\ProcessInvoiceDueReminders;
use App\Jobs\ProcessInvoiceOverdue;
use App\Jobs\ProcessProposalExpired;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Schedule::job(new ProcessInvoiceDueReminders(3))->dailyAt('08:00')->name('invoice-due-reminder-3')->withoutOverlapping();
Schedule::job(new ProcessInvoiceDueReminders(1))->dailyAt('08:00')->name('invoice-due-reminder-1')->withoutOverlapping();
Schedule::job(new ProcessInvoiceOverdue())->dailyAt('00:01')->name('invoice-overdue')->withoutOverlapping();
Schedule::job(new ProcessProposalExpired())->dailyAt('00:01')->name('proposal-expired')->withoutOverlapping();
Schedule::job(new ProcessEstimateExpired())->dailyAt('00:01')->name('estimate-expired')->withoutOverlapping();
