<!DOCTYPE html>
<html lang="id">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Kwitansi {{ $payment->receipt_number }}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link
    href="https://fonts.googleapis.com/css2?family=Roboto+Flex:opsz,wght@8..144,300;8..144,400;8..144,500;8..144,600;8..144,700&display=swap"
    rel="stylesheet">
  <style>
    * {
      font-family: 'Roboto Flex', sans-serif;
    }

    body {
      background: white;
      margin: 0;
      padding: 0;
      position: relative;
    }

    body::before {
      content: "";
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background-image: @if(filled($settings->company_logo)) url("{{ \App\Helpers\FileHelper::getR2Url($settings->company_logo) }}") @else none @endif;
      background-repeat: no-repeat;
      background-position: center center;
      background-size: 520px;
      opacity: 0.10;
      pointer-events: none;
      z-index: 0;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    body>* {
      position: relative;
      z-index: 1;
    }

    .no-break {
      page-break-inside: avoid;
      break-inside: avoid;
    }

    :root {
      --invoice-line-strong: #18181b;
      --invoice-line-muted: #d4d4d8;
    }

    .invoice-line-b-header {
      border-bottom: 1px solid rgba(24, 24, 27, 0.3);
    }

    .invoice-line-t-strong {
      border-top: 1px solid var(--invoice-line-strong);
    }

    .invoice-line-t-muted {
      border-top: 1px solid var(--invoice-line-muted);
    }

    table.invoice-items {
      width: 100%;
      border-collapse: collapse;
      border-spacing: 0;
    }

    table.invoice-items thead th {
      border-bottom: 1px solid var(--invoice-line-strong);
    }

    table.invoice-items tbody td {
      border-bottom: 1px solid var(--invoice-line-muted);
    }

    table.invoice-items tfoot td {
      border-top: 1px solid var(--invoice-line-strong);
    }
  </style>
</head>

<body>
  @php
    $customer = $invoice->customer ?? $invoice->project?->customer;
    $company = $invoice->project?->company;
  @endphp

  <div class="mx-auto w-full max-w-[794px]">
    <div>

      {{-- Header --}}
      <div class="invoice-line-b-header flex items-start justify-between pb-10">
        <div class="flex items-start gap-4">
          @if ($settings->company_logo)
            <img src="{{ \App\Helpers\FileHelper::getR2Url($settings->company_logo) }}"
              alt="{{ $settings->company_name }}" class="h-16 w-auto object-contain">
          @endif
          <div>
            <h2 class="text-xl font-semibold text-zinc-900">{{ $settings->company_name ?? 'CV. Mitra Jasa Legalitas' }}</h2>
            {{-- @if ($settings->company_tagline)
              <p class="mt-1 text-sm text-zinc-600">{{ $settings->company_tagline }}</p>
            @endif --}}
            <div class="mt-1 space-y-0.5 text-xs text-zinc-600">
              @if ($settings->company_address)
                <p>{{ $settings->company_address }}</p>
              @endif
              @if ($settings->company_city || $settings->company_province)
                <p>
                  {{ collect([$settings->company_city, $settings->company_province, $settings->company_postal_code])->filter()->join(', ') }}
                </p>
              @endif
              @if ($settings->company_phone)
                <p>Telp: {{ $settings->company_phone }}</p>
              @endif
              @if ($settings->company_email)
                <p>Email: {{ $settings->company_email }}</p>
              @endif
            </div>
          </div>
        </div>
        <div class="text-right">
          <h2 class="text-2xl font-semibold tracking-tight text-zinc-900">KWITANSI</h2>
          <p class="text-lg font-semibold text-zinc-600 whitespace-nowrap">{{ $payment->receipt_number }}</p>
        </div>
      </div>

      {{-- Meta --}}
      <div class="mt-10 grid grid-cols-2 gap-8">
        <div>
          <p class="mb-2 text-xs font-semibold uppercase tracking-widest text-zinc-600">Diterima Dari</p>
          <p class="text-sm font-semibold text-zinc-900">{{ $customer?->name ?? '-' }}</p>
          <div class=" text-sm text-zinc-600">
            @if ($customer?->email)
              <p>{{ $customer->email }}</p>
            @endif
            @if ($customer?->phone)
              <p>{{ $customer->phone }}</p>
            @endif
            @if ($company)
              <p class="mt-2 text-xs">Perusahaan: <span class="font-medium text-zinc-900">{{ $company->name }}</span>
              </p>
            @endif
            @if ($invoice->project)
              <p class="text-xs">Proyek: <span class="font-medium text-zinc-900">{{ $invoice->project->name }}</span>
              </p>
            @endif
          </div>
        </div>
        <div>
          <p class="mb-2 text-xs font-semibold uppercase tracking-widest text-zinc-600">Detail Kwitansi</p>
          <div class="space-y-1 text-sm">
            <div class="flex justify-between gap-4">
              <span class="text-zinc-600">Nomor Kwitansi</span>
              <span class="font-medium text-zinc-900">{{ $payment->receipt_number }}</span>
            </div>
            <div class="flex justify-between gap-4">
              <span class="text-zinc-600">Nomor Invoice</span>
              <span class="font-medium text-zinc-900">{{ $invoice->invoice_number }}</span>
            </div>
            <div class="flex justify-between gap-4">
              <span class="text-zinc-600">Tanggal Verifikasi</span>
              <span class="font-medium text-zinc-900">{{ $payment->verified_at->format('d M Y') }}</span>
            </div>
            <div class="flex justify-between gap-4">
              <span class="text-zinc-600">Metode Pembayaran</span>
              <span
                class="font-medium text-zinc-900">{{ ucfirst(str_replace('_', ' ', $payment->payment_method)) }}</span>
            </div>
            @if ($payment->reference_number)
              <div class="flex justify-between gap-4">
                <span class="text-zinc-600">Referensi</span>
                <span class="font-medium text-zinc-900">{{ $payment->reference_number }}</span>
              </div>
            @endif
            @if ($payment->verifier)
              <div class="flex justify-between gap-4">
                <span class="text-zinc-600">Diverifikasi Oleh</span>
                <span class="font-medium text-zinc-900">{{ $payment->verifier->name }}</span>
              </div>
            @endif
          </div>
        </div>
      </div>

      {{-- Amount --}}
      <div class="mt-10 no-break">
        <p class="mb-3 text-xs font-semibold uppercase tracking-widest text-zinc-600">Jumlah Pembayaran</p>
        <div class="rounded-lg border border-zinc-900 p-6">
          <div class="flex items-center justify-between">
            <div class="text-sm text-zinc-600">
              <p>Pembayaran untuk invoice <span class="font-medium text-zinc-900">{{ $invoice->invoice_number }}</span>
              </p>
              <p class="mt-1">Tipe: <span class="font-medium text-zinc-900">{{ $invoice->formatted_type }}</span></p>
            </div>
            <div class="text-right">
              <p class="text-xs text-zinc-600">Jumlah Dibayar</p>
              <p class="text-2xl font-semibold text-zinc-900">Rp {{ number_format($payment->amount, 0, ',', '.') }}</p>
            </div>
          </div>

          {{-- Ringkasan pembayaran invoice jika ada lebih dari 1 payment --}}
          @php
            $allVerified = $invoice->payments->where('status', 'verified');
            $totalPaid = $allVerified->sum('amount');
          @endphp
          @if ($allVerified->count() > 1)
            <div class="invoice-line-t-muted mt-4 space-y-1 pt-4 text-sm">
              <div class="flex justify-between">
                <span class="text-zinc-600">Total Invoice</span>
                <span class="text-zinc-900">Rp {{ number_format($invoice->total_amount, 0, ',', '.') }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-zinc-600">Total Terbayar</span>
                <span class="text-zinc-900">Rp {{ number_format($totalPaid, 0, ',', '.') }}</span>
              </div>
              @if ($totalPaid < $invoice->total_amount)
                <div class="flex justify-between font-medium">
                  <span class="text-zinc-600">Sisa</span>
                  <span class="text-zinc-900">Rp
                    {{ number_format($invoice->total_amount - $totalPaid, 0, ',', '.') }}</span>
                </div>
              @else
                <div class="flex justify-between font-semibold text-green-600">
                  <span>Status</span>
                  <span>LUNAS</span>
                </div>
              @endif
            </div>
          @endif
        </div>
      </div>

      {{-- Notes --}}
      @if ($payment->notes)
        <div class="mt-6 no-break">
          <p class="mb-2 text-xs font-semibold uppercase tracking-widest text-zinc-600">Catatan</p>
          <p class="whitespace-pre-line text-sm text-zinc-600">{{ $payment->notes }}</p>
        </div>
      @endif

      {{-- Terms --}}
      @if ($settings->document_terms_and_conditions)
        <div class="mt-6 rounded-lg bg-zinc-50 p-4 no-break">
          <p class="mb-1 text-xs font-semibold uppercase tracking-widest text-zinc-600">Syarat & Ketentuan</p>
          <p class="whitespace-pre-line text-xs text-zinc-600">{{ $settings->document_terms_and_conditions }}</p>
        </div>
      @endif

      {{-- Signature --}}
      <div class="no-break mt-10 flex items-end justify-between">
        <div class="text-xs text-zinc-600">
          @if ($settings->document_footer_text)
            <p>{{ $settings->document_footer_text }}</p>
          @endif
          @if ($settings->legal_npwp)
            <p>NPWP: {{ $settings->legal_npwp }}</p>
          @endif
        </div>
        <div class="text-center">
          <p class="mb-3 text-xs text-zinc-600">Hormat kami,</p>
          <div class="relative inline-block min-h-[64px] min-w-[128px]">
            @if ($settings->stamp_image)
              <img src="{{ \App\Helpers\FileHelper::getR2Url($settings->stamp_image) }}" alt="Stempel"
                class="absolute -top-4 -left-8 h-20 w-20 object-contain opacity-80">
            @endif
            @if ($settings->signature_image)
              <img src="{{ \App\Helpers\FileHelper::getR2Url($settings->signature_image) }}" alt="Tanda Tangan"
                class="mx-auto h-16 w-32 object-contain">
            @endif
          </div>
          <div class="invoice-line-t-strong mt-2 pt-1 text-xs">
            <p class="font-semibold text-zinc-900">{{ $settings->signer_name ?? $settings->company_name }}</p>
            @if ($settings->signer_position)
              <p class="text-zinc-600">{{ $settings->signer_position }}</p>
            @endif
          </div>
        </div>
      </div>

    </div>
  </div>
</body>

</html>
