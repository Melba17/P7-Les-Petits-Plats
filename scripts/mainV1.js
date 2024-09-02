// Importation des modules
import { recipes } from './api/recipes.js';
import { TemplateCards } from './pattern/templateCard.js';
import { createFiltersButtons, createSearchArea } from './utils/dropdowns.js';

// Variables globales pour stocker les options/items
let selectedIngredients = [];
let selectedAppliances = [];
let selectedUstensils = [];

// Fonction pour récupérer les données des recettes
function getData() {
    return recipes;
}

// Fonction pour afficher les cartes de recettes
function showRecipeCards(recipes) {
    const cardSection = document.querySelector(".grid");
    if (cardSection) {
        cardSection.innerHTML = ''; // Vide la section des cartes avant d'ajouter les nouvelles cartes
        recipes.forEach(recipe => {
            const card = new TemplateCards(recipe);
            cardSection.appendChild(card.display());
        });
    } else {
        console.error('.grid non trouvé');
    }
}

// Fonction pour mettre à jour le compteur de recettes
function updateRecipeCounter(count) {
    const counterElement = document.querySelector('.counter');
    if (counterElement) {
        counterElement.textContent = count === null ? '1500 recettes' : `${count} recette${count > 1 ? 's' : ''}`;
    } else {
        console.error('.counter non trouvé');
    }
}

// Fonction pour filtrer et afficher les recettes
function filterAndShowRecipes() {
    const data = getData();
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

    updateDropdownOptions(filteredRecipes);
    showRecipeCards(filteredRecipes);
    updateRecipeCounter(filteredRecipes.length);
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

// Fonction pour fermer les menus déroulants
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
        grid.style.marginTop = '30px';
    } else {
        console.log('.grid non trouvé');
    }
}

// Fonction pour mettre à jour l'affichage des éléments sélectionnés
function updateSelectedItems() {
    const optionsContainer = document.querySelector('.options-container') || createOptionsContainer();
    optionsContainer.innerHTML = '';

    selectedIngredients.forEach(ingredient => {
        const selectedItem = document.createElement('div');
        selectedItem.className = 'selected-item';
        selectedItem.style.display = 'block';

        const textContainer = document.createElement('span');
        textContainer.className = 'option-text';
        textContainer.textContent = ingredient;
        selectedItem.appendChild(textContainer);

        const closeIcon = document.createElement('i');
        closeIcon.className = 'fa-solid fa-xmark cross-item';
        closeIcon.setAttribute('aria-label', 'Supprimer la sélection');

        closeIcon.addEventListener('click', () => {
            selectIngredient(ingredient);
        });

        selectedItem.appendChild(closeIcon);
        optionsContainer.appendChild(selectedItem);
    });

    selectedAppliances.forEach(appliance => {
        const selectedItem = document.createElement('div');
        selectedItem.className = 'selected-item';
        selectedItem.style.display = 'block';

        const textContainer = document.createElement('span');
        textContainer.className = 'option-text';
        textContainer.textContent = appliance;
        selectedItem.appendChild(textContainer);

        const closeIcon = document.createElement('i');
        closeIcon.className = 'fa-solid fa-xmark cross-item';
        closeIcon.setAttribute('aria-label', 'Supprimer la sélection');

        closeIcon.addEventListener('click', () => {
            selectAppliance(appliance);
        });

        selectedItem.appendChild(closeIcon);
        optionsContainer.appendChild(selectedItem);
    });

    selectedUstensils.forEach(ustensil => {
        const selectedItem = document.createElement('div');
        selectedItem.className = 'selected-item';
        selectedItem.style.display = 'block';

        const textContainer = document.createElement('span');
        textContainer.className = 'option-text';
        textContainer.textContent = ustensil;
        selectedItem.appendChild(textContainer);

        const closeIcon = document.createElement('i');
        closeIcon.className = 'fa-solid fa-xmark cross-item';
        closeIcon.setAttribute('aria-label', 'Supprimer la sélection');

        closeIcon.addEventListener('click', () => {
            selectUstensil(ustensil);
        });

        selectedItem.appendChild(closeIcon);
        optionsContainer.appendChild(selectedItem);
    });
}

// Fonction pour créer le conteneur des éléments sélectionnés
function createOptionsContainer() {
    const optionsContainer = document.createElement('div');
    optionsContainer.className = 'options-container';
    const flexContainer = document.querySelector('.flex');
    if (flexContainer) {
        flexContainer.parentNode.insertBefore(optionsContainer, flexContainer.nextSibling);
    } else {
        console.error('.flex non trouvé pour créer le conteneur');
    }
    return optionsContainer;
}

// Fonction d'initialisation principale
function initialize() {
    const data = getData();
    showRecipeCards(data);
    updateRecipeCounter(null);
    createFiltersButtons(data, selectIngredient, selectAppliance, selectUstensil);
}

initialize();

// Fonction pour gérer l'affichage de la croix dans la barre de recherche
function handleSearchInput() {
    const searchInput = document.querySelector('.searchbar');
    const crossIcon = document.querySelector('.cross-icon');
    if (searchInput && crossIcon) {
        searchInput.addEventListener('input', () => {
            crossIcon.classList.toggle('visible', searchInput.value.length > 0);
        });

        crossIcon.addEventListener('click', () => {
            searchInput.value = '';
            crossIcon.classList.remove('visible');
            searchInput.focus();
        });
    } else {
        console.error('.searchbar ou .cross-icon non trouvé');
    }
}

handleSearchInput();

// Fonction pour mettre à jour les options des menus déroulants
function updateDropdownOptions(filteredRecipes) {
    const ingredients = new Set();
    const appliances = new Set();
    const ustensils = new Set();

    filteredRecipes.forEach(recipe => {
        recipe.ingredients.forEach(ing => ingredients.add(ing.ingredient.toLowerCase()));
        appliances.add(recipe.appliance.toLowerCase());
        recipe.ustensils.forEach(ust => ustensils.add(ust.toLowerCase()));
    });

    updateDropdown('dropdownIngredients', Array.from(ingredients), 'ingredients');
    updateDropdown('dropdownAppliances', Array.from(appliances), 'appliances');
    updateDropdown('dropdownUstensils', Array.from(ustensils), 'ustensils');
}


// Fonction pour mettre à jour une liste déroulante spécifique
function updateDropdown(id, items, type) {
    const dropdownList = document.querySelector(`#${id} .list-container`);

    if (dropdownList) {
        dropdownList.innerHTML = ''; // On vide la liste des éléments

        // Remplir la liste d'items
        items.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.className = 'item';
            itemElement.tabIndex = '0';
            itemElement.textContent = item;
            itemElement.addEventListener('click', () => {
                if (type === 'ingredients') {
                    selectIngredient(item);
                } else if (type === 'appliances') {
                    selectAppliance(item);
                } else if (type === 'ustensils') {
                    selectUstensil(item);
                }
            });
            dropdownList.appendChild(itemElement);
        });
    } else {
        console.error(`#${id} .list-container non trouvé`);
    }
}
