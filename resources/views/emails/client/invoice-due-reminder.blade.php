@extends('emails.layout')

@section('title', "Jatuh Tempo {$daysLeft} Hari Lagi")
@section('subtitle', 'Segera lakukan pembayaran untuk menghindari keterlambatan')

@section('content')
  @php $customer = $invoice->customer ?? $invoice->project?->customer; @endphp

  <p class="greeting">Halo, {{ $customer?->name }}!</p>

  <p class="message">
    Ini adalah pengingat bahwa faktur Anda akan jatuh tempo dalam <strong>{{ $daysLeft }} hari</strong>.
    Segera lakukan pembayaran untuk menghindari keterlambatan.
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
        <td class="info-label">Jatuh Tempo</td>
        <td class="info-value">{{ $invoice->due_date->translatedFormat('d F Y') }}</td>
      </tr>
      <tr>
        <td class="info-label">Sisa Tagihan</td>
        <td class="info-value">Rp {{ number_format($invoice->remaining_amount, 0, ',', '.') }}</td>
      </tr>
    </table>
  </div>
@endsection

@section('action_url', url("/portal/faktur/{$invoice->id}"))
@section('action_label', 'Bayar Sekarang')
