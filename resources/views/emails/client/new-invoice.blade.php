@extends('emails.layout')

@section('title', 'Faktur Baru Diterbitkan')
@section('subtitle', 'Silakan lakukan pembayaran sebelum jatuh tempo')

@section('content')
  @php $customer = $invoice->customer ?? $invoice->project?->customer; @endphp

  <p class="greeting">Halo, {{ $customer?->name }}!</p>

  <p class="message">
    Faktur baru telah diterbitkan untuk Anda. Silakan lakukan pembayaran sebelum tanggal jatuh tempo:
  </p>

  <div class="info-box">
    <table>
      <tr>
        <td class="info-label">Nomor Faktur</td>
        <td class="info-value">{{ $invoice->invoice_number }}</td>
      </tr>
      <tr>
        <td class="info-label">Tipe</td>
        <td class="info-value">{{ $invoice->formatted_type }}</td>
      </tr>
      @if ($invoice->project)
        <tr>
          <td class="info-label">Proyek</td>
          <td class="info-value">{{ $invoice->project->name }}</td>
        </tr>
      @endif
      <tr>
        <td class="info-label">Tanggal Faktur</td>
        <td class="info-value">{{ $invoice->invoice_date->translatedFormat('d F Y') }}</td>
      </tr>
      <tr>
        <td class="info-label">Jatuh Tempo</td>
        <td class="info-value">{{ $invoice->due_date->translatedFormat('d F Y') }}</td>
      </tr>
      @if ($invoice->discount_amount > 0)
        <tr>
          <td class="info-label">Diskon</td>
          <td class="info-value">-Rp {{ number_format($invoice->discount_amount, 0, ',', '.') }}</td>
        </tr>
      @endif
      @if ($invoice->tax_amount > 0)
        <tr>
          <td class="info-label">Pajak</td>
          <td class="info-value">Rp {{ number_format($invoice->tax_amount, 0, ',', '.') }}</td>
        </tr>
      @endif
      <tr>
        <td class="info-label">Total</td>
        <td class="info-value">Rp {{ number_format($invoice->total_amount, 0, ',', '.') }}</td>
      </tr>
    </table>
  </div>

  @if ($invoice->payment_instructions)
    <p class="message"><strong>Instruksi Pembayaran:</strong><br>{{ $invoice->payment_instructions }}</p>
  @endif
@endsection

@section('action_url', url("/portal/faktur/{$invoice->id}"))
@section('action_label', 'Lihat & Bayar Faktur')
