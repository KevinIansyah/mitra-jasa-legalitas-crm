<!DOCTYPE html>
<html lang="id">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Estimasi {{ $estimate->estimate_number }}</title>
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
      background-image: url("{{ \App\Helpers\FileHelper::getR2Url($settings->company_logo) }}");
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
  </style>
</head>

<body>
  @php
    $customer = $estimate->customer ?? ($estimate->proposal?->customer ?? $estimate->quote?->customer);

    $name = $customer?->name ?? ($estimate->quote?->user?->name ?? '-');
    $email = $customer?->email ?? ($estimate->quote?->user?->email ?? '-');
    $phone = $customer?->phone ?? ($estimate->quote?->user?->phone ?? '-');
  @endphp

  <div class="mx-auto w-full max-w-[794px]">
    <div>

      {{-- Header --}}
      <div class="flex items-start justify-between border-b border-zinc-900/30 pb-10">
        <div class="flex items-start gap-4">
          @if ($settings->company_logo)
            <img src="{{ \App\Helpers\FileHelper::getR2Url($settings->company_logo) }}"
              alt="{{ $settings->company_name }}" class="h-16 w-auto object-contain">
          @endif
          <div>
            <h2 class="text-xl font-semibold text-zinc-900">{{ $settings->company_name ?? '-' }}</h2>
            @if ($settings->company_tagline)
              <p class="mt-1 text-sm text-zinc-600">{{ $settings->company_tagline }}</p>
            @endif
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
          <h2 class="text-2xl font-semibold tracking-tight text-zinc-900">ESTIMASI</h2>
          <p class="text-lg font-semibold text-zinc-600">{{ $estimate->estimate_number }}</p>

        </div>
      </div>

      {{-- Meta --}}
      <div class="mt-10 grid grid-cols-2 gap-8">
        <div>
          <p class="mb-2 text-xs font-semibold uppercase tracking-widest text-zinc-600">Ditujukan Kepada</p>
          <p class="text-sm font-semibold text-zinc-900">{{ $name }}</p>
          <div class="text-sm text-zinc-600">
            @if ($email)
              <p>{{ $email }}</p>
            @endif
            @if ($phone)
              <p>{{ $phone }}</p>
            @endif
          </div>
          @if ($estimate->proposal)
            <p class="mt-2 text-xs text-zinc-600">Proposal: <span
                class="font-medium text-zinc-900">{{ $estimate->proposal->proposal_number }}</span></p>
            <p class="text-xs text-zinc-600">Judul Proposal: <span
                class="font-medium text-zinc-900">{{ $estimate->proposal->project_name }}</span></p>
          @endif
          @if ($estimate->quote)
            <p class="mt-2 text-xs text-zinc-600">Quote: <span
                class="font-medium text-zinc-900">{{ $estimate->quote->reference_number }}</span></p>
            <p class="text-xs text-zinc-600">Nama Proyek: <span
                class="font-medium text-zinc-900">{{ $estimate->quote->project_name }}</span></p>
          @endif
        </div>
        <div>
          <p class="mb-2 text-xs font-semibold uppercase tracking-widest text-zinc-600">Detail Estimasi</p>
          <div class="space-y-1 text-sm">
            <div class="flex justify-between gap-4">
              <span class="text-zinc-600">Versi</span>
              <span class="font-medium text-zinc-900">{{ $estimate->version_label }}</span>
            </div>
            @if ($estimate->estimate_date)
              <div class="flex justify-between gap-4">
                <span class="text-zinc-600">Tanggal</span>
                <span class="font-medium text-zinc-900">{{ $estimate->estimate_date->format('d M Y') }}</span>
              </div>
            @endif
            @if ($estimate->valid_until)
              <div class="flex justify-between gap-4">
                <span class="text-zinc-600">Berlaku Hingga</span>
                <span class="font-medium text-zinc-900">{{ $estimate->valid_until->format('d M Y') }}</span>
              </div>
            @endif
          </div>
        </div>
      </div>

      {{-- Items --}}
      <div class="mt-10">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-zinc-900">
              <th class="pb-3 text-left font-semibold text-zinc-900">Deskripsi</th>
              <th class="pb-3 text-right font-semibold text-zinc-900">Qty</th>
              <th class="pb-3 text-right font-semibold text-zinc-900">Harga Satuan</th>
              <th class="pb-3 text-right font-semibold text-zinc-900">Diskon</th>
              <th class="pb-3 text-right font-semibold text-zinc-900">Pajak</th>
              <th class="pb-3 text-right font-semibold text-zinc-900">Total</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-zinc-100">
            @foreach ($estimate->items as $item)
              <tr>
                <td class="py-3 text-zinc-900">{{ $item->description }}</td>
                <td class="py-3 text-right text-zinc-600">{{ $item->quantity }}</td>
                <td class="py-3 text-right text-zinc-600">Rp {{ number_format($item->unit_price, 0, ',', '.') }}</td>
                <td class="py-3 text-right text-zinc-600">
                  {{ $item->discount_percent > 0 ? $item->discount_percent . '%' : '-' }}</td>
                <td class="py-3 text-right text-zinc-600">{{ $item->tax_percent > 0 ? $item->tax_percent . '%' : '-' }}
                </td>
                <td class="py-3 text-right font-medium text-zinc-900">Rp
                  {{ number_format($item->total_amount, 0, ',', '.') }}</td>
              </tr>
            @endforeach
          </tbody>
        </table>
      </div>

      {{-- Totals --}}
      <div class="mt-6 flex justify-end no-break">
        <div class="w-72 space-y-2 text-sm">
          <div class="flex justify-between">
            <span class="text-zinc-600">Subtotal</span>
            <span class="text-zinc-900">Rp {{ number_format($estimate->subtotal, 0, ',', '.') }}</span>
          </div>
          @if ($estimate->discount_amount > 0)
            <div class="flex justify-between">
              <span class="text-zinc-600">Diskon ({{ $estimate->discount_percent }}%)</span>
              <span class="text-zinc-900">-Rp {{ number_format($estimate->discount_amount, 0, ',', '.') }}</span>
            </div>
          @endif
          @if ($estimate->tax_amount > 0)
            <div class="flex justify-between">
              <span class="text-zinc-600">Pajak ({{ $estimate->tax_percent }}%)</span>
              <span class="text-zinc-900">Rp {{ number_format($estimate->tax_amount, 0, ',', '.') }}</span>
            </div>
          @endif
          <div class="flex justify-between border-t border-zinc-900 pt-2 font-semibold text-zinc-900">
            <span>Total</span>
            <span>Rp {{ number_format($estimate->total_amount, 0, ',', '.') }}</span>
          </div>
        </div>
      </div>

      {{-- Notes --}}
      @if ($estimate->notes)
        <div class="mt-6 no-break">
          <p class="mb-2 text-xs font-semibold uppercase tracking-widest text-zinc-600">Catatan</p>
          <p class="whitespace-pre-line text-sm text-zinc-600">{{ $estimate->notes }}</p>
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
          <div class="mt-2 border-t border-zinc-500 pt-1 text-xs">
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
