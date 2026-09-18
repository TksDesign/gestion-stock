import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';

// Création de l'instance Axios globale
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_GATEWAY_URL || 'http://localhost:8222',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour injecter le token d'authentification (quand il y en aura un)
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// Intercepteur pour la gestion globale des erreurs
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const status = error.response.status;
      // Lecture du vrai message backend standardisé (GlobalExceptionHandler)
      const backendError = error.response?.data?.errors?.error;
      
      switch (status) {
        case 400:
          toast.error(backendError || "Données invalides. Veuillez vérifier votre saisie.");
          break;
        case 401:
          toast.error(backendError || "Votre session a expiré. Veuillez vous reconnecter.");
          useAuthStore.getState().logout();
          break;
        case 403:
          toast.error(backendError || "Vous n'avez pas l'autorisation d'effectuer cette action.");
          break;
        case 404:
          toast.error(backendError || "La ressource demandée est introuvable.");
          break;
        case 500:
          toast.error(backendError || "Erreur serveur. Veuillez réessayer plus tard.");
          break;
        default:
          toast.error(backendError || "Une erreur inattendue est survenue.");
      }
    } else if (error.request) {
      // La requête a été envoyée mais aucune réponse n'a été reçue (ex: Gateway down)
      toast.error("Impossible de contacter le serveur. Vérifiez votre connexion.");
    }
    
    return Promise.reject(error);
  }
);
