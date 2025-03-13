import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Clock, Calendar, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { annulerParticipation } from "../api";

// Fonction pour récupérer les participations d'un campeur
const getCampeurCreneaux = async (campeurId) => {
  const response = await fetch(
    `http://localhost:8080/api/creneaux/${campeurId}/creneaux`
  );
  if (!response.ok) {
    throw new Error("Problème lors de la récupération des participations");
  }
  return response.json();
};

export default function MesParticipations() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  // Récupération des créneaux où le campeur est inscrit
  const {
    data: mesCreneaux,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["campeurCreneaux", user?.id],
    queryFn: () => getCampeurCreneaux(user?.id),
    enabled: !!user?.id,
  });

  // Mutation pour annuler une participation
  const annulerMutation = useMutation({
    mutationFn: ({ campeurId, creneauId }) =>
      annulerParticipation(campeurId, creneauId),
    onSuccess: () => {
      setSuccessMessage("Votre participation a été annulée avec succès");
      setErrorMessage(null);
      queryClient.invalidateQueries(["campeurCreneaux", user?.id]);
      queryClient.invalidateQueries(["creneaux"]); // Rafraîchir aussi la liste générale des créneaux
    },
    onError: (error) => {
      setErrorMessage("Erreur lors de l'annulation de votre participation");
      setSuccessMessage(null);
    },
  });

  // Vérifier si une date est dans le passé
  const isDatePassed = (dateCreneau, heureCreneau) => {
    const creneauDate = new Date(`${dateCreneau}T${heureCreneau}`);
    return creneauDate < new Date();
  };

  // Masquer les messages après 5 secondes
  useEffect(() => {
    const timer = setTimeout(() => {
      setSuccessMessage(null);
      setErrorMessage(null);
    }, 5000); // 5 secondes

    return () => clearTimeout(timer); // Nettoyer le timer
  }, [successMessage, errorMessage]);

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center">
          Veuillez vous connecter pour voir vos participations.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center">Chargement de vos participations...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center text-red-600">
          Erreur lors du chargement de vos participations. Veuillez réessayer
          plus tard.
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">
        Mes participations aux activités
      </h1>

      {/* Afficher le message de succès */}
      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {successMessage}
        </div>
      )}

      {/* Afficher le message d'erreur */}
      {errorMessage && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {errorMessage}
        </div>
      )}

      {mesCreneaux?.length === 0 ? (
        <p>Vous n'êtes inscrit à aucune activité pour le moment.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mesCreneaux?.map((creneau) => {
            const isPast = isDatePassed(
              creneau.dateCreneau,
              creneau.heureCreneau
            );

            return (
              <div
                key={creneau.idCreneau}
                className={`bg-white rounded-lg shadow-md p-6 ${
                  isPast ? "opacity-70" : ""
                }`}
              >
                <h3 className="text-xl font-semibold text-blue-600 mb-2">
                  {creneau.animation?.libelleAnimation || "Animation"}
                </h3>
                <div className="flex items-center space-x-2 text-gray-600 mb-2">
                  <Calendar className="h-5 w-5" />
                  <span>
                    {format(new Date(creneau.dateCreneau), "EEEE d MMMM yyyy", {
                      locale: fr,
                    })}
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-gray-600 mb-4">
                  <Clock className="h-5 w-5" />
                  <span>{creneau.heureCreneau.substring(0, 5)}</span>
                  <span>({creneau.dureeCreneau} min)</span>
                </div>

                {isPast ? (
                  <p className="text-gray-500 italic">Activité passée</p>
                ) : (
                  <button
                    onClick={() =>
                      annulerMutation.mutate({
                        campeurId: user.id,
                        creneauId: creneau.idCreneau,
                      })
                    }
                    className="flex items-center space-x-2 bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600"
                  >
                    <X className="h-4 w-4" />
                    <span>Annuler ma participation</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
