import React from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { getAnimateurPlanning } from "../api";
import { useAuth } from "../context/AuthContext";
import { Calendar, Users, Clock } from "lucide-react";

export default function AnimateurPlanning() {
  const { user } = useAuth();

  const { data: planning, isLoading } = useQuery({
    queryKey: ["planning", user?.id],
    queryFn: () => (user ? getAnimateurPlanning(user.id) : null),
    enabled: !!user && user.role === "ANIMATEUR",
  });

  if (!user || user.role !== "ANIMATEUR") {
    return null;
  }

  if (isLoading) {
    return <div className="text-center">Chargement du planning...</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Mon Planning</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {planning?.map((creneau) => (
          <div
            key={creneau.idCreneau}
            className="bg-white rounded-lg shadow-md p-6"
          >
            <div className="mb-4">
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
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
