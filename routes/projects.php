<?php

use App\Http\Controllers\Projects\ProjectCommentController;
use App\Http\Controllers\Projects\ProjectController;
use App\Http\Controllers\Projects\ProjectDocumentController;
use App\Http\Controllers\Projects\ProjectMemberController;
use App\Http\Controllers\Projects\ProjectMilestoneController;
use App\Http\Controllers\Projects\ProjectTemplateController;
use App\Http\Controllers\Projects\ProjectDeliverableController;
use App\Http\Controllers\Projects\ProjectTaskController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| PROJECT MANAGEMENT MODULE
|--------------------------------------------------------------------------
| All project-related endpoints:
|   - Project Templates
|   - Projects
|   - Project Teams
|   - Milestones
|   - Tasks
|   - Documents
|   - Deliverables
|   - Discussions (Comments)
|
| Middleware: auth, verified, restrict_user
|--------------------------------------------------------------------------
*/

Route::middleware(['auth', 'verified', 'restrict_user'])->group(function () {

  /*
    |--------------------------------------------------------------------------
    | PROJECT TEMPLATES
    |--------------------------------------------------------------------------
    | GET    /projects/templates                          -> List templates
    | GET    /projects/templates/create                   -> Show create form
    | POST   /projects/templates                          -> Store template
    | GET    /projects/templates/{template}/edit          -> Show edit form
    | PUT    /projects/templates/{template}               -> Update template
    | DELETE /projects/templates/{template}               -> Delete template
    | POST   /projects/templates/{template}/duplicate     -> Duplicate template
    | GET    /projects/templates/from-service/{service}   -> Get template from service
    |--------------------------------------------------------------------------
    */

  Route::prefix('projects/templates')->name('projects.templates.')->group(function () {

    Route::get('/', [ProjectTemplateController::class, 'index'])
      ->middleware('permission:view-project-templates')
      ->name('index');

    Route::get('/create', [ProjectTemplateController::class, 'create'])
      ->middleware('permission:create-project-templates')
      ->name('create');

    Route::post('/', [ProjectTemplateController::class, 'store'])
      ->middleware('permission:create-project-templates')
      ->name('store');

    Route::get('/{template}/edit', [ProjectTemplateController::class, 'edit'])
      ->middleware('permission:edit-project-templates')
      ->name('edit');

    Route::put('/{template}', [ProjectTemplateController::class, 'update'])
      ->middleware('permission:edit-project-templates')
      ->name('update');

    Route::delete('/{template}', [ProjectTemplateController::class, 'destroy'])
      ->middleware('permission:delete-project-templates')
      ->name('destroy');

    Route::post('/{template}/duplicate', [ProjectTemplateController::class, 'duplicate'])
      ->middleware('permission:create-project-templates')
      ->name('duplicate');

    Route::get('/from-service/{service}', [ProjectTemplateController::class, 'getTemplateFromService'])
      ->middleware('permission:create-project-templates')
      ->name('from-service');
  });


  /*
    |--------------------------------------------------------------------------
    | PROJECTS
    |--------------------------------------------------------------------------
    | GET    /projects/documents              -> List all documents (global)
    | GET    /projects/deliverables           -> List all deliverables (global)
    |
    | GET    /projects                        -> List projects
    | GET    /projects/create                 -> Show create form
    | POST   /projects                        -> Store project
    | GET    /projects/{project}              -> Show project
    | GET    /projects/{project}/edit         -> Show edit form
    | PUT    /projects/{project}              -> Update project
    | DELETE /projects/{project}              -> Delete project
    | PATCH  /projects/{project}/status       -> Update project status
    |--------------------------------------------------------------------------
    */

  Route::prefix('projects')->name('projects.')->group(function () {

    Route::get('/documents', [ProjectDocumentController::class, 'index'])
      ->middleware('permission:view-project-documents')
      ->name('documents.index');

    Route::get('/deliverables', [ProjectDeliverableController::class, 'index'])
      ->middleware('permission:view-project-deliverables')
      ->name('deliverables.index');

    Route::get('/', [ProjectController::class, 'index'])
      ->middleware('permission:view-projects')
      ->name('index');

    Route::get('/create', [ProjectController::class, 'create'])
      ->middleware('permission:create-projects')
      ->name('create');

    Route::post('/', [ProjectController::class, 'store'])
      ->middleware('permission:create-projects')
      ->name('store');

    Route::get('/{project}', [ProjectController::class, 'show'])
      ->middleware('permission:view-projects')
      ->name('show');

    Route::get('/{project}/edit', [ProjectController::class, 'edit'])
      ->middleware('permission:edit-projects')
      ->name('edit');

    Route::put('/{project}', [ProjectController::class, 'update'])
      ->middleware('permission:edit-projects')
      ->name('update');

    Route::delete('/{project}', [ProjectController::class, 'destroy'])
      ->middleware('permission:delete-projects')
      ->name('destroy');

    Route::patch('/{project}/status', [ProjectController::class, 'updateStatus'])
      ->middleware('permission:edit-projects')
      ->name('update-status');
  });


  /*
    |--------------------------------------------------------------------------
    | PROJECT TABS
    |--------------------------------------------------------------------------
    | GET /projects/{project}/overview      -> Overview tab
    | GET /projects/{project}/finance       -> Finance tab
    | GET /projects/{project}/team          -> Team tab
    | GET /projects/{project}/tasks         -> Tasks tab
    | GET /projects/{project}/milestones    -> Milestones tab
    | GET /projects/{project}/documents     -> Documents tab
    | GET /projects/{project}/deliverables  -> Deliverables tab
    | GET /projects/{project}/discussions   -> Discussions tab
    | GET /projects/{project}/activities    -> Activities tab
    |--------------------------------------------------------------------------
    */

  Route::prefix('projects/{project}')->name('projects.')->group(function () {

    Route::get('/overview', [ProjectController::class, 'show'])
      ->middleware('permission:view-projects')
      ->name('overview');

    Route::get('/finance', [ProjectController::class, 'finance'])
      ->middleware([
        'permission:view-finance-invoices',
        'permission:view-finance-expenses',
        'permission:view-finance-payments',
      ])
      ->name('finance');

    Route::get('/team', [ProjectController::class, 'team'])
      ->middleware('permission:view-project-members')
      ->name('team');

    Route::get('/tasks', [ProjectController::class, 'tasks'])
      ->middleware('permission:view-project-tasks')
      ->name('tasks');

    Route::get('/milestones', [ProjectController::class, 'milestones'])
      ->middleware('permission:view-project-milestones')
      ->name('milestones');

    Route::get('/documents', [ProjectController::class, 'documents'])
      ->middleware('permission:view-project-documents')
      ->name('documents');

    Route::get('/deliverables', [ProjectController::class, 'deliverables'])
      ->middleware('permission:view-project-deliverables')
      ->name('deliverables');

    Route::get('/discussions', [ProjectController::class, 'discussions'])
      ->middleware('permission:view-project-discussions')
      ->name('discussions');

    Route::get('/activities', [ProjectController::class, 'activities'])
      ->middleware('permission:view-projects')
      ->name('activities');
  });


  /*
    |--------------------------------------------------------------------------
    | PROJECT TEAMS
    |--------------------------------------------------------------------------
    | POST   /projects/{project}/teams/{member}                      -> Add member
    | PUT    /projects/{project}/teams/{member}                      -> Update member
    | PATCH  /projects/{project}/teams/{member}/role                 -> Update member role
    | PATCH  /projects/{project}/teams/{member}/approve-documents    -> Toggle document approval
    | DELETE /projects/{project}/teams/{member}                      -> Remove member
    |--------------------------------------------------------------------------
    */

  Route::prefix('projects/{project}/teams')->name('projects.teams.')->group(function () {

    Route::post('/', [ProjectMemberController::class, 'store'])
      ->middleware('permission:create-project-members')
      ->name('store');

    Route::put('/{member}', [ProjectMemberController::class, 'update'])
      ->middleware('permission:edit-project-members')
      ->name('update');

    Route::patch('/{member}/role', [ProjectMemberController::class, 'updateRole'])
      ->middleware('permission:edit-project-members')
      ->name('update-role');

    Route::patch('/{member}/approve-documents', [ProjectMemberController::class, 'updateApproveDocuments'])
      ->middleware('permission:edit-project-members')
      ->name('update-approve-documents');

    Route::delete('/{member}', [ProjectMemberController::class, 'destroy'])
      ->middleware('permission:delete-project-members')
      ->name('destroy');
  });


  /*
    |--------------------------------------------------------------------------
    | PROJECT MILESTONES
    |--------------------------------------------------------------------------
    | POST   /projects/{project}/milestones                      -> Create milestone
    | POST   /projects/{project}/milestones/reorder              -> Reorder milestones
    | PUT    /projects/{project}/milestones/{milestone}          -> Update milestone
    | PATCH  /projects/{project}/milestones/{milestone}/status   -> Update milestone status
    | DELETE /projects/{project}/milestones/{milestone}          -> Delete milestone
    |--------------------------------------------------------------------------
    */

  Route::prefix('projects/{project}/milestones')->name('projects.milestones.')->group(function () {

    Route::post('/', [ProjectMilestoneController::class, 'store'])
      ->middleware('permission:create-project-milestones')
      ->name('store');

    Route::post('/reorder', [ProjectMilestoneController::class, 'reorder'])
      ->middleware('permission:edit-project-milestones')
      ->name('reorder');

    Route::put('/{milestone}', [ProjectMilestoneController::class, 'update'])
      ->middleware('permission:edit-project-milestones')
      ->name('update');

    Route::patch('/{milestone}/status', [ProjectMilestoneController::class, 'updateStatus'])
      ->middleware('permission:edit-project-milestones')
      ->name('update-status');

    Route::delete('/{milestone}', [ProjectMilestoneController::class, 'destroy'])
      ->middleware('permission:delete-project-milestones')
      ->name('destroy');
  });


  /*
    |--------------------------------------------------------------------------
    | PROJECT DOCUMENTS
    |--------------------------------------------------------------------------
    | GET    /projects/{project}/documents/{document}/view             -> View document
    | GET    /projects/{project}/documents/{document}/download         -> Download document
    | GET    /projects/{project}/documents/download-all                -> Download all documents
    |
    | POST   /projects/{project}/documents                             -> Store document
    | POST   /projects/{project}/documents/reorder                     -> Reorder documents
    | POST   /projects/{project}/documents/{document}/upload           -> Upload document file
    | PUT    /projects/{project}/documents/{document}                  -> Update document
    | PATCH  /projects/{project}/documents/{document}/status           -> Update document status
    | PATCH  /projects/{project}/documents/{document}/encrypt          -> Toggle document encryption
    | DELETE /projects/{project}/documents/{document}                  -> Delete document
    | DELETE /projects/{project}/documents/{document}/file             -> Delete document file
    |--------------------------------------------------------------------------
    */

  Route::prefix('projects/{project}/documents')->whereNumber('project')->name('projects.documents.')->group(function () {

    Route::middleware('permission:view-project-documents')->group(function () {
      Route::get('/{document}/view', [ProjectDocumentController::class, 'view'])
        ->middleware('throttle:60,1')
        ->name('view');
      Route::get('/{document}/download', [ProjectDocumentController::class, 'download'])
        ->middleware('throttle:60,1')
        ->name('download');
      Route::get('/download-all', [ProjectDocumentController::class, 'downloadAll'])
        ->middleware('throttle:10,1')
        ->name('download-all');
    });

    Route::post('/', [ProjectDocumentController::class, 'store'])
      ->middleware('permission:create-project-documents')
      ->name('store');

    Route::post('/reorder', [ProjectDocumentController::class, 'reorder'])
      ->middleware('permission:edit-project-documents')
      ->name('reorder');

    Route::post('/{document}/upload', [ProjectDocumentController::class, 'upload'])
      ->middleware('permission:edit-project-documents')
      ->name('upload');

    Route::put('/{document}', [ProjectDocumentController::class, 'update'])
      ->middleware('permission:edit-project-documents')
      ->name('update');

    Route::patch('/{document}/status', [ProjectDocumentController::class, 'updateStatus'])
      ->middleware('permission:edit-project-documents')
      ->name('update-status');

    Route::patch('/{document}/encrypt', [ProjectDocumentController::class, 'updateEncrypt'])
      ->middleware('permission:edit-project-documents')
      ->name('update-encrypt');

    Route::delete('/{document}', [ProjectDocumentController::class, 'destroy'])
      ->middleware('permission:delete-project-documents')
      ->name('destroy');

    Route::delete('/{document}/file', [ProjectDocumentController::class, 'deleteFile'])
      ->middleware('permission:edit-project-documents')
      ->name('delete-file');
  });


  /*
    |--------------------------------------------------------------------------
    | PROJECT DELIVERABLES
    |--------------------------------------------------------------------------
    | GET    /projects/{project}/deliverables/{deliverable}/view            -> View deliverable
    | GET    /projects/{project}/deliverables/{deliverable}/download        -> Download deliverable
    | GET    /projects/{project}/deliverables/download-all                  -> Download all deliverables
    |
    | POST   /projects/{project}/deliverables                               -> Store deliverable
    | PATCH  /projects/{project}/deliverables/{deliverable}                 -> Update deliverable
    | DELETE /projects/{project}/deliverables/{deliverable}                 -> Delete deliverable
    |--------------------------------------------------------------------------
    */

  Route::prefix('projects/{project}/deliverables')->whereNumber('project')->name('projects.deliverables.')->group(function () {

    Route::middleware('permission:view-project-deliverables')->group(function () {
      Route::get('/{deliverable}/view', [ProjectDeliverableController::class, 'view'])
        ->middleware('throttle:60,1')
        ->name('view');
      Route::get('/{deliverable}/download', [ProjectDeliverableController::class, 'download'])
        ->middleware('throttle:60,1')
        ->name('download');
      Route::get('/download-all', [ProjectDeliverableController::class, 'downloadAll'])
        ->middleware('throttle:10,1')
        ->name('download-all');
    });

    Route::post('/', [ProjectDeliverableController::class, 'store'])
      ->middleware('permission:create-project-deliverables')
      ->name('store');

    Route::patch('/{deliverable}', [ProjectDeliverableController::class, 'update'])
      ->middleware('permission:edit-project-deliverables')
      ->name('update');

    Route::delete('/{deliverable}', [ProjectDeliverableController::class, 'destroy'])
      ->middleware('permission:delete-project-deliverables')
      ->name('destroy');
  });


  /*
    |--------------------------------------------------------------------------
    | PROJECT COMMENTS
    |--------------------------------------------------------------------------
    | POST   /projects/{project}/comments             -> Post comment
    | PATCH  /projects/{project}/comments/{comment}   -> Update comment
    | DELETE /projects/{project}/comments/{comment}   -> Delete comment
    |--------------------------------------------------------------------------
    */

  Route::prefix('projects/{project}/comments')->name('projects.comments.')->group(function () {

    Route::post('/', [ProjectCommentController::class, 'store'])
      ->middleware('permission:create-project-discussions')
      ->name('store');

    Route::patch('/{comment}', [ProjectCommentController::class, 'update'])
      ->middleware('permission:edit-project-discussions')
      ->name('update');

    Route::delete('/{comment}', [ProjectCommentController::class, 'destroy'])
      ->middleware('permission:delete-project-discussions')
      ->name('destroy');
  });


  /*
    |--------------------------------------------------------------------------
    | PROJECT TASKS
    |--------------------------------------------------------------------------
    | POST   /projects/{project}/tasks                        -> Create task
    | PUT    /projects/{project}/tasks/{task}                 -> Update task
    | PATCH  /projects/{project}/tasks/{task}/status          -> Update task status
    | PATCH  /projects/{project}/tasks/{task}/priority        -> Update task priority
    | DELETE /projects/{project}/tasks/{task}                 -> Delete task
    |--------------------------------------------------------------------------
    */

  Route::prefix('projects/{project}/tasks')->name('projects.tasks.')->group(function () {

    Route::post('/', [ProjectTaskController::class, 'store'])
      ->middleware('permission:create-project-tasks')
      ->name('store');

    Route::put('/{task}', [ProjectTaskController::class, 'update'])
      ->middleware('permission:edit-project-tasks')
      ->name('update');

    Route::patch('/{task}/status', [ProjectTaskController::class, 'updateStatus'])
      ->middleware('permission:edit-project-tasks')
      ->name('updateStatus');

    Route::patch('/{task}/priority', [ProjectTaskController::class, 'updatePriority'])
      ->middleware('permission:edit-project-tasks')
      ->name('updatePriority');

    Route::delete('/{task}', [ProjectTaskController::class, 'destroy'])
      ->middleware('permission:delete-project-tasks')
      ->name('destroy');
  });
});
