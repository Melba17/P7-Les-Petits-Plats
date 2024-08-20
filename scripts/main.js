// Importation des modules
import { recipes } from './api/recipes.js';
import { TemplateCards } from './pattern/templateCard.js';

// Fonction pour récupérer les données des recettes
async function getData() {
    try {
        // Pas besoin d'utiliser fetch ici, car on importe directement les données
        return recipes;  // Retourne les recettes importées
    } catch (error) {
        // Message d'erreur fourni par le moteur JavaScript du navigateur selon TypeError, SyntaxError, etc...
        console.error('Erreur lors de la récupération des données :', error);
    }
}

// Fonction pour afficher les cartes de recettes
async function showRecipeCard() {
    // Récupère les données des recettes
    const data = await getData();  
    const cardSection = document.querySelector(".grid");

    // Parcourt chaque recette et crée une carte pour chacune d'elles
    data.forEach(recipe => {
        // Crée une nouvelle carte de recette
        const card = new TemplateCards(recipe);
        // Ajoute la carte à la section .grid  
        cardSection.appendChild(card.display());  
    });
}

// Appelle la fonction pour afficher les cartes
showRecipeCard();  