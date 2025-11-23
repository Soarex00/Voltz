import { ShoppingCart, Heart, Star, MessageSquare, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "../services/api";
import { addToCart } from "../utils/addToCart";
import { useNavigate } from "react-router-dom";
import { addToFavorites, isFavorite } from "../utils/addToFavorites";
import Swal from "sweetalert2";

export default function ProductCardFilter({ products: productsProp }) {
  const [products, setProducts] = useState(productsProp || []);
  const [favorites, setFavorites] = useState({});
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  function handleAddToCart(produto) {
    const user = localStorage.getItem('user');
    if (!user) {
      Swal.fire({
        title: 'Login necessário',
        text: 'Você precisa estar logado para adicionar produtos ao carrinho.',
        icon: 'warning',
        confirmButtonColor: '#002D72',
        confirmButtonText: 'Fazer Login'
      }).then((result) => {
        if (result.isConfirmed) {
          navigate('/login');
        }
      });
      return;
    }

    addToCart(produto);
    Swal.fire({
      toast: true,
      position: 'bottom-end',
      icon: 'success',
      title: 'Produto adicionado ao carrinho',
      showConfirmButton: false,
      timer: 2800,
      timerProgressBar: true
    });
  }

  {/* Verificar se é admin*/ }
  useEffect(() => {
    const checkAdmin = () => {
      const userData = localStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        if (user.isAdmin === true) {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
    };

    checkAdmin();
  }, []);

  async function excluirItem(id) {
    const resultado = await Swal.fire({
      title: 'Tem certeza?',
      text: "Esta ação não pode ser desfeita!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#002D72',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sim, excluir!',
      cancelButtonText: 'Cancelar'
    });

    if (resultado.isConfirmed) {
      try {
        await api.delete(`/products/${id}`);

        // Remove o produto do estado local
        setProducts(prevProducts => prevProducts.filter(produto => produto.id !== id));

        Swal.fire({
          title: 'Excluído!',
          text: 'O produto foi removido com sucesso.',
          icon: 'success',
          confirmButtonColor: '#002D72'
        });
      } catch (error) {
        Swal.fire({
          title: 'Erro!',
          text: 'Não foi possível excluir o produto.',
          icon: 'error',
          confirmButtonColor: '#002D72'
        });
      }
    }
  }

  useEffect(() => {
    if (!productsProp) {
      carregarProdutos();
    } else {
      setProducts(productsProp);
      const statusFavoritos = {};
      productsProp.forEach(produto => {
        statusFavoritos[produto.id] = isFavorite(produto.id);
      });
      setFavorites(statusFavoritos);
    }
  }, [productsProp]);

  async function carregarProdutos() {
    try {
      const response = await api.get("/products");
      setProducts(response.data);

      const statusFavoritos = {};
      response.data.forEach(produto => {
        statusFavoritos[produto.id] = isFavorite(produto.id);
      });
      setFavorites(statusFavoritos);
    } catch (error) {
      console.log("Erro ao carregar produtos:", error);
    }
  }

  function alternarFavorito(produto) {
    const foiAdicionado = addToFavorites(produto);
    setFavorites(anterior => ({
      ...anterior,
      [produto.id]: foiAdicionado
    }));
  }

  function calcularMedia(avaliacoes) {
    if (!avaliacoes || avaliacoes.length === 0) return 0;

    const soma = avaliacoes.reduce((total, avaliacao) => total + avaliacao.rating, 0);
    const media = soma / avaliacoes.length;

    return media.toFixed(1);
  }

  async function adicionarAvaliacao(produto) {
    const resultado = await Swal.fire({
      title: `Avaliar ${produto.name}`,
      html: criarFormularioAvaliacao(),
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Enviar Avaliação',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#002D72',
      cancelButtonColor: '#6b7280',
      didOpen: configurarBotoesNota,
      preConfirm: validarFormulario
    });

    if (resultado.value) {
      await salvarAvaliacao(produto, resultado.value);
    }
  }


  function criarFormularioAvaliacao() {
    return `
      <div style="text-align: left;">
        <label style="display: block; margin-bottom: 10px; font-weight: 600; color: #002D72;">
          Seu nome:
        </label>
        <input type="text" id="name" class="swal2-input" placeholder="Digite seu nome" 
          style="width: 100%; margin: 0 0 20px 0; border: 2px solid #002D72; border-radius: 8px; padding: 10px;">
        
        <label style="display: block; margin-bottom: 10px; font-weight: 600; color: #002D72;">
          Sua nota (1 a 5):
        </label>
        <div style="display: flex; gap: 10px; justify-content: center; margin-bottom: 20px;">
          ${[1, 2, 3, 4, 5].map(numero => `
            <button type="button" class="star-btn" data-rating="${numero}" 
              style="background: none; border: 2px solid #002D72; border-radius: 8px; padding: 10px 15px; cursor: pointer; font-size: 18px; transition: all 0.3s;">
              ${numero} ⭐
            </button>
          `).join('')}
        </div>
        <input type="hidden" id="rating" value="5">
        
        <label style="display: block; margin-bottom: 10px; font-weight: 600; color: #002D72;">
          Seu comentário:
        </label>
        <textarea id="comment" class="swal2-input" placeholder="Escreva sua opinião..." 
          style="width: 100%; height: 100px; resize: vertical; border: 2px solid #002D72; border-radius: 8px; padding: 10px;"></textarea>
      </div>
    `;
  }


  function configurarBotoesNota() {
    const botoes = document.querySelectorAll('.star-btn');

    botoes.forEach(botao => {
      botao.addEventListener('click', function () {

        botoes.forEach(b => {
          b.style.background = 'white';
          b.style.color = 'black';
        });


        this.style.background = '#002D72';
        this.style.color = 'white';
        document.getElementById('rating').value = this.dataset.rating;
      });
    });


    botoes[4].click();
  }
  function validarFormulario() {
    const nome = document.getElementById('name').value;
    const nota = document.getElementById('rating').value;
    const comentario = document.getElementById('comment').value;

    if (!nome.trim()) {
      Swal.showValidationMessage('Por favor, digite seu nome');
      return false;
    }

    if (!comentario.trim()) {
      Swal.showValidationMessage('Por favor, escreva um comentário');
      return false;
    }

    return {
      name: nome.trim(),
      rating: parseInt(nota),
      comment: comentario.trim()
    };
  }

  async function salvarAvaliacao(produto, dados) {
    try {
      const novaAvaliacao = {
        name: dados.name,
        rating: dados.rating,
        comment: dados.comment,
        date: new Date().toISOString()
      };

      const produtoAtualizado = {
        ...produto,
        userReviews: [...(produto.userReviews || []), novaAvaliacao]
      };

      await api.put(`/products/${produto.id}`, produtoAtualizado);

      await Swal.fire({
        title: 'Avaliação enviada!',
        text: 'Obrigado pela sua opinião.',
        icon: 'success',
        confirmButtonColor: '#002D72'
      });

      carregarProdutos();
    } catch (error) {
      Swal.fire({
        title: 'Erro!',
        text: 'Não foi possível enviar a avaliação.',
        icon: 'error',
        confirmButtonColor: '#002D72'
      });
    }
  }

  function visualizarAvaliacoes(produto) {
    const avaliacoes = produto.userReviews || [];

    if (avaliacoes.length === 0) {
      Swal.fire({
        title: 'Sem avaliações',
        text: 'Este produto ainda não possui avaliações.',
        icon: 'info',
        confirmButtonColor: '#002D72'
      });
      return;
    }

    const media = calcularMedia(avaliacoes);
    const estrelas = gerarEstrelasVisuais(media);

    Swal.fire({
      title: `Avaliações - ${produto.name}`,
      html: criarListaAvaliacoes(avaliacoes, media, estrelas),
      width: '600px',
      confirmButtonColor: '#002D72',
      confirmButtonText: 'Fechar'
    });
  }

  function gerarEstrelasVisuais(media) {
    const estrelasInteiras = Math.floor(media);
    const temMeiaEstrela = media % 1 >= 0.5;

    let estrelas = '';

    for (let i = 0; i < 5; i++) {
      if (i < estrelasInteiras) {
        estrelas += '⭐';
      } else if (i === estrelasInteiras && temMeiaEstrela) {
        estrelas += '✨';
      } else {
        estrelas += '☆';
      }
    }

    return estrelas;
  }

  function criarListaAvaliacoes(avaliacoes, media, estrelas) {
    const totalAvaliacoes = avaliacoes.length;
    const textoPlural = totalAvaliacoes > 1 ? 'avaliações' : 'avaliação';

    return `
      <div style="text-align: left;">
        <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin-bottom: 20px; text-align: center;">
          <div style="font-size: 32px; margin-bottom: 5px;">${estrelas}</div>
          <div style="font-size: 24px; font-weight: bold; color: #002D72;">${media}</div>
          <div style="color: #6b7280;">Baseado em ${totalAvaliacoes} ${textoPlural}</div>
        </div>
        
        <div style="max-height: 400px; overflow-y: auto;">
          ${avaliacoes.map(avaliacao => criarCardAvaliacao(avaliacao)).join('')}
        </div>
      </div>
    `;
  }

  function criarCardAvaliacao(avaliacao) {
    const nomeUsuario = avaliacao.name || 'Anônimo';
    const dataFormatada = new Date(avaliacao.date).toLocaleDateString('pt-BR');
    const estrelasPreenchidas = '⭐'.repeat(avaliacao.rating);
    const estrelasVazias = '☆'.repeat(5 - avaliacao.rating);

    return `
      <div style="border: 2px solid #002D72; border-radius: 8px; padding: 15px; margin-bottom: 15px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
          <div>
            <div style="color: #002D72; font-weight: bold; margin-bottom: 5px;">
              ${nomeUsuario}
            </div>
            <div style="color: #002D72; font-weight: 600;">
              ${estrelasPreenchidas}${estrelasVazias}
            </div>
          </div>
          <div style="color: #6b7280; font-size: 12px;">
            ${dataFormatada}
          </div>
        </div>
        <div style="color: #374151;">${avaliacao.comment}</div>
      </div>
    `;
  }

  return (
    <section id="catalogo" className="py-20 bg-white">
      <div className="container mx-auto px-6">

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {products.map((produto) => {
            const temAvaliacoes = produto.userReviews && produto.userReviews.length > 0;
            const notaMedia = calcularMedia(produto.userReviews);

            return (
              <div
                key={produto.id}
                className="border border-[#002D72] rounded-2xl shadow-sm hover:shadow-lg transition-shadow duration-300 bg-white flex flex-col relative"
              >
                {!temAvaliacoes && (
                  <span className="absolute top-3 left-3 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full z-10">
                    NEW
                  </span>
                )}

                <button
                  onClick={() => alternarFavorito(produto)}
                  className="absolute top-3 right-3 z-10 p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-all duration-300 group"
                >
                  <Heart
                    className={`h-5 w-5 transition-all duration-300 ${favorites[produto.id]
                      ? "fill-red-500 text-red-500 scale-110"
                      : "text-gray-400 group-hover:text-red-500"
                      }`}
                  />
                </button>

                {isAdmin && (
                  <button
                    onClick={() => excluirItem(produto.id)}
                    className="absolute top-14 right-3 z-10 p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-all duration-300"
                  >
                    <Trash2 className="w-5 h-5 text-red-500 hover:text-red-700" />
                  </button>
                )}

                <img
                  src={produto.image}
                  alt={produto.name}
                  className="w-full h-40 object-contain p-4"
                />

                <div className="px-5 pb-6 text-center flex flex-col flex-1">
                  <p className="text-gray-500 text-sm mb-1">
                    Modelo <span className="font-medium">{produto.model}</span>
                  </p>

                  <h3 className="text-lg font-bold text-[#002D72] mb-2">
                    {produto.name}
                  </h3>

                  {temAvaliacoes && (
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, indice) => (
                          <Star
                            key={indice}
                            className={`h-4 w-4 ${indice < Math.round(notaMedia)
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300"
                              }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-600">
                        {notaMedia}
                      </span>
                    </div>
                  )}

                  <p className="text-gray-500 text-sm">A partir de</p>
                  <p className="text-2xl font-bold text-[#002D72] mb-4">
                    R$ {produto.price.toLocaleString("pt-BR", {
                      minimumFractionDigits: 2,
                    })}
                  </p>

                  <div className="space-y-2 mt-auto">
                    <button
                      onClick={() => handleAddToCart(produto)}
                      className="w-full flex items-center justify-center gap-2 bg-[#002D72] text-white font-semibold py-2.5 rounded-lg hover:bg-[#003B99] transition-all"
                    >
                      <ShoppingCart className="h-5 w-5" />
                      Adicionar ao Carrinho
                    </button>

                    <div className="flex gap-2">
                      <button
                        onClick={() => adicionarAvaliacao(produto)}
                        className="flex-1 flex items-center justify-center gap-1 border-2 border-[#002D72] text-[#002D72] font-semibold py-2 rounded-lg hover:bg-[#002D72] hover:text-white transition-all"
                      >
                        <Star className="h-4 w-4" />
                        Avaliar
                      </button>

                      <button
                        onClick={() => visualizarAvaliacoes(produto)}
                        className="flex-1 flex items-center justify-center gap-1 border-2 border-[#002D72] text-[#002D72] font-semibold py-2 rounded-lg hover:bg-[#002D72] hover:text-white transition-all"
                      >
                        <MessageSquare className="h-4 w-4" />
                        Ver ({produto.userReviews?.length || 0})
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
