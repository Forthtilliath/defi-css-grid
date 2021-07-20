import { timeout } from './utils.js';

class Game {
    constructor() {
        this.container = document.querySelector('.container');
        this.btn_firstStart = document.querySelector('#btn_firstStart');
        this.btn_newStart = document.querySelector('#btn_newStart');
        this.btn_nextStep = document.querySelector('#btn_nextStep');
        this.firstGame = document.querySelector('#beforeGame');
        this.inputNbCases = document.querySelector('#nbCases');
        this.gameOver = document.querySelector('#gameOver');
        this.divCurrentScore = document.querySelector('#currentScore');
        this.divFinalScore = document.querySelector('#finalScore');

        this.soundActive = new Audio('../sounds/active.mp3');
        this.soundRight = new Audio('../sounds/right.mp3');
        this.soundWrong = new Audio('../sounds/wrong.mp3');

        this.started = false;
        this.playerCanClick = false;

        this.activeDuration = 1000;
        this.intervalDuration = 300;
        this.minCases = 2;
        this.defaultCases = 5;
        this.maxCases = 10;
        this.size = this.defaultCases;

        this.container.innerHTML = '';

        this.createEvents();
    }

    /**
     * Initialise la partie, utile si on veut relancer une partie
     */
    init() {
        this.step = 0;
        this.score = 0;
        this.tabCasesToFind = [];
        this.divCurrentScore.innerText = 0;
        this.errorCase = -1;
    }

    /**
     * Met à jour la grille en fonction de la taille
     */
    setSize() {
        this.nbCol = this.size;
        this.nbRow = this.size;
        this.nbCases = this.size * this.size;
        this.setGrid();
    }

    /**
     * Met à jour le grid en fonction du nombre de lignes et colonnes souhaitées
     */
    setGrid() {
        document.documentElement.style.setProperty('--js-nbCol', this.nbCol);
        document.documentElement.style.setProperty('--js-nbRow', this.nbRow);
    }

    /**
     * Génère l'ensemble des cases
     */
    createGame() {
        for (let i = 0; i < this.nbCases; i++) {
            this.container.appendChild(this.createCase(i%2 === 0));
        }
        this.cases = document.querySelectorAll('.case');
        this.createCaseEvents();
    }

    /**
     * Retourne une case
     * @param {Boolean} odd Si true, une classe supplémentaire est ajoutée à la case
     * @returns {HTMLDivElement}
     */
    createCase(odd) {
        const uneCase = document.createElement('div');
        uneCase.classList.add('case');
        if( odd ) uneCase.classList.add('odd');
        return uneCase;
    }

    /**
     * Génère l'ensemble des évents liés au jeu
     */
    createEvents() {
        this.btn_firstStart.addEventListener('click', () => this.startFirstGame());
        this.btn_newStart.addEventListener('click', () => this.startNewGame());
    }

    /**
     * Supprime les events
     */
    deleteEvents() {
        this.deleteCaseEvents();
    }

    /**
     * Génère les events liés aux cases (ne peut etre fait qu'une fois les cases générées)
     */
    createCaseEvents() {
        this.cases.forEach((uneCase) => uneCase.addEventListener('click', (e) => this.eventClickCase(e.target)));
    }

    /**
     * Supprime les events liés aux cases
     */
    deleteCaseEvents() {
        this.cases.forEach((uneCase) => uneCase.removeEventListener('click', (e) => this.eventClickCase(e.target)));
    }

    /**
     * Actions effectuées lors d'une clic sur une case
     * @param {HTMLDivElement} uneCase
     */
    async eventClickCase(uneCase) {
        if (this.playerCanClick) {
            this.setCasesClickable(false);
            let caseClicked = [...this.cases].indexOf(uneCase);
            let isGood = this.isCaseClickedIsGood(caseClicked);

            if (!isGood) {
                await this.showWrongCase(caseClicked);
                this.errorCase = caseClicked;
                this.divFinalScore.innerText = this.score;
                this.showGameOver();
                return;
            }

            this.setScore();
            await this.showRightCase(caseClicked);

            if (this.nbCasesClicked < this.tabCasesToFind.length - 1) {
                this.nbCasesClicked++;
                this.setCasesClickable(true);
            } else {
                this.launchTurn();
            }
        }
    }

    /**
     * Démarre la partie
     */
    async startGame() {
        await timeout(1000);
        this.started = true;

        this.init();

        this.launchTurn();
    }

    /**
     * Démarre une première partie
     */
    startFirstGame() {
        this.rectifySize();
        console.log(this.size);
        this.setSize();
        this.createGame();
        this.firstGame.classList.add('hidden');
        this.startGame();
    }

    /**
     * Démarre une nouvelle partie
     */
    async startNewGame() {
        this.gameOver.classList.add('hidden');
        this.getCase(this.errorCase).classList.remove('wrong');
        await timeout(1000);
        this.startGame();
    }

    /**
     * Vérifie si la taille reçu est correct
     * @returns {Number} Retourne -1 si le format est incorrect,
     * -2 si la taille est trop petite, -3 si elle est trop grande,
     * et un entier positif si la taille est correct
     */
    checkSize() {
        let input = +this.inputNbCases.value;
        if (isNaN(+this.inputNbCases.value.replace(/\s|\$/g, ''))) return -1;
        if (input < this.minCases) return -2;
        if (input > this.maxCases) return -3;
        return input;
    }

    /**
     * Corrige la taille si besoin
     */
    rectifySize() {
        let res = this.checkSize();
        switch (res) {
            case -1:
                this.size = this.defaultCases;
                break;
            case -2:
                this.size = this.minCases;
                break;
            case -3:
                this.size = this.maxCases;
                break;
            default:
                this.size = res;
        }
    }

    /**
     * Lance un tour de jeu qui comprend le fait de montrer les cases à trouver et la sélection du joueur
     */
    async launchTurn() {
        // On montre les cases à cliquer
        await this.showCasesToFind();

        // Le joueur tente de cliquer sur les memes cases
        this.selectionPlayer();

        // On passe au tour suivant
        this.step++;
    }

    /**
     * Affiche les cases à trouver
     */
    async showCasesToFind() {
        this.setCasesClickable(false);

        // Affiche toutes les cases précédentes
        for (const i in this.tabCasesToFind) {
            await this.activeCase(this.tabCasesToFind[i]);
        }

        // Affiche la nouvelle case
        await this.activeCase(this.addCaseToFind());
    }

    /**
     * Ajoute une case à trouver
     * @returns {Number}
     */
    addCaseToFind() {
        let number = Math.floor(Math.random() * this.nbCases);
        this.tabCasesToFind.push(number);
        return number;
    }

    /**
     * Active une case en lui ajoutant la classe active temporairement
     * @param {Number} number Réprésente l'indice de la case
     */
    async activeCase(number) {
        this.soundActive.play();
        await this.showStateCase(number, 'active');
    }

    /**
     * Active une case en vert pour montrer au joueur a eu bon
     * @param {Number} number Réprésente l'indice de la case
     */
    async showRightCase(number) {
        this.soundRight.play();
        await this.showStateCase(number, 'right');
    }

    /**
     * Active une case en rouge pour montrer au joueur a eu faux
     * @param {Number} number Réprésente l'indice de la case
     */
    async showWrongCase(number) {
        this.soundWrong.play();
        await this.showStateCase(number, 'wrong');
    }

    /**
     * Met en surbrillance une classe temporairement
     * @param {Number} number Réprésente l'indice de la case
     * @param {String} state
     */
    async showStateCase(number, state) {
        this.getCase(number).classList.add(state);

        if (state !== 'wrong') {
            let reduceDuration = state === 'active' ? 1 : 1.5;
            setTimeout(() => {
                this.getCase(number).classList.remove(state);
            }, this.activeDuration / reduceDuration);

            await timeout(this.activeDuration / reduceDuration + this.intervalDuration);
        }
    }

    /**
     * Tour du joueur, on rend donc les cases clickable
     */
    selectionPlayer() {
        this.setCasesClickable(true);
        this.nbCasesClicked = 0;
    }

    /**
     * Modifie l'état des cases : clickage ou pas
     * @param {boolean} clickable
     */
    setCasesClickable(clickable = true) {
        this.playerCanClick = clickable;
        this.cases.forEach((uneCase) => {
            uneCase.classList.remove('clickable');
            if (clickable) uneCase.classList.add('clickable');
        });
    }

    /**
     *
     * @param {Number} caseRank Rang de la case sur la laquelle le joueur a cliqué
     * @returns {boolean}
     */
    isCaseClickedIsGood(caseRank) {
        return caseRank === this.tabCasesToFind[this.nbCasesClicked];
    }

    /**
     * Affiche l'ecran de game over
     */
    showGameOver() {
        this.deleteEvents();

        this.gameOver.classList.remove('hidden');
    }

    /**
     * Modifie le score
     */
    setScore() {
        this.score += 1;
        this.divCurrentScore.innerText = this.score;
    }

    /**
     * Retourne une case
     * @param {HTMLDivElement} nb
     * @returns
     */
    getCase(nb) {
        return document.querySelector(`.case:nth-child(${nb + 1})`);
    }
}

export default new Game();
