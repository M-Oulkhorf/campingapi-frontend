import axios from "axios";
import {
  Creneau,
  Utilisateur,
  ParticiperRequest,
  AnimerRequest,
} from "./types";

const api = axios.create({
  baseURL: "http://localhost:8080/api",
});

// Utilisateurs
export const login = async (identifiant: string, mdp: string) => {
  try {
    const response = await api.post<Utilisateur>("/utilisateurs/login", {
      identifiant,
      mdp,
    });

    // Vérification si la réponse contient un objet utilisateur
    if (response.data && response.data.id) {
      return response.data;
    } else {
      throw new Error("Réponse inattendue de l'API");
    }
  } catch (error) {
    console.error("Erreur de connexion:", error);
    throw error;
  }
};

// Fonction helper pour simuler la récupération de l'ID utilisateur
function findUserIdByIdentifiant(identifiant: string): number {
  const userMap: { [key: string]: number } = {
    jdupont: 1,
    mo: 2,
    jdo: 3,
    jdoe: 4,
  };
  return userMap[identifiant] || 1;
}

export const register = async (utilisateur: Omit<Utilisateur, "id">) => {
  const response = await api.post<Utilisateur>(
    "/utilisateurs/register",
    utilisateur
  );
  return response.data;
};

// Créneaux
export const getCreneaux = async () => {
  const response = await api.get<Creneau[]>("/creneaux");
  return response.data;
};

export const createCreneau = async (creneau: Omit<Creneau, "idCreneau">) => {
  const response = await api.post<Creneau>("/creneaux", creneau);
  return response.data;
};

// Participants
export const getCampeursByCreneau = async (creneauId: number) => {
  try {
    const response = await api.get<Utilisateur[]>(
      `/creneaux/${creneauId}/campeurs`
    );
    return response.data;
  } catch (error) {
    console.error(
      `Erreur lors de la récupération des campeurs pour le créneau ${creneauId}:`,
      error
    );
    return [];
  }
};

export const getAbsentsByCreneau = async (creneauId: number) => {
  try {
    const response = await api.get<Utilisateur[]>(
      `/creneaux/${creneauId}/absents`
    );
    return response.data;
  } catch (error) {
    console.error(
      `Erreur lors de la récupération des absents pour le créneau ${creneauId}:`,
      error
    );
    return [];
  }
};

// Participation
export const participerCreneau = async ({
  campeurId,
  creneauId,
}: {
  campeurId: number;
  creneauId: number;
}) => {
  try {
    const response = await api.post(
      "/creneaux/participer",
      {
        id: {
          campeurId,
          creneauId,
        },
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data; // Retourne la réponse directe de l'API
  } catch (error) {
    console.error("Erreur lors de la participation:", error);
    throw error; // Propage l'erreur pour qu'elle soit capturée par onError
  }
};

export const annulerParticipation = async (
  campeurId: number,
  creneauId: number
) => {
  const response = await api.delete(
    `/creneaux/annuler/${campeurId}/${creneauId}`
  );
  return response.data;
};

export const confirmerParticipation = async (
  campeurId: number,
  creneauId: number
) => {
  const response = await api.put(
    `/creneaux/participation-effectuee/${campeurId}/${creneauId}`
  );
  return response.data;
};

// Animateurs
export const getAnimateurPlanning = async (animateurId: number) => {
  try {
    const response = await api.get<Creneau[]>(
      `/utilisateurs/${animateurId}/planning`
    );
    return response.data;
  } catch (error) {
    console.error(
      `Erreur lors de la récupération du planning de l'animateur ${animateurId}:`,
      error
    );
    return [];
  }
};

export const assignerAnimateur = async ({
  animateurId,
  creneauId,
}: AnimerRequest) => {
  try {
    const response = await api.post("/creneaux/animer", {
      id: {
        animateurId,
        creneauId,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Erreur lors de l'assignation:", error);
    throw error;
  }
};

// Récupérer la liste des animateurs (simulation)
export const getAnimateurs = async (): Promise<Utilisateur[]> => {
  // Simulation car l'API ne semble pas avoir d'endpoint pour ça
  return [
    {
      id: 1,
      identifiant: "jdupont",
      nom: "Dupont",
      prenom: "Jean",
      email: "jean.dupont@example.com",
      role: "ANIMATEUR",
      nombreAbsences: 0,
    },
    {
      id: 5,
      identifiant: "mmartins",
      nom: "Martins",
      prenom: "Marie",
      email: "marie.martins@example.com",
      role: "ANIMATEUR",
      nombreAbsences: 0,
    },
  ];
};
