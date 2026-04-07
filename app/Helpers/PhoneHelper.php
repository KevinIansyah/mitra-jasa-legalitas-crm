<?php

namespace App\Helpers;

class PhoneHelper
{
    /**
     * Normalize phone numbers (Indonesia): strip non-digits, 0→+62, 62→+62, else +prefix.
     * Returns null for null, empty string, or when no digits remain.
     */
    public static function format(?string $phone): ?string
    {
        if ($phone === null || $phone === '') {
            return null;
        }

        $digits = preg_replace('/[^0-9]/', '', $phone);

        if ($digits === '') {
            return null;
        }

        if (str_starts_with($digits, '0')) {
            return '+62'.substr($digits, 1);
        }

        if (str_starts_with($digits, '62')) {
            return '+'.$digits;
        }

        return '+'.$digits;
    }
}
