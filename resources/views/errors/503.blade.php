<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="robots" content="noindex, nofollow">
    <title>Layanan tidak tersedia — {{ config('app.name') }}</title>
    <link rel="icon" href="/favicon.ico" sizes="any">
    <style>
        :root {
            --bg: oklch(0.97 0.005 260);
            --card: oklch(1 0 0);
            --text: oklch(0.2 0.02 260);
            --muted: oklch(0.45 0.02 260);
            --border: oklch(0.9 0.01 260);
            --accent: oklch(0.45 0.15 250);
        }
        @media (prefers-color-scheme: dark) {
            :root {
                --bg: oklch(0.145 0 0);
                --card: oklch(0.2 0.01 260);
                --text: oklch(0.95 0.01 260);
                --muted: oklch(0.65 0.02 260);
                --border: oklch(0.35 0.02 260);
                --accent: oklch(0.7 0.12 250);
            }
        }
        * { box-sizing: border-box; }
        body {
            margin: 0;
            min-height: 100vh;
            font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
            background: var(--bg);
            color: var(--text);
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 1.5rem;
        }
        .card {
            width: 100%;
            max-width: 28rem;
            background: var(--card);
            border: 1px solid var(--border);
            border-radius: 0.75rem;
            padding: 2rem 1.5rem;
            text-align: center;
            box-shadow: 0 1px 3px oklch(0 0 0 / 0.06);
        }
        .code {
            font-size: 2.5rem;
            font-weight: 600;
            color: var(--muted);
            letter-spacing: -0.02em;
            font-variant-numeric: tabular-nums;
        }
        h1 {
            margin: 0.5rem 0 0;
            font-size: 1.25rem;
            font-weight: 600;
        }
        p {
            margin: 0.75rem 0 0;
            font-size: 0.9375rem;
            line-height: 1.5;
            color: var(--muted);
        }
        .hint {
            margin-top: 1.25rem;
            font-size: 0.75rem;
            color: var(--muted);
        }
    </style>
</head>
<body>
    <div class="card">
        <div class="code">503</div>
        <h1>Layanan tidak tersedia</h1>
        <p>
            Aplikasi sedang dalam pemeliharaan atau sementara tidak dapat diakses.
            Silakan coba lagi beberapa saat.
        </p>
        @if (! empty($retryAfter))
            <p style="margin-top: 0.75rem;">
                Coba lagi setelah: <strong>{{ $retryAfter }}</strong>
            </p>
        @endif
        <p class="hint">{{ config('app.name') }}</p>
    </div>
</body>
</html>
