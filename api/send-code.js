export default async function handler(req, res) {
  // 只允许POST请求
  if (req.method !== 'POST') {
    return res.status(405).json({ msg: "仅支持POST" });
  }
  try {
    const { email } = req.body;
    if (!email || !email.includes('@')) {
      return res.status(400).json({ msg: "邮箱格式错误" });
    }
    // 生成6位数字验证码
    const code = String(Math.floor(100000 + Math.random() * 900000));
    // 这里只是生成，Vercel无持久存储！
    // 👉 重要提醒：免费Vercel函数没有数据库，验证码没法存、没法校验！
    // 这个接口【只能发邮件】，校验验证码你后面要搭配别的存储（Supabase免费版）
    const brevoRes = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": process.env.BREVO_API_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        sender: { name: "你的APP名称", email: "这里填你Brevo验证好的发件邮箱" },
        to: [{ email: email }],
        subject: "你的验证码",
        htmlContent: `<p>验证码：<b>${code}</b></p><p>5分钟内有效，请勿转发</p>`
      })
    })
    const result = await brevoRes.json();
    if (!brevoRes.ok) {
      return res.status(500).json({ msg: "发送失败", detail: result });
    }
    return res.status(200).json({ msg: "发送成功", code: code });
  } catch (err) {
    return res.status(500).json({ msg: "服务器异常", err: err.message });
  }
}