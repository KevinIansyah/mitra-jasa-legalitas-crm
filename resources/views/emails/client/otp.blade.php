@extends('emails.layout')

@section('title', match($type)
    'email_verification' => 'Verifikasi Email Anda',
    'password_reset'     => 'Reset Password',
    default              => 'Kode OTP'
)

@section('subtitle', match($type)
    'email_verification' => 'Masukkan kode berikut untuk memverifikasi email Anda',
    'password_reset'     => 'Masukkan kode berikut untuk mereset password Anda',
    default              => 'Masukkan kode berikut'
)

@section('content')
    <p class="greeting">Halo, {{ $user->name }}!</p>

    <p class="message">
        @if ($type === 'email_verification')
            Terima kasih telah mendaftar. Gunakan kode OTP berikut untuk memverifikasi email Anda.
        @elseif ($type === 'password_reset')
            Kami menerima permintaan reset password untuk akun Anda. Gunakan kode OTP berikut untuk melanjutkan.
        @else
            Gunakan kode OTP berikut untuk melanjutkan.
        @endif
    </p>

    <div style="text-align:center;margin:28px 0;">
        <div style="display:inline-block;background:#f4f4f5;border-radius:12px;padding:20px 40px;">
            <p style="font-size:11px;color:#71717a;margin-bottom:8px;letter-spacing:0.05em;text-transform:uppercase;">Kode OTP</p>
            <p style="font-size:36px;font-weight:700;letter-spacing:0.2em;color:#123e87;margin:0;">{{ $code }}</p>
        </div>
    </div>

    <div class="info-box">
        <table>
            <tr>
                <td class="info-label">Berlaku selama</td>
                <td class="info-value">15 menit</td>
            </tr>
            <tr>
                <td class="info-label">Untuk akun</td>
                <td class="info-value">{{ $user->email }}</td>
            </tr>
        </table>
    </div>

    <p class="message">
        Jangan bagikan kode ini kepada siapapun, termasuk tim kami. Kode ini bersifat rahasia dan hanya untuk Anda.
    </p>
@endsection