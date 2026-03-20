@extends('emails.layout')

@section('title', 'Faktur Telah Jatuh Tempo')
@section('subtitle', 'Harap segera lakukan pembayaran')

@section('content')
  @php $customer = $invoice->customer ?? $invoice->project?->customer; @endphp

  <p class="greeting">Halo, {{ $customer?->name }}!</p>

  <p class="message">
    Faktur Anda telah melewati tanggal jatuh tempo. Harap segera lakukan pembayaran
    atau hubungi kami jika ada pertanyaan.
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
