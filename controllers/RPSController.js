class RPSController {

    getResults = (player1, player2) => {

        const player1Choice = player1.selection;
        const player2Choice = player2.selection; 

        if (player1Choice === player2Choice) {
            return 'tie';
        } else if (
            (player1Choice === "rock" && player2Choice === "scissors") ||
            (player1Choice === "paper" && player2Choice === "rock") ||
            (player1Choice === "scissors" && player2Choice === "paper")
        ) {
            return { winner: player1, loser: player2 };
        } else {
            return { winner: player2, loser: player1 };
        }

    }
}

export default RPSController;