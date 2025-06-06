// lib/emailService.ts
import nodemailer from 'nodemailer';

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false, // true para 465, false para outras portas
      auth: {
        user: process.env.GMAIL_EMAIL,
        pass: process.env.GMAIL_APP_PASSWORD
      }
    });
  }

  async sendPasswordResetEmail(email: string, resetToken: string, userName: string): Promise<boolean> {
    try {
      const resetUrl = `${process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000'}/auth/reset-password?token=${resetToken}`;
      
      const mailOptions = {
        from: `"🎵 Ear Training App" <${process.env.GMAIL_EMAIL}>`,
        to: email,
        subject: '🔑 Recuperação de Senha - Ear Training',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <title>Recuperação de Senha</title>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #007bff; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
              .content { padding: 30px; background: #f9f9f9; }
              .button { 
                display: inline-block; 
                padding: 15px 30px; 
                background: #007bff; 
                color: white; 
                text-decoration: none; 
                border-radius: 5px; 
                margin: 20px 0;
                font-weight: bold;
              }
              .footer { padding: 20px; text-align: center; color: #666; border-radius: 0 0 8px 8px; background: #f1f1f1; }
              .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
              .code-box { background: #eee; padding: 15px; border-radius: 5px; font-family: monospace; word-break: break-all; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🎵 Ear Training App</h1>
                <p style="margin: 0; opacity: 0.9;">Recuperação de Senha</p>
              </div>
              
              <div class="content">
                <h2>Olá, ${userName}! 👋</h2>
                
                <p>Você solicitou a recuperação da sua senha para o <strong>Ear Training App</strong>.</p>
                
                <p>Clique no botão abaixo para criar uma nova senha:</p>
                
                <div style="text-align: center;">
                  <a href="${resetUrl}" class="button">🔑 Redefinir Minha Senha</a>
                </div>
                
                <div class="warning">
                  <p><strong>⚠️ Importante:</strong></p>
                  <ul>
                    <li>Este link é válido por apenas <strong>1 hora</strong></li>
                    <li>O link só pode ser usado <strong>uma única vez</strong></li>
                    <li>Se você não solicitou esta recuperação, pode ignorar este email</li>
                  </ul>
                </div>
                
                <p><strong>Se o botão não funcionar</strong>, copie e cole este link no seu navegador:</p>
                <div class="code-box">
                  ${resetUrl}
                </div>
                
                <p style="margin-top: 30px;">
                  <strong>Dicas de segurança:</strong><br>
                  • Use uma senha forte com pelo menos 8 caracteres<br>
                  • Combine letras, números e símbolos<br>
                  • Não reutilize senhas de outras contas
                </p>
              </div>
              
              <div class="footer">
                <p>© 2024 Ear Training App</p>
                <p style="font-size: 12px; color: #888;">
                  Este email foi enviado automaticamente. Se você não solicitou, pode ignorá-lo com segurança.
                </p>
              </div>
            </div>
          </body>
          </html>
        `
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('✅ Email de recuperação enviado:', result.messageId);
      console.log('📧 Para:', email);
      console.log('🔗 Link:', resetUrl);
      return true;
      
    } catch (error) {
      console.error('❌ Erro ao enviar email:', error);
      return false;
    }
  }

  // Método para testar a configuração de email
  async testConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      console.log('✅ Servidor de email conectado com sucesso');
      console.log(`📧 Usando: ${process.env.GMAIL_EMAIL}`);
      return true;
    } catch (error) {
      console.error('❌ Erro na conexão com servidor de email:', error);
      console.error('🔧 Verifique as credenciais no .env.local');
      return false;
    }
  }

  // Método para enviar email de teste
  async sendTestEmail(): Promise<boolean> {
    try {
      const testEmail = process.env.GMAIL_EMAIL;
      if (!testEmail) {
        console.error('❌ GMAIL_EMAIL não configurado');
        return false;
      }

      const mailOptions = {
        from: `"🎵 Ear Training App" <${process.env.GMAIL_EMAIL}>`,
        to: testEmail,
        subject: '🧪 Teste de Email - Ear Training App',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #007bff;">🎉 Email funcionando!</h2>
            <p>Parabéns! Sua configuração de email está funcionando perfeitamente.</p>
            <p><strong>Configuração atual:</strong></p>
            <ul>
              <li>Host: ${process.env.SMTP_HOST}</li>
              <li>Porta: ${process.env.SMTP_PORT}</li>
              <li>Email: ${process.env.GMAIL_EMAIL}</li>
            </ul>
            <p>Agora você pode usar o sistema de recuperação de senha! 🚀</p>
            <hr>
            <p style="color: #666; font-size: 12px;">
              Teste realizado em: ${new Date().toLocaleString('pt-BR')}
            </p>
          </div>
        `
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('✅ Email de teste enviado:', result.messageId);
      return true;
      
    } catch (error) {
      console.error('❌ Erro ao enviar email de teste:', error);
      return false;
    }
  }
}

// Criar instância nomeada antes de exportar
const emailService = new EmailService();

export default emailService;