// app/components/ButtonCard.tsx

interface ButtonProps {
  nome: string;
  preco: string;
  imagem: string;
}

export default function ButtonCard({ nome, preco, imagem }: ButtonProps) {
  return (
    <div className="border border-gray-200 rounded-xl p-4 shadow-lg hover:shadow-xl transition bg-white">
      {/* Área da Imagem */}
      <div className="w-full h-48 bg-gray-100 rounded-lg mb-4 overflow-hidden flex items-center justify-center">
        {/* Usando a tag img normal por enquanto para facilitar */}
        <img 
          src={imagem} 
          alt={nome} 
          className="object-cover w-full h-full"
        />
      </div>
      
      {/* Informações */}
      <h3 className="text-lg font-bold text-gray-800">{nome}</h3>
      <p className="text-green-600 font-bold text-xl">R$ {preco}</p>
      
      {/* Botão de Comprar */}
      <button className="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-medium">
        Adicionar ao Carrinho
      </button>
    </div>
  );
}