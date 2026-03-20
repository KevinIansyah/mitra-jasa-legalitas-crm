<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Facades\Notification as NotificationFacade;

class NotificationService
{
  public static function notifyStaff(Notification $notification): void
  {
    $staff = User::whereHas(
      'roles',
      fn($q) =>
      $q->where('name', '!=', 'user')
    )->get();

    NotificationFacade::send($staff, $notification);
  }

  public static function notifyAdmins(Notification $notification): void
  {
    $admins = User::whereHas(
      'roles',
      fn($q) =>
      $q->where('name', 'admin')
    )->get();

    NotificationFacade::send($admins, $notification);
  }

  public static function notifyAllStaff(Notification $notification): void
  {
    $staff = User::whereHas(
      'roles',
      fn($q) =>
      $q->where('name', '!=', 'user')
    )->get();

    NotificationFacade::send($staff, $notification);
  }

  public static function notifyUser(User $user, Notification $notification): void
  {
    $user->notify($notification);
  }
}
