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
        .greeting { font-size: 22px; font-weight: 700; color: #0f172a; margin: 0 0 8px; }
        .subtitle { color: #64748b; font-size: 14px; margin: 0 0 28px; }
        .ref-badge { display: inline-block; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 4px 12px; font-size: 12px; color: #64748b; font-family: monospace; margin-bottom: 20px; }
        .status-change { text-align: center; padding: 32px 20px; margin: 24px 0; background: #f8fafc; border-radius: 12px; }
        .status-old { display: inline-block; padding: 8px 20px; border-radius: 8px; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; background: #f1f5f9; color: #94a3b8; text-decoration: line-through; }
        .status-arrow { display: inline-block; margin: 0 16px; color: #d4af37; font-size: 20px; vertical-align: middle; }
        .status-new { display: inline-block; padding: 8px 20px; border-radius: 8px; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
        .status-confirmed { background: #dcfce7; color: #166534; }
        .status-quoted { background: #dbeafe; color: #1e40af; }
        .status-deposit_paid { background: #d1fae5; color: #065f46; }
        .status-completed { background: #f1f5f9; color: #475569; }
        .status-cancelled { background: #fee2e2; color: #991b1b; }
        .status-inquiry { background: #fef3c7; color: #92400e; }
        .details-compact { margin: 24px 0 0; padding: 20px; background: #f8fafc; border-radius: 10px; }
        .details-compact .label { font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 12px; }
        .details-compact .row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 13px; }
        .details-compact .row .key { color: #64748b; }
        .details-compact .row .val { color: #0f172a; font-weight: 600; }
        .info-box { background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 12px; padding: 20px; margin: 24px 0; }
        .info-box p { margin: 0; color: #1e40af; font-size: 14px; line-height: 1.7; }
        .footer { text-align: center; padding: 24px 20px; }
        .footer p { color: #94a3b8; font-size: 12px; margin: 4px 0; }
        .footer .brand { font-weight: 600; color: #64748b; }
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
            <p class="greeting">Hi {{ $clientName }},</p>
            <p class="subtitle">Your booking status has been updated.</p>

            <div class="ref-badge">Ref: KB-{{ str_pad($booking->id, 5, '0', STR_PAD_LEFT) }}</div>

            <div class="status-change">
                <span class="status-old">{{ str_replace('_', ' ', $oldStatus) }}</span>
                <span class="status-arrow">&rarr;</span>
                <span class="status-new status-{{ $newStatus }}">{{ str_replace('_', ' ', $newStatus) }}</span>
            </div>

            @if($newStatus === 'confirmed')
                <div class="info-box">
                    <p>
                        <strong>Great news!</strong> Your session has been confirmed.
                        I'm looking forward to capturing amazing moments with you. If you have any
                        questions or last-minute changes, feel free to reply to this email.
                    </p>
                </div>
            @elseif($newStatus === 'deposit_paid')
                <div class="info-box">
                    <p>
                        <strong>Deposit received!</strong> Thank you for securing your session.
                        Your booking is now locked in. I'll be in touch closer to the date with
                        preparation tips and details.
                    </p>
                </div>
            @elseif($newStatus === 'completed')
                <div class="info-box">
                    <p>
                        <strong>Session complete!</strong> Thank you for an amazing session.
                        I'll be working on your photos and will share your gallery soon.
                        Thank you for choosing {{ $booking->studio->name ?? 'Kyle Blackman Photography' }}!
                    </p>
                </div>
            @elseif($newStatus === 'cancelled')
                <div class="info-box" style="background: #fef2f2; border-color: #fecaca;">
                    <p style="color: #991b1b;">
                        Your booking has been cancelled. If this was unexpected or you'd like to
                        reschedule, please don't hesitate to reach out.
                    </p>
                </div>
            @endif

            <div class="details-compact">
                <p class="label">Booking Details</p>
                <div class="row">
                    <span class="key">Date</span>
                    <span class="val">{{ $booking->session_date?->format('M j, Y') }}</span>
                </div>
                <div class="row">
                    <span class="key">Time</span>
                    <span class="val">{{ $booking->session_date?->format('g:i A') }}</span>
                </div>
                <div class="row">
                    <span class="key">Location</span>
                    <span class="val">{{ $booking->location }}</span>
                </div>
            </div>

            <p style="color: #64748b; font-size: 13px; margin-top: 24px; text-align: center;">
                If you have any questions, feel free to reply to this email
                @if($booking->studio->phone)
                    or call <strong>{{ $booking->studio->phone }}</strong>
                @endif
            </p>
        </div>

        <div class="footer">
            <p class="brand">{{ $booking->studio->name ?? 'Kyle Blackman Photography' }}</p>
            <p>&copy; {{ date('Y') }} {{ $booking->studio->name ?? 'Photography Studio' }}. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
