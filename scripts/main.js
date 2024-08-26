// Importation des modules
import { recipes } from './api/recipes.js';
import { TemplateCards } from './pattern/templateCard.js';
import { createFiltersButtons } from './utils/dropdowns.js';

// Variables globales pour stocker les sélections
let selectedIngredients = [];
let selectedAppliances = [];
let selectedUstensils = [];

// Fonction pour récupérer les données des recettes
async function getData() {
    return recipes;  // Retourne les recettes importées
}

const data = await getData();  // Appelle getData() une seule fois et stockez le résultat dans une variable

// Fonction pour afficher les cartes de recettes
async function showRecipeCards(recipes) {
    const cardSection = document.querySelector(".grid");
    cardSection.innerHTML = ''; // Vide la section des cartes avant d'ajouter les nouvelles cartes

    recipes.forEach(recipe => {
        const card = new TemplateCards(recipe);
        cardSection.appendChild(card.display());
    });
}

// Fonction pour filtrer les recettes en fonction des sélections
async function filterAndShowRecipes() {
    const data = await getData();
    const filteredRecipes = data.filter(recipe =>
        selectedIngredients.every(ingredient =>
            recipe.ingredients.some(ing => ing.ingredient.toLowerCase() === ingredient.toLowerCase())
        ) &&
        selectedAppliances.every(appliance =>
            recipe.appliance.toLowerCase() === appliance.toLowerCase()
        ) &&
        selectedUstensils.every(ustensil =>
            recipe.ustensils.some(ust => ust.toLowerCase() === ustensil.toLowerCase())
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

// Fonction pour gérer la sélection des appareils
function selectAppliance(appliance) {
    const index = selectedAppliances.indexOf(appliance.toLowerCase());
    if (index === -1) {
        selectedAppliances.push(appliance.toLowerCase());
    } else {
        selectedAppliances.splice(index, 1);
    }
    filterAndShowRecipes();
    updateSelectedItems();
    adjustGridMargin();
    closeDropdown();
}

// Fonction pour gérer la sélection des ustensiles
function selectUstensil(ustensil) {
    const index = selectedUstensils.indexOf(ustensil.toLowerCase());
    if (index === -1) {
        selectedUstensils.push(ustensil.toLowerCase());
    } else {
        selectedUstensils.splice(index, 1);
    }
    filterAndShowRecipes();
    updateSelectedItems();
    adjustGridMargin();
    closeDropdown();
}

// Fonction pour mettre à jour le menu déroulant
function closeDropdown() {
    const dropdowns = ['#dropdownIngredientsButton', '#dropdownAppliancesButton', '#dropdownUstensilsButton'];
    dropdowns.forEach(selector => {
        const button = document.querySelector(selector);
        if (button) {
            button.setAttribute("aria-expanded", "false");
            button.classList.remove('show');
            const content = document.querySelector(`${selector.replace('Button', '')} .dropdown-content`);
            if (content) {
                content.style.display = 'none';
            }
        }
    });
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

    selectedAppliances.forEach(appliance => {
        const selectedItem = document.createElement('div');
        selectedItem.className = 'selected-item';
        selectedItem.style.display = 'block'; // Assure que l'élément est visible

        const textContainer = document.createElement('span');
        textContainer.className = 'option-text';
        textContainer.textContent = appliance;
        selectedItem.appendChild(textContainer);

        const closeIcon = document.createElement('i');
        closeIcon.className = 'fa-solid fa-xmark cross-item';
        closeIcon.setAttribute('aria-label', 'Supprimer la sélection');

        closeIcon.addEventListener('click', () => {
            selectAppliance(appliance); // Utilise selectAppliance pour retirer l'appareil
        });

        selectedItem.appendChild(closeIcon);
        optionsContainer.appendChild(selectedItem);
    });

    selectedUstensils.forEach(ustensil => {
        const selectedItem = document.createElement('div');
        selectedItem.className = 'selected-item';
        selectedItem.style.display = 'block'; // Assure que l'élément est visible

        const textContainer = document.createElement('span');
        textContainer.className = 'option-text';
        textContainer.textContent = ustensil;
        selectedItem.appendChild(textContainer);

        const closeIcon = document.createElement('i');
        closeIcon.className = 'fa-solid fa-xmark cross-item';
        closeIcon.setAttribute('aria-label', 'Supprimer la sélection');

        closeIcon.addEventListener('click', () => {
            selectUstensil(ustensil); // Utilise selectUstensil pour retirer l'ustensile
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
showRecipeCards(data);

// Appelle la fonction pour créer les boutons de filtres avec la fonction de sélection des ingrédients
createFiltersButtons(data, selectIngredient, selectAppliance, selectUstensil);
