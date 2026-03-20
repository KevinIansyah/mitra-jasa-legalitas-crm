@extends('emails.layout')

@section('title', 'Estimasi Telah Kadaluarsa')
@section('subtitle', 'Hubungi kami untuk mendapatkan estimasi terbaru')

@section('content')
  @php
    $customer = $estimate->customer ?? ($estimate->proposal?->customer ?? $estimate->quote?->customer);

    $name = $customer?->name ?? ($estimate->quote?->user?->name ?? '-');
  @endphp

  <p class="greeting">Halo, {{ $name }}!</p>

  <p class="message">
    Estimasi berikut telah melewati tanggal berlaku. Jika Anda masih tertarik, silakan hubungi kami untuk mendapatkan
    estimasi terbaru.
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
      <tr>
        <td class="info-label">Berlaku Hingga</td>
        <td class="info-value">{{ $estimate->valid_until?->translatedFormat('d F Y') ?? '-' }}</td>
      </tr>
      <tr>
        <td class="info-label">Total</td>
        <td class="info-value">Rp {{ number_format($estimate->total_amount, 0, ',', '.') }}</td>
      </tr>
    </table>
  </div>
@endsection

@section('action_url', url("/portal/estimasi/{$estimate->id}"))
@section('action_label', 'Lihat Estimasi')
