@extends('emails.layout')

@section('title', 'Proposal Baru untuk Anda')
@section('subtitle', 'Silakan tinjau dan berikan konfirmasi Anda')

@section('content')
  <p class="greeting">Halo, {{ $proposal->customer?->name }}!</p>

  <p class="message">
    Kami telah menyiapkan proposal untuk kebutuhan Anda. Silakan tinjau dan berikan konfirmasi sebelum tanggal berlaku
    habis.
  </p>

  <div class="info-box">
    <table>
      <tr>
        <td class="info-label">Nomor Proposal</td>
        <td class="info-value">{{ $proposal->proposal_number }}</td>
      </tr>
      <tr>
        <td class="info-label">Proyek</td>
        <td class="info-value">{{ $proposal->project_name }}</td>
      </tr>
      <tr>
        <td class="info-label">Tanggal Proposal</td>
        <td class="info-value">{{ $proposal->proposal_date->translatedFormat('d F Y') }}</td>
      </tr>
      @if ($proposal->valid_until)
        <tr>
          <td class="info-label">Berlaku Hingga</td>
          <td class="info-value">{{ $proposal->valid_until->translatedFormat('d F Y') }}</td>
        </tr>
      @endif
      @if ($proposal->discount_amount > 0)
        <tr>
          <td class="info-label">Diskon</td>
          <td class="info-value">-Rp {{ number_format($proposal->discount_amount, 0, ',', '.') }}</td>
        </tr>
      @endif
      @if ($proposal->tax_amount > 0)
        <tr>
          <td class="info-label">Pajak</td>
          <td class="info-value">Rp {{ number_format($proposal->tax_amount, 0, ',', '.') }}</td>
        </tr>
      @endif
      <tr>
        <td class="info-label">Total</td>
        <td class="info-value">Rp {{ number_format($proposal->total_amount, 0, ',', '.') }}</td>
      </tr>
    </table>
  </div>

  <p class="message">
    Proposal juga terlampir dalam email ini sebagai file PDF. Silakan hubungi kami jika ada pertanyaan.
  </p>
@endsection

@section('action_url', url("/portal/proposal/{$proposal->id}"))
@section('action_label', 'Tinjau Proposal')
