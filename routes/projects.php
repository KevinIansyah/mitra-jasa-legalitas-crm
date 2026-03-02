<?php

use App\Http\Controllers\ProjectCommentController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\ProjectDocumentController;
use App\Http\Controllers\ProjectMemberController;
use App\Http\Controllers\ProjectMilestoneController;
use App\Http\Controllers\ProjectTemplateController;
use App\Http\Controllers\ProjectDeliverableController;
use App\Http\Controllers\ProjectTaskController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified', 'restrict_user'])->group(function () {

  /*
    |--------------------------------------------------------------------------
    | PROJECT TEMPLATES
    |--------------------------------------------------------------------------
    */

  Route::prefix('projects/templates')->name('projects.templates.')->group(function () {
    Route::get('/',                       [ProjectTemplateController::class, 'index'])->middleware('permission:view-project-templates')->name('index');
    Route::get('/create',                 [ProjectTemplateController::class, 'create'])->middleware('permission:create-project-templates')->name('create');
    Route::post('/',                      [ProjectTemplateController::class, 'store'])->middleware('permission:create-project-templates')->name('store');
    Route::get('/{template}/edit',        [ProjectTemplateController::class, 'edit'])->middleware('permission:edit-project-templates')->name('edit');
    Route::put('/{template}',             [ProjectTemplateController::class, 'update'])->middleware('permission:edit-project-templates')->name('update');
    Route::delete('/{template}',          [ProjectTemplateController::class, 'destroy'])->middleware('permission:delete-project-templates')->name('destroy');
    Route::post('/{template}/duplicate',  [ProjectTemplateController::class, 'duplicate'])->middleware('permission:create-project-templates')->name('duplicate');
    Route::get('/from-service/{service}', [ProjectTemplateController::class, 'getTemplateFromService'])->middleware('permission:create-project-templates')->name('from-service');
  });

  /*
    |--------------------------------------------------------------------------
    | PROJECTS
    |--------------------------------------------------------------------------
    */

  Route::prefix('projects')->name('projects.')->group(function () {
    Route::get('/documents',    [ProjectDocumentController::class, 'index'])
      ->middleware('permission:view-project-documents')
      ->name('documents.index');

    Route::get('/deliverables', [ProjectDeliverableController::class, 'index'])
      ->middleware('permission:view-project-deliverables')
      ->name('deliverables.index');

    Route::get('/',                   [ProjectController::class, 'index'])->middleware('permission:view-projects')->name('index');
    Route::get('/create',             [ProjectController::class, 'create'])->middleware('permission:create-projects')->name('create');
    Route::post('/',                  [ProjectController::class, 'store'])->middleware('permission:create-projects')->name('store');
    Route::get('/{project}',          [ProjectController::class, 'show'])->middleware('permission:view-projects')->name('show');
    Route::get('/{project}/edit',     [ProjectController::class, 'edit'])->middleware('permission:edit-projects')->name('edit');
    Route::put('/{project}',          [ProjectController::class, 'update'])->middleware('permission:edit-projects')->name('update');
    Route::delete('/{project}',       [ProjectController::class, 'destroy'])->middleware('permission:delete-projects')->name('destroy');
    Route::patch('/{project}/status', [ProjectController::class, 'updateStatus'])->middleware('permission:edit-projects')->name('update-status');
  });

  /*
    |--------------------------------------------------------------------------
    | PROJECT TABS
    |--------------------------------------------------------------------------
    */

  Route::prefix('projects/{project}')->name('projects.')->group(function () {
    Route::get('/overview',     [ProjectController::class, 'show'])->middleware('permission:view-projects')->name('overview');
    Route::get('/finance',      [ProjectController::class, 'finance'])
      ->middleware([
        'permission:view-finance-invoices',
        'permission:view-finance-expenses',
        'permission:view-finance-payments',
      ])
      ->name('finance');
    Route::get('/team',         [ProjectController::class, 'team'])->middleware('permission:view-project-members')->name('team');
    Route::get('/tasks',        [ProjectController::class, 'tasks'])->middleware('permission:view-project-tasks')->name('tasks');
    Route::get('/milestones',   [ProjectController::class, 'milestones'])->middleware('permission:view-project-milestones')->name('milestones');
    Route::get('/documents',    [ProjectController::class, 'documents'])->middleware('permission:view-project-documents')->name('documents');
    Route::get('/deliverables', [ProjectController::class, 'deliverables'])->middleware('permission:view-project-deliverables')->name('deliverables');
    Route::get('/discussions',  [ProjectController::class, 'discussions'])->middleware('permission:view-project-discussions')->name('discussions');
    Route::get('/activities',   [ProjectController::class, 'activities'])->middleware('permission:view-projects')->name('activities');
  });

  /*
    |--------------------------------------------------------------------------
    | PROJECT TEAMS
    |--------------------------------------------------------------------------
    */

  Route::prefix('projects/{project}/teams')->name('projects.teams.')->group(function () {
    Route::post('/',                              [ProjectMemberController::class, 'store'])->middleware('permission:create-project-members')->name('store');
    Route::put('/{member}',                       [ProjectMemberController::class, 'update'])->middleware('permission:edit-project-members')->name('update');
    Route::patch('/{member}/role',                [ProjectMemberController::class, 'updateRole'])->middleware('permission:edit-project-members')->name('update-role');
    Route::patch('/{member}/approve-documents',   [ProjectMemberController::class, 'updateApproveDocuments'])->middleware('permission:edit-project-members')->name('update-approve-documents');
    Route::delete('/{member}',                    [ProjectMemberController::class, 'destroy'])->middleware('permission:delete-project-members')->name('destroy');
  });

  /*
    |--------------------------------------------------------------------------
    | PROJECT MILESTONES
    |--------------------------------------------------------------------------
    */

  Route::prefix('projects/{project}/milestones')->name('projects.milestones.')->group(function () {
    Route::post('/',                      [ProjectMilestoneController::class, 'store'])->middleware('permission:create-project-milestones')->name('store');
    Route::post('/reorder',               [ProjectMilestoneController::class, 'reorder'])->middleware('permission:edit-project-milestones')->name('reorder');
    Route::put('/{milestone}',            [ProjectMilestoneController::class, 'update'])->middleware('permission:edit-project-milestones')->name('update');
    Route::patch('/{milestone}/status',   [ProjectMilestoneController::class, 'updateStatus'])->middleware('permission:edit-project-milestones')->name('update-status');
    Route::delete('/{milestone}',         [ProjectMilestoneController::class, 'destroy'])->middleware('permission:delete-project-milestones')->name('destroy');
  });

  /*
    |--------------------------------------------------------------------------
    | PROJECT DOCUMENTS
    |--------------------------------------------------------------------------
    */

  Route::prefix('projects/{project}/documents')->whereNumber('project')->name('projects.documents.')->group(function () {
    Route::middleware('permission:view-project-documents')->group(function () {
      Route::get('/{document}/view/{filename}', [ProjectDocumentController::class, 'view'])->name('view');
      Route::get('/{document}/download',  [ProjectDocumentController::class, 'download'])->name('download');
      Route::get('/download-all',         [ProjectDocumentController::class, 'downloadAll'])->name('download-all');
    });


    Route::post('/',                    [ProjectDocumentController::class, 'store'])->middleware('permission:create-project-documents')->name('store');
    Route::post('/reorder',             [ProjectDocumentController::class, 'reorder'])->middleware('permission:edit-project-documents')->name('reorder');
    Route::post('/{document}/upload',   [ProjectDocumentController::class, 'upload'])->middleware('permission:edit-project-documents')->name('upload');
    Route::put('/{document}',           [ProjectDocumentController::class, 'update'])->middleware('permission:edit-project-documents')->name('update');
    Route::patch('/{document}/status',  [ProjectDocumentController::class, 'updateStatus'])->middleware('permission:edit-project-documents')->name('update-status');
    Route::patch('/{document}/encrypt', [ProjectDocumentController::class, 'updateEncrypt'])->middleware('permission:edit-project-documents')->name('update-encrypt');
    Route::delete('/{document}',        [ProjectDocumentController::class, 'destroy'])->middleware('permission:delete-project-documents')->name('destroy');
    Route::delete('/{document}/file',   [ProjectDocumentController::class, 'deleteFile'])->middleware('permission:edit-project-documents')->name('delete-file');
  });

  /*
    |--------------------------------------------------------------------------
    | PROJECT DELIVERABLES
    |--------------------------------------------------------------------------
    */

  Route::prefix('projects/{project}/deliverables')->whereNumber('project')->name('projects.deliverables.')->group(function () {
    Route::middleware('permission:view-project-deliverables')->group(function () {
      Route::get('/{deliverable}/view/{filename}', [ProjectDeliverableController::class, 'view'])->name('view');
      Route::get('/{deliverable}/download', [ProjectDeliverableController::class, 'download'])->name('download');
      Route::get('/download-all',           [ProjectDeliverableController::class, 'downloadAll'])->name('download-all');
    });


    Route::post('/',                [ProjectDeliverableController::class, 'store'])->middleware('permission:create-project-deliverables')->name('store');
    Route::patch('/{deliverable}',  [ProjectDeliverableController::class, 'update'])->middleware('permission:edit-project-deliverables')->name('update');
    Route::delete('/{deliverable}', [ProjectDeliverableController::class, 'destroy'])->middleware('permission:delete-project-deliverables')->name('destroy');
  });

  /*
    |--------------------------------------------------------------------------
    | PROJECT COMMENTS
    |--------------------------------------------------------------------------
    */

  Route::prefix('projects/{project}/comments')->name('projects.comments.')->group(function () {
    Route::post('/',               [ProjectCommentController::class, 'store'])->middleware('permission:create-project-discussions')->name('store');
    Route::patch('/{comment}',     [ProjectCommentController::class, 'update'])->middleware('permission:edit-project-discussions')->name('update');
    Route::delete('/{comment}',    [ProjectCommentController::class, 'destroy'])->middleware('permission:delete-project-discussions')->name('destroy');
  });

  /*
    |--------------------------------------------------------------------------
    | PROJECT TASKS
    |--------------------------------------------------------------------------
    */

  Route::prefix('projects/{project}/tasks')->name('projects.tasks.')->group(function () {
    Route::post('/',                          [ProjectTaskController::class, 'store'])->middleware('permission:create-project-tasks')->name('store');
    Route::put('/{task}',                     [ProjectTaskController::class, 'update'])->middleware('permission:edit-project-tasks')->name('update');
    Route::patch('/{task}/status',            [ProjectTaskController::class, 'updateStatus'])->middleware('permission:edit-project-tasks')->name('updateStatus');
    Route::patch('/{task}/priority',          [ProjectTaskController::class, 'updatePriority'])->middleware('permission:edit-project-tasks')->name('updatePriority');
    Route::delete('/{task}',                  [ProjectTaskController::class, 'destroy'])->middleware('permission:delete-project-tasks')->name('destroy');
  });
});
