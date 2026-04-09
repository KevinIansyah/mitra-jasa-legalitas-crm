@extends('emails.layout')

@section('title', 'Permintaan Penawaran Ditolak')
@section('subtitle', 'Permintaan quote Anda tidak dapat diproses')

@section('content')
  <p class="greeting">Halo, {{ $quote->user?->name }}!</p>

  <p class="message">
    Mohon maaf, permintaan penawaran Anda tidak dapat kami proses saat ini. Berikut detail permintaan penawaran yang ditolak:
  </p>

  <div class="info-box">
    <table>
      <tr>
        <td class="info-label">Nomor Referensi</td>
        <td class="info-value">{{ $quote->reference_number }}</td>
      </tr>
      <tr>
        <td class="info-label">Proyek</td>
        <td class="info-value">{{ $quote->project_name ?? '-' }}</td>
      </tr>
      @if ($quote->service)
        <tr>
          <td class="info-label">Layanan</td>
          <td class="info-value">{{ $quote->service->name }}</td>
        </tr>
      @endif
      <tr>
        <td class="info-label">Tanggal Pengajuan</td>
        <td class="info-value">{{ $quote->created_at->setTimezone(config('app.timezone'))->translatedFormat('d F Y') }}
        </td>
      </tr>
    </table>
  </div>

  @if ($quote->rejected_reason)
    <div style="margin: 20px 0; padding: 16px; background: #fef2f2; border-left: 4px solid #ef4444; border-radius: 4px;">
      <p style="margin: 0; font-size: 13px; font-weight: 600; color: #991b1b;">Alasan Penolakan:</p>
      <p style="margin: 6px 0 0; font-size: 13px; color: #7f1d1d;">{{ $quote->rejected_reason }}</p>
    </div>
  @endif

  <p class="message">
    Jika Anda memiliki pertanyaan atau ingin mengajukan permintaan penawaran baru, jangan ragu untuk menghubungi kami.
  </p>
@endsection

@section('action_url', frontend_url("/portal/permintaan-penawaran/{$quote->id}"))
@section('action_label', 'Lihat Detail')
