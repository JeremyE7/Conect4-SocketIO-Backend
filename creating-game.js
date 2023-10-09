export const createNewGame = () => {
  const players = []
  const id = Math.floor(Math.random() * 1000000)
  const board = [
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0]
  ]

  let turn = 0

  const addPlayer = (player) => {
    players.push(player)
  }

  const removePlayer = (player) => {
    const index = players.indexOf(player)
    if (index > -1) {
      players.splice(index, 1)
    }
  }

  const addPiece = (piece) => {
    const { x, value } = piece
    turn === 0 ? turn = 1 : turn = 0
    // Comprobar que ya no hay una pieza en la posición
    console.log(turn)

    for (let i = board.length - 1; i >= 0; i--) {
      if (board[i][x] === 0) {
        board[i][x] = value
        return turn
      }
    }
  }

  const checkWinner = ({ board }) => {
    const WINNER_STATES = [
      [[0, 0], [0, 1], [0, 2], [0, 3]],
      [[1, 0], [1, 1], [1, 2], [1, 3]],
      [[2, 0], [2, 1], [2, 2], [2, 3]],
      [[3, 0], [3, 1], [3, 2], [3, 3]],
      [[0, 0], [1, 0], [2, 0], [3, 0]],
      [[0, 1], [1, 1], [2, 1], [3, 1]],
      [[0, 2], [1, 2], [2, 2], [3, 2]],
      [[0, 3], [1, 3], [2, 3], [3, 3]],
      [[0, 0], [1, 1], [2, 2], [3, 3]],
      [[0, 3], [1, 2], [2, 1], [3, 0]]

    ]

    let winner = null

    for (const state of WINNER_STATES) {
      const [a, b, c, d] = state
      const [x1, y1] = a
      const [x2, y2] = b
      const [x3, y3] = c
      const [x4, y4] = d
      const value1 = board[x1][y1]
      const value2 = board[x2][y2]
      const value3 = board[x3][y3]
      const value4 = board[x4][y4]

      if (value1 === 0 || value2 === 0 || value3 === 0 || value4 === 0) continue

      if (value1 === value2 && value2 === value3 && value3 === value4) {
        winner = value1
      }
    }

    return winner
  }

  return {
    players,
    board,
    addPlayer,
    removePlayer,
    addPiece,
    checkWinner,
    id,
    turn
  }
}
