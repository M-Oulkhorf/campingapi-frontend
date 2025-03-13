import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Calendar, LogIn, LogOut, UserPlus } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <Calendar className="h-6 w-6" />
            <span className="font-bold text-lg">Camping Manager</span>
          </Link>

          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <span>Bonjour, {user.prenom}</span>
                <button
                  onClick={logout}
                  className="flex items-center space-x-1 hover:text-gray-200"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Déconnexion</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="flex items-center space-x-1 hover:text-gray-200"
                >
                  <LogIn className="h-5 w-5" />
                  <span>Connexion</span>
                </Link>
                <Link
                  to="/register"
                  className="flex items-center space-x-1 hover:text-gray-200"
                >
                  <UserPlus className="h-5 w-5" />
                  <span>Inscription</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}