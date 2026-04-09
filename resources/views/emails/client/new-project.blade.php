@extends('emails.layout')

@section('title', 'Proyek Baru Dibuat')
@section('subtitle', 'Informasi Proyek Anda')

@section('content')
  <p class="greeting">Halo, {{ $project->customer?->name }}!</p>

  <p class="message">
    Proyek Anda telah berhasil dibuat dan tim kami siap untuk memulai pengerjaan. Berikut detail proyek Anda:
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
        <td class="info-label">Tanggal Mulai</td>
        <td class="info-value">{{ $project->start_date?->translatedFormat('d F Y') ?? '-' }}</td>
      </tr>
      <tr>
        <td class="info-label">Target Selesai</td>
        <td class="info-value">{{ $project->planned_end_date?->translatedFormat('d F Y') ?? '-' }}</td>
      </tr>
      <tr>
        <td class="info-label">Status</td>
        <td class="info-value">{{ ucfirst($project->status) }}</td>
      </tr>
    </table>
  </div>

  <p class="message">
    Anda dapat memantau perkembangan proyek melalui portal pelanggan kami.
  </p>
@endsection

@section('action_url', frontend_url("/portal/proyek/{$project->id}"))
@section('action_label', 'Lihat Proyek')
