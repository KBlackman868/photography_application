<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1a1a2e; margin: 0; padding: 0; background: #f1f5f9; }
        .wrapper { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
        .header { text-align: center; padding: 32px 40px; background: linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%); border-radius: 16px 16px 0 0; }
        .header h1 { font-size: 22px; font-weight: 700; color: #ffffff; margin: 0 0 4px; letter-spacing: 0.5px; }
        .header .tagline { font-size: 11px; color: #d4af37; text-transform: uppercase; letter-spacing: 2px; font-weight: 600; margin: 0; }
        .gold-bar { height: 3px; background: linear-gradient(90deg, transparent, #d4af37, transparent); }
        .card { background: #ffffff; padding: 40px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
        .greeting { font-size: 26px; font-weight: 700; color: #0f172a; margin: 0 0 8px; }
        .subtitle { color: #64748b; font-size: 15px; margin: 0 0 32px; }
        .ref-badge { display: inline-block; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px 16px; margin-bottom: 24px; }
        .ref-badge span { font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; display: block; }
        .ref-badge strong { font-size: 16px; color: #0f172a; font-family: monospace; }
        .details-grid { border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; margin-bottom: 24px; }
        .detail-row { display: flex; padding: 14px 20px; border-bottom: 1px solid #f1f5f9; }
        .detail-row:last-child { border-bottom: none; }
        .detail-row:nth-child(even) { background: #f8fafc; }
        .detail-label { color: #64748b; font-size: 13px; font-weight: 500; min-width: 110px; }
        .detail-value { color: #0f172a; font-size: 14px; font-weight: 600; }
        .package-card { background: linear-gradient(135deg, #f8fafc, #eff6ff); border: 1px solid #dbeafe; border-radius: 12px; padding: 24px; margin: 24px 0; }
        .package-label { font-size: 10px; color: #64748b; text-transform: uppercase; letter-spacing: 1px; font-weight: 600; margin: 0 0 6px; }
        .package-name { font-weight: 700; font-size: 18px; color: #0f172a; margin: 0 0 4px; }
        .package-price { font-size: 28px; font-weight: 700; color: #d4af37; margin: 0 0 6px; }
        .package-desc { color: #64748b; font-size: 13px; margin: 0; }
        .status-badge { display: inline-block; background: #fef3c7; color: #92400e; font-size: 11px; font-weight: 700; padding: 5px 14px; border-radius: 20px; text-transform: uppercase; letter-spacing: 0.5px; }
        .message-box { background: #f8fafc; border-left: 3px solid #d4af37; padding: 20px 24px; border-radius: 0 12px 12px 0; margin: 28px 0; }
        .message-box p { margin: 0; color: #475569; font-size: 14px; line-height: 1.7; }
        .divider { height: 1px; background: #e2e8f0; margin: 28px 0; }
        .footer { text-align: center; padding: 24px 20px; }
        .footer p { color: #94a3b8; font-size: 12px; margin: 4px 0; }
        .footer .brand { font-weight: 600; color: #64748b; }
        .social-links { margin-top: 12px; }
        .social-links a { color: #94a3b8; text-decoration: none; font-size: 12px; margin: 0 8px; }
        .social-links a:hover { color: #d4af37; }
    </style>
</head>
<body>
    <div class="wrapper">
        <div class="header">
            <h1>{{ $booking->studio->name ?? 'Photography Studio' }}</h1>
            <p class="tagline">Capturing Your Story</p>
        </div>
        <div class="gold-bar"></div>
        <div class="card">
            <p class="greeting">Thank You, {{ $clientName }}!</p>
            <p class="subtitle">
                Thank you for choosing <strong>{{ $booking->studio->name ?? 'Kyle Blackman Photography' }}</strong>.
                Your booking request has been received and I'm excited to work with you!
            </p>

            <div class="ref-badge">
                <span>Booking Reference</span>
                <strong>KB-{{ str_pad($booking->id, 5, '0', STR_PAD_LEFT) }}</strong>
            </div>

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
                <div class="detail-row">
                    <span class="detail-label">Status</span>
                    <span class="detail-value"><span class="status-badge">Pending Review</span></span>
                </div>
            </div>

            @if($booking->package)
                <div class="package-card">
                    <p class="package-label">Selected Package</p>
                    <p class="package-name">{{ $booking->package->name }}</p>
                    <p class="package-price">${{ number_format($booking->package->price, 2) }}</p>
                    @if($booking->package->description)
                        <p class="package-desc">{{ $booking->package->description }}</p>
                    @endif
                </div>
            @endif

            <div class="divider"></div>

            <div class="message-box">
                <p>
                    <strong>What happens next?</strong><br>
                    I'll personally review your booking request and get back to you within 24 hours
                    to confirm your session details, answer any questions, and discuss your vision for the shoot.
                </p>
            </div>

            <p style="color: #64748b; font-size: 13px; margin-top: 24px; text-align: center;">
                If you have any questions in the meantime, feel free to reply to this email
                @if($booking->studio->phone)
                    or call <strong>{{ $booking->studio->phone }}</strong>
                @endif
            </p>
        </div>

        <div class="footer">
            <p class="brand">{{ $booking->studio->name ?? 'Kyle Blackman Photography' }}</p>
            @if($booking->studio->website)
                <p>{{ $booking->studio->website }}</p>
            @endif
            @if($booking->studio->social_links)
                <div class="social-links">
                    @if(!empty($booking->studio->social_links['instagram']))
                        <a href="https://instagram.com/{{ $booking->studio->social_links['instagram'] }}">Instagram</a>
                    @endif
                    @if(!empty($booking->studio->social_links['facebook']))
                        <a href="{{ $booking->studio->social_links['facebook'] }}">Facebook</a>
                    @endif
                </div>
            @endif
            <p>&copy; {{ date('Y') }} {{ $booking->studio->name ?? 'Photography Studio' }}. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
