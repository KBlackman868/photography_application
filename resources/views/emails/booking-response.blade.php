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
        .subtitle { color: #64748b; font-size: 14px; margin: 0 0 24px; }
        .ref-badge { display: inline-block; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 4px 12px; font-size: 12px; color: #64748b; font-family: monospace; margin-bottom: 20px; }
        .message-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 28px; margin: 24px 0; }
        .message-card .from { font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 12px; }
        .message-card .body { color: #1e293b; font-size: 15px; line-height: 1.8; margin: 0; white-space: pre-line; }
        .details-compact { margin: 24px 0 0; padding: 20px; background: #f8fafc; border-radius: 10px; }
        .details-compact .label { font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 12px; }
        .details-compact .row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 13px; }
        .details-compact .row .key { color: #64748b; }
        .details-compact .row .val { color: #0f172a; font-weight: 600; }
        .reply-note { text-align: center; color: #64748b; font-size: 13px; margin-top: 28px; padding-top: 20px; border-top: 1px solid #e2e8f0; }
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
            <p class="subtitle">You have a new message regarding your booking.</p>

            <div class="ref-badge">Ref: KB-{{ str_pad($booking->id, 5, '0', STR_PAD_LEFT) }}</div>

            <div class="message-card">
                <p class="from">Message from {{ $senderName }}</p>
                <p class="body">{{ $responseMessage }}</p>
            </div>

            <div class="details-compact">
                <p class="label">Your Booking Details</p>
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
                <div class="row">
                    <span class="key">Status</span>
                    <span class="val" style="text-transform: capitalize;">{{ str_replace('_', ' ', $booking->status) }}</span>
                </div>
            </div>

            <p class="reply-note">
                You can reply directly to this email to continue the conversation.
            </p>
        </div>

        <div class="footer">
            <p class="brand">{{ $booking->studio->name ?? 'Kyle Blackman Photography' }}</p>
            <p>&copy; {{ date('Y') }} {{ $booking->studio->name ?? 'Photography Studio' }}. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
