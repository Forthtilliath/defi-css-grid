import { timeout } from './utils.js';

class Game {
    constructor() {
        this.container = document.querySelector('.container');
        this.btn_start = document.querySelector('#btn_start');

        this.setSize(5);
        this.createEvents();
        this.started = false;

        this.activeDuration = 1000;
        this.intervalDuration = 300;

        // TODO Supprimer plus tard, seulement là pour les tests
        this.init();
    }

    /**
     * Initialise la partie, utile si on veut relancer une partie
     */
    init() {
        this.step = 0;
        this.tabCasesToFind = [];
    }

    /**
     *
     * @param {Number} size Nombre de cases par ligne et colonne
     */
    setSize(size) {
        this.nbCol = size;
        this.nbRow = size;
        this.nbCases = size * size;
        this.#setGrid();
    }

    /**
     * Met à jour le grid en fonction du nombre de lignes et colonnes souhaitées
     */
    #setGrid() {
        document.documentElement.style.setProperty('--js-nbCol', this.nbCol);
        document.documentElement.style.setProperty('--js-nbRow', this.nbRow);
    }

    /**
     * Génère l'ensemble des cases
     */
    createGame() {
        for (let i = 0; i < this.nbCases; i++) {
            this.container.appendChild(this.createCase());
        }
    }

    /**
     * Retourne une case
     * @returns {HTMLDivElement}
     */
    createCase() {
        const uneCase = document.createElement('div');
        uneCase.classList.add('case');
        return uneCase;
    }

    /**
     * Génère l'ensemble des évents liés au jeu
     */
    createEvents() {
        this.btn_start.addEventListener('click', () => this.startGame());
    }

    /**
     * Démarre la partie
     */
    startGame() {
        this.started = true;

        // this.init();

        this.launchTurn();
    }

    /**
     * Lance un tour de jeu qui comprend le fait de montrer les cases à trouver et la sélection du joueur
     */
    launchTurn() {
        this.showCaseToFind();
        this.selectionPlayer();

        // Tour suivant
        this.step++;
        // this.launchTurn();
    }

    /**
     * Affiche les cases à trouver
     */
    async showCaseToFind() {
        this.btn_start.disabled = true;

        // Affiche toutes les cases précédentes
        for (const i in this.tabCasesToFind) {
            await this.activeCase(this.tabCasesToFind[i]);
        }

        // Affiche la nouvelle case
        await this.activeCase(this.addCaseToFind());

        this.btn_start.disabled = false;
    }

    /**
     * Ajoute une case à trouver
     * @returns {Number}
     */
    addCaseToFind() {
        let number = Math.floor(Math.random() * this.nbCases) + 1;
        this.tabCasesToFind.push(number);
        return number;
    }

    /**
     * Active une case en lui ajoutant la classe active temporairement
     * @param {Number} number Réprésente l'indice de la case (commence à 1)
     */
    async activeCase(number) {
        document.querySelector(`.case:nth-child(${number})`).classList.add('active');

        setTimeout(() => {
            document.querySelector(`.case:nth-child(${number})`).classList.remove('active');
        }, this.activeDuration);

        await timeout(this.activeDuration + this.intervalDuration);
    }

    selectionPlayer() {

    }
}

export default new Game();
