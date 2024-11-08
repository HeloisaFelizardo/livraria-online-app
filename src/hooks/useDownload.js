import {useNavigate} from "react-router-dom";
import {downloadBook} from "../services/bookService.js";
import {useAuth} from "./useAuth.js";
import {useToast} from "@chakra-ui/react";

const useDownload = () => {
  const {token, setToken} = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  return async (bookId) => {
    if (!token) {
      navigate('/login');
      toast({
        title: 'Não foi possível fazer o download',
        description: 'Você precisa estar logado para fazer esse download.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    try {
      const blob = await downloadBook(bookId, token);
      const url = window.URL.createObjectURL(blob);

      // Abrir o PDF em uma nova aba para leitura
      window.open(url, '_blank');

      // A URL do Blob será revogada após um pequeno tempo para liberar memória
      setTimeout(() => window.URL.revokeObjectURL(url), 5000);

    } catch (error) {
      // Aqui você pode verificar se o erro é relacionado à expiração do token
      if (error.response && error.response.status === 403) {
        setToken(null); // Limpa o token
        toast({
          title: 'Não foi possível fazer o download',
          description: 'Sessão expirada. Faça o login novamente.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        navigate('/login'); // Redireciona para a página de login
      } else {
        console.error("Erro ao baixar o PDF:", error);
      }
    }
  };
};

export default useDownload;
