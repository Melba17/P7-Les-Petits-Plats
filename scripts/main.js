// Importation des modules
import { recipes } from './api/recipes.js';
import { TemplateCards } from './pattern/templateCard.js';
import { createFiltersButtons } from './utils/dropdowns.js';

// Variable globale pour stocker les ingrédients sélectionnés
let selectedIngredients = [];

// Fonction pour récupérer les données des recettes
async function getData() {
    try {
        return recipes;  // Retourne les recettes importées
    } catch (error) {
        console.error('Erreur lors de la récupération des données :', error);
    }
}

// Fonction pour afficher les cartes de recettes
async function showRecipeCards(recipes) {
    const cardSection = document.querySelector(".grid");
    cardSection.innerHTML = ''; // Vide la section des cartes avant d'ajouter les nouvelles cartes

    recipes.forEach(recipe => {
        const card = new TemplateCards(recipe);
        cardSection.appendChild(card.display());
    });
}

// Fonction pour filtrer les recettes en fonction des ingrédients sélectionnés
async function filterAndShowRecipes() {
    const data = await getData();
    const filteredRecipes = data.filter(recipe =>
        selectedIngredients.every(ingredient =>
            recipe.ingredients.some(ing => ing.ingredient.toLowerCase() === ingredient.toLowerCase())
        )
    );
    showRecipeCards(filteredRecipes);
}

// Fonction pour gérer la sélection des ingrédients
function selectIngredient(ingredient) {
    const index = selectedIngredients.indexOf(ingredient.toLowerCase());
    if (index === -1) {
        selectedIngredients.push(ingredient.toLowerCase());
    } else {
        selectedIngredients.splice(index, 1);
    }
    filterAndShowRecipes();
    updateSelectedItems();
    adjustGridMargin();
    closeDropdown();
}

// Fonction pour mettre à jour le menu déroulant
function closeDropdown() {
    const ingredientsButton = document.querySelector('#dropdownIngredientsButton');
    if (ingredientsButton) {
        ingredientsButton.setAttribute("aria-expanded", "false");
        ingredientsButton.classList.remove('show');
        const ingredientsContent = document.querySelector('#dropdownIngredients .dropdown-content');
        if (ingredientsContent) {
            ingredientsContent.style.display = 'none';
        }
    }
}

// Fonction pour ajuster la marge de la grille
function adjustGridMargin() {
    const grid = document.querySelector('.grid');
    if (grid) {
        grid.style.marginTop = '30px'; // Ajuste la marge en haut de la grille
    } else {
        console.log('.grid non trouvé');
    }
}

// Fonction pour mettre à jour l'affichage des éléments sélectionnés
function updateSelectedItems() {
    const optionsContainer = document.querySelector('.options-container') || createOptionsContainer();

    optionsContainer.innerHTML = ''; // Vide le conteneur avant d'ajouter les éléments sélectionnés

    selectedIngredients.forEach(ingredient => {
        const selectedItem = document.createElement('div');
        selectedItem.className = 'selected-item';
        selectedItem.style.display = 'block'; // Assure que l'élément est visible

        const textContainer = document.createElement('span');
        textContainer.className = 'option-text';
        textContainer.textContent = ingredient;
        selectedItem.appendChild(textContainer);

        const closeIcon = document.createElement('i');
        closeIcon.className = 'fa-solid fa-xmark cross-item';
        closeIcon.setAttribute('aria-label', 'Supprimer la sélection');

        closeIcon.addEventListener('click', () => {
            selectIngredient(ingredient); // Utilise selectIngredient pour retirer l'ingrédient
        });

        selectedItem.appendChild(closeIcon);

        optionsContainer.appendChild(selectedItem);
    });
}

// Fonction pour créer le conteneur des éléments sélectionnés si nécessaire
function createOptionsContainer() {
    const optionsContainer = document.createElement('div');
    optionsContainer.className = 'options-container';
    const flexContainer = document.querySelector('.flex');
    if (flexContainer) {
        flexContainer.parentNode.insertBefore(optionsContainer, flexContainer.nextSibling);
    }
    return optionsContainer;
}

// Appelle la fonction pour afficher les cartes avec toutes les recettes
showRecipeCards(await getData());

// Appelle la fonction pour créer les boutons de filtres avec la fonction de sélection des ingrédients
createFiltersButtons(await getData(), selectIngredient);
