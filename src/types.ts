export interface Utilisateur {
  id: number;
  identifiant: string;
  nom: string;
  prenom: string;
  email: string;
  role: "ADMIN" | "ANIMATEUR" | "CAMPEUR";
  nombreAbsences: number;
  mdp?: string;
}

export interface Animation {
  idAnimation: number;
  libelleAnimation: string;
}

export interface Lieu {
  idLieu: number;
  libelleLieu: string;
  coordoneesLieu: string;
}

export interface Creneau {
  idCreneau: number;
  dateCreneau: string;
  heureCreneau: string;
  dureeCreneau: number;
  nbPlacesCreneau: number;
  animation?: Animation;
  lieu?: Lieu;
  idAnimation?: number;
  idLieu?: number;
}

export interface ParticiperRequest {
  campeurId: number;
  creneauId: number;
}

export interface AnimerRequest {
  animateurId: number;
  creneauId: number;
}

export interface ParticiperID {
  campeurId: number;
  creneauId: number;
}

export interface Participer {
  id: ParticiperID;
  campeur?: Utilisateur;
  creneau?: Creneau;
}
