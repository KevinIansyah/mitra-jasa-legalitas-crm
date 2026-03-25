@extends('emails.layout')

@section('title', 'Konfirmasi Langganan Blog')
@section('subtitle', 'Satu langkah lagi untuk berlangganan')

@section('content')
  <p class="greeting">Halo, {{ $name ?? 'Sobat' }}!</p>

  <p class="message">
    Terima kasih telah mendaftar untuk berlangganan blog kami. Klik tombol di bawah untuk mengkonfirmasi
    email Anda dan mulai menerima artikel terbaru dari kami.
  </p>

  <p class="message">
    Link konfirmasi ini akan kedaluwarsa dalam <strong>24 jam</strong>.
  </p>
@endsection

@section('action_url', $verifyUrl)
@section('action_label', 'Konfirmasi Langganan')
