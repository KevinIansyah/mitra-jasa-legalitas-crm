<!DOCTYPE html>
<html lang="id">

<head>
  <meta charset="UTF-8">
  <title>Laporan Arus Kas</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'DejaVu Sans', sans-serif;
      font-size: 11px;
      color: #1a1a1a;
      padding: 40px;
      line-height: 1.5;
    }

    .header {
      margin-bottom: 28px;
      border-bottom: 2px solid #1a1a1a;
      padding-bottom: 14px;
    }

    .header h1 {
      font-size: 18px;
      font-weight: 700;
    }

    .header .subtitle {
      font-size: 11px;
      color: #555;
      margin-top: 4px;
    }

    .summary-grid {
      display: flex;
      gap: 12px;
      margin-bottom: 24px;
    }

    .summary-card {
      flex: 1;
      padding: 10px 12px;
      border: 1px solid #e5e7eb;
      border-radius: 4px;
    }

    .summary-card .label {
      font-size: 10px;
      color: #666;
    }

    .summary-card .value {
      font-size: 13px;
      font-weight: 700;
      margin-top: 2px;
      font-variant-numeric: tabular-nums;
    }

    .summary-card.in .value {
      color: #065f46;
    }

    .summary-card.out .value {
      color: #9f1239;
    }

    .summary-card.net .value {
      color: #1a1a1a;
    }

    .section {
      margin-bottom: 22px;
    }

    .section-title {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      padding: 5px 8px;
      margin-bottom: 4px;
      background: #f3f4f6;
      color: #374151;
    }

    table {
      width: 100%;
      border-collapse: collapse;
    }

    th {
      padding: 5px 8px;
      text-align: left;
      font-size: 10px;
      font-weight: 600;
      text-transform: uppercase;
      color: #555;
      border-bottom: 1px solid #d1d5db;
    }

    th.right,
    td.right {
      text-align: right;
    }

    td {
      padding: 5px 8px;
      border-bottom: 1px solid #e5e7eb;
      font-variant-numeric: tabular-nums;
    }

    td.in {
      color: #065f46;
    }

    td.out {
      color: #9f1239;
    }

    td.net-pos {
      color: #065f46;
      font-weight: 600;
    }

    td.net-neg {
      color: #991b1b;
      font-weight: 600;
    }

    tr.total td {
      font-weight: 700;
      border-top: 2px solid #1a1a1a;
      border-bottom: none;
      padding-top: 7px;
    }

    .footer {
      margin-top: 40px;
      font-size: 10px;
      color: #888;
      text-align: right;
      border-top: 1px solid #e5e7eb;
      padding-top: 10px;
    }
  </style>
</head>

<body>
  <div class="header">
    <h1>Laporan Arus Kas</h1>
    <div class="subtitle">
      Periode {{ $report['period']['from'] }} s/d {{ $report['period']['to'] }}
    </div>
  </div>

  {{-- Summary --}}
  <div class="summary-grid">
    <div class="summary-card in">
      <div class="label">Total Kas Masuk</div>
      <div class="value">Rp {{ number_format($report['cash_in'], 0, ',', '.') }}</div>
    </div>
    <div class="summary-card out">
      <div class="label">Total Kas Keluar</div>
      <div class="value">Rp {{ number_format($report['cash_out'], 0, ',', '.') }}</div>
    </div>
    <div class="summary-card net">
      <div class="label">Net Arus Kas</div>
      <div class="value">Rp {{ number_format($report['net_cashflow'], 0, ',', '.') }}</div>
    </div>
  </div>

  {{-- Per aktivitas --}}
  <div class="section">
    <div class="section-title">Rincian per Aktivitas</div>
    <table>
      <thead>
        <tr>
          <th>Aktivitas</th>
          <th class="right">Kas Masuk</th>
          <th class="right">Kas Keluar</th>
          <th class="right">Net</th>
        </tr>
      </thead>
      <tbody>
        @foreach ($report['activities'] as $a)
          <tr>
            <td>{{ $a['label'] }}</td>
            <td class="right in">{{ number_format($a['cash_in'], 0, ',', '.') }}</td>
            <td class="right out">{{ number_format($a['cash_out'], 0, ',', '.') }}</td>
            <td class="right {{ $a['net'] >= 0 ? 'net-pos' : 'net-neg' }}">
              {{ number_format($a['net'], 0, ',', '.') }}
            </td>
          </tr>
        @endforeach
        <tr class="total">
          <td>Total</td>
          <td class="right">Rp {{ number_format($report['cash_in'], 0, ',', '.') }}</td>
          <td class="right">Rp {{ number_format($report['cash_out'], 0, ',', '.') }}</td>
          <td class="right">Rp {{ number_format($report['net_cashflow'], 0, ',', '.') }}</td>
        </tr>
      </tbody>
    </table>
  </div>

  {{-- Per bulan --}}
  @if (count($report['monthly']) > 0)
    <div class="section">
      <div class="section-title">Rincian per Bulan</div>
      <table>
        <thead>
          <tr>
            <th>Bulan</th>
            <th class="right">Kas Masuk</th>
            <th class="right">Kas Keluar</th>
            <th class="right">Net</th>
          </tr>
        </thead>
        <tbody>
          @foreach ($report['monthly'] as $m)
            <tr>
              <td>{{ $m['label'] }}</td>
              <td class="right in">{{ number_format($m['cash_in'], 0, ',', '.') }}</td>
              <td class="right out">{{ number_format($m['cash_out'], 0, ',', '.') }}</td>
              <td class="right {{ $m['net'] >= 0 ? 'net-pos' : 'net-neg' }}">
                {{ number_format($m['net'], 0, ',', '.') }}
              </td>
            </tr>
          @endforeach
        </tbody>
      </table>
    </div>
  @endif

  <div class="footer">Dicetak pada {{ now()->format('d/m/Y H:i') }}</div>
</body>

</html>
