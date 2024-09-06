/* /////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  mainv1.js : GESTION DE L'INTERACTION UTILISATEUR ET LOGIQUE DE FILTRAGE DES RECETTES
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////// */

// Importation des modules
import { recipes } from './data/recipes.js';
import { TemplateCards } from './pattern/templateCard.js';
import { createFiltersButtons } from './utils/dropdowns.js';

// Variables globales pour stocker les options/items et le dernier filtre sélectionné
let selectedIngredients = [];
let selectedAppliances = [];
let selectedUstensils = [];
let lastSelectedFilter = null;

/* //////////////////////////////////////////
   FONCTIONS DE TRAITEMENT DES RECETTES
////////////////////////////////////////// */

// Fonction pour récupérer les données des recettes du fichier recipes.js
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

// Fonction pour filtrer et afficher les recettes initialement
// Variables globales pour suivre la réinitialisation et l'ajustement de la marge de la grille
let isGridMarginReset = false; // Variable pour suivre si la grille a été réinitialisée
let isGridMarginAdjusted = false; // Variable pour suivre si la marge de la grille a été ajustée

function filterAndShowRecipes() {
    const data = mainSearchResults !== null ? mainSearchResults : recipes; // Utilise les résultats de la recherche principale si disponibles
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

    // Mise à jour du compteur
    if (selectedIngredients.length === 0 && selectedAppliances.length === 0 && selectedUstensils.length === 0) {
        if (mainSearchResults === null) {
            updateRecipeCounter(null); // Réinitialise à 1500 si aucune recherche effectuée
        } else {
            updateRecipeCounter(mainSearchResults.length); // Affiche le nombre de recettes de la recherche principale
        }

        // Réinitialiser la marge de la grille si elle n'a pas encore été réinitialisée
        if (!isGridMarginReset) {
            resetGridMargin(); // Réinitialise la marge de la grille à zéro
            isGridMarginReset = true; // Marque la grille comme réinitialisée
        }

        // Remettre la variable pour ajustement de la grille à false
        if (isGridMarginAdjusted) {
            isGridMarginAdjusted = false; // Réinitialise pour permettre un futur ajustement
        }
    } else {
        updateRecipeCounter(filteredRecipes.length); // Affiche le nombre de recettes filtrées

        // Ajuster la marge de la grille dès qu'il y a des filtres appliqués ou après une recherche
        if (!isGridMarginAdjusted || isGridMarginReset) {
            adjustGridMargin(); // Ajuste la marge de la grille
            isGridMarginAdjusted = true; // Marque la grille comme ajustée
            isGridMarginReset = false; // Réinitialisation terminée
        }
    }

    const optionsContainer = document.querySelector('.options-container');
    const errorContainer = document.querySelector('.error-container');

    if (filteredRecipes.length === 0) {
        if (optionsContainer && lastSelectedFilter) {
            showError(errorContainer, lastSelectedFilter);
        }
    } else if (errorContainer) {
        errorContainer.remove();
    }
}

// Fonction pour mettre à jour le dernier filtre sélectionné
function updateLastSelectedFilter(filter) {
    lastSelectedFilter = filter;
}

/* //////////////////////////////////////////
   FONCTIONS DE SÉLECTION DES FILTRES
////////////////////////////////////////// */

// Fonction générique pour gérer la sélection des filtres
function selectFilter(type, item) {
    // Détermine la liste sélectionnée et la mise à jour du filtre basé sur le type
    let selectedList;
    switch (type) {
        case 'ingredient':
            selectedList = selectedIngredients;
            break;
        case 'appliance':
            selectedList = selectedAppliances;
            break;
        case 'ustensil':
            selectedList = selectedUstensils;
            break;
        default:
            console.error('Type de filtre inconnu');
            return;
    }
    
    const lowerItem = item.toLowerCase();
    const index = selectedList.indexOf(lowerItem);

    if (index === -1) {
        selectedList.push(lowerItem);
        updateLastSelectedFilter(item);
    } else {
        selectedList.splice(index, 1);
        updateLastSelectedFilter(null); // Réinitialise si aucun filtre n'est sélectionné
    }

    // Appelle les fonctions communes après la sélection
    filterAndShowRecipes();
    updateSelectedItems();
    adjustGridMargin();
    closeDropdown();
}

// Fonction spécifique pour les ingrédients
function selectIngredient(ingredient) {
    selectFilter('ingredient', ingredient);
}

// Fonction spécifique pour les appareils
function selectAppliance(appliance) {
    selectFilter('appliance', appliance);
}

// Fonction spécifique pour les ustensiles
function selectUstensil(ustensil) {
    selectFilter('ustensil', ustensil);
}

/* ////////////////////////////////////////////////////
   FONCTIONS DE MISE À JOUR DES OPTIONS ET SÉLECTIONS
/////////////////////////////////////////////////// */

// Fonction générale, responsable de la coordination de la mise à jour des options des trois listes déroulantes (ingrédients, appareils, ustensiles) en appelant updateDropdown() sur chacune d'elle.
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

// Fonction pour mettre à jour une liste déroulante spécifique avec les données qui lui sont fournies, donc ne gère qu'une seule liste déroulante à la fois
function updateDropdown(id, items, type) {
    const dropdownList = document.querySelector(`#${id} .list-container`);

    if (dropdownList) {
        dropdownList.innerHTML = ''; // Vide la liste des éléments

        // Remplit la liste d'items
        items.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.className = 'item';
            itemElement.tabIndex = '0';
            itemElement.textContent = item;

            // Vérifie si l'élément est déjà sélectionné
            if (isItemSelected(type, item)) {
                itemElement.classList.add('choice-item');
                const removeIcon = document.createElement('i');
                removeIcon.className = 'fa-solid fa-circle-xmark remove-icon';
                removeIcon.setAttribute('aria-label', 'Supprimer la sélection');
                removeIcon.addEventListener('click', (e) => {
                    e.stopPropagation(); // Empêche la propagation de l'événement de clic
                    deselectItem(type, item);
                    updateSelectedItems();
                    filterAndShowRecipes();
                });
                itemElement.appendChild(removeIcon);
            }

            itemElement.addEventListener('click', () => {
                if (itemElement.classList.contains('choice-item')) {
                    deselectItem(type, item);
                    itemElement.classList.remove('choice-item');
                    const removeIcon = itemElement.querySelector('.remove-icon');
                    if (removeIcon) {
                        removeIcon.remove();
                    }
                } else {
                    selectItem(type, item);
                    itemElement.classList.add('choice-item');
                    if (!itemElement.querySelector('.remove-icon')) {
                        const removeIcon = document.createElement('i');
                        removeIcon.className = 'fa-solid fa-circle-xmark remove-icon';
                        removeIcon.setAttribute('aria-label', 'Supprimer la sélection');
                        removeIcon.addEventListener('click', (e) => {
                            e.stopPropagation(); // Garantit que le clic sur l'icône de suppression n'affecte que l'élément ciblé, évitant ainsi des désélections non désirées sur d'autres éléments en simultané.
                            deselectItem(type, item);
                            itemElement.classList.remove('choice-item');
                            removeIcon.remove();
                            updateSelectedItems();
                            filterAndShowRecipes();
                        });
                        itemElement.appendChild(removeIcon);
                    }
                }
                filterAndShowRecipes();
                updateSelectedItems();
            });

            dropdownList.appendChild(itemElement);
        });
    } else {
        console.error(`#${id} .list-container non trouvé`);
    }
}

// Fonction pour vérifier si un élément est sélectionné
function isItemSelected(type, item) {
    let selectedList;
    switch (type) {
        case 'ingredients':
            selectedList = selectedIngredients;
            break;
        case 'appliances':
            selectedList = selectedAppliances;
            break;
        case 'ustensils':
            selectedList = selectedUstensils;
            break;
        default:
            console.error('Type de filtre inconnu');
            return false;
    }
    return selectedList.includes(item.toLowerCase());
}

// Fonction pour sélectionner un élément
function selectItem(type, item) {
    let selectedList;
    switch (type) {
        case 'ingredients':
            selectedList = selectedIngredients;
            break;
        case 'appliances':
            selectedList = selectedAppliances;
            break;
        case 'ustensils':
            selectedList = selectedUstensils;
            break;
        default:
            console.error('Type de filtre inconnu');
            return;
    }
    const lowerItem = item.toLowerCase();
    if (!selectedList.includes(lowerItem)) {
        selectedList.push(lowerItem);
    }
}

// Fonction pour désélectionner un élément
function deselectItem(type, item) {
    let selectedList;
    switch (type) {
        case 'ingredients':
            selectedList = selectedIngredients;
            break;
        case 'appliances':
            selectedList = selectedAppliances;
            break;
        case 'ustensils':
            selectedList = selectedUstensils;
            break;
        default:
            console.error('Type de filtre inconnu');
            return;
    }
    const lowerItem = item.toLowerCase();
    const index = selectedList.indexOf(lowerItem);
    if (index !== -1) {
        selectedList.splice(index, 1);
    }
}

// Fonction pour afficher les éléments sélectionnés sous les boutons de filtre / Tags
function updateSelectedItems() {
    const optionsContainer = document.querySelector('.options-container') || createOptionsContainer();
    optionsContainer.innerHTML = '';

    // Objet pour mapper les listes sélectionnées aux fonctions de sélection
    const selectionMap = {
        ingredients: {
            list: selectedIngredients,
            selectFunction: selectIngredient
        },
        appliances: {
            list: selectedAppliances,
            selectFunction: selectAppliance
        },
        ustensils: {
            list: selectedUstensils,
            selectFunction: selectUstensil
        }
    };

    // Fonction pour créer les éléments sélectionnés
    function createSelectedItems(type) {
        const { list, selectFunction } = selectionMap[type];

        list.forEach(item => {
            const selectedItem = document.createElement('div');
            selectedItem.className = 'selected-item';
            selectedItem.style.display = 'block';
            selectedItem.tabIndex = '0'; // Rendre l'élément focusable

            const textContainer = document.createElement('span');
            textContainer.className = 'option-text';
            textContainer.textContent = item;
            selectedItem.appendChild(textContainer);

            const closeIcon = document.createElement('i');
            closeIcon.className = 'fa-solid fa-xmark cross-item';
            closeIcon.setAttribute('aria-label', 'Supprimer la sélection');

            closeIcon.addEventListener('click', () => {
                selectFunction(item);
            });

            selectedItem.appendChild(closeIcon);
            optionsContainer.appendChild(selectedItem);

            // Ajouter gestion des événements clavier pour les éléments sélectionnés
            selectedItem.addEventListener('keydown', (event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    selectFunction(item);
                }
            });
        });
    }

    // Appelle la fonction de création pour chaque type
    createSelectedItems('ingredients');
    createSelectedItems('appliances');
    createSelectedItems('ustensils');
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

/* //////////////////////////////////////////
   FONCTIONS D'UI ET GESTION DES ERREURS
////////////////////////////////////////// */

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

// Fonction pour ajuster la marge de la grille des cartes recettes 
function adjustGridMargin() {
    const grid = document.querySelector('.grid');
    if (grid) {
        grid.style.marginTop = '30px';
    } else {
        console.log('.grid non trouvé');
    }
}

// Fonction pour réinitialiser la marge de la grille des cartes recettes à zéro
function resetGridMargin() {
    const grid = document.querySelector('.grid');
    if (grid) {
        grid.style.marginTop = '0';
    } else {
        console.error('.grid non trouvé');
    }
}

// Fonction pour afficher un message d'erreur
function showError(container, item) {
    // Si le conteneur d'erreurs n'existe pas encore, le créer
    if (!container) {
        const optionsContainer = document.querySelector('.options-container');
        if (optionsContainer) {
            // Crée une nouvelle div pour le message d'erreur
            const newErrorContainer = document.createElement('div');
            newErrorContainer.className = 'error-container';
            optionsContainer.parentNode.insertBefore(newErrorContainer, optionsContainer.nextSibling);
            container = newErrorContainer;
        } else {
            console.error('.options-container non trouvé pour ajouter le conteneur d\'erreur');
            return;
        }
    }

    // Crée le message d'erreur
    const errorMessage = document.createElement('div');
    errorMessage.className = 'error-message';

    // Crée le texte principal du message d'erreur
    const messageText = document.createElement('span');
    messageText.textContent = "Aucune recette ne contient ";
    errorMessage.appendChild(messageText);

    // Crée le span pour l'élément avec la classe d'erreur
    const errorItem = document.createElement('span');
    errorItem.className = 'error-item';
    errorItem.textContent = item; // Ajoute le nom de l'item sélectionné causant le message d'erreur
    errorMessage.appendChild(errorItem);

    // Ajoute le texte final du message d'erreur
    const additionalText = document.createElement('span');
    additionalText.textContent = ". Veuillez faire une nouvelle recherche, svp.";
    errorMessage.appendChild(additionalText);

    // Ajoute le message d'erreur au conteneur
    container.innerHTML = ''; // Vide le conteneur avant d'ajouter un nouveau message
    container.appendChild(errorMessage);
}

/* //////////////////////////////////////////
        FONCTIONS D'INITIALISATION
////////////////////////////////////////// */

// Fonction d'initialisation principale
function initialize() {
    const data = getData();
    showRecipeCards(data);
    updateRecipeCounter(null);
    createFiltersButtons(data, selectIngredient, selectAppliance, selectUstensil);
    
}

initialize();

/* //////////////////////////////////////////////////////////////////////////////////////////////////////
BARRE DE RECHERCHE PRINCIPALE - VERSION N°1 - TRI AVEC BOUCLE FOR ET STRUCTURE CONDITIONNELLE IF/ELSE 
////////////////////////////////////////////////////////////////////////////////////////////////////// */

// Variable pour stocker les résultats de la recherche principale
let mainSearchResults = null;

function handleSearchInput() {
    const searchInput = document.querySelector('.searchbar');
    const crossIcon = document.querySelector('.cross-icon');

    searchInput.addEventListener('input', function () {
        const query = searchInput.value.toLowerCase().trim();

        // Si la recherche est trop courte, réinitialise
        if (query.length < 3) {
            mainSearchResults = null;
            showRecipeCards(recipes);
            updateRecipeCounter(1500);
            filterAndShowRecipes();
            return;
        }

        // Extraire les termes de recherche avec des termes composés
        const terms = extractSearchTerms(query);

        // Filtrer les recettes
        const filteredRecipes = [];
        for (let i = 0; i < recipes.length; i++) {
            let recipe = recipes[i];
            let recipeMatches = true;

            // Vérifier que tous les termes sont présents dans le titre, les ingrédients ou la description
            for (let j = 0; j < terms.length; j++) {
                let term = terms[j];
                let termPatterns = [
                    new RegExp(`\\b${term}\\b`, 'i'), // Terme exact
                    new RegExp(`\\b${pluralize(term)}\\b`, 'i') // Pluriel
                ];
                let termFound = false;

                // Vérifier le titre de la recette
                if (termPatterns.some(pattern => pattern.test(recipe.name))) {
                    termFound = true;
                }

                // Vérifier les ingrédients de la recette
                for (let k = 0; k < recipe.ingredients.length; k++) {
                    if (termPatterns.some(pattern => pattern.test(recipe.ingredients[k].ingredient))) {
                        termFound = true;
                        break;
                    }
                }

                // Vérifier la description de la recette
                if (termPatterns.some(pattern => pattern.test(recipe.description))) {
                    termFound = true;
                }

                // Si un terme n'est pas trouvé, la recette ne correspond pas
                if (!termFound) {
                    recipeMatches = false;
                    break;
                }
            }

            // Ajouter la recette aux résultats filtrés si elle correspond
            if (recipeMatches) {
                filteredRecipes.push(recipe);
            }
        }

        if (filteredRecipes.length > 0) {
            mainSearchResults = filteredRecipes;
            showRecipeCards(filteredRecipes);
            updateDropdownOptions(filteredRecipes);
            updateRecipeCounter(filteredRecipes.length);
        } else {
            mainSearchResults = [];
            showRecipeCards([]);
            updateDropdownOptions([]);
            updateRecipeCounter(0);
        }
    });

    // Pour gérer la croix de la barre de recherche principale
    if (searchInput && crossIcon) {
        searchInput.addEventListener('input', () => {
            crossIcon.classList.toggle('visible', searchInput.value.length > 2);
        });

        crossIcon.addEventListener('click', () => {
            searchInput.value = '';
            crossIcon.classList.remove('visible');
            mainSearchResults = null;
            updateRecipeCounter(1500);
            showRecipeCards(recipes);
            filterAndShowRecipes();
        });
    }
}

function extractSearchTerms(query) {
    // Diviser la recherche en termes en tenant compte des termes composés
    const terms = [];
    let currentTerm = '';  
    let insideQuotes = false;

    for (let i = 0; i < query.length; i++) {
        const char = query[i];
        
        if (char === '"') {
            insideQuotes = !insideQuotes; // Activer/désactiver la détection des guillemets
            if (!insideQuotes && currentTerm) {
                terms.push(currentTerm.trim());
                currentTerm = '';
            }
        } else if (char === ' ' && !insideQuotes) {
            if (currentTerm) {
                terms.push(currentTerm.trim());
                currentTerm = '';
            }
        } else {
            currentTerm += char;
        }
    }

    if (currentTerm) {
        terms.push(currentTerm.trim());
    }

    return terms;
}

function pluralize(term) {
    // Simple pluralisation: ajoute un "s" à la fin du terme si ce n'est pas déjà pluriel
    if (term.endsWith('s') || term.endsWith('x') || term.endsWith('z')) {
        return term; // Termes déjà pluriels
    }
    return term + 's'; // Ajoute un "s" pour la pluralisation
}

handleSearchInput();
