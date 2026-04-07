@extends('emails.layout')

@section('title', 'Reset Password')
@section('subtitle', 'Permintaan Keamanan Akun')

@section('content')
  <p class="greeting">Halo, {{ $user->name }}!</p>

  <p class="message">
    Kami menerima permintaan reset password untuk akun kamu. Klik tombol di bawah untuk membuat password baru.
  </p>

  <div class="info-box">
    <table>
      <tr>
        <td class="info-label">Email</td>
        <td class="info-value">{{ $email }}</td>
      </tr>
      <tr>
        <td class="info-label">Link Berlaku</td>
        <td class="info-value">60 menit</td>
      </tr>
    </table>
  </div>
@endsection

@section('action_url', url(route('password.reset', ['token' => $token, 'email' => $email], false)))
@section('action_label', 'Reset Password')
