@extends('emails.layout')

@section('title', 'Estimasi Baru untuk Anda')
@section('subtitle', 'Silakan tinjau estimasi biaya dari kami')

@section('content')
  @php
    $customer = $estimate->customer ?? ($estimate->proposal?->customer ?? $estimate->quote?->customer);

    $name = $customer?->name ?? ($estimate->quote?->user?->name ?? '-');
  @endphp

  <p class="greeting">Halo, {{ $name }}!</p>

  <p class="message">
    Kami telah menyiapkan estimasi biaya untuk Anda. Silakan tinjau dan berikan konfirmasi.
  </p>

  <div class="info-box">
    <table>
      <tr>
        <td class="info-label">Nomor Estimasi</td>
        <td class="info-value">{{ $estimate->estimate_number }}</td>
      </tr>
      <tr>
        <td class="info-label">Versi</td>
        <td class="info-value">{{ $estimate->version_label }}</td>
      </tr>
      @if ($estimate->proposal)
        <tr>
          <td class="info-label">Proposal</td>
          <td class="info-value">{{ $estimate->proposal->proposal_number }}</td>
        </tr>
      @endif
      @if ($estimate->quote)
        <tr>
          <td class="info-label">Quote</td>
          <td class="info-value">{{ $estimate->quote->reference_number }}</td>
        </tr>
      @endif
      @if ($estimate->estimate_date)
        <tr>
          <td class="info-label">Tanggal Estimasi</td>
          <td class="info-value">{{ $estimate->estimate_date->translatedFormat('d F Y') }}</td>
        </tr>
      @endif
      @if ($estimate->valid_until)
        <tr>
          <td class="info-label">Berlaku Hingga</td>
          <td class="info-value">{{ $estimate->valid_until->translatedFormat('d F Y') }}</td>
        </tr>
      @endif
      @if ($estimate->discount_amount > 0)
        <tr>
          <td class="info-label">Diskon</td>
          <td class="info-value">-Rp {{ number_format($estimate->discount_amount, 0, ',', '.') }}</td>
        </tr>
      @endif
      @if ($estimate->tax_amount > 0)
        <tr>
          <td class="info-label">Pajak</td>
          <td class="info-value">Rp {{ number_format($estimate->tax_amount, 0, ',', '.') }}</td>
        </tr>
      @endif
      <tr>
        <td class="info-label">Total</td>
        <td class="info-value">Rp {{ number_format($estimate->total_amount, 0, ',', '.') }}</td>
      </tr>
    </table>
  </div>

  <p class="message">
    Estimasi juga terlampir dalam email ini sebagai file PDF.
  </p>
@endsection

@section('action_url', frontend_url("/portal/estimasi/{$estimate->id}"))
@section('action_label', 'Tinjau Estimasi')
