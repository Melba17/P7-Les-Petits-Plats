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

    // Mise à jour du compteur
    if (selectedIngredients.length === 0 && selectedAppliances.length === 0 && selectedUstensils.length === 0) {
        updateRecipeCounter(null); // Réinitialise le compteur à "1500 recettes"
        resetGridMargin(); // Réinitialise la marge de la grille des cartes recettes à zéro
    } else {
        updateRecipeCounter(filteredRecipes.length); // Affiche le nombre de cartes recettes disponibles
        adjustGridMargin();  // Ajuste la marge de la grille des cartes recettes à zéro
    }

    const optionsContainer = document.querySelector('.options-container');
    const errorContainer = document.querySelector('.error-container');

    if (filteredRecipes.length === 0) {
        if (optionsContainer) {
            if (lastSelectedFilter) {
                // Crée ou met à jour la zone de message d'erreur
                showError(errorContainer, lastSelectedFilter);
            }
        }
    } else {
        // Supprime le conteneur du message d'erreur existant s'il y en a un
        if (errorContainer) {
            errorContainer.remove();
        }
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
        dropdownList.innerHTML = ''; // Vide la liste des éléments

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

// Fonction pour afficher les éléments sélectionnés sous les boutons de filtre
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

function handleSearchInput() {
    const searchInput = document.querySelector('.searchbar');
    const crossIcon = document.querySelector('.cross-icon');

    searchInput.addEventListener('input', function () {
        const query = searchInput.value.toLowerCase();

        // Si la recherche est trop courte, ne pas effectuer de recherche
        if (query.length < 3) {
            // Réinitialise la galerie et le compteur si la recherche est courte
            showRecipeCards(recipes);
            updateRecipeCounter(recipes.length);
            filterAndShowRecipes(); // Réinitialise les filtres si nécessaire
            return;
        }

        const filteredRecipes = [];

        for (let i = 0; i < recipes.length; i++) {
            let recipe = recipes[i];
            let match = false;

            // Vérifie le titre
            if (recipe.name.toLowerCase().includes(query)) {
                match = true;
            }

            // Vérifie les ingrédients un par un
            if (!match) {
                for (let j = 0; j < recipe.ingredients.length; j++) {
                    if (recipe.ingredients[j].ingredient.toLowerCase().includes(query)) {
                        match = true;
                    }
                }
            }

            // Vérifie la description
            if (!match && recipe.description.toLowerCase().includes(query)) {
                match = true;
            }

            if (match) {
                filteredRecipes.push(recipe);
            }
        }

        if (filteredRecipes.length > 0) {
            showRecipeCards(filteredRecipes);  // Affiche les recettes trouvées
            createFiltersButtons(filteredRecipes, selectIngredient, selectAppliance, selectUstensil); // Met à jour les boutons de filtre
            updateRecipeCounter(filteredRecipes.length); // Met à jour le compteur de recettes

            
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
            updateRecipeCounter(recipes.length); // Réinitialise le compteur à toutes les recettes
            showRecipeCards(recipes); // Réaffiche toutes les recettes
            filterAndShowRecipes(); // Réinitialise les filtres
            resetGridMargin(); // Réinitialise la marge de la galerie des cartes recettes

            
        });
    }
}


handleSearchInput();
