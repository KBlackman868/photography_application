<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1a1a2e; margin: 0; padding: 0; background: #f8fafc; }
        .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
        .card { background: #ffffff; border-radius: 16px; padding: 40px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        .badge { display: inline-block; background: #fef3c7; color: #92400e; font-size: 12px; font-weight: 600; padding: 4px 12px; border-radius: 20px; text-transform: uppercase; letter-spacing: 0.5px; }
        h2 { font-size: 22px; font-weight: 700; color: #0f172a; margin: 16px 0 8px; }
        .subtitle { color: #64748b; font-size: 14px; margin-bottom: 28px; }
        .section-title { font-size: 12px; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; margin: 24px 0 12px; }
        .detail-row { padding: 10px 0; border-bottom: 1px solid #f1f5f9; }
        .detail-label { color: #64748b; font-size: 13px; }
        .detail-value { color: #0f172a; font-size: 14px; font-weight: 600; }
        .package-box { background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 12px; padding: 16px; margin-top: 16px; }
        .package-name { font-weight: 700; color: #1e40af; }
        .package-price { font-size: 20px; font-weight: 700; color: #197fe6; }
        .message-box { background: #f8fafc; border-left: 3px solid #197fe6; padding: 16px; border-radius: 0 8px 8px 0; margin-top: 16px; }
        .message-box p { margin: 0; color: #475569; font-size: 14px; font-style: italic; }
        .footer { text-align: center; margin-top: 24px; color: #94a3b8; font-size: 13px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="card">
            <span class="badge">New Booking Request</span>
            <h2>{{ $clientName }}</h2>
            <p class="subtitle">A new booking request has been submitted on your website.</p>

            <div class="section-title">Client Details</div>
            <div>
                <div class="detail-row">
                    <div class="detail-label">Name</div>
                    <div class="detail-value">{{ $clientName }}</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">Email</div>
                    <div class="detail-value">{{ $clientEmail }}</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">Phone</div>
                    <div class="detail-value">{{ $clientPhone }}</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">Session Type</div>
                    <div class="detail-value">{{ $sessionType }}</div>
                </div>
            </div>

            <div class="section-title">Session Details</div>
            <div>
                <div class="detail-row">
                    <div class="detail-label">Date</div>
                    <div class="detail-value">{{ $booking->session_date?->format('l, F j, Y') }}</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">Time</div>
                    <div class="detail-value">{{ $booking->session_date?->format('g:i A') }}</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">Location</div>
                    <div class="detail-value">{{ $booking->location }}</div>
                </div>
            </div>

            @if($booking->package)
                <div class="section-title">Selected Package</div>
                <div class="package-box">
                    <div class="package-name">{{ $booking->package->name }}</div>
                    <div class="package-price">${{ number_format($booking->package->price, 2) }}</div>
                    @if($booking->package->description)
                        <div style="color: #64748b; font-size: 13px; margin-top: 4px;">{{ $booking->package->description }}</div>
                    @endif
                </div>
            @endif

            @if($message)
                <div class="section-title">Client Message</div>
                <div class="message-box">
                    <p>{{ $message }}</p>
                </div>
            @endif
        </div>
        <div class="footer">
            <p>This is an automated notification from your photography studio website.</p>
        </div>
    </div>
</body>
</html>
