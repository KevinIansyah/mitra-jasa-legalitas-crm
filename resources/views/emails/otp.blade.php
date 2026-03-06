<!DOCTYPE html>
<html lang="id">

<head>
  <meta charset="UTF-8">
  <style>
    body {
      font-family: Arial, sans-serif;
      background: #f4f4f4;
      margin: 0;
      padding: 20px;
    }

    .container {
      max-width: 480px;
      margin: 0 auto;
      background: #fff;
      border-radius: 8px;
      padding: 32px;
    }

    .title {
      font-size: 20px;
      font-weight: bold;
      margin-bottom: 12px;
    }

    .otp-box {
      font-size: 36px;
      font-weight: bold;
      letter-spacing: 12px;
      color: #4F46E5;
      background: #EEF2FF;
      border-radius: 8px;
      padding: 16px;
      text-align: center;
      margin: 24px 0;
    }

    .note {
      color: #6B7280;
      font-size: 14px;
    }

    .footer {
      margin-top: 24px;
      color: #9CA3AF;
      font-size: 12px;
    }
  </style>
</head>

<body>
  <div class="container">
    <div class="title">
      @if ($type === 'email_verification')
        Verifikasi Email Anda
      @else
        Reset Password
      @endif
    </div>

    <p>Halo, <strong>{{ $user->name }}</strong>!</p>

    @if ($type === 'email_verification')
      <p>Gunakan kode OTP berikut untuk memverifikasi alamat email Anda:</p>
    @else
      <p>Gunakan kode OTP berikut untuk mereset password Anda:</p>
    @endif

    <div class="otp-box">{{ $code }}</div>

    <p class="note">
      Kode ini berlaku selama <strong>15 menit</strong>. Jangan bagikan kode ini kepada siapapun.
    </p>

    <p class="note">
      Jika Anda tidak merasa melakukan permintaan ini, abaikan email ini.
    </p>

    <div class="footer">
      &copy; {{ date('Y') }} {{ config('app.name') }}
    </div>
  </div>
</body>

</html>
