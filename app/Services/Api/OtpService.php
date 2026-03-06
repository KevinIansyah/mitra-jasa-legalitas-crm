<?php

namespace App\Services;

use App\Models\Otp;
use App\Models\User;
use App\Mail\OtpMail;
use Illuminate\Support\Facades\Mail;

class OtpService
{
  const OTP_EXPIRY_MINUTES = 15;

  /**
   * Generate and send OTP to the user's email
   */
  public function send(User $user, string $type): string
  {
    Otp::where('user_id', $user->id)
      ->where('type', $type)
      ->whereNull('used_at')
      ->delete();

    $code = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);

    Otp::create([
      'user_id'    => $user->id,
      'code'       => $code,
      'type'       => $type,
      'expires_at' => now()->addMinutes(self::OTP_EXPIRY_MINUTES),
    ]);

    Mail::to($user->email)->send(new OtpMail($user, $code, $type));

    return $code;
  }

  /**
   * Verify OTP
   */
  public function verify(User $user, string $code, string $type): bool
  {
    $otp = Otp::where('user_id', $user->id)
      ->where('code', $code)
      ->where('type', $type)
      ->whereNull('used_at')
      ->latest()
      ->first();

    if (!$otp || !$otp->isValid()) {
      return false;
    }

    $otp->markAsUsed();

    return true;
  }

  /**
   * Check if the OTP is still valid (without marking it as used)
   * Useful for validating OTP before resetting the password
   */
  public function check(User $user, string $code, string $type): ?Otp
  {
    return Otp::where('user_id', $user->id)
      ->where('code', $code)
      ->where('type', $type)
      ->whereNull('used_at')
      ->where('expires_at', '>', now())
      ->latest()
      ->first();
  }
}
