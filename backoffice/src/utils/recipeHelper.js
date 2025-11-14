// backoffice/src/utils/recipeHelper.js

/**
 * Fonction pour afficher l'auteur d'une recette de manière professionnelle
 * @param {Object} recipe - L'objet recette
 * @returns {Object} - Informations d'affichage de l'auteur
 */
export const getAuthorDisplay = (recipe) => {
  // Si la recette est officielle, afficher "Gourmi"
  if (recipe.isOfficial) {
    return {
      name: "Gourmi",
      displayName: "Recette Officielle Gourmi",
      badge: "success",
      icon: "fas fa-star",
      isOfficial: true
    };
  }
  
  // Si pas de créateur, afficher "Anonyme"
  if (!recipe.createdBy) {
    return {
      name: "Anonyme",
      displayName: "Utilisateur Anonyme",
      badge: "secondary",
      icon: "fas fa-user-secret",
      isOfficial: false
    };
  }
  
  // Afficher les infos de l'utilisateur normal
  const { firstName, lastName } = recipe.createdBy;
  
  let displayName = "Utilisateur";
  
  if (firstName && lastName) {
    displayName = `${firstName} ${lastName}`;
  } else if (firstName) {
    displayName = firstName;
  } else if (lastName) {
    displayName = lastName;
  }
  
  return {
    name: displayName,
    displayName: displayName,
    badge: "info",
    icon: "fas fa-user",
    isOfficial: false
  };
};