import { Link } from 'react-router-dom';

export const NotFoundPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-center px-4">
      <h1 className="text-9xl font-bold text-gray-300">404</h1>
      <h2 className="text-3xl font-semibold text-gray-800 mt-4">Page introuvable</h2>
      <p className="text-gray-600 mt-2 mb-8 max-w-md">
        Oups ! La page que vous recherchez semble avoir disparu, été supprimée ou n'a peut-être jamais existé.
      </p>
      <Link 
        to="/" 
        className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition duration-200"
      >
        Retour à l'accueil
      </Link>
    </div>
  );
};
