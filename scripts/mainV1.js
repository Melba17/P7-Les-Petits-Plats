/* //////////////////////////////////////////////////////////////////////////////////////////////
    MAINV1.JS : GESTION DE L'INTERACTION UTILISATEUR ET LOGIQUE DE FILTRAGE DES RECETTES
///////////////////////////////////////////////////////////////////////////////////////////// */

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
        if (mainSearchResults === null || mainSearchResults.length === 0) {
            updateRecipeCounter(1500); // Réinitialise à 1500 si aucune recherche effectuée ou si les résultats de recherche sont vides
        } else {
            updateRecipeCounter(mainSearchResults.length); // Affiche le nombre de recettes de la recherche principale
        }

        // Réinitialise la marge de la grille si elle n'a pas encore été réinitialisée
        if (filteredRecipes.length === 0) {
            if (!isGridMarginAdjusted) {
                adjustGridMargin(); // Ajuste la marge de la grille à 30px
                isGridMarginAdjusted = true; // Marque la grille comme ajustée
            }
        }
    } else {
        updateRecipeCounter(filteredRecipes.length); // Affiche le nombre de recettes filtrées

        // Ajuste la marge de la grille seulement si elle n'a pas déjà été ajustée ou si la grille a été réinitialisée
        if (selectedIngredients.length > 0 || selectedAppliances.length > 0 || selectedUstensils.length > 0) {
            if (!isGridMarginAdjusted) {
                adjustGridMargin(); // Ajuste la marge de la grille
                isGridMarginAdjusted = true; // Marque la grille comme ajustée
            }
        }
    }

    const optionsContainer = document.querySelector('.options-container');
    const errorContainer = document.querySelector('.error-container');

    if (filteredRecipes.length === 0 && optionsContainer && lastSelectedFilter) {
        showError(errorContainer, lastSelectedFilter);
    } else if (errorContainer) {
        errorContainer.remove();
    }
}

/* //////////////////////////////////////////
   FONCTIONS DE SÉLECTION DES FILTRES
////////////////////////////////////////// */

// Objet pour les listes de filtres
const filterLists = {
    'ingredient': selectedIngredients,
    'appliance': selectedAppliances,
    'ustensil': selectedUstensils
};

// Met à jour le dernier filtre sélectionné
function updateLastSelectedFilter(filter) {
    lastSelectedFilter = filter;
}

// Fonction générique pour gérer la sélection des filtres
function selectFilter(type, item) {
    const selectedList = filterLists[type];
    
    if (!selectedList) {
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
        updateLastSelectedFilter(selectedList.length > 0 ? selectedList[selectedList.length - 1] : null);
    }

    // Appelle les fonctions communes après la sélection
    filterAndShowRecipes();
    updateSelectedItems();
    adjustGridMargin();
    closeDropdown();
}

// Fonction générique pour sélectionner un filtre
function select(type, value) {
    selectFilter(type, value);
}

// Utilisation des fonctions spécifiques
function selectIngredient(ingredient) {
    select('ingredient', ingredient);
}

function selectAppliance(appliance) {
    select('appliance', appliance);
}

function selectUstensil(ustensil) {
    select('ustensil', ustensil);
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
                    handleItemDeselect(type, item, itemElement);
                });
                itemElement.appendChild(removeIcon);
            }

            itemElement.addEventListener('click', () => {
                handleItemSelectOrDeselect(type, item, itemElement);
            });

            dropdownList.appendChild(itemElement);
        });
    } else {
        console.error(`#${id} .list-container non trouvé`);
    }
}

// Fonction pour gérer la sélection ou désélection d'un item
function handleItemSelectOrDeselect(type, item, itemElement) {
    if (itemElement.classList.contains('choice-item')) {
        handleItemDeselect(type, item, itemElement);
    } else {
        selectItem(type, item);
        itemElement.classList.add('choice-item');
        addRemoveIcon(itemElement, type, item);
    }

    updateSelectedItems();
    filterAndShowRecipes();
}

// Fonction pour désélectionner un item
function handleItemDeselect(type, item, itemElement) {
    deselectItem(type, item);
    itemElement.classList.remove('choice-item');
    const removeIcon = itemElement.querySelector('.remove-icon');
    if (removeIcon) {
        removeIcon.remove();
    }

    updateSelectedItems();
    filterAndShowRecipes();
}

// Fonction pour ajouter l'icône de suppression (pour ne pas répéter le code)
function addRemoveIcon(itemElement, type, item) {
    const removeIcon = document.createElement('i');
    removeIcon.className = 'fa-solid fa-circle-xmark remove-icon';
    removeIcon.setAttribute('aria-label', 'Supprimer la sélection');
    removeIcon.addEventListener('click', (e) => {
        e.stopPropagation(); // Garantit que le clic sur l'icône de suppression n'affecte pas d'autres éléments
        handleItemDeselect(type, item, itemElement);
    });
    itemElement.appendChild(removeIcon);
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

// Fonction pour afficher un message d'erreur
function showError(container, item) {
    // Si le conteneur d'erreurs n'existe pas encore, le créer
    if (!container) {
        let existingContainer = document.querySelector('.error-container');
        if (!existingContainer) {
            // Crée une nouvelle div pour le message d'erreur
            existingContainer = document.createElement('div');
            existingContainer.className = 'error-container';
            document.body.appendChild(existingContainer);
        }
        container = existingContainer;
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
let typingTimer; // Timer pour gérer le délai de recherche
const typingInterval = 500;

function handleSearchInput() {
    const searchInput = document.querySelector('.searchbar');
    const crossIcon = document.querySelector('.cross-icon');

    searchInput.addEventListener('input', function () {
        clearTimeout(typingTimer); // Annuler le précédent timer

        typingTimer = setTimeout(() => {
            const query = searchInput.value.toLowerCase().trim();

            // Réinitialiser le message d'erreur
            const errorContainer = document.querySelector('.error-container');
            if (errorContainer) {
                errorContainer.innerHTML = ''; // Vider le conteneur d'erreur
            }

            // Si la recherche est trop courte, réinitialise
            if (query.length < 3) {
                mainSearchResults = null;
                showRecipeCards(recipes);
                updateRecipeCounter(1500);
                filterAndShowRecipes();
                return;
            }

            /////// BOUCLE FOR ET STRUCTURE CONDITIONNELLE IF/ELSE ///////
            /////////////////////////////////////////////////////////////

            // Extraire les termes de recherche avec des termes composés
            const terms = extractSearchTerms(query);

            // Filtrer les recettes
            const filteredRecipes = [];
            for (let i = 0; i < recipes.length; i++) {
                let recipe = recipes[i];
                let recipeMatches = true;

                // Vérifier que tous les termes (singulier/pluriel) sont présents dans le titre, les ingrédients ou la description
                for (let j = 0; j < terms.length; j++) {
                    let term = terms[j];
                    let { singular, plural } = getSingularAndPluralForms(term); // Obtenir les deux formes du terme
                    let termPatternSingular = new RegExp(`\\b${singular}\\b`, 'i'); // Expression régulière pour le singulier
                    let termPatternPlural = new RegExp(`\\b${plural}\\b`, 'i'); // Expression régulière pour le pluriel
                    let termFound = false;

                    // Vérifier le titre de la recette
                    if (termPatternSingular.test(recipe.name) || termPatternPlural.test(recipe.name)) {
                        termFound = true;
                    }

                    // Vérifier les ingrédients de la recette
                    for (let k = 0; k < recipe.ingredients.length; k++) {
                        if (termPatternSingular.test(recipe.ingredients[k].ingredient) || termPatternPlural.test(recipe.ingredients[k].ingredient)) {
                            termFound = true;
                            break;
                        }
                    }

                    // Vérifier la description de la recette
                    if (termPatternSingular.test(recipe.description) || termPatternPlural.test(recipe.description)) {
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
                
                // Afficher le message d'erreur dans le conteneur existant
                showError(document.querySelector('.error-container'), query);
            }
        }, typingInterval);
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
            // Cacher le message d'erreur lors de la réinitialisation
            const errorContainer = document.querySelector('.error-container');
            if (errorContainer) {
                errorContainer.innerHTML = ''; // Vider le conteneur d'erreur
            }
        });
    }
}

///// Le reste du code est inchangé pour préserver son comportement d'origine /////
// Fonction qui a pour but de générer les formes singulière et plurielle d'un mot (terme) donné
function getSingularAndPluralForms(term) {
    // Condition if qui vérifie si le mot (terme) se termine par un "s"
    if (term.endsWith('s')) {
        // Retourne un objet contenant les formes singulière et plurielle du terme
        return {
            // Méthode slice() extrait tous les caractères du terme sauf le dernier, ce qui permet d'obtenir sa forme singulière.
            singular: term.slice(0, -1),
            // Et la propriété plural est définie en conservant le terme tel quel, c'est à dire déjà au pluriel
            plural: term
        };
    } else {
        return {
            // Sinon, la propriété singular est définie en prenant le terme original qui ne se termine pas par un "s", donc il est déjà sous forme singulière
            singular: term,
            // Concaténation avec "s" pour définir le mot (terme) au pluriel
            plural: term + 's'
        };
    }
}

// Fonction qui extrait les termes individuels (mots ou groupes de mots) d'une chaîne de caractères donnée, c'est à dire la requête de recherche de l'utilisateur
function extractSearchTerms(query) {
    // Déclaration d'un tableau vide terms qui va stocker les différents termes extraits de la requête. Chaque terme sera ajouté dans ce tableau après avoir été traité
    const terms = [];
    // Déclaration d'une chaîne de caractères vide qui va servir à construire progressivement chaque terme de la requête
    let currentTerm = '';  
    // Boucle for qui parcourt chaque caractère de la chaîne query
    for (let i = 0; i < query.length; i++) {
        // Constante qui récupère le caractère actuel à l'index i dans la chaîne query. Cette ligne permet d'examiner chaque caractère individuellement
        const char = query[i];
        // Condition if qui vérifie si le caractère actuel char est un espace. Un espace marque la fin d'un terme dans la requête de recherche
        if (char === ' ') {
            //Si la variable contient une chaîne non vide, c'est-à-dire qu'on a accumulé des caractères avant de rencontrer l'espace
            if (currentTerm) {
                // On ajoute le terme complet au tableau terms. .trim() supprime les espaces inutiles au début et à la fin du terme, pour s'assurer que le terme est propre avant de l'ajouter 
                terms.push(currentTerm.trim());
                // Une fois le terme ajouté au tableau, la variable currentTerm est réinitialisée à une chaîne vide, prête à accumuler le prochain terme
                currentTerm = '';
            }
            // Si le caractère actuel n'est pas un espace, le code dans le bloc else est exécuté
        } else {
            // Le caractère actuel char est ajouté à la variable currentTerm. Cela permet de construire progressivement un terme jusqu'à ce qu'un espace soit rencontré
            currentTerm += char;
        }
        // Fin de la boucle for. À ce stade, tous les caractères de la chaîne query ont été parcourus
    }
    // Après la boucle, on vérifie si la variable currentTerm contient encore un terme (dans le cas où la chaîne query ne se termine pas par un espace). Si c'est le cas, on passe à l'étape suivante
    if (currentTerm) {
        // Le terme restant (qui n'est pas suivi d'un espace) est ajouté au tableau terms après avoir été nettoyé avec .trim() pour supprimer les éventuels espaces superflus
        terms.push(currentTerm.trim());
    }
    // La fonction retourne le tableau terms, qui contient tous les termes extraits de la chaîne query
    return terms;
}

handleSearchInput()