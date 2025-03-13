import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import {
  getCreneaux,
  getCampeursByCreneau,
  participerCreneau,
  annulerParticipation,
  assignerAnimateur,
  getAnimateurs,
  confirmerParticipation,
} from "../api";
import { useAuth } from "../context/AuthContext";
import { Users, Clock, X, UserPlus } from "lucide-react";

export default function CreneauxList() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate(); // Hook pour la redirection
  const [selectedCreneauId, setSelectedCreneauId] = useState<number | null>(
    null
  );
  const [successMessage, setSuccessMessage] = useState<string | null>(null); // État pour le message de succès
  const [errorMessage, setErrorMessage] = useState<string | null>(null); // État pour le message d'erreur

  const { data: creneaux, isLoading } = useQuery({
    queryKey: ["creneaux"],
    queryFn: getCreneaux,
  });
  const { data: animateurs } = useQuery({
    queryKey: ["animateurs"],
    queryFn: getAnimateurs,
  });

  const { data: campeurs, isLoading: isLoadingCampeurs } = useQuery({
    queryKey: ["campeurs", selectedCreneauId],
    queryFn: () =>
      selectedCreneauId ? getCampeursByCreneau(selectedCreneauId) : null,
    enabled: !!selectedCreneauId,
  });

  const participerMutation = useMutation({
    mutationFn: participerCreneau,
    onSuccess: (data) => {
      // Afficher le message de succès retourné par l'API
      setSuccessMessage(data || "Participation réussie !"); // Utilisez directement `data`
      setErrorMessage(null); // Effacer les messages d'erreur précédents
      queryClient.invalidateQueries(["creneaux", "campeurs"]); // Rafraîchir les données
    },
    onError: (error) => {
      // Afficher directement la réponse de l'API
      setErrorMessage(error.response?.data); // Utilisez directement `error.response.data`
      setSuccessMessage(null); // Effacer les messages de succès précédents
    },
  });

  const annulerMutation = useMutation({
    mutationFn: ({ campeurId, creneauId }) =>
      annulerParticipation(campeurId, creneauId),
    onSuccess: () => {
      setSuccessMessage("l'absence est bien enregistrée");
      setErrorMessage(null);
    },
    onError: (error) => {
      setErrorMessage("Erreur de fonctionnement de site");
      setSuccessMessage(null);
    },
  });

  const assignerAnimateurMutation = useMutation({
    mutationFn: assignerAnimateur,
    onSuccess: () => {
      queryClient.invalidateQueries(["creneaux"]);
    },
  });

  const handleParticiperClick = (creneauId) => {
    if (!user) {
      // Rediriger vers la page de connexion si l'utilisateur n'est pas connecté
      navigate("/login");
    } else if (user.role === "CAMPEUR") {
      // Si l'utilisateur est un campeur, déclencher la mutation pour participer
      participerMutation.mutate({
        campeurId: user.id,
        creneauId: creneauId,
      });
    }
  };

  //confirmer Participation Mutation
  const confirmerParticipationMutation = useMutation({
    mutationFn: confirmerParticipation,
    onSuccess: (data) => {
      setSuccessMessage(data || "Participation confirmée avec succès !");
      setErrorMessage(null);
      queryClient.invalidateQueries(["creneaux", "campeurs"]);
    },
    onError: (error) => {
      setErrorMessage(error.response?.data);
      setSuccessMessage(null);
    },
  });
  const [participantStatus, setParticipantStatus] = useState<{
    [key: number]: "present" | "absent" | null;
  }>({});

  // Masquer les messages après 5 secondes
  useEffect(() => {
    const timer = setTimeout(() => {
      setSuccessMessage(null);
      setErrorMessage(null);
    }, 5000); // 5 secondes

    return () => clearTimeout(timer); // Nettoyer le timer
  }, [successMessage, errorMessage]);

  if (isLoading) return <div className="text-center">Chargement...</div>;

  return (
    <div className="space-y-6">
      {/* Afficher le message de succès */}
      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          {successMessage}
        </div>
      )}

      {/* Afficher le message d'erreur */}
      {errorMessage && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {errorMessage}
        </div>
      )}

      <h2 className="text-2xl font-bold text-gray-900">Créneaux disponibles</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {creneaux?.map((creneau) => (
          <div
            key={creneau.idCreneau}
            className="bg-white rounded-lg shadow-md p-6"
          >
            <h3 className="text-xl font-semibold text-blue-600 mb-2">
              {creneau.animation?.libelleAnimation || "Animation"}
            </h3>
            <p className="text-lg font-semibold text-gray-900">
              {format(new Date(creneau.dateCreneau), "EEEE d MMMM yyyy", {
                locale: fr,
              })}
            </p>
            <div className="flex items-center space-x-2 text-gray-600 mt-2">
              <Clock className="h-5 w-5" />
              <span>{creneau.heureCreneau.substring(0, 5)}</span>
              <span>({creneau.dureeCreneau} min)</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-600 mb-4">
              <Users className="h-5 w-5" />
              <span>{creneau.nbPlacesCreneau} places disponibles</span>
              {user?.role === "ADMIN" || user?.role === "ANIMATEUR" ? (
                <button
                  onClick={() => setSelectedCreneauId(creneau.idCreneau)}
                  className="ml-2 text-blue-600 hover:text-blue-800"
                >
                  Voir les participants
                </button>
              ) : !user ? ( // Afficher "Participer" uniquement si l'utilisateur n'est pas connecté
                <button
                  onClick={() => handleParticiperClick(creneau.idCreneau)}
                  className="ml-2 text-blue-600 hover:text-blue-800"
                >
                  Participer
                </button>
              ) : null}
            </div>
            {selectedCreneauId === creneau.idCreneau && (
              <div className="mb-4 p-4 bg-gray-50 rounded-md">
                <h4 className="font-semibold mb-2">Participants:</h4>
                {isLoadingCampeurs ? (
                  <p>Chargement des participants...</p>
                ) : campeurs?.length ? (
                  <ul className="space-y-2">
                    {campeurs.map((campeur) => {
                      const isToday =
                        new Date(creneau.dateCreneau)
                          .toISOString()
                          .split("T")[0] ===
                        new Date().toISOString().split("T")[0];

                      return (
                        <li
                          key={campeur.id}
                          className="flex items-center justify-between"
                        >
                          <span>
                            {campeur.prenom} {campeur.nom}
                            {participantStatus[campeur.id] === "present" &&
                              " (Présent)"}
                            {participantStatus[campeur.id] === "absent" &&
                              " (Absent)"}
                          </span>
                          {(user?.role === "ADMIN" ||
                            user?.role === "ANIMATEUR") &&
                            isToday && (
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => {
                                    confirmerParticipationMutation.mutate({
                                      campeurId: campeur.id,
                                      creneauId: creneau.idCreneau,
                                    });
                                    setParticipantStatus((prev) => ({
                                      ...prev,
                                      [campeur.id]: "present",
                                    }));
                                  }}
                                  className="text-green-600 hover:text-green-800"
                                >
                                  Présent
                                </button>
                                <button
                                  onClick={() => {
                                    annulerMutation.mutate({
                                      campeurId: campeur.id,
                                      creneauId: creneau.idCreneau,
                                    });
                                    setParticipantStatus((prev) => ({
                                      ...prev,
                                      [campeur.id]: "absent",
                                    }));
                                  }}
                                  className="text-red-600 hover:text-red-800"
                                >
                                  Absent
                                </button>
                              </div>
                            )}
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <p>Aucun participant</p>
                )}
              </div>
            )}
            {user?.role === "CAMPEUR" && (
              <button
                onClick={() => {
                  participerMutation.mutate({
                    campeurId: user.id,
                    creneauId: creneau.idCreneau,
                  });
                }}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
              >
                S'inscrire
              </button>
            )}
            {user?.role === "ADMIN" && (
              <div className="mt-4">
                <select
                  onChange={(e) =>
                    assignerAnimateurMutation.mutate({
                      animateurId: parseInt(e.target.value),
                      creneauId: creneau.idCreneau,
                    })
                  }
                  className="w-full rounded-md border-gray-300"
                >
                  <option value="">Assigner un animateur</option>
                  {animateurs?.map((animateur) => (
                    <option key={animateur.id} value={animateur.id}>
                      {animateur.nom} {animateur.prenom}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
