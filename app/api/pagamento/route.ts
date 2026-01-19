import { MercadoPagoConfig, Payment } from 'mercadopago';
import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
  const token = process.env.MP_ACCESS_TOKEN;
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;

  // Defina o link correto do seu site aqui
  const URL_DO_SEU_SITE = 'https://loja-buttons.vercel.app'; 

  try {
    if (!token || !emailUser || !emailPass) {
      throw new Error("Faltam variáveis de ambiente.");
    }

    const client = new MercadoPagoConfig({ accessToken: token });
    
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: emailUser, pass: emailPass },
    });

    const { valor, descricao, nome, email, cpf } = await request.json();
    const cpfLimpo = cpf.replace(/\D/g, '');

    // --- GERA O PIX ---
    const payment = new Payment(client);
    
    const result = await payment.create({
      body: {
        transaction_amount: Number(valor),
        description: descricao,
        payment_method_id: 'pix',
        payer: {
          email: email,
          first_name: nome,
          identification: { type: 'CPF', number: cpfLimpo }
        },
        notification_url: `${URL_DO_SEU_SITE}/api/webhook`,
        // 👇 AQUI ESTÁ A MÁGICA: SALVAMOS NO METADATA PARA NÃO PERDER
        metadata: {
            email_cliente: email,
            nome_cliente: nome
        }
      }
    });

    const pixCopiaCola = result.point_of_interaction?.transaction_data?.qr_code;
    const idPagamento = result.id;
    const pixBase64 = result.point_of_interaction?.transaction_data?.qr_code_base64;

    // --- ENVIA O EMAIL DE "AGUARDANDO PAGAMENTO" ---
    const htmlEmail = `
      <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #e63946;">Pedido Confirmado, ${nome}! 🚀</h2>
        <p>Seu pedido #${idPagamento} foi gerado.</p>
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 10px; text-align: center; margin: 20px 0;">
          <h1 style="color: #2a9d8f; margin: 0;">R$ ${Number(valor).toFixed(2).replace('.', ',')}</h1>
        </div>
        <h3>👇 Código PIX (Copia e Cola):</h3>
        <div style="background-color: #eee; padding: 15px; word-break: break-all; font-size: 12px; border-radius: 5px; border: 1px dashed #999;">
          ${pixCopiaCola}
        </div>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;" />
        <p style="text-align: center; color: #888; font-size: 12px;">Buttons Express</p>
      </div>
    `;

    try {
      await transporter.sendMail({
        from: `"Buttons Express" <${emailUser}>`,
        to: email,
        subject: `Pague seu Pedido #${idPagamento} ⚡`,
        html: htmlEmail,
      });
    } catch (emailError) {
      console.error("⚠️ Erro email inicial:", emailError);
    }

    return NextResponse.json({
      status: 'sucesso',
      qr_code: pixCopiaCola,
      qr_code_base64: pixBase64,
      id_pagamento: idPagamento
    });

  } catch (error: any) {
    console.error("❌ ERRO NO BACKEND:", error);
    return NextResponse.json({ status: 'erro', mensagem: error.message }, { status: 400 });
  }
}