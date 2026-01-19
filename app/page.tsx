"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

// --- 1. CONFIGURAÇÃO ---
const NOME_BENEFICIARIO = "Thallyso M. Magalhães";

// 🔴 CONTROLE GERAL
const ACEITANDO_PEDIDOS_AUTOMATICOS = true; 

// 🛡️ TRAVA DE SEGURANÇA
// Acima dessa quantidade (UNIDADES), o pedido vai para "Orçamento"
const LIMITE_AUTOMATICO = 50; 

// Lógica de Preços (Atacado)
function getPrecoPorUnidade(qtd: number) {
  if (qtd >= 100) return 2.00;
  if (qtd >= 75) return 2.15;
  if (qtd >= 50) return 2.25;
  if (qtd >= 25) return 2.35;
  if (qtd >= 10) return 2.60;
  return 3.00;
}

const tabelaSurpresaTotal: Record<number, number> = {
  1: 12.00, 2: 24.00, 3: 34.00, 4: 44.00, 5: 46.00
};
const QTD_BOTOES_NO_KIT = 5;
const LINK_DO_FORMULARIO = "https://forms.gle/Fb9ST4xetPw8rfWx7"; 

const produtos = [
  { 
    id: 1, 
    nome: "Encomenda Personalizada", 
    categoria: "Você Manda, a Gente Faz!", 
    descricao: "Envie sua arte, foto ou logo e transformamos em buttons incríveis.",
    imagem: "/custom.jpg", 
    tipo: "personalizado",
    destaque: false
  },
  { 
    id: 2, 
    nome: "Caixinha Surpresa", 
    categoria: "Kit Mágico (5 Buttons)", 
    descricao: "Um kit com 5 buttons surpresa. Quanto mais kits você leva, maior o desconto!",
    imagem: "/imagemcaixasurpresa.jpg", 
    tipo: "surpresa",
    destaque: true 
  }
];

const fotosInstagram = [
  "/rock.jpg", "/imagem3.jpg", "/imagem1.jpg", "/box.jpg",
  "/imagem6.jpg", "/imagem4.jpg", "/imagem2.jpg", "/imagem5.jpg"
];

// --- 2. COMPONENTE DO CARTÃO ---
function ProdutoCard({ produto, aoComprar, aoErro }: { produto: any, aoComprar: any, aoErro: any }) {
  const [quantidade, setQuantidade] = useState<number | string>(1);
  const [textoCliente, setTextoCliente] = useState("");
  const isSurpresa = produto.tipo === "surpresa";
  const qtdNumerica = Number(quantidade) || 1;

  let total = 0;
  let totalFormatado = "0,00";
  let resumoQuantidade = "";
  let precoUnitarioAtual = 0;
  // Calcula quantos botões reais isso representa
  let qtdRealBotoes = isSurpresa ? qtdNumerica * QTD_BOTOES_NO_KIT : qtdNumerica;

  if (isSurpresa) {
    total = tabelaSurpresaTotal[qtdNumerica] || (qtdNumerica * 12.00);
    totalFormatado = total.toFixed(2).replace('.', ',');
    resumoQuantidade = `${qtdNumerica} Kit(s) (${qtdRealBotoes} buttons)`;
  } else {
    precoUnitarioAtual = getPrecoPorUnidade(qtdNumerica);
    total = precoUnitarioAtual * qtdNumerica;
    totalFormatado = total.toFixed(2).replace('.', ',');
    resumoQuantidade = `${qtdNumerica} un.`;
  }

  const btnClass = isSurpresa ? "bg-purple-600 hover:bg-purple-700" : "bg-brandRed hover:bg-red-700";
  const textClass = isSurpresa ? "text-purple-600" : "text-brandRed";
  const borderHoverClass = isSurpresa ? "hover:border-purple-600" : "hover:border-brandRed";
  const bgSoftClass = isSurpresa ? "bg-purple-50" : "bg-red-50";
  const focusRingClass = isSurpresa ? "focus:border-purple-600 focus:ring-purple-600" : "focus:border-brandRed focus:ring-brandRed";
  const badgeClass = isSurpresa ? "bg-purple-600" : "bg-brandRed";

  const handleBlur = () => {
    let val = Number(quantidade);
    if (!val || val < 1) setQuantidade(1);
    else if (val > 1000) setQuantidade(1000);
  };

  const handleCompra = () => {
    if (!textoCliente.trim()) {
      aoErro("Ops! Escreva o tema ou descrição antes de adicionar.");
      return;
    }
    const detalhes = `[Nota: ${textoCliente}]`;
    aoComprar(produto.nome, resumoQuantidade, total, totalFormatado, detalhes, qtdRealBotoes);
    setTextoCliente("");
    setQuantidade(1);
  };

  return (
    <div className={`bg-white rounded-2xl shadow-xl overflow-hidden border-2 border-transparent ${borderHoverClass} transition flex flex-col h-full group transform hover:-translate-y-1 duration-300`}>
      <div className={`${bgSoftClass} h-56 flex items-center justify-center p-6 relative overflow-hidden`}>
        <div className={`absolute inset-0 opacity-10 ${badgeClass} rounded-full blur-3xl transform scale-150`}></div>
        <Image src={produto.imagem} alt={produto.nome} fill className="object-contain p-4 group-hover:scale-110 transition duration-500 z-10" />
        {produto.destaque && (
          <span className={`absolute top-4 right-4 ${badgeClass} text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-lg z-20`}>
            {isSurpresa ? "✨ Mágica" : "Destaque"}
          </span>
        )}
      </div>

      <div className="p-8 flex flex-col flex-grow gap-5">
        <div>
          <span className={`text-xs font-bold ${textClass} uppercase tracking-widest`}>{produto.categoria}</span>
          <h3 className="text-2xl font-black text-gray-900 leading-tight mt-2 mb-3">{produto.nome}</h3>
          <p className="text-gray-500 text-sm leading-relaxed font-medium">{produto.descricao}</p>
        </div>
        
        <div className="border-t border-gray-100 my-1"></div>
        
        <div>
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wide block mb-2">{isSurpresa ? "1. Qual o tema?" : "1. Descreva o pedido:"}</label>
          <textarea rows={2} value={textoCliente} onChange={(e) => setTextoCliente(e.target.value)} className={`w-full p-3 rounded-xl border border-gray-200 bg-gray-50 ${focusRingClass} focus:bg-white focus:ring-2 outline-none text-sm resize-none transition`} placeholder={isSurpresa ? "Ex: Animes anos 90..." : "Ex: Logo da empresa..."} />
        </div>

        <div>
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wide block mb-2">Quantidade:</label>
          
          {isSurpresa ? (
            <div className="relative">
                <select value={quantidade} onChange={(e) => setQuantidade(Number(e.target.value))} className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 font-bold text-gray-800 cursor-pointer outline-none appearance-none hover:bg-white transition">
                    {Object.keys(tabelaSurpresaTotal).map(Number).sort((a, b) => a - b).map((qtd) => (
                    <option key={qtd} value={qtd}>{qtd} {qtd === 1 ? 'Kit' : 'Kits'} - R$ {tabelaSurpresaTotal[qtd].toFixed(2)}</option>
                    ))}
                </select>
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-400">▼</div>
            </div>
          ) : (
            <div className="relative">
              <input 
                type="number" 
                inputMode="numeric"
                min="1" 
                max="1000"
                value={quantidade} 
                onBlur={handleBlur}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === "") setQuantidade("");
                  else setQuantidade(parseInt(val));
                }} 
                className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 font-black text-xl text-center text-gray-800 outline-none focus:border-brandRed focus:ring-1 focus:ring-brandRed focus:bg-white transition"
              />
              <p className="text-center text-xs text-gray-400 mt-2 font-medium">
                Unidade: <b>R$ {precoUnitarioAtual.toFixed(2).replace('.', ',')}</b>
                {qtdNumerica < 10 && <span className="text-brandRed ml-1 block sm:inline font-bold"> (Leve 10+ por R$ 2,60)</span>}
              </p>
            </div>
          )}
        </div>

        <div className="mt-auto pt-4 flex items-center justify-between">
          <div><p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Total Estimado</p><p className={`text-3xl font-black ${textClass}`}>R$ {totalFormatado}</p></div>
          <button onClick={handleCompra} className={`${btnClass} text-white px-8 py-4 rounded-2xl font-bold transition-all shadow-lg hover:shadow-xl active:scale-95 flex items-center gap-2`}>
            {isSurpresa && <span>✨</span>} Adicionar
          </button>
        </div>
      </div>
    </div>
  );
}

// --- 3. PÁGINA PRINCIPAL ---
export default function Home() {
  const [scrolled, setScrolled] = useState(false);

  const [carrinho, setCarrinho] = useState<string[]>([]);
  const [valorTotalCarrinho, setValorTotalCarrinho] = useState(0);
  const [qtdTotalItens, setQtdTotalItens] = useState(0); // Total de UNIDADES (Buttons)
  
  // DADOS DO CLIENTE
  const [nomeCliente, setNomeCliente] = useState("");
  const [emailCliente, setEmailCliente] = useState("");
  const [cpfCliente, setCpfCliente] = useState("");
  const [enderecoCliente, setEnderecoCliente] = useState("");
  const [tipoEntrega, setTipoEntrega] = useState<'retirada' | 'entrega'>('retirada');

  const [idGerado, setIdGerado] = useState("");
  const [toast, setToast] = useState<{msg: string, tipo: 'sucesso' | 'erro'} | null>(null);

  const [carregandoPix, setCarregandoPix] = useState(false);
  const [pixCopiaCola, setPixCopiaCola] = useState("");
  const [pixImagemBase64, setPixImagemBase64] = useState("");
  const [idPagamentoMP, setIdPagamentoMP] = useState(""); 
  
  const [pedidoConcluido, setPedidoConcluido] = useState(false);

  const temPersonalizado = carrinho.some(item => item.includes("Encomenda Personalizada"));

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  function mostrarAviso(mensagem: string, tipo: 'sucesso' | 'erro') {
    setToast({ msg: mensagem, tipo: tipo });
    setTimeout(() => setToast(null), 3000); 
  }

  function adicionarAoCarrinho(nome: string, qtdTexto: string, valorNumerico: number, valorTexto: string, detalhes: string, qtdReal: number) {
    const itemPedido = `📦 ${nome}\n   └ Qtd: ${qtdTexto} | Total: R$ ${valorTexto}\n   └ ${detalhes}`;
    setCarrinho([...carrinho, itemPedido]);
    setValorTotalCarrinho(valorTotalCarrinho + valorNumerico);
    setQtdTotalItens(qtdTotalItens + qtdReal);
    mostrarAviso(`+ ${qtdTexto} de ${nome} adicionado!`, 'sucesso');
  }

  function gerarProtocolo() {
    if (carrinho.length === 0) {
      mostrarAviso("Adicione itens ao carrinho primeiro!", 'erro');
      const section = document.getElementById("produtos");
      if(section) section.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    
    if (!nomeCliente.trim() || !emailCliente.trim() || !cpfCliente.trim() || !enderecoCliente.trim()) {
      mostrarAviso("Preencha todos os dados e o endereço!", 'erro');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    
    if (!idGerado) {
      const aleatorio = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
      const novoId = `#${aleatorio}`;
      setIdGerado(novoId);
    }
    setPedidoConcluido(false);
    setPixCopiaCola(""); 
    setPixImagemBase64("");

    setTimeout(() => {
      const section = document.getElementById("area-finalizacao");
      if(section) section.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }

  async function gerarPagamentoPix() {
    setCarregandoPix(true);
    try {
      const resposta = await fetch('/api/pagamento', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          valor: valorTotalCarrinho,
          nome: nomeCliente,
          email: emailCliente,
          cpf: cpfCliente,
          descricao: `Pedido ${idGerado} - Buttons Express`,
        })
      });

      const dados = await resposta.json();

      if (dados.status === 'sucesso') {
        setPixCopiaCola(dados.qr_code);
        setPixImagemBase64(dados.qr_code_base64);
        setIdPagamentoMP(dados.id_pagamento);
        mostrarAviso("QR Code gerado com sucesso!", "sucesso");
      } else {
        console.error("Erro MP:", dados);
        mostrarAviso("Erro no Pagamento: Verifique os dados.", "erro");
      }

    } catch (error) {
      console.error(error);
      mostrarAviso("Erro de conexão.", "erro");
    } finally {
      setCarregandoPix(false);
    }
  }

  function copiarPix() {
    if (!pixCopiaCola) return;
    navigator.clipboard.writeText(pixCopiaCola);
    mostrarAviso("Código PIX copiado!", 'sucesso');
  }

  function iniciarNovoPedido() {
    setCarrinho([]);
    setValorTotalCarrinho(0);
    setQtdTotalItens(0);
    setIdGerado("");
    setPedidoConcluido(false);
    setPixCopiaCola("");
    setPixImagemBase64("");
    setIdPagamentoMP("");
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function enviarParaWhatsApp() {
    let statusMsg = "";
    let textoIntro = "";

    const pedidoGrande = qtdTotalItens > LIMITE_AUTOMATICO;
    const precisaEntregar = tipoEntrega === 'entrega';

    if (pedidoGrande) {
        statusMsg = "📦 PEDIDO GRANDE: Aguardando confirmação de estoque/prazo.";
        textoIntro = `Olá! Preciso de uma GRANDE QUANTIDADE (${qtdTotalItens} un). Gostaria de confirmar prazo e estoque.`;
    } else if (precisaEntregar) {
        statusMsg = "🚚 PEDIDO COM ENTREGA: Aguardando cálculo de frete.";
        textoIntro = `Olá! Gostaria de encomendar com ENTREGA para: ${enderecoCliente}.`;
    } else {
        if (idPagamentoMP) {
            statusMsg = `✅ Pagamento PIX (ID: ${idPagamentoMP}) - Retirada no Local.`;
            textoIntro = "Olá! Fiz o pagamento via site e vou retirar.";
        } else {
            statusMsg = "⚠️ Pagamento Pendente - Aguardando instruções.";
            textoIntro = "Olá! Gere meu pedido para retirada, aguardo instruções de pagamento.";
        }
    }

    if (temPersonalizado) {
        statusMsg += " + Artes enviadas no Formulário.";
    }

    const mensagem = `*NOVO PEDIDO: ${idGerado}* 🚀\n${textoIntro}\n\n*Cliente:* ${nomeCliente}\n*Local:* ${enderecoCliente} (${tipoEntrega === 'entrega' ? 'Entrega' : 'Retirada'})\n\n${carrinho.join("\n\n")}\n\n💰 *Valor Produtos: R$ ${valorTotalCarrinho.toFixed(2).replace('.', ',')}* (Sem frete)\n--------------------\n*Status:* ${statusMsg}`;
    
    const numeroWhatsApp = "5588997274467";
    const linkWhatsApp = `https://api.whatsapp.com/send?phone=${numeroWhatsApp}&text=${encodeURIComponent(mensagem)}`;
    
    window.open(linkWhatsApp, "_blank");
    setPedidoConcluido(true);
  }

  const modoOrcamento = tipoEntrega === 'entrega' || 
                        !ACEITANDO_PEDIDOS_AUTOMATICOS || 
                        qtdTotalItens > LIMITE_AUTOMATICO;

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-gray-900 font-sans relative selection:bg-brandRed selection:text-white">
      
      {toast && (
        <div className="fixed top-24 right-5 z-50 animate-bounce-in">
          <div className={`border-l-4 px-6 py-4 rounded-xl shadow-2xl flex items-center gap-4 bg-white ${toast.tipo === 'erro' ? 'border-red-500' : 'border-green-500'}`}>
            <div className={`p-2 rounded-full ${toast.tipo === 'erro' ? 'bg-red-100' : 'bg-green-100'}`}>
              <span className="text-xl">{toast.tipo === 'erro' ? '⚠️' : '🛒'}</span>
            </div>
            <div>
              <h4 className={`font-bold text-xs uppercase tracking-widest ${toast.tipo === 'erro' ? 'text-red-700' : 'text-green-700'}`}>{toast.tipo === 'erro' ? 'Atenção' : 'Sucesso!'}</h4>
              <p className="font-bold text-sm text-gray-800">{toast.msg}</p>
            </div>
          </div>
        </div>
      )}

      {/* NAVBAR */}
      <nav className={`fixed top-0 left-0 w-full z-40 transition-all duration-300 ${scrolled ? 'bg-white/80 backdrop-blur-md shadow-sm py-3' : 'bg-transparent py-6'}`}>
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative w-12 h-12 md:w-14 md:h-14 overflow-hidden rounded-full border-2 border-white shadow-sm">
                <Image src="/logo.png" alt="Logo" fill className="object-cover"/>
            </div>
            <h1 className={`text-xl font-black tracking-tighter uppercase transition-colors duration-300 ${scrolled ? 'text-brandRed' : 'text-gray-800'}`}>Buttons Express</h1>
          </div>
          
          <div className="flex items-center gap-4">
             <div className="relative group cursor-pointer" onClick={() => document.getElementById("area-finalizacao")?.scrollIntoView({behavior: "smooth"})}>
                <span className="text-2xl">🛍️</span>
                {carrinho.length > 0 && (
                    <span className="absolute -top-2 -right-2 bg-brandRed text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full shadow-md animate-pulse">
                        {/* AQUI ESTÁ A CORREÇÃO VISUAL: Mostra Unidades Totais */}
                        {qtdTotalItens}
                    </span>
                )}
             </div>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <header className="relative pt-32 pb-20 px-4 bg-gradient-to-b from-[#FFFBF0] to-[#FAFAFA]">
        <div className="max-w-4xl mx-auto text-center mb-10">
           <h2 className="text-5xl md:text-6xl font-black text-gray-900 tracking-tight mb-4">
             Faça sua <span className="text-transparent bg-clip-text bg-gradient-to-r from-brandRed to-orange-500">Encomenda</span>
           </h2>
           <p className="text-lg text-gray-500 font-medium max-w-xl mx-auto">
             Buttons personalizados de alta qualidade ou caixinhas surpresa. Preencha seus dados para começar.
           </p>
        </div>

        {/* CARD DO CLIENTE */}
        <div className="max-w-4xl mx-auto bg-white p-6 md:p-8 rounded-3xl shadow-2xl border border-gray-100 relative z-10 transform hover:scale-[1.01] transition duration-500">
           <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest shadow-lg">
             Dados do Pedido
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
             <div className="text-left">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1 mb-1 block">Nome Completo</label>
                <input type="text" placeholder="Ex: João Silva" value={nomeCliente} onChange={(e) => setNomeCliente(e.target.value)} className="w-full p-3 bg-gray-50 rounded-xl border-2 border-transparent focus:border-brandRed focus:bg-white outline-none transition font-semibold text-gray-700" />
             </div>
             <div className="text-left">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1 mb-1 block">E-mail</label>
                <input type="email" placeholder="Ex: joao@email.com" value={emailCliente} onChange={(e) => setEmailCliente(e.target.value)} className="w-full p-3 bg-gray-50 rounded-xl border-2 border-transparent focus:border-brandRed focus:bg-white outline-none transition font-semibold text-gray-700" />
             </div>
             <div className="text-left">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1 mb-1 block">CPF</label>
                <input type="text" placeholder="000.000.000-00" value={cpfCliente} onChange={(e) => setCpfCliente(e.target.value)} className="w-full p-3 bg-gray-50 rounded-xl border-2 border-transparent focus:border-brandRed focus:bg-white outline-none transition font-semibold text-gray-700" />
             </div>
             <div className="text-left">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1 mb-1 block">Cidade e Bairro (Para entrega ou identificação)</label>
                <input type="text" placeholder="Ex: Sobral, Centro" value={enderecoCliente} onChange={(e) => setEnderecoCliente(e.target.value)} className="w-full p-3 bg-gray-50 rounded-xl border-2 border-transparent focus:border-brandRed focus:bg-white outline-none transition font-semibold text-gray-700" />
             </div>
           </div>

           {carrinho.length > 0 && (
             <div className="mt-6 border-t border-gray-100 pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 animate-fade-in">
                <p className="text-gray-500 font-medium">
                  {/* AQUI ESTÁ A CORREÇÃO VISUAL: Mostra "un" em vez de "itens" */}
                  🛒 <strong className="text-gray-800">{qtdTotalItens} un</strong> no carrinho. Total: <strong className="text-green-600 text-xl">R$ {valorTotalCarrinho.toFixed(2).replace('.', ',')}</strong>
                </p>
                <button onClick={gerarProtocolo} className="w-full sm:w-auto bg-gray-900 hover:bg-black text-white px-8 py-3 rounded-xl font-bold transition shadow-lg flex items-center justify-center gap-2">
                  Gerar Pedido ➔
                </button>
             </div>
           )}
        </div>
      </header>

      <main id="produtos" className="max-w-5xl mx-auto px-4 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          {produtos.map((produto) => (
            <ProdutoCard key={produto.id} produto={produto} aoComprar={adicionarAoCarrinho} aoErro={(msg: string) => mostrarAviso(msg, 'erro')} />
          ))}
        </div>
      </main>

      {/* --- ÁREA DE FINALIZAÇÃO --- */}
      <section id="area-finalizacao" className="bg-white py-16 border-t border-gray-100 min-h-[400px]">
        <div className="max-w-5xl mx-auto px-4 text-center">
          
          {!idGerado ? (
            <div className="opacity-40 py-10 grayscale">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-4xl">👇</div>
              <p className="text-xl font-bold text-gray-400">
                Adicione produtos e clique em <span className="text-black">"Gerar Pedido"</span> lá em cima.
              </p>
            </div>
          ) : (
            <div className="animate-fade-in-up">
              
              {pedidoConcluido ? (
                <div className="bg-green-50 border border-green-200 p-10 rounded-[2rem] max-w-2xl mx-auto shadow-2xl text-center relative overflow-hidden">
                   <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-green-400 to-emerald-600"></div>
                   <div className="w-24 h-24 bg-white text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 text-5xl shadow-md">🎉</div>
                   <h3 className="text-4xl font-black text-green-800 mb-4 tracking-tight">Pedido Enviado!</h3>
                   <p className="text-green-700 text-lg mb-8 leading-relaxed font-medium">Recebemos sua solicitação. Aguarde nosso retorno no WhatsApp.</p>
                   <button onClick={iniciarNovoPedido} className="block w-full sm:w-auto mx-auto bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-10 rounded-2xl transition shadow-xl transform hover:-translate-y-1 active:scale-95">🛍️ Fazer Novo Pedido</button>
                </div>
              ) : (
                <>
                  <div className="flex flex-col items-center justify-center gap-2 mb-8">
                     <h3 className="text-3xl md:text-4xl font-black uppercase text-gray-800 tracking-tight">Como deseja receber?</h3>
                     <p className="text-gray-500 text-sm">Escolha a opção para prosseguir.</p>
                  </div>

                  <div className="max-w-xl mx-auto bg-gray-50 p-2 rounded-2xl flex mb-10 border border-gray-200">
                      <button onClick={() => setTipoEntrega('retirada')} className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${tipoEntrega === 'retirada' ? 'bg-white text-gray-900 shadow-md' : 'text-gray-400 hover:text-gray-600'}`}>📍 Retirar Grátis (Campus)</button>
                      <button onClick={() => setTipoEntrega('entrega')} className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${tipoEntrega === 'entrega' ? 'bg-white text-gray-900 shadow-md' : 'text-gray-400 hover:text-gray-600'}`}>🚚 Entrega / Outra Cidade</button>
                  </div>

                  {/* LÓGICA DE EXIBIÇÃO */}
                  {modoOrcamento ? (
                    // MODO ORÇAMENTO
                    <div className="bg-orange-50 p-8 rounded-3xl border border-orange-200 max-w-2xl mx-auto shadow-xl">
                         <div className="text-orange-600 text-5xl mb-4">
                            {qtdTotalItens > LIMITE_AUTOMATICO ? '📦' : '🚚'}
                         </div>
                         
                         <h4 className="text-2xl font-black text-orange-900 mb-2">Pedido sob Consulta</h4>
                         
                         <p className="text-orange-800 mb-6 font-medium">
                            {qtdTotalItens > LIMITE_AUTOMATICO 
                                ? `Para grandes quantidades (${qtdTotalItens} un), precisamos confirmar o prazo e estoque antes do pagamento.` 
                                : "Como o local de entrega varia, precisamos calcular o frete e confirmar a disponibilidade."
                            }
                         </p>
                         
                         {/* CÓDIGO DO PEDIDO MOVIDO PARA CÁ */}
                         <div className="bg-white p-4 rounded-xl border border-orange-100 mb-6 text-left relative overflow-hidden">
                            <div className="absolute top-0 right-0 bg-orange-100 text-orange-600 text-[10px] font-bold px-2 py-1 rounded-bl-lg">PROTOCOLO</div>
                            <p className="text-xs font-bold text-gray-400 uppercase">Seu Código</p>
                            <p className="text-2xl font-black text-gray-800 tracking-wider mb-2">{idGerado}</p>
                            
                            <p className="text-xs font-bold text-gray-400 uppercase mt-2">Valor Estimado</p>
                            <p className="text-xl font-black text-gray-800">R$ {valorTotalCarrinho.toFixed(2).replace('.', ',')}</p>
                            <p className="text-[10px] text-orange-600 mt-1 font-bold">+ Frete (A Combinar)</p>
                         </div>

                         <button onClick={enviarParaWhatsApp} className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-4 rounded-xl text-lg transition shadow-lg active:scale-95 flex items-center justify-center gap-2">
                             💬 Enviar Pedido para Análise
                         </button>
                    </div>
                  ) : (
                    // MODO RETIRADA
                    <div className={`grid grid-cols-1 ${temPersonalizado ? 'md:grid-cols-3' : 'md:grid-cols-2 max-w-4xl'} gap-6 mx-auto mt-4 text-left`}>
                      
                      {/* PASSO 1: PAGAMENTO */}
                      <div className={`bg-white p-8 rounded-3xl border border-gray-100 shadow-xl ${temPersonalizado ? 'order-1 md:order-2 md:scale-110 z-10' : 'order-1'} transform transition hover:shadow-2xl`}>
                        <div className="flex items-center gap-3 mb-6">
                          <span className="bg-green-100 text-green-700 rounded-xl w-10 h-10 flex items-center justify-center font-black text-lg shadow-sm">1</span>
                          <h4 className="font-bold text-gray-800 text-xl">Pagamento</h4>
                        </div>
                        <div className="text-center">
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Total a Pagar</p>
                          <p className="text-5xl font-black text-green-600 mb-6 tracking-tighter">R$ {valorTotalCarrinho.toFixed(2).replace('.', ',')}</p>
                          {!pixImagemBase64 ? (
                            <button onClick={gerarPagamentoPix} disabled={carregandoPix} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl text-lg transition flex justify-center gap-2 shadow-lg active:scale-95">
                              {carregandoPix ? "Gerando..." : "Gerar PIX ⚡"}
                            </button>
                          ) : (
                            <div className="animate-fade-in bg-gray-50 p-4 rounded-xl border border-gray-100">
                              <div className="flex justify-center mb-4"><div className="w-40 h-40 relative border-4 border-white rounded-xl shadow-sm overflow-hidden"><img src={`data:image/png;base64,${pixImagemBase64}`} alt="QR Code PIX" className="w-full h-full object-cover"/></div></div>
                              <button onClick={copiarPix} className="w-full bg-gray-900 hover:bg-black text-white font-bold py-2 rounded-lg text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 mb-3">📋 Copiar Código</button>
                              <textarea readOnly value={pixCopiaCola} onClick={(e) => e.currentTarget.select()} className="w-full h-16 text-[10px] text-gray-400 bg-white border border-gray-200 rounded-lg p-2 font-mono resize-none focus:outline-none"/>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* PASSO 2: ARTES (CÓDIGO AQUI DENTRO) */}
                      {temPersonalizado && (
                        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-lg order-2 md:order-1 opacity-90 hover:opacity-100 transition">
                          <div className="flex items-center gap-3 mb-6"><span className="bg-blue-100 text-blue-700 rounded-xl w-10 h-10 flex items-center justify-center font-black text-lg shadow-sm">2</span><h4 className="font-bold text-gray-800 text-xl">Artes</h4></div>
                          
                          {/* CÓDIGO DO PEDIDO EM DESTAQUE */}
                          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-4 text-center cursor-pointer hover:bg-blue-100 transition group" onClick={() => {navigator.clipboard.writeText(idGerado); mostrarAviso("Copiado!", "sucesso")}}>
                                <p className="text-[10px] font-bold text-blue-400 uppercase group-hover:text-blue-600">Seu Código</p>
                                <p className="text-2xl font-black text-blue-700 tracking-wider group-hover:scale-105 transition">{idGerado}</p>
                                <p className="text-[10px] text-blue-400 group-hover:text-blue-600">(Clique para copiar)</p>
                          </div>

                          <p className="text-sm text-gray-500 mb-6 leading-relaxed font-medium">Copie o código acima e anexe suas imagens no formulário.</p>
                          <a href={LINK_DO_FORMULARIO} target="_blank" className="block w-full bg-blue-600 text-white hover:bg-blue-700 font-bold py-4 rounded-xl text-center transition shadow-lg shadow-blue-200">📂 Abrir Formulário</a>
                        </div>
                      )}

                      {/* PASSO 3: CONFIRMAR */}
                      <div className={`bg-white p-8 rounded-3xl border border-gray-100 shadow-lg ${temPersonalizado ? 'order-3' : 'order-2'} opacity-90 hover:opacity-100 transition`}>
                        <div className="flex items-center gap-3 mb-6"><span className="bg-orange-100 text-brandRed rounded-xl w-10 h-10 flex items-center justify-center font-black text-lg shadow-sm">{temPersonalizado ? '3' : '2'}</span><h4 className="font-bold text-gray-800 text-xl">WhatsApp</h4></div>
                        <p className="text-sm text-gray-500 mb-6 leading-relaxed font-medium">Pagou? Avise a gente para agilizar a produção!</p>
                        <button onClick={enviarParaWhatsApp} className="block w-full bg-brandRed text-white font-bold py-4 rounded-xl hover:bg-red-700 text-center transition shadow-lg shadow-red-200">🚀 Confirmar</button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </section>

      <section className="bg-[#FAFAFA] py-16 border-t border-gray-200 relative z-0">
        <div className="max-w-3xl mx-auto px-4 mb-10 text-center">
          <h3 className="text-2xl font-black uppercase text-gray-900 mb-2 tracking-tight">@buttons_express</h3>
          <p className="text-gray-500 text-sm font-medium">Acompanhe nossas produções</p>
        </div>
        <div className="flex flex-nowrap overflow-x-auto snap-x snap-mandatory gap-6 px-4 pb-8 scrollbar-hide justify-start md:justify-center">
          {fotosInstagram.map((src, index) => (
            <a key={index} href="https://www.instagram.com/buttons_express/" target="_blank" className="snap-center shrink-0 w-60 h-60 relative rounded-[2rem] overflow-hidden shadow-xl border-4 border-white group cursor-pointer block transform hover:rotate-2 transition duration-300">
              <Image src={src} alt="Post do Instagram" fill className="object-cover group-hover:scale-110 transition duration-700"/>
            </a>
          ))}
        </div>
      </section>

      {/* --- RODAPÉ COM CRÉDITOS --- */}
      <footer className="bg-white border-t border-gray-100 pt-10 pb-12 relative z-10">
        <div className="max-w-6xl mx-auto px-4 flex flex-col items-center justify-center gap-6">
          
          {/* Marca da Loja */}
          <div className="text-center">
            <p className="font-bold text-sm text-gray-400">Buttons Express © 2025</p>
            <p className="text-[10px] text-gray-300 mt-1">Todos os direitos reservados</p>
          </div>

          {/* Divisória Suave */}
          <div className="w-12 h-[1px] bg-gray-100"></div>

          {/* Créditos do Desenvolvedor (Breno Caxias) */}
          <div className="flex flex-col items-center gap-3">
             <p className="text-xs text-gray-400 font-medium flex items-center gap-1">
               Desenvolvido por <span className="text-gray-800 font-bold">Breno Caxias</span>
             </p>
             
             {/* Ícones de Contato */}
             <div className="flex items-center gap-4">
                
                {/* GitHub */}
                <a href="https://github.com/brenocaxias" target="_blank" className="group relative">
                   <div className="absolute -inset-2 bg-gray-100 rounded-full opacity-0 group-hover:opacity-100 transition duration-300"></div>
                   <svg className="w-5 h-5 text-gray-400 group-hover:text-black relative transition z-10" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                   </svg>
                </a>

                {/* Instagram */}
                <a href="https://instagram.com/brenocaxias" target="_blank" className="group relative">
                   <div className="absolute -inset-2 bg-pink-50 rounded-full opacity-0 group-hover:opacity-100 transition duration-300"></div>
                   <svg className="w-5 h-5 text-gray-400 group-hover:text-pink-600 relative transition z-10" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.468 3.2c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                   </svg>
                </a>

                {/* WhatsApp / Contato Profissional */}
                <a href="https://wa.me/5588994047841" target="_blank" className="group relative">
                   <div className="absolute -inset-2 bg-green-50 rounded-full opacity-0 group-hover:opacity-100 transition duration-300"></div>
                   <svg className="w-5 h-5 text-gray-400 group-hover:text-green-600 relative transition z-10" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                   </svg>
                </a>

             </div>
          </div>

        </div>
      </footer>
    </div>
  );
}