class TicTacToeGame {
    constructor(placeholder, grid_size, callback) {

        // Sauve l'emplacement du jeu
        this.placeholder = placeholder;

        // Dessine le plateau de jeu
        this.paint(grid_size);

        // Enregistre le callback
        this.callback = callback;

        // Enregistre les scores des joueurs
        this.scores = {
            X: 0,
            O: 0
        };

        this.marks = {
            X: "X",
            O: "O",
            count: 0 // Nombre d'actions effectués
        };

        return this;
    }

    paint(grid_size) {

        var self = this;

        // Get le nombre de colonnes, un plateau de taille N x N (3 x 3)
        
        self.grid_size = grid_size;

        var html = '<table id="tic-tac-toe" align="center">';

        for (var i = 0; i < grid_size; i++) {
            html += '<tr>';
            for (var j = 0; j < grid_size; j++) {
                html += '<td id="square_'+((i * grid_size) + j)+'"></td>';
            }
            html += '</tr>';
        }

        html += '</table>';

        self.placeholder.innerHTML = html;

        // ------------------------------

        self.columns = self.placeholder.getElementsByTagName("td");

    }

    mark(column, playedMark) {
        var current_mark;
        // Ne fait rien si la colonne est remplie
        if (column.innerHTML) {
            return;
        }

        // Ajoute le déplacement dans le compte
        this.marks.count++;
        
        // On a la marque en se basant sur le paramètre
        if(playedMark == "X"){
            current_mark = this.marks.X;
        }else{
            current_mark = this.marks.O;
        }

        // Rempli la colonne avec la marque
        column.innerHTML = current_mark;
        column.classList.add(current_mark);

        // Verifie si le joueur (X ou O) a gagné
        if (this.didWin(current_mark)) {
            // On incrémente le score du joueur
            if (current_mark == "X") {
                this.scores.X++;
            } else {
                this.scores.O++;
            }
            // Envoie la marque (X ou O) ainsi que le score
            this.callback(current_mark, this.scores);
        } else if (this.marks.count === this.columns.length) {
            // Envoie le résultat de l'égalité
            this.callback("draw");
        }

    }
    
    //Verifie si un joueur a gagné la partie
    didWin(mark) {

        // Prends en compte le nombre de colonnes
        var grid_size = this.grid_size;

        // Declare variables to count the presence of the mark
        var horizontal_count, vertical_count, right_to_left_count = 0, left_to_right_count = 0;


        // Loop 1
        for (var i = 0; i < grid_size; i++) {

            // Empty the count
            horizontal_count = vertical_count = 0;

            // Loop 2
            for (var j = 0; j < grid_size; j++) {

                // i * grid_size + j ===> "0,1,2", "3,4,5", "6,7,8"
                if (this.columns[i * grid_size + j].innerHTML == mark) {
                    horizontal_count++;
                }

                // j * grid_size + i ===> "0,3,6", "1,4,7", "2,5,8"
                if (this.columns[j * grid_size + i].innerHTML == mark) {
                    vertical_count++;
                }

            }

            // If horizontal or vertical combination is found the return true
            if (horizontal_count == grid_size || vertical_count == grid_size) {
                return true;
            }

            // i * grid_size + i ===> "0,4,8"
            if (this.columns[i * grid_size + i].innerHTML == mark) {
                right_to_left_count++;
            }

            // (grid_size - 1) * (i+1) ===> "2,4,6"
            if (this.columns[(grid_size - 1) * (i + 1)].innerHTML == mark) {
                left_to_right_count++;
            }

        } // End of loop


        // If mark is present diagnolly
        if (right_to_left_count == grid_size || left_to_right_count == grid_size) {
            return true;
        }

        return false;
    }

    // Fonction qui vide le board
    empty() {
        // Passe a travers toutes les colonnes et les vide
        for (var i = 0; i < this.columns.length; i++) {
            this.columns[i].innerHTML = '';
            this.columns[i].classList.remove(this.marks.X);
            this.columns[i].classList.remove(this.marks.O);

        }
        // Reset le compte
        this.marks.count = 0;
    }

    // Fonction qui reset une partie
    reset() {
        this.empty();
        this.scores = {
            X: 0,
            O: 0
        };
    }
}

export default TicTacToeGame;