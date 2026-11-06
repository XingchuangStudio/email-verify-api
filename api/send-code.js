export default async function handler(req, res) {
    if (req.method !== 'POST') {
          return res.status(405).json({ error: 'Method not allowed' });
    }

    const { email } = req.body || {};

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          return res.status(400).json({ error: '请输入有效的邮箱地址' });
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();

    try {
          const r = await fetch('https://api.resend.com/emails', {
                  method: 'POST',
                  headers: {
                            'Authorization': 'Bearer ' + process.env.BREVO_API_KEY,
                            'Content-Type': 'application/json'
                                    },
                  body: JSON.stringify({
                            from: 'onboarding@resend.dev',
                            to: email,
                            subject: '【验证码】您的登录验证码',
                            text: '您的验证码是：' + code + '，5分钟内有效。',
                            html: '<div style="padding:20px;font-family:sans-serif"><h2>邮箱验证码</h2><p>您的验证码是：</p><p style="font-size:32px;font-weight:bold;color:#333;letter-spacing:4px">' + code + '</p><p style="color:#999;font-size:14px">5分钟内有效，请勿泄露给他人。</p></div>'
                                    })
                        });

          const data = await r.json();
          if (!r.ok) {
                  return res.status(500).json({ error: '发送失败', detail: data });
          }

          return res.status(200).json({ success: true, message: '验证码已发送' });
        } catch (err) {
          console.error('邮件发送失败:', err);
          return res.status(500).json({ error: '发送失败：' + err.message });
    }
}
