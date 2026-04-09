@extends('emails.layout')

@section('title', 'Proposal Telah Kadaluarsa')
@section('subtitle', 'Hubungi kami untuk mendapatkan proposal terbaru')

@section('content')
  <p class="greeting">Halo, {{ $proposal->customer?->name }}!</p>

  <p class="message">
    Proposal berikut telah melewati tanggal berlaku. Jika Anda masih tertarik, silakan hubungi kami untuk mendapatkan proposal terbaru.
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
        <td class="info-label">Berlaku Hingga</td>
        <td class="info-value">{{ $proposal->valid_until?->translatedFormat('d F Y') ?? '-' }}</td>
      </tr>
      <tr>
        <td class="info-label">Total</td>
        <td class="info-value">Rp {{ number_format($proposal->total_amount, 0, ',', '.') }}</td>
      </tr>
    </table>
  </div>
@endsection

@section('action_url', frontend_url("/portal/proposal/{$proposal->id}"))
@section('action_label', 'Lihat Proposal')