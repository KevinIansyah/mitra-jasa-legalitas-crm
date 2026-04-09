@extends('emails.layout')

@section('title', 'Project Selesai!')
@section('subtitle', 'Project Anda telah selesai dikerjakan')

@section('content')
  <p class="greeting">Halo, {{ $project->customer?->name }}!</p>

  <p class="message">
    Kami dengan senang hati memberitahukan bahwa proyek Anda telah selesai dikerjakan. Terima kasih telah mempercayakan
    kebutuhan legalitas Anda kepada kami.
  </p>

  <div class="info-box">
    <table>
      <tr>
        <td class="info-label">Nama Proyek</td>
        <td class="info-value">{{ $project->name }}</td>
      </tr>
      <tr>
        <td class="info-label">Layanan</td>
        <td class="info-value">{{ $project->service?->name ?? '-' }}</td>
      </tr>
      <tr>
        <td class="info-label">Tanggal Selesai</td>
        <td class="info-value">
          {{ $project->actual_end_date?->translatedFormat('d F Y') ?? now()->translatedFormat('d F Y') }}</td>
      </tr>
    </table>
  </div>

  <p class="message">
    Silakan cek hasil akhir proyek Anda melalui portal pelanggan. Jika ada pertanyaan, jangan ragu untuk menghubungi
    kami.
  </p>
@endsection

@section('action_url', frontend_url("/portal/proyek/{$project->id}"))
@section('action_label', 'Lihat Hasil Proyek')
