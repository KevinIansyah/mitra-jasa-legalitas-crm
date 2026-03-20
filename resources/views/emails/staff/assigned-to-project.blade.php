@extends('emails.layout')

@section('title', 'Kamu Ditugaskan ke Project')
@section('subtitle', 'Notifikasi Penugasan Tim')

@section('content')
  <p class="greeting">Halo, {{ $member->user->name }}!</p>

  <p class="message">
    Kamu telah ditugaskan ke proyek berikut. Segera cek detail dan mulai berkolaborasi dengan tim.
  </p>

  <div class="info-box">
    <table>
      <tr>
        <td class="info-label">Proyek</td>
        <td class="info-value">{{ $member->project->name }}</td>
      </tr>
      <tr>
        <td class="info-label">Role</td>
        <td class="info-value">
          {{ match ($member->role) {
              'project_leader' => 'Project Leader',
              'team_member' => 'Team Member',
              'observer' => 'Observer',
              default => ucfirst($member->role),
          } }}
        </td>
      </tr>
      <tr>
        <td class="info-label">Tanggal Mulai</td>
        <td class="info-value">{{ $member->project->start_date?->setTimezone(config('app.timezone'))->translatedFormat('d F Y') ?? '-' }}</td>
      </tr>
      <tr>
        <td class="info-label">Ditugaskan Pada</td>
        <td class="info-value">{{ $member->assigned_at->setTimezone(config('app.timezone'))->translatedFormat('d F Y, H:i') }}</td>
      </tr>
    </table>
  </div>
@endsection

@section('action_url', url("/projects/{$member->project->id}"))
@section('action_label', 'Lihat Project')
