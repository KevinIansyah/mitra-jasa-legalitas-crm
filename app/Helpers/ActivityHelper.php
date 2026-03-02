<?php

namespace App\Helpers;

use Spatie\Activitylog\Models\Activity;

class ActivityHelper
{
  private static array $fieldLabels = [
    'status'               => 'status',
    'name'                 => 'nama',
    'title'                => 'judul',
    'description'          => 'deskripsi',
    'budget'               => 'budget',
    'amount'               => 'jumlah',
    'start_date'           => 'tanggal mulai',
    'planned_end_date'     => 'rencana selesai',
    'actual_start_date'    => 'tanggal mulai aktual',
    'actual_end_date'      => 'tanggal selesai aktual',
    'due_date'             => 'jatuh tempo',
    'paid_at'              => 'tanggal bayar',
    'role'                 => 'peran',
    'can_approve_documents' => 'hak approve dokumen',
    'is_billable'          => 'dapat ditagih',
    'category'             => 'kategori',
    'expense_date'         => 'tanggal pengeluaran',
    'file_path'            => 'file',
    'invoice_number'       => 'nomor invoice',
    'type'                 => 'tipe',
  ];

  private static array $subjectLabels = [
    'project'   => 'project',
    'milestone' => 'milestone',
    'invoice'   => 'invoice',
    'expense'   => 'pengeluaran',
    'member'    => 'anggota tim',
    'document'  => 'dokumen',
  ];

  public static function describe(Activity $activity): string
  {
    $subject = self::$subjectLabels[$activity->log_name] ?? $activity->log_name;
    $subjectName = $activity->properties->get('subject_name')
      ?? $activity->subject?->title
      ?? $activity->subject?->name
      ?? null;
    $event   = $activity->event;
    $old     = $activity->properties->get('old', []);
    $new     = $activity->properties->get('attributes', []);

    if ($event === 'created') {
      return "Menambahkan {$subject} baru" . ($subjectName ? " \"{$subjectName}\"" : '');
    }

    if ($event === 'deleted') {
      return "Menghapus {$subject}" . ($subjectName ? " \"{$subjectName}\"" : '');
    }

    if ($event === 'updated' && !empty($old)) {
      $changes = [];

      foreach ($old as $field => $oldValue) {
        $newValue = $new[$field] ? $new[$field] : 'null';
        $label    = self::$fieldLabels[$field] ?? $field;

        $changes[] = "mengubah {$label} dari \"{$oldValue}\" menjadi \"{$newValue}\"";
      }

      if (count($changes) === 1) {
        return ucfirst($changes[0]) . " pada {$subject}" . ($subjectName ? " \"{$subjectName}\"" : 'null');
      }

      return "Memperbarui " . implode(', ', $changes) . " pada {$subject}" . ($subjectName ? " \"{$subjectName}\"" : 'null');
    }

    return "Memperbarui {$subject}" . ($subjectName ? " \"{$subjectName}\"" : '"null"');
  }

  private static function formatValue($value): string
  {
    if ($value === null || $value === '') {
      return 'null';
    }

    return "\"{$value}\"";
  }
}
