<!DOCTYPE html>
<html lang="id">

<head>
  <meta charset="UTF-8">
  <title>Laporan Laba Rugi</title>
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
      opacity: 0.07;
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
  <div class="mx-auto w-full max-w-[794px]">

    {{-- Header --}}
    <div class="invoice-line-b-header flex items-start justify-between pb-10">
      <div class="flex items-start gap-4">
        @if ($settings->company_logo)
          <img src="{{ \App\Helpers\FileHelper::getR2Url($settings->company_logo) }}" alt="{{ $settings->company_name }}"
            class="h-14 w-auto object-contain">
        @endif
        <div>
          <h2 class="text-base font-semibold text-zinc-900">{{ $settings->company_name ?? 'CV. Mitra Jasa Legalitas' }}</h2>
          {{-- @if ($settings->company_tagline)
            <p class="text-xs text-zinc-500">{{ $settings->company_tagline }}</p>
          @endif --}}
          <div class="mt-1 space-y-0.5 text-xs text-zinc-500">
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
              <p>{{ $settings->company_email }}</p>
            @endif
          </div>
        </div>
      </div>
      <div class="text-right">
        <h1 class="text-2xl font-semibold text-zinc-900">LABA RUGI</h1>
        <p class="mt-1 text-xs text-zinc-500">
          Periode {{ \Carbon\Carbon::parse($report['period']['from'])->translatedFormat('d F Y') }} s/d
          {{ \Carbon\Carbon::parse($report['period']['to'])->translatedFormat('d F Y') }}
        </p>
      </div>
    </div>

    {{-- Pendapatan --}}
    <div class="mt-10 no-break">
      <p class="mb-2 text-xs font-semibold uppercase tracking-widest text-zinc-600">Pendapatan</p>
      <table class="w-full text-sm">
        <tbody class="divide-y divide-zinc-100">
          @foreach ($report['revenue']['detail'] as $item)
            <tr>
              <td class="py-2 text-xs text-zinc-400 w-20">{{ $item['code'] }}</td>
              <td class="py-2 text-zinc-700">{{ $item['name'] }}</td>
              <td class="py-2 text-right text-zinc-700">Rp {{ number_format($item['amount'], 0, ',', '.') }}</td>
            </tr>
          @endforeach
        </tbody>
        <tfoot>
          <tr>
            <td class="pt-2 w-20"></td>
            <td class="pt-2 font-semibold text-zinc-900">Total Pendapatan</td>
            <td class="pt-2 text-right font-semibold text-zinc-900">Rp
              {{ number_format($report['revenue']['total'], 0, ',', '.') }}</td>
          </tr>
        </tfoot>
      </table>
    </div>

    {{-- Beban --}}
    <div class="mt-10 no-break">
      <p class="mb-2 text-xs font-semibold uppercase tracking-widest text-zinc-600">Beban</p>
      <table class="invoice-items w-full text-sm">
        <tbody>
          @foreach ($report['expense']['detail'] as $item)
            <tr>
              <td class="py-2 text-xs text-zinc-400 w-20">{{ $item['code'] }}</td>
              <td class="py-2 text-zinc-700">{{ $item['name'] }}</td>
              <td class="py-2 text-right text-zinc-700">Rp {{ number_format($item['amount'], 0, ',', '.') }}</td>
            </tr>
          @endforeach
        </tbody>
        <tfoot>
          <tr>
            <td class="pt-2 w-20"></td>
            <td class="pt-2 font-semibold text-zinc-900">Total Beban</td>
            <td class="pt-2 text-right font-semibold text-zinc-900">Rp
              {{ number_format($report['expense']['total'], 0, ',', '.') }}</td>
          </tr>
        </tfoot>
      </table>
    </div>

    {{-- Net --}}
    <div
      class="mt-10 no-break rounded-lg border p-6 {{ $report['is_profitable'] ? 'border-emerald-500 bg-emerald-50' : 'border-red-500 bg-red-50' }}">
      <div class="flex items-center justify-between">
        <span class="text-sm font-semibold {{ $report['is_profitable'] ? 'text-emerald-500' : 'text-red-500' }}">
          {{ $report['is_profitable'] ? 'Laba Bersih' : 'Rugi Bersih' }}
        </span>
        <span class="text-base font-semibold {{ $report['is_profitable'] ? 'text-emerald-500' : 'text-red-500' }}">
          Rp {{ number_format(abs($report['net_profit']), 0, ',', '.') }}
        </span>
      </div>
    </div>

    {{-- Footer --}}
    <div class="mt-10 text-right text-xs text-zinc-400">
      @if ($settings->legal_npwp)
        <span class="mr-4">NPWP: {{ $settings->legal_npwp }}</span>
      @endif
      Dicetak pada {{ now()->format('d/m/Y H:i') }}
    </div>

  </div>
</body>

</html>
