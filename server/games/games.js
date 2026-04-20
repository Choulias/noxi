export const getBoardGameInfo =  (gameId, playersLimit) => {
    return {
        "id": gameId,
        "model": "board",
        "balls": 20,
        "playersLimit": playersLimit,
        "clients": []
    }
}

export const getTicTacToeGameInfo =  (gameId, playersLimit, squares, state) => {
    return {
        "id": gameId,
        "model": "tictactoe",
        "squares": squares,
        "playersLimit": playersLimit,
        "clients": [],
        "state": state
    }
}

export const getMascaradeGameInfo = (gameId, playersLimit, engine) => {
    return {
        "id": gameId,
        "model": "mascarade",
        "playersLimit": playersLimit,
        "clients": [],
        "engine": engine
    }
}

export const getUndercoverGameInfo = (gameId, playersLimit, engine) => {
    return {
        "id": gameId,
        "model": "undercover",
        "playersLimit": playersLimit,
        "clients": [],
        "engine": engine
    }
}