<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1a1a2e; margin: 0; padding: 0; background: #f8fafc; }
        .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
        .card { background: #ffffff; border-radius: 16px; padding: 40px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        .logo { text-align: center; margin-bottom: 32px; }
        .logo h1 { font-size: 20px; font-weight: 700; color: #0f172a; margin: 0; }
        h2 { font-size: 24px; font-weight: 700; color: #0f172a; margin: 0 0 8px; }
        .subtitle { color: #64748b; font-size: 15px; margin-bottom: 32px; }
        .detail-row { display: flex; padding: 14px 0; border-bottom: 1px solid #f1f5f9; }
        .detail-label { color: #64748b; font-size: 14px; font-weight: 500; min-width: 120px; }
        .detail-value { color: #0f172a; font-size: 14px; font-weight: 600; }
        .package-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin-top: 24px; }
        .package-name { font-weight: 700; font-size: 16px; color: #0f172a; }
        .package-price { font-size: 24px; font-weight: 700; color: #197fe6; margin-top: 4px; }
        .package-desc { color: #64748b; font-size: 13px; margin-top: 8px; }
        .footer { text-align: center; margin-top: 32px; color: #94a3b8; font-size: 13px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="card">
            <div class="logo">
                <h1>{{ $booking->studio->name ?? 'Photography Studio' }}</h1>
            </div>

            <h2>Booking Request Received!</h2>
            <p class="subtitle">Hi {{ $clientName }}, thank you for your booking request. Here are the details:</p>

            <div>
                <div class="detail-row">
                    <span class="detail-label">Date</span>
                    <span class="detail-value">{{ $booking->session_date?->format('l, F j, Y') }}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Time</span>
                    <span class="detail-value">{{ $booking->session_date?->format('g:i A') }}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Location</span>
                    <span class="detail-value">{{ $booking->location }}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Status</span>
                    <span class="detail-value">Pending Confirmation</span>
                </div>
            </div>

            @if($booking->package)
                <div class="package-box">
                    <div class="package-name">{{ $booking->package->name }}</div>
                    <div class="package-price">${{ number_format($booking->package->price, 2) }}</div>
                    @if($booking->package->description)
                        <div class="package-desc">{{ $booking->package->description }}</div>
                    @endif
                </div>
            @endif

            <p style="margin-top: 32px; color: #64748b; font-size: 14px;">
                I'll review your request and get back to you within 24 hours to confirm your session details.
            </p>
        </div>
        <div class="footer">
            <p>&copy; {{ date('Y') }} {{ $booking->studio->name ?? 'Photography Studio' }}. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
