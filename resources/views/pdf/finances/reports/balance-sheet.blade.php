<!DOCTYPE html>
<html lang="id">

<head>
  <meta charset="UTF-8">
  <title>Neraca</title>
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
    }

    .section-title.asset {
      background: #dbeafe;
      color: #1e40af;
    }

    .section-title.liability {
      background: #ffe4e6;
      color: #9f1239;
    }

    .section-title.equity {
      background: #ede9fe;
      color: #5b21b6;
    }

    table {
      width: 100%;
      border-collapse: collapse;
    }

    td {
      padding: 5px 8px;
      border-bottom: 1px solid #e5e7eb;
    }

    td.code {
      color: #888;
      width: 70px;
      font-family: monospace;
      font-size: 10px;
    }

    td.amount {
      text-align: right;
      font-variant-numeric: tabular-nums;
    }

    tr.total td {
      font-weight: 700;
      border-top: 2px solid #1a1a1a;
      border-bottom: none;
      padding-top: 7px;
    }

    .balance-box {
      margin-top: 24px;
      padding: 12px 16px;
      border: 2px solid;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .balance-box.ok {
      border-color: #10b981;
      background: #f0fdf4;
    }

    .balance-box.err {
      border-color: #ef4444;
      background: #fef2f2;
    }

    .balance-row {
      display: flex;
      justify-content: space-between;
      font-size: 11px;
    }

    .balance-row.status {
      font-weight: 700;
      border-top: 1px solid #d1d5db;
      padding-top: 6px;
      margin-top: 2px;
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
    <h1>Neraca</h1>
    <div class="subtitle">Per tanggal {{ $report['as_of'] }}</div>
  </div>

  {{-- Aset --}}
  <div class="section">
    <div class="section-title asset">Aset</div>
    <table>
      @foreach ($report['assets']['detail'] as $item)
        <tr>
          <td class="code">{{ $item['code'] }}</td>
          <td>{{ $item['name'] }}</td>
          <td class="amount">{{ number_format($item['amount'], 0, ',', '.') }}</td>
        </tr>
      @endforeach
      <tr class="total">
        <td class="code"></td>
        <td>Total Aset</td>
        <td class="amount">Rp {{ number_format($report['assets']['total'], 0, ',', '.') }}</td>
      </tr>
    </table>
  </div>

  {{-- Kewajiban --}}
  <div class="section">
    <div class="section-title liability">Kewajiban</div>
    <table>
      @foreach ($report['liabilities']['detail'] as $item)
        <tr>
          <td class="code">{{ $item['code'] }}</td>
          <td>{{ $item['name'] }}</td>
          <td class="amount">{{ number_format($item['amount'], 0, ',', '.') }}</td>
        </tr>
      @endforeach
      <tr class="total">
        <td class="code"></td>
        <td>Total Kewajiban</td>
        <td class="amount">Rp {{ number_format($report['liabilities']['total'], 0, ',', '.') }}</td>
      </tr>
    </table>
  </div>

  {{-- Ekuitas --}}
  <div class="section">
    <div class="section-title equity">Ekuitas</div>
    <table>
      @foreach ($report['equity']['detail'] as $item)
        <tr>
          <td class="code">{{ $item['code'] }}</td>
          <td>{{ $item['name'] }}</td>
          <td class="amount">{{ number_format($item['amount'], 0, ',', '.') }}</td>
        </tr>
      @endforeach
      <tr class="total">
        <td class="code"></td>
        <td>Total Ekuitas</td>
        <td class="amount">Rp {{ number_format($report['equity']['total'], 0, ',', '.') }}</td>
      </tr>
    </table>
  </div>

  {{-- Balance check --}}
  <div class="balance-box {{ $report['is_balanced'] ? 'ok' : 'err' }}">
    <div class="balance-row">
      <span>Total Aset</span>
      <span>Rp {{ number_format($report['assets']['total'], 0, ',', '.') }}</span>
    </div>
    <div class="balance-row">
      <span>Total Kewajiban + Ekuitas</span>
      <span>Rp {{ number_format($report['total_liabilities_and_equity'], 0, ',', '.') }}</span>
    </div>
    <div class="balance-row status">
      <span>Status</span>
      <span>{{ $report['is_balanced'] ? 'Balance ✓' : 'Tidak Balance ✗' }}</span>
    </div>
  </div>

  <div class="footer">Dicetak pada {{ now()->format('d/m/Y H:i') }}</div>
</body>

</html>
