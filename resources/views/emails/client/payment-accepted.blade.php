@extends('emails.layout')

@section('title', 'Pembayaran Diterima')
@section('subtitle', 'Pembayaran Anda telah berhasil diverifikasi')

@section('content')
  @php
    $invoice = $payment->invoice;
    $customer = $invoice->customer ?? $invoice->project?->customer;
  @endphp

  <p class="greeting">Halo, {{ $customer?->name }}!</p>

  <p class="message">
    Pembayaran Anda telah berhasil diverifikasi. Berikut detail pembayaran dan kwitansi Anda:
  </p>

  <div class="info-box">
    <table>
      <tr>
        <td class="info-label">Nomor Kwitansi</td>
        <td class="info-value">{{ $payment->receipt_number }}</td>
      </tr>
      <tr>
        <td class="info-label">Nomor Faktur</td>
        <td class="info-value">{{ $invoice->invoice_number }}</td>
      </tr>
      @if ($invoice->project)
        <tr>
          <td class="info-label">Proyek</td>
          <td class="info-value">{{ $invoice->project->name }}</td>
        </tr>
      @endif
      <tr>
        <td class="info-label">Jumlah Dibayar</td>
        <td class="info-value">Rp {{ number_format($payment->amount, 0, ',', '.') }}</td>
      </tr>
      <tr>
        <td class="info-label">Metode Pembayaran</td>
        <td class="info-value">{{ ucfirst(str_replace('_', ' ', $payment->payment_method)) }}</td>
      </tr>
      @if ($payment->reference_number)
        <tr>
          <td class="info-label">Referensi</td>
          <td class="info-value">{{ $payment->reference_number }}</td>
        </tr>
      @endif
      <tr>
        <td class="info-label">Tanggal Verifikasi</td>
        <td class="info-value">
          {{ $payment->verified_at->setTimezone(config('app.timezone'))->translatedFormat('d F Y, H:i') }}</td>
      </tr>
      <tr>
        <td class="info-label">Diverifikasi Oleh</td>
        <td class="info-value">{{ $payment->verifier?->name ?? '-' }}</td>
      </tr>
    </table>
  </div>

  <p class="message">
    Kwitansi pembayaran Anda tersedia di portal. Silakan unduh untuk keperluan arsip Anda.
  </p>
@endsection

@section('action_url', url("/portal/pembayaran/{$payment->id}"))
@section('action_label', 'Unduh Kwitansi')
