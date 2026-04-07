<?php

namespace App\Http\Controllers\Api;

use App\Helpers\ApiResponse;
use App\Helpers\FileHelper;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\Profile\PasswordUpdateRequest;
use App\Http\Requests\Api\Profile\ProfileUpdateRequest;

class ProfileController extends Controller
{
    public function updateProfile(ProfileUpdateRequest $request)
    {
        $user = $request->user();
        $validated = $request->validated();

        if ($request->boolean('remove_avatar') && $user->avatar) {
            FileHelper::deleteFromR2($user->avatar, isPublic: true);
            $validated['avatar'] = null;
        }

        if ($request->hasFile('avatar')) {
            if ($user->avatar) {
                FileHelper::deleteFromR2($user->avatar, isPublic: true);
            }
            $file = FileHelper::uploadToR2Public($request->file('avatar'), 'avatars');
            $validated['avatar'] = $file['path'];
        }

        $user->fill($validated);

        if ($user->isDirty('email')) {
            $user->email_verified_at = null;
        }

        $user->save();

        return ApiResponse::updated($user, 'Profil berhasil diperbarui.');
    }

    public function updatePassword(PasswordUpdateRequest $request)
    {
        $request->user()->update([
            'password' => $request->password,
        ]);

        return ApiResponse::updated(null, 'Password berhasil diperbarui.');
    }
}
