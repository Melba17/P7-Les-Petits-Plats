// dropdown.js : GÉNÉRATION ET GESTION DES MENUS DÉROULANTS POUR LES FILTRES (INGRÉDIENTS, APPAREILS, USTENSILES) 
// INTÉRACTIONS UTILISATEUR

import { selectItem, deselectItem, updateSelectedItems, filterAndShowRecipes } from './filter.js';
import { getMainSearchResults } from './state.js';
import { isItemSelected } from './filter.js';
import { getData } from '../main.js';

/* //////////////////////////////////////////////////////////////////////////
   OBJET POUR STOCKER LES ÉLÉMENTS FILTRÉS APRÈS LA PREMIÈRE RECHERCHE
////////////////////////////////////////////////////////////////////////// */
let firstFilteredItems = {
    ingredients: [], // Stocke la liste des ingrédients filtrés
    appliances: [], // idem pour les appareils
    ustensils: []   // // idem pour les ustensiles
}

/* ////////////////////////////////////////////////////////////////////////////
   CRÉATION DES BOUTONS DE FILTRES (INGRÉDIENTS, APPAREILS, USTENSILES)
//////////////////////////////////////////////////////////////////////////// */
// Fonction qui crée les boutons pour les listes déroulantes des filtres (ingrédients, appareils, ustensiles)
export function createFiltersButtons(recipes = getData()) {  
    const mainSearchResults = getMainSearchResults();  // Récupère les résultats de la recherche principale

    // Crée les menus déroulants pour chaque type de filtre (ingrédients, appareils, ustensiles)
    createDropdown('dropdownIngredients', 'Ingrédients', recipes.flatMap(recipe => recipe.ingredients.map(ing => ing.ingredient)), (item) => selectItem('ingredient', item, recipes), mainSearchResults, recipes);
    createDropdown('dropdownAppliances', 'Appareils', recipes.map(recipe => recipe.appliance), (item) => selectItem('appliance', item, recipes), mainSearchResults, recipes);
    createDropdown('dropdownUstensils', 'Ustensiles', recipes.flatMap(recipe => recipe.ustensils), (item) => selectItem('ustensil', item, recipes), mainSearchResults, recipes);
}

/* ///////////////////////////////////////////////////////////////////////
   MISE À JOUR DES OPTIONS DES LISTES DÉROULANTES  APRÈS UN FILTRAGE
/////////////////////////////////////////////////////////////////////// */
// Fonction pour mettre à jour les options des menus déroulants après un filtrage des recettes
export function updateDropdownOptions(filteredRecipes) {
    const ingredients = new Set();  // Utilise un Set pour garantir des valeurs uniques
    const appliances = new Set();  // Utilise un Set pour garantir des valeurs uniques pour les appareils
    const ustensils = new Set();  // Utilise un Set pour garantir des valeurs uniques pour les ustensiles

    // Remplit les Sets avec les ingrédients, appareils et ustensiles filtrés
    filteredRecipes.forEach(recipe => {
        recipe.ingredients.forEach(ing => ingredients.add(ing.ingredient.toLowerCase()));
        appliances.add(recipe.appliance.toLowerCase());
        recipe.ustensils.forEach(ust => ustensils.add(ust.toLowerCase()));
    });

    // Stocke les résultats filtrés dans l'objet `firstFilteredItems`
    firstFilteredItems.ingredients = Array.from(ingredients);
    firstFilteredItems.appliances = Array.from(appliances);
    firstFilteredItems.ustensils = Array.from(ustensils);

    // Met à jour les listes déroulantes avec les nouvelles options filtrées
    updateDropdown('dropdownIngredients', firstFilteredItems.ingredients, 'ingredient', filteredRecipes);
    updateDropdown('dropdownAppliances', firstFilteredItems.appliances, 'appliance', filteredRecipes);
    updateDropdown('dropdownUstensils', firstFilteredItems.ustensils, 'ustensil', filteredRecipes);
}

/* /////////////////////////////////////////////////////
   MISE À JOUR DE LA LISTE DANS LE MENU DÉROULANT
/////////////////////////////////////////////////// */
// Fonction qui met à jour les éléments dans le menu déroulant (dropdown)
function updateDropdown(id, items, type, recipes) {
    const dropdownList = document.querySelector(`#${id} .list-container`);  // Sélectionne la liste du menu déroulant par son ID
    if (!dropdownList) return console.error(`#${id} .list-container non trouvé`);  // Affiche une erreur si la liste n'est pas trouvée

    dropdownList.innerHTML = '';  // Réinitialise la liste déroulante

    // Parcourt chaque élément à ajouter à la liste déroulante
    items.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = 'item';  // Définit la classe `item` pour chaque élément
        itemElement.tabIndex = '0';  // Rend l'élément focusable
        itemElement.textContent = item;  // Définit le contenu textuel de l'élément

        // Si l'élément est déjà sélectionné, on ajoute la classe `choice-item`
        if (isItemSelected(type, item)) {
            itemElement.classList.add('choice-item');
            addRemoveIcon(itemElement, type, item);  // Ajoute l'icône de suppression
        }

        // Gère la logique de sélection/désélection des éléments au clic
        itemElement.addEventListener('click', () => {
            if (itemElement.classList.contains('choice-item')) {
                deselectItem(type, item);  // Désélectionne l'élément
                itemElement.classList.remove('choice-item');
                removeRemoveIcon(itemElement);  // Supprime l'icône de suppression
            } else {
                selectItem(type, item, recipes);  // Sélectionne l'élément
                itemElement.classList.add('choice-item');
                addRemoveIcon(itemElement, type, item);  // Ajoute l'icône de suppression
            }
            
            updateSelectedItems();  // Met à jour visuellement les éléments sélectionnés
            filterAndShowRecipes(recipes);  // Filtre et affiche les recettes en fonction des sélections
        });

        dropdownList.appendChild(itemElement);  // Ajoute l'élément à la liste déroulante
    });
}

/* //////////////////////////////////////////////////////////////////
   AJOUT D'UNE ICÔNE DE SUPPRESSION SUR UN ÉLÉMENT SÉLECTIONNÉ
///////////////////////////////////////////////////////////////// */
// Fonction pour ajouter une icône de suppression à un élément sélectionné
function addRemoveIcon(itemElement, type, item) {
    const removeIcon = document.createElement('i');  // Crée un élément icône
    removeIcon.className = 'fa-solid fa-circle-xmark remove-icon';  // Définit la classe de l'icône
    removeIcon.setAttribute('aria-label', 'Supprimer la sélection');  // Ajoute une description ARIA pour l'accessibilité

    // Gère l'événement de clic sur l'icône de suppression
    removeIcon.addEventListener('click', e => {
        e.stopPropagation();  // Empêche la propagation du clic vers d'autres éléments
        deselectItem(type, item);  // Désélectionne l'élément
        itemElement.classList.remove('choice-item');  // Retire la mise en évidence de l'élément sélectionné
        removeRemoveIcon(itemElement);  // Supprime l'icône de suppression
        updateSelectedItems();  // Met à jour visuellement les éléments sous les filtres
        filterAndShowRecipes();  // Réapplique les filtres et affiche les recettes
    });

    itemElement.appendChild(removeIcon);  // Ajoute l'icône à l'élément
}

/* //////////////////////////////////////////
   SUPPRESSION DE L'ICÔNE DE SUPPRESSION
////////////////////////////////////////// */
// Fonction pour supprimer l'icône de suppression d'un élément
function removeRemoveIcon(itemElement) {
    const removeIcon = itemElement.querySelector('.remove-icon');  // Sélectionne l'icône de suppression
    if (removeIcon) {
        removeIcon.remove();  // Supprime l'icône si elle est présente
    }
}

/* //////////////////////////////////////////////
    FONCTION POUR CRÉER UN MENU DÉROULANT
///////////////////////////////////////////////*/
 function createDropdown(id, label, items, selectItem, recipes) { 
    let dropdownWrapper = document.querySelector(`#${id}`);  // Sélectionne le conteneur du menu déroulant par son ID

    // Si le conteneur n'existe pas, on le crée
    if (!dropdownWrapper) {
        // Crée un élément `div` pour contenir le menu déroulant
        dropdownWrapper = createElement('div', { class: 'dropdown-wrapper', id: id });

        // Crée un bouton pour ouvrir/fermer le menu déroulant
        const button = createElement('button', {
            class: 'dropdown',  // Ajoute la classe CSS 'dropdown'
            type: 'button',  // Définit le type du bouton comme 'button'
            id: `${id}Button`,  // Définit l'ID unique pour ce bouton
            'aria-haspopup': 'listbox',  // Attribut ARIA indiquant que ce bouton contrôle une liste
            'aria-expanded': 'false',  // Définit l'état initial du menu (fermé)
            'aria-label': `Filtre ${label.toLowerCase()}`  // Ajoute un label ARIA pour l'accessibilité
        }, [
            createElement('span', {}, [document.createTextNode(label)]),  // Ajoute le label textuel du bouton
            createElement('i', { class: 'fa-solid fa-angle-down dropdown-icon' })  // Ajoute l'icône de flèche pour indiquer l'état du menu
        ]);

        // Crée le contenu du menu déroulant (la liste d'éléments)
        const content = createElement('div', {
            class: 'dropdown-content',  // Ajoute la classe CSS 'dropdown-content'
            role: 'listbox',  // Définit le rôle ARIA comme 'listbox'
            'aria-labelledby': `${id}Button`  // Lie ce contenu au bouton pour l'accessibilité
        });

        // Ajoute le bouton et le contenu au conteneur du menu déroulant
        dropdownWrapper.append(button, content);
        document.querySelector('.dropdowns').appendChild(dropdownWrapper);  // Ajoute le menu déroulant à la section .dropdowns du DOM

        // Crée un conteneur pour la liste d'éléments du menu
        const listContainer = createElement('div', { class: 'list-container' });
        content.appendChild(listContainer);  // Ajoute le conteneur de la liste dans le contenu du menu déroulant

        // GESTION DE L'OUVERTURE/FERMETURE DU MENU
        button.addEventListener('click', () => {
            const isExpanded = button.getAttribute('aria-expanded') === 'true';  // Vérifie si le menu est déjà ouvert
            toggleDropdownIcon(button, isExpanded);  // Gère l'icône du menu (rotation de l'icône de flèche)

            // Si le menu est fermé, on donne le focus au premier élément de la liste
            if (!isExpanded) {
                const firstItem = listContainer.querySelector('.item');  // Sélectionne le premier élément de la liste
                if (firstItem) {
                    firstItem.focus();  // Applique le focus uniquement si l'élément existe
                }
            }
        });

        // GESTION DES INTERACTIONS CLAVIER (TAB, SHIFT+TAB, ENTER, ESPACE, ESCAPE)
        listContainer.addEventListener('keydown', (event) => {
            // Gère la sélection de l'élément avec la touche Enter ou Espace
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();  // Empêche le comportement par défaut de la touche
                const focusedItem = document.activeElement;  // Récupère l'élément actuellement sélectionné (focus)
                if (focusedItem.classList.contains('item')) {
                    // Détermine le type de filtre en fonction de l'ID du menu déroulant
                    const filterType = id === 'dropdownIngredients' ? 'ingredient':
                                       id === 'dropdownAppliances' ? 'appliance': 
                                       id === 'dropdownUstensils' ? 'ustensil':

                    selectItem(filterType, focusedItem.textContent, recipes);  // Sélectionne l'élément avec la fonction selectItem
                    toggleDropdownIcon(button, true);  // Ferme le menu après la sélection
                }
            }

            // Gère la fermeture du menu avec la touche Escape
            if (event.key === 'Escape') {
                toggleDropdownIcon(button, true);  // Ferme le menu
                button.focus();  // Ramène le focus sur le bouton du menu
            }
        });

        // GESTION DE LA SÉLECTION PAR CLIC
        listContainer.addEventListener('click', (event) => {
            // Vérifie si l'élément cliqué est un item
            if (event.target.classList.contains('item')) {
                // Détermine le type de filtre en fonction de l'ID du menu déroulant
                const filterType = id === 'dropdownIngredients' ? 'ingredient':
                                   id === 'dropdownAppliances' ? 'appliance': 
                                   id === 'dropdownUstensils' ? 'ustensil':

                selectItem(filterType, event.target.textContent, recipes);  // Passe l'élément sélectionné à la fonction selectItem
                toggleDropdownIcon(button, true);  // Ferme le menu après la sélection
            }
        });

        // Passe le type d'élément (filterType) à la fonction createSearchArea
        const filterType = id === 'dropdownIngredients' ? 'ingredient' :
                           id === 'dropdownAppliances' ? 'appliance' : 'ustensil';
                        
        createSearchArea(listContainer, items, selectItem, filterType);  // Crée la zone de recherche dans le menu déroulant avec le type approprié
    }
}



/* ///////////////////////////////////////////////////////////
   GESTION DE LA ZONE DE RECHERCHE DANS LE MENU DÉROULANT
////////////////////////////////////////////////////////// */
// Fonction qui gère la zone de recherche dans les menus déroulants
function createSearchArea(listContainer, items, selectItem, filterType) {
    const searchContainer = createElement('div', {
        style: 'position: sticky; top: 0; background-color: white; z-index: 1; padding: 10px;'  // Style pour garder la zone de recherche visible
    });

    const uniqueId = generateUniqueId('search');
    const searchInput = createElement('input', {
        type: 'search',
        class: 'search-filters',
        id: uniqueId,
        name: uniqueId,
        'aria-label': 'Rechercher parmi les éléments',
        tabindex: '0'  // Champ de recherche pour filtrer les éléments dans le menu déroulant
    });

    const iconSearch = createElement('i', {
        class: 'fa-solid fa-magnifying-glass filters-icon',  // Icône de loupe pour le champ de recherche
        'aria-hidden': 'true'
    });

    const clearIcon = createElement('i', {
        class: 'fa-solid fa-xmark clear-icon',  // Icône pour effacer la recherche
        'aria-label': 'Supprimer la saisie',
        tabindex: '0'
    });

    searchContainer.append(iconSearch, searchInput, clearIcon);  // Ajoute les icônes et le champ de recherche
    listContainer.parentNode.insertBefore(searchContainer, listContainer);  // Place la zone de recherche au-dessus de la liste

    const listItems = [...new Set(items.map(item => item.toLowerCase()))];  // Récupère la liste d'éléments filtrés de manière unique
    displayList(listContainer, listItems, selectItem, filterType);  // Affiche les éléments dans la liste

    // Gestion de la recherche dans les éléments du menu déroulant
    searchInput.addEventListener('input', () => {
        const query = searchInput.value.toLowerCase().trim();  // Récupère la valeur tapée par l'utilisateur
        clearIcon.style.display = query ? 'block' : 'none';  // Affiche ou cache l'icône de suppression selon le texte

        let remainingItems;
        if (filterType === 'ingredient') {
            remainingItems = firstFilteredItems.ingredients;  // Utilise la liste filtrée des ingrédients
        } else if (filterType === 'appliance') {
            remainingItems = firstFilteredItems.appliances;  // Utilise la liste filtrée des appareils
        } else if (filterType === 'ustensil') {
            remainingItems = firstFilteredItems.ustensils;  // Utilise la liste filtrée des ustensiles
        }

        let filteredItems = remainingItems.filter(item => item.includes(query));  // Filtre les éléments selon la recherche
        displayList(listContainer, filteredItems, selectItem, filterType);  // Affiche les éléments filtrés
    });

    // Gestion du bouton pour effacer la recherche
    clearIcon.addEventListener('click', () => {
        searchInput.value = '';  // Réinitialise le champ de recherche
        clearIcon.style.display = 'none';  // Cache l'icône de suppression
        searchInput.focus();  // Redonne le focus au champ de recherche

        let remainingItems;
        if (filterType === 'ingredient') {
            remainingItems = firstFilteredItems.ingredients;
        } else if (filterType === 'appliance') {
            remainingItems = firstFilteredItems.appliances;
        } else if (filterType === 'ustensil') {
            remainingItems = firstFilteredItems.ustensils;
        }

        displayList(listContainer, remainingItems, selectItem, filterType);  // Réaffiche la liste complète filtrée
    });

    // Gestion clavier pour effacer la recherche avec la touche Enter ou Espace
    clearIcon.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            searchInput.value = '';  // Réinitialise le champ de recherche
            clearIcon.style.display = 'none';  // Cache l'icône de suppression

            let remainingItems;
            if (filterType === 'ingredient') {
                remainingItems = firstFilteredItems.ingredients;
            } else if (filterType === 'appliance') {
                remainingItems = firstFilteredItems.appliances;
            } else if (filterType === 'ustensil') {
                remainingItems = firstFilteredItems.ustensils;
            }

            displayList(listContainer, remainingItems, selectItem, filterType);  // Réaffiche la liste complète
            searchInput.focus();  // Redonne le focus au champ de recherche
        }
    });
}

/* /////////////////////////////////////////////////
   AFFICHAGE DES ÉLÉMENTS DANS LE MENU DÉROULANT
///////////////////////////////////////////////// */
// Fonction qui affiche les éléments dans la liste du menu déroulant
function displayList(listContainer, items, selectItem, filterType) {
    listContainer.innerHTML = '';  // Vide le conteneur avant d'ajouter les nouveaux éléments

    // Si la liste d'éléments n'est pas vide, on affiche chaque élément
    if (items.length > 0) {
        items.forEach(item => {
            const itemElement = createElement('div', { class: 'item', tabindex: '0' }, [document.createTextNode(item)]);  // Crée un élément pour chaque item

            // Si l'élément est déjà sélectionné, on ajoute la classe `choice-item`
            if (isItemSelected(filterType, item)) {
                itemElement.classList.add('choice-item');
                addRemoveIcon(itemElement, filterType, item);  // Ajoute l'icône de suppression
            }

            // Gestion de la sélection de l'élément au clic
            itemElement.addEventListener('click', () => selectItem(item));
            listContainer.appendChild(itemElement);  // Ajoute l'élément au conteneur de la liste
        });
    } else {
        // Si aucun résultat trouvé, affiche un message 'Aucun résultat trouvé'
        const noResults = document.createElement('div');
        noResults.className = 'item';
        noResults.textContent = 'Aucun résultat trouvé';
        listContainer.appendChild(noResults);
    }
}


/* ///////////////////////////////////////////////////////
   CRÉATION D'UN ÉLÉMENT DOM AVEC ATTRIBUTS ET ENFANTS
/////////////////////////////////////////////////////// */
// Fonction qui crée un élément DOM avec ses attributs et enfants
function createElement(type, attributes = {}, children = []) {
    const element = document.createElement(type);  // Crée un élément du type donné
    Object.keys(attributes).forEach(attr => element.setAttribute(attr, attributes[attr]));  // Applique les attributs
    children.forEach(child => element.appendChild(child));  // Ajoute les enfants
    return element;  // Retourne l'élément créé
}

/* //////////////////////////////////////////////////////
   GÉNÉRATION D'ID UNIQUE POUR LES ZONES DE RECHERCHE
////////////////////////////////////////////////////// */
// Fonction qui génère un ID unique pour chaque barre de recherche
let idCounter = 0;  // Compteur d'ID
function generateUniqueId(prefix = '') {
    idCounter += 1;  // Incrémente le compteur
    return `${prefix}-${idCounter}`;  // Retourne l'ID unique
}

/* //////////////////////////////////////////
   GESTION DE L'ICÔNE DU MENU DÉROULANT
////////////////////////////////////////// */
// Fonction qui gère l'icône de flèche dans le menu déroulant
function toggleDropdownIcon(button, isExpanded) {
    button.setAttribute('aria-expanded', !isExpanded);  // Inverse l'état du menu (ouvert/fermé)
    const icon = button.querySelector('.dropdown-icon');
    icon.style.transform = isExpanded ? 'rotate(0deg)' : 'rotate(180deg)';  // Fait pivoter l'icône de flèche
    const content = button.nextElementSibling;
    content.style.display = isExpanded ? 'none' : 'block';  // Affiche ou cache le contenu du menu
}