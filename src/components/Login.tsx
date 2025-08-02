import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { BookOpen } from "lucide-react";

type UserRole = "student" | "professor" | "coordinator";
interface FormData {
  email: string;
  password: string;
  name: string;
  role: UserRole;
}
const Login: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
    name: "",
    role: "student"as UserRole,
  });
  const [error, setError] = useState("");
  const { login, register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      if (isLogin) {
        await login(formData.email, formData.password);
      } else {
        await register(
          formData.email,
          formData.password,
          formData.name,
          formData.role
        );
      }
    } catch (err) {
      setError("Une erreur est survenue. Vérifiez vos informations.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-2xl overflow-hidden">
        <div className="bg-blue-600 px-6 py-8 text-center">
          <BookOpen className="w-12 h-12 text-white mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white">EduClass Pro</h1>
          <p className="text-blue-100 mt-2">Plateforme éducative avancée</p>
        </div>

        <div className="p-8">
          <div className="mb-6">
            <div className="flex rounded-lg bg-gray-100 p-1">
              <button
                onClick={() => setIsLogin(true)}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  isLogin ? "bg-white shadow text-blue-600" : "text-gray-600"
                }`}
              >
                Connexion
              </button>
              <button
                onClick={() => setIsLogin(false)}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  !isLogin ? "bg-white shadow text-blue-600" : "text-gray-600"
                }`}
              >
                Inscription
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom complet
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mot de passe
              </label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rôle
                </label>
                <select
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      role: e.target.value as
                        UserRole
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="student">Étudiant</option>
                  <option value="professor">Professeur</option>
                  <option value="coordinator">Coordinateur</option>
                </select>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              {isLogin ? "Se connecter" : "S'inscrire"}
            </button>
          </form>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">
              Identifiants : :
            </p>
            <p className="text-xs text-gray-500">Email prof: p@gmail.com</p>
            <p className="text-xs text-gray-500">Mdp Prof: 123</p>
            <p className="text-xs text-gray-500">Email Etudiant: e@gmail.com</p>
            <p className="text-xs text-gray-500">Mdp Etudiant: 123</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
