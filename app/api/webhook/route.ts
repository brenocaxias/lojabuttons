import { MercadoPagoConfig, Payment } from 'mercadopago';
import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN! });

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function POST(request: Request) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id") || url.searchParams.get("data.id");

    if (!id) {
       // Tenta pegar do corpo da requisição se não vier na URL
       try {
         const body = await request.json();
         if (body?.data?.id) return await verificarPagamento(body.data.id);
       } catch (e) { /* corpo vazio */ }
       
       return NextResponse.json({ status: 'Sem ID' });
    }

    return await verificarPagamento(id);

  } catch (error: any) {
    console.error("❌ Erro no Webhook:", error);
    return NextResponse.json({ status: 'erro', details: error.message }, { status: 500 });
  }
}

async function verificarPagamento(paymentId: string) {
    try {
        const payment = new Payment(client);
        const dadosPagamento = await payment.get({ id: paymentId });
        
        console.log(`💰 Status ${paymentId}: ${dadosPagamento.status}`);

        if (dadosPagamento.status === 'approved') {
            
            // Tenta pegar o email de vários lugares para garantir
            // Prioridade: Metadata (onde acabamos de salvar) > Payer > Additional Info
            const emailCliente = 
                dadosPagamento.metadata?.email_cliente || 
                dadosPagamento.payer?.email || 
                (dadosPagamento as any).additional_info?.payer?.email;

            const nomeCliente = 
                dadosPagamento.metadata?.nome_cliente || 
                dadosPagamento.payer?.first_name || 
                "Cliente";

            const valorPago = dadosPagamento.transaction_amount;

            console.log(`📧 Tentando enviar para: [${emailCliente}]`);

            // TRAVA DE SEGURANÇA: Só tenta enviar se tiver um email válido
            if (emailCliente && emailCliente.includes('@')) {
                
                const htmlEmailAprovado = `
                  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 10px; overflow: hidden;">
                    <div style="background-color: #2a9d8f; padding: 20px; text-align: center; color: white;">
                       <h1>Pagamento Confirmado! 🎉</h1>
                    </div>
                    <div style="padding: 20px; color: #333;">
                      <h2>Olá, ${nomeCliente}!</h2>
                      <p>O Mercado Pago confirmou seu pagamento de <strong>R$ ${valorPago?.toFixed(2)}</strong>.</p>
                      <p>Seu pedido está sendo processado.</p>
                      <br>
                      <p style="text-align: center; color: #888; font-size: 12px;">Buttons Express</p>
                    </div>
                  </div>
                `;

                await transporter.sendMail({
                    from: `"Buttons Express" <${process.env.EMAIL_USER}>`,
                    to: emailCliente,
                    subject: `Aprovado! Pedido #${paymentId} confirmado ✅`,
                    html: htmlEmailAprovado,
                });
                console.log(`✅ Email enviado com sucesso para ${emailCliente}`);
                
            } else {
                console.warn(`⚠️ ALERTA: Pagamento aprovado, mas e-mail não encontrado. Metadata:`, dadosPagamento.metadata);
            }
        }

        return NextResponse.json({ status: 'ok', novoStatus: dadosPagamento.status });

    } catch (error) {
        console.error("Erro ao verificar pagamento:", error);
        return NextResponse.json({ status: 'erro ao consultar mp' }, { status: 500 });
    }
}