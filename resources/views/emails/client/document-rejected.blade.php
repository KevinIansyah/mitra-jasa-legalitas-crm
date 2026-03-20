@extends('emails.layout')

@section('title', 'Dokumen Ditolak')
@section('subtitle', 'Dokumen Anda perlu diperbaiki atau diunggah ulang')

@section('content')
  @php
    $customer = $document->project->customer;
  @endphp

  <p class="greeting">Halo, {{ $customer?->name }}!</p>

  <p class="message">
    Dokumen yang Anda unggah tidak dapat kami terima. Silakan periksa alasan penolakan di bawah dan unggah ulang dokumen
    yang sesuai.
  </p>

  <div class="info-box">
    <table>
      <tr>
        <td class="info-label">Project</td>
        <td class="info-value">{{ $document->project->name }}</td>
      </tr>
      <tr>
        <td class="info-label">Nama Dokumen</td>
        <td class="info-value">{{ $document->name }}</td>
      </tr>
      @if ($document->description)
        <tr>
          <td class="info-label">Keterangan</td>
          <td class="info-value">{{ $document->description }}</td>
        </tr>
      @endif
    </table>
  </div>

  @if ($document->rejection_reason)
    <div style="margin: 20px 0; padding: 16px; background: #fef2f2; border-left: 4px solid #ef4444; border-radius: 4px;">
      <p style="margin: 0; font-size: 13px; font-weight: 600; color: #991b1b;">Alasan Penolakan:</p>
      <p style="margin: 6px 0 0; font-size: 13px; color: #7f1d1d;">{{ $document->rejection_reason }}</p>
    </div>
  @endif

  <p class="message">
    Silakan login ke portal dan unggah ulang dokumen yang benar.
  </p>
@endsection

@section('action_url', url("/portal/proyek/{$document->project->id}/dokumen"))
@section('action_label', 'Unggah Ulang Dokumen')
