@extends('emails.layout')

@section('title', 'Artikel Baru Telah Terbit')
@section('subtitle', 'Ada konten baru untukmu')

@section('content')
  <p class="greeting">Halo, {{ $name ?? 'Sobat' }}!</p>

  <p class="message">
    Artikel baru telah kami terbitkan. Yuk, langsung baca selengkapnya!
  </p>

  @if ($featuredImage)
    <img src="{{ $featuredImage }}" alt="{{ $title }}"
      style="width:100%;border-radius:8px;margin-bottom:16px;object-fit:cover;max-height:240px;">
  @endif

  <div class="info-box">
    <table>
      <tr>
        <td class="info-label">Judul</td>
        <td class="info-value">{{ $title }}</td>
      </tr>
      @if ($excerpt)
        <tr>
          <td class="info-label">Ringkasan</td>
          <td class="info-value" style="font-weight:normal;color:#3f3f46;">{{ $excerpt }}</td>
        </tr>
      @endif
    </table>
  </div>
@endsection

@section('action_url', $url)
@section('action_label', 'Baca Artikel')

@section('footer_extra')
  <p style="text-align:center;font-size:12px;color:#a1a1aa;margin-top:16px;">
    Tidak ingin menerima email ini lagi?
    <a href="{{ $unsubscribeUrl }}" style="color:#123e87;">Berhenti berlangganan</a>
  </p>
@endsection
