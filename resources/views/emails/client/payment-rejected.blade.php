@extends('emails.layout')

@section('title', 'Pembayaran Ditolak')
@section('subtitle', 'Pembayaran Anda tidak dapat diverifikasi')

@section('content')
  @php
    $invoice = $payment->invoice;
    $customer = $invoice->customer ?? $invoice->project?->customer;
  @endphp

  <p class="greeting">Halo, {{ $customer?->name }}!</p>

  <p class="message">
    Mohon maaf, pembayaran Anda tidak dapat diverifikasi. Silakan periksa detail di bawah dan lakukan pembayaran ulang.
  </p>

  <div class="info-box">
    <table>
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
        <td class="info-label">Jumlah</td>
        <td class="info-value">Rp {{ number_format($payment->amount, 0, ',', '.') }}</td>
      </tr>
      <tr>
        <td class="info-label">Tanggal Bayar</td>
        <td class="info-value">{{ $payment->payment_date->translatedFormat('d F Y') }}</td>
      </tr>
    </table>
  </div>

  @if ($payment->rejection_reason)
    <div style="margin: 20px 0; padding: 16px; background: #fef2f2; border-left: 4px solid #ef4444; border-radius: 4px;">
      <p style="margin: 0; font-size: 13px; font-weight: 600; color: #991b1b;">Alasan Penolakan:</p>
      <p style="margin: 6px 0 0; font-size: 13px; color: #7f1d1d;">{{ $payment->rejection_reason }}</p>
    </div>
  @endif

  <p class="message">
    Jika Anda merasa ini adalah kesalahan atau membutuhkan bantuan, silakan hubungi kami.
  </p>
@endsection

@section('action_url', frontend_url("/portal/faktur/{$invoice->id}"))
@section('action_label', 'Bayar Ulang')
