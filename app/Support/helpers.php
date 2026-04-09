<?php

if (! function_exists('frontend_url')) {
    function frontend_url(string $path = ''): string
    {
        $base = rtrim((string) config('app.frontend_url'), '/');
        $path = ltrim($path, '/');

        return $path === '' ? $base : $base.'/'.$path;
    }
}
