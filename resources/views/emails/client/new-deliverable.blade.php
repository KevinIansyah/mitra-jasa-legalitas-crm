@extends('emails.layout')

@section('title', 'Hasil Akhir Tersedia')
@section('subtitle', 'Dokumen hasil pengerjaan project Anda siap diunduh')

@section('content')
  <p class="greeting">Halo, {{ $deliverable->project->customer?->name }}!</p>

  <p class="message">
    Tim kami telah menyelesaikan dan mengunggah hasil akhir untuk proyek Anda. Silakan login ke portal untuk mengunduh
    dokumen tersebut.
  </p>

  <div class="info-box">
    <table>
      <tr>
        <td class="info-label">Proyek</td>
        <td class="info-value">{{ $deliverable->project->name }}</td>
      </tr>
      <tr>
        <td class="info-label">Nama File</td>
        <td class="info-value">{{ $deliverable->name }}</td>
      </tr>
      @if ($deliverable->version)
        <tr>
          <td class="info-label">Versi</td>
          <td class="info-value">{{ $deliverable->version }}</td>
        </tr>
      @endif
      <tr>
        <td class="info-label">Tipe</td>
        <td class="info-value">{{ $deliverable->is_final ? 'File Final' : 'Draft' }}</td>
      </tr>
      @if ($deliverable->description)
        <tr>
          <td class="info-label">Deskripsi</td>
          <td class="info-value">{{ $deliverable->description }}</td>
        </tr>
      @endif
      <tr>
        <td class="info-label">Diunggah Pada</td>
        <td class="info-value">
          {{ $deliverable->uploaded_at->setTimezone(config('app.timezone'))->translatedFormat('d F Y, H:i') }}</td>
      </tr>
    </table>
  </div>

  <p class="message">
    Gunakan tombol di bawah untuk mengakses dan mengunduh dokumen Anda.
  </p>
@endsection

@section('action_url', frontend_url("/portal/proyek/{$deliverable->project->id}"))
@section('action_label', 'Unduh Dokumen')
