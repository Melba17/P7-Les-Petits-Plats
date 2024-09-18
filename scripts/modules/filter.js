// filter.js : GESTION DE LA SÉLECTION DES FILTRES

import { showRecipeCards, updateRecipeCounter, adjustGridMargin, showError } from './ui.js';
import { updateDropdownOptions } from './dropdown.js';
import { closeDropdown } from './ui.js';
import { getMainSearchResults } from './state.js';
import { getData } from '../main.js';

// Listes des filtres sélectionnés
let selectedIngredients = [];
let selectedAppliances = [];
let selectedUstensils = [];
let lastSelectedFilter = null;  // Dernier filtre sélectionné

let isGridMarginAdjusted = false;  // Indique si la marge de la grille a été ajustée

/* //////////////////////////////////////////
    FILTRAGE ET AFFICHAGE DES RECETTES
////////////////////////////////////////// */
// Fonction qui gère les filtres supplémentaires, issus des menus déroulants, sur les résultats de la recherche principale faite par l'utilisateur
export function filterAndShowRecipes(recipes = getData()) {
    const mainSearchResults = getMainSearchResults();  // Récupère les résultats de la recherche principale

    // Utilise les résultats de la recherche principale si disponibles, sinon utilise les recettes passées en argument
    const data = mainSearchResults !== null ? mainSearchResults : recipes; 
    const filteredRecipes = data.filter(recipe =>
        selectedIngredients.every(ingredient =>
            recipe.ingredients.some(ing => ing.ingredient.toLowerCase() === ingredient.toLowerCase())  // Filtre par ingrédients sélectionnés
        ) &&
        selectedAppliances.every(appliance =>
            recipe.appliance.toLowerCase() === appliance.toLowerCase()  // Filtre par appareils sélectionnés
        ) &&
        selectedUstensils.every(ustensil =>
            recipe.ustensils.some(ust => ust.toLowerCase() === ustensil.toLowerCase())  // Filtre par ustensiles sélectionnés
        )
    );

    updateDropdownOptions(filteredRecipes);  // Met à jour les options des menus déroulants
    showRecipeCards(filteredRecipes);  // Affiche les recettes filtrées

    // Déterminer le nombre à afficher pour le compteur selon les recettes restantes
    let recipeCount;
    if (selectedIngredients.length === 0 && selectedAppliances.length === 0 && selectedUstensils.length === 0) {
        recipeCount = (mainSearchResults === null || mainSearchResults.length === 0) ? 1500 : mainSearchResults.length;
    } else {
        recipeCount = filteredRecipes.length;
    }

    // Mise à jour du compteur avec le nombre de recettes
    updateRecipeCounter(recipeCount);

    // Ajuste la marge de la grille si nécessaire
    if (filteredRecipes.length === 0 || (selectedIngredients.length > 0 || selectedAppliances.length > 0 || selectedUstensils.length > 0)) {
        if (!isGridMarginAdjusted) {
            adjustGridMargin();  // Ajuste la marge de la grille
            isGridMarginAdjusted = true;  // Marque la grille comme ajustée
        }
    }
}

/* //////////////////////////////////////////
            SÉLECTION D'UN FILTRE
////////////////////////////////////////// */
function selectFilter(type, item, recipes) {
    const selectedList = getSelectedList(type);  // Récupère la liste des éléments sélectionnés pour le type donné
    const lowerItem = item?.toLowerCase();  // Convertit l'élément en minuscule
    const index = selectedList.indexOf(lowerItem);  // Cherche l'index de l'élément dans la liste

    if (index === -1) {
        selectedList.push(lowerItem);  // Ajoute l'élément s'il n'est pas déjà dans la liste
        updateLastSelectedFilter(item);  // Met à jour le dernier filtre sélectionné
    } else {
        selectedList.splice(index, 1);  // Supprime l'élément s'il est déjà sélectionné
        updateLastSelectedFilter(selectedList.length > 0 ? selectedList[selectedList.length - 1] : null);  // Met à jour le dernier filtre sélectionné
    }

    filterAndShowRecipes(recipes);  // Filtre et affiche les recettes
    updateSelectedItems();  // Met à jour les éléments visuels sous les filtres
    adjustGridMargin();  // Ajuste la marge de la grille
    closeDropdown();  // Ferme le menu déroulant
}

/* //////////////////////////////////////////////
   MISE À JOUR DU DERNIER FILTRE SÉLECTIONNÉ
///////////////////////////////////////////// */
function updateLastSelectedFilter(filter) {
    lastSelectedFilter = filter;  // Met à jour la variable avec le dernier filtre sélectionné
}

/* //////////////////////////////////////////
        SÉLECTION D'UN ÉLÉMENT
////////////////////////////////////////// */
export function selectItem(type, item, recipes) {
    selectFilter(type, item, recipes);  // Sélectionne et applique le filtre pour l'élément donné
    filterAndShowRecipes(recipes);  // Filtre et affiche les recettes
    const itemElement = document.querySelector(`.item[data-value="${item.toLowerCase()}"]`);  // Sélectionne l'élément dans le DOM
    if (itemElement) {
        itemElement.classList.add('choice-item');  // Ajoute la classe pour mettre en évidence l'élément sélectionné
        addRemoveIcon(itemElement, type, item);  // Ajoute l'icône de suppression
    }
}

/* //////////////////////////////////////////
        SÉLECTION D'UN INGREDIENT
////////////////////////////////////////// */
export function selectIngredient(ingredient, recipes) {
    selectFilter('ingredient', ingredient, recipes);  // Applique le filtre pour l'ingrédient donné
}

/* //////////////////////////////////////////
        SÉLECTION D'UN APPAREIL
////////////////////////////////////////// */
export function selectAppliance(appliance, recipes) {
    selectFilter('appliance', appliance, recipes);  // Applique le filtre pour l'appareil donné
}

/* //////////////////////////////////////////
        SÉLECTION D'UN USTENSILE
////////////////////////////////////////// */
export function selectUstensil(ustensil, recipes) {
    selectFilter('ustensil', ustensil, recipes);  // Applique le filtre pour l'ustensile donné
}

/* //////////////////////////////////////////
        DÉSÉLECTION D'UN ÉLÉMENT
////////////////////////////////////////// */
export function deselectItem(type, item) {
    const selectedList = getSelectedList(type);  // Récupère la liste des éléments sélectionnés pour le type donné
    const lowerItem = item.toLowerCase();  // Convertit l'élément en minuscule
    const index = selectedList.indexOf(lowerItem);  // Cherche l'index de l'élément dans la liste

    if (index !== -1) {
        selectedList.splice(index, 1);  // Supprime l'élément s'il est trouvé

        // Vérifie si tous les filtres sont désélectionnés
        if (selectedIngredients.length === 0 && selectedAppliances.length === 0 && selectedUstensils.length === 0) {
            // Réinitialise les listes déroulantes à leur état initial
            updateDropdownOptions(getData());  // Remet les listes déroulantes à leur état initial avec toutes les recettes

            // Réinitialise les cartes de recettes à toutes les recettes disponibles
            showRecipeCards(getData());  // Affiche toutes les recettes

            // Met à jour le compteur à 1500 recettes (ou le nombre total initial de recettes)
            updateRecipeCounter(1500);

            // Réinitialise l'état des items sélectionnés (supprime les classes 'choice-item')
            resetChoiceItems();
        } else {
            // Filtre et affiche les recettes restantes
            filterAndShowRecipes();
        }
    }
}

function resetChoiceItems() {
    const choiceItems = document.querySelectorAll('.choice-item');
    choiceItems.forEach(item => item.classList.remove('choice-item'));  // Supprime la classe 'choice-item' de tous les éléments
}


/* //////////////////////////////////////////////////
   MISE À JOUR DES ÉLÉMENTS SÉLECTIONNÉS (VISUELS)
///////////////////////////////////////////////// */
export function updateSelectedItems() {
    const optionsContainer = document.querySelector('.options-container') || createOptionsContainer();  // Sélectionne ou crée le conteneur des éléments sélectionnés
    optionsContainer.innerHTML = '';  // Vide le conteneur

    // Crée et affiche les éléments sélectionnés pour chaque type (ingrédients, appareils, ustensiles)
    ['ingredient', 'appliance', 'ustensil'].forEach(createSelectedItems);
}

/* ////////////////////////////////////////////////
   CRÉATION DU CONTENEUR D'ÉLÉMENTS SÉLECTIONNÉS
/////////////////////////////////////////////// */
function createOptionsContainer() {
    const optionsContainer = document.createElement('div');  // Crée un nouveau conteneur
    optionsContainer.className = 'options-container';  // Définit la classe du conteneur
    const flexContainer = document.querySelector('.flex');  // Sélectionne l'élément flex
    if (flexContainer) {
        flexContainer.parentNode.insertBefore(optionsContainer, flexContainer.nextSibling);  // Insère le conteneur après l'élément flex
    } else {
        console.error('.flex non trouvé pour créer le conteneur');  // Affiche une erreur si l'élément flex n'est pas trouvé
    }
    return optionsContainer;
}

/* ////////////////////////////////////////////
   CRÉATION DES ÉLÉMENTS SÉLECTIONNÉS (TAGS)
//////////////////////////////////////////// */
function createSelectedItems(type) {
    const selectedList = getSelectedList(type);  // Récupère la liste des éléments sélectionnés pour le type donné
    selectedList.forEach(item => {
        const selectedItem = document.createElement('div');  // Crée un nouveau div pour l'élément sélectionné
        selectedItem.className = 'selected-item';  // Définit la classe de l'élément
        selectedItem.tabIndex = '0';  // Rend l'élément focusable

        const textContainer = document.createElement('span');  // Crée un span pour le texte de l'élément
        textContainer.className = 'option-text';  // Définit la classe du texte
        textContainer.textContent = item;  // Définit le contenu textuel de l'élément

        const closeIcon = document.createElement('i');  // Crée l'icône de fermeture
        closeIcon.className = 'fa-solid fa-xmark cross-item';  // Définit la classe de l'icône
        closeIcon.setAttribute('aria-label', 'Supprimer la sélection');  // Définit l'attribut aria pour l'accessibilité
        closeIcon.addEventListener('click', () => {
            deselectItem(type, item);  // Supprime l'élément de la sélection
            updateSelectedItems();  // Met à jour l'affichage des éléments sélectionnés
            filterAndShowRecipes();  // Réapplique les filtres
        });

        selectedItem.appendChild(textContainer);  // Ajoute le texte à l'élément sélectionné
        selectedItem.appendChild(closeIcon);  // Ajoute l'icône de fermeture
        document.querySelector('.options-container').appendChild(selectedItem);  // Ajoute l'élément sélectionné au conteneur
    });
}

/* /////////////////////////////////////////////
   VÉRIFICATION SI UN ÉLÉMENT EST SÉLECTIONNÉ
/////////////////////////////////////////////*/
export function isItemSelected(type, item) {
    const selectedList = getSelectedList(type);  // Récupère la liste des éléments sélectionnés pour le type donné
    return selectedList.includes(item.toLowerCase());  // Retourne vrai si l'élément est sélectionné
}

/* /////////////////////////////////////////////
   OBTENIR LA LISTE DES ÉLÉMENTS SÉLECTIONNÉS
//////////////////////////////////////////// */
function getSelectedList(type) {
    switch (type) {
        case 'ingredient': 
            return selectedIngredients;  // Retourne la liste des ingrédients sélectionnés
        case 'appliance': 
            return selectedAppliances;  // Retourne la liste des appareils sélectionnés
        case 'ustensil': 
            return selectedUstensils;  // Retourne la liste des ustensiles sélectionnés
        default: 
            console.error('Type de filtre inconnu:', type);  // Affiche une erreur si le type est inconnu
            return [];
    }
}
