<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1a1a2e; margin: 0; padding: 0; background: #f1f5f9; }
        .wrapper { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
        .alert-bar { background: #d4af37; color: #0f172a; text-align: center; padding: 10px; border-radius: 16px 16px 0 0; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; }
        .card { background: #ffffff; padding: 40px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
        .ref-badge { display: inline-block; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 4px 12px; font-size: 12px; color: #64748b; font-family: monospace; }
        h2 { font-size: 24px; font-weight: 700; color: #0f172a; margin: 16px 0 4px; }
        .subtitle { color: #64748b; font-size: 14px; margin: 0 0 28px; }
        .section-title { font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; margin: 28px 0 12px; padding-bottom: 8px; border-bottom: 2px solid #f1f5f9; }
        .details-grid { margin-bottom: 0; }
        .detail-row { display: flex; padding: 12px 0; border-bottom: 1px solid #f1f5f9; }
        .detail-row:last-child { border-bottom: none; }
        .detail-label { color: #94a3b8; font-size: 13px; font-weight: 500; min-width: 120px; }
        .detail-value { color: #0f172a; font-size: 14px; font-weight: 600; }
        .detail-value a { color: #1e3a8a; text-decoration: none; }
        .package-card { background: linear-gradient(135deg, #eff6ff, #f0fdf4); border: 1px solid #dbeafe; border-radius: 12px; padding: 20px; margin-top: 16px; }
        .package-name { font-weight: 700; font-size: 16px; color: #1e40af; margin: 0 0 4px; }
        .package-price { font-size: 22px; font-weight: 700; color: #d4af37; margin: 0; }
        .package-desc { color: #64748b; font-size: 13px; margin: 6px 0 0; }
        .message-box { background: #fffbeb; border: 1px solid #fde68a; border-radius: 12px; padding: 20px; margin-top: 16px; }
        .message-box .label { font-size: 11px; font-weight: 700; color: #92400e; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 8px; }
        .message-box p { margin: 0; color: #78350f; font-size: 14px; font-style: italic; line-height: 1.7; }
        .action-btn { display: inline-block; margin-top: 28px; background: #1e3a8a; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 10px; font-size: 14px; font-weight: 600; }
        .footer { text-align: center; margin-top: 24px; color: #94a3b8; font-size: 12px; }
    </style>
</head>
<body>
    <div class="wrapper">
        <div class="alert-bar">New Booking Request</div>
        <div class="card">
            <span class="ref-badge">KB-{{ str_pad($booking->id, 5, '0', STR_PAD_LEFT) }}</span>
            <h2>{{ $clientName }}</h2>
            <p class="subtitle">A new booking request has been submitted on your website.</p>

            <div class="section-title">Client Information</div>
            <div class="details-grid">
                <div class="detail-row">
                    <span class="detail-label">Name</span>
                    <span class="detail-value">{{ $clientName }}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Email</span>
                    <span class="detail-value"><a href="mailto:{{ $clientEmail }}">{{ $clientEmail }}</a></span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Phone</span>
                    <span class="detail-value"><a href="tel:{{ $clientPhone }}">{{ $clientPhone }}</a></span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Session Type</span>
                    <span class="detail-value">{{ $sessionType }}</span>
                </div>
            </div>

            <div class="section-title">Session Details</div>
            <div class="details-grid">
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
            </div>

            @if($booking->package)
                <div class="section-title">Selected Package</div>
                <div class="package-card">
                    <p class="package-name">{{ $booking->package->name }}</p>
                    <p class="package-price">${{ number_format($booking->package->price, 2) }}</p>
                    @if($booking->package->description)
                        <p class="package-desc">{{ $booking->package->description }}</p>
                    @endif
                </div>
            @endif

            @if($message)
                <div class="section-title">Client Message</div>
                <div class="message-box">
                    <p class="label">From {{ $clientName }}</p>
                    <p>{{ $message }}</p>
                </div>
            @endif

            <div style="text-align: center;">
                <a href="{{ url('/bookings') }}" class="action-btn">View in Dashboard</a>
            </div>
        </div>
        <div class="footer">
            <p>This notification was sent from your photography studio website.</p>
        </div>
    </div>
</body>
</html>
