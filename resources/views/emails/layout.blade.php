<!DOCTYPE html>
<html lang="id">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>@yield('subject', 'Notifikasi')</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      background-color: #f4f4f5;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      color: #18181b;
      line-height: 1.6;
    }

    .wrapper {
      max-width: 600px;
      margin: 40px auto;
      padding: 0 16px 40px;
    }

    /* Header */
    .header {
      text-align: center;
      padding: 32px 0 24px;
    }

    .header img {
      height: 48px;
      width: auto;
    }

    .header .company-name {
      margin-top: 8px;
      font-size: 13px;
      font-weight: 600;
      color: #52525b;
    }

    /* Card */
    .card {
      background: #ffffff;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
    }

    /* Card Header Strip */
    .card-header {
      background: #123e87;
      padding: 24px 32px;
    }

    .card-header h1 {
      color: #ffffff;
      font-size: 20px;
      font-weight: 700;
      line-height: 1.3;
    }

    .card-header p {
      color: #a1a1aa;
      font-size: 13px;
      margin-top: 4px;
    }

    /* Card Body */
    .card-body {
      padding: 32px;
    }

    .greeting {
      font-size: 15px;
      font-weight: 600;
      color: #18181b;
      margin-bottom: 12px;
    }

    .message {
      color: #3f3f46;
      font-size: 14px;
      margin-bottom: 16px;
    }

    /* Info Box */
    .info-box {
      background: #f4f4f5;
      border-radius: 8px;
      padding: 16px 20px;
      margin: 20px 0;
    }

    .info-box table {
      width: 100%;
      border-collapse: collapse;
    }

    .info-box td {
      padding: 8px 0;
      border-bottom: 1px solid #e4e4e7;
      font-size: 13px;
      vertical-align: top;
    }

    .info-box tr:last-child td {
      border-bottom: none;
    }

    .info-label {
      color: #71717a;
      width: 40%;
    }

    .info-value {
      font-weight: 600;
      color: #123e87;
      text-align: right;
    }

    /* Button */
    .btn-wrap {
      text-align: center;
      margin: 28px 0 8px;
    }

    .btn {
      display: inline-block;
      background: #ff8002;
      color: #ffffff !important;
      text-decoration: none;
      padding: 12px 28px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      letter-spacing: 0.01em;
    }


    /* Divider */
    .divider {
      border: none;
      border-top: 1px solid #e4e4e7;
      margin: 24px 0;
    }

    .note {
      font-size: 12px;
      color: #a1a1aa;
    }

    /* Footer */
    .footer {
      text-align: center;
      padding: 24px 0 0;
    }

    .footer .company-info {
      font-size: 12px;
      color: #71717a;
      line-height: 1.8;
    }

    .footer .social-links {
      margin: 12px 0;
    }

    .footer .social-links a {
      display: inline-block;
      margin: 0 4px;
      color: #123e87;
      text-decoration: none;
      font-size: 12px;
    }

    .footer .legal {
      margin-top: 12px;
      font-size: 11px;
      color: #a1a1aa;
    }

    .footer .legal a {
      color: #123e87;
    }
  </style>
</head>

<body>
  @php $settings = \App\Models\SiteSetting::get(); @endphp

  <div class="wrapper">

    {{-- Header --}}
    <div class="header">
      @if ($settings->company_logo)
        <img src="{{ \App\Helpers\FileHelper::getR2Url($settings->company_logo) }}" alt="{{ $settings->company_name }}">
      @else
        <div class="company-name">{{ $settings->company_name }}</div>
      @endif
    </div>

    {{-- Card --}}
    <div class="card">

      {{-- Card Header --}}
      <div class="card-header">
        <h1>@yield('title')</h1>
        @hasSection('subtitle')
          <p>@yield('subtitle')</p>
        @endif
      </div>

      {{-- Card Body --}}
      <div class="card-body">
        @yield('content')

        @hasSection('action_url')
          <div class="btn-wrap">
            <a href="@yield('action_url')" class="btn">@yield('action_label', 'Lihat Detail')</a>
          </div>
        @endif

        <hr class="divider">

        <p class="note">
          Jika kamu merasa tidak mengenali aktivitas ini, abaikan email ini atau hubungi kami di
          <a href="mailto:{{ $settings->company_email }}">{{ $settings->company_email }}</a>.
        </p>
      </div>
    </div>

    {{-- Footer --}}
    <div class="footer">
      <div class="company-info">
        <strong>{{ $settings->company_name }}</strong><br>
        @if ($settings->company_address)
          {{ $settings->company_address }}<br>
        @endif
        @if ($settings->company_city || $settings->company_province)
          {{ collect([$settings->company_city, $settings->company_province])->filter()->join(', ') }}<br>
        @endif
        @if ($settings->company_phone)
          Telp: {{ $settings->company_phone }}<br>
        @endif
        @if ($settings->company_email)
          {{ $settings->company_email }}
        @endif
      </div>

      @if (
          $settings->social_instagram ||
              $settings->social_facebook ||
              $settings->social_linkedin ||
              $settings->social_whatsapp)
        <div class="social-links">
          @if ($settings->social_instagram)
            <a href="{{ $settings->social_instagram }}">Instagram</a>
          @endif
          @if ($settings->social_facebook)
            <a href="{{ $settings->social_facebook }}">Facebook</a>
          @endif
          @if ($settings->social_linkedin)
            <a href="{{ $settings->social_linkedin }}">LinkedIn</a>
          @endif
          @if ($settings->social_whatsapp)
            <a href="https://wa.me/{{ $settings->social_whatsapp }}">WhatsApp</a>
          @endif
        </div>
      @endif

      <div class="legal">
        Kamu menerima email ini karena terdaftar di {{ $settings->company_name }}.<br>
        @if ($settings->legal_npwp)
          NPWP: {{ $settings->legal_npwp }} &nbsp;|&nbsp;
        @endif
        @if ($settings->document_privacy_policy_url)
          <a href="{{ $settings->document_privacy_policy_url }}">Kebijakan Privasi</a>
        @endif
        <br>
        &copy; {{ now()->year }} {{ $settings->company_name }}. All rights reserved.
      </div>
    </div>

  </div>
</body>

</html>
