import express from 'express'
import http from 'http'
import { Server as SocketServer } from 'socket.io'
import { createNewGame } from './creating-game.js'

const games = []

const app = express()
const server = http.createServer(app)
const io = new SocketServer(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'UPDATE', 'DELETE']
  }
})

io.on('connection', (socket) => {
  console.log('New client connected')

  socket.on('searching-player', (data) => {
    if (games.length === 0 || games.every((game) => game.players.length === 2)) {
      const game = createNewGame()
      console.log(game)
      game.addPlayer({ id_player: socket.id, name: data })
      socket.join(game.id)
      io.to(game.id).emit('game-created', game)
      games.push(game)
      console.log(socket.id)
    } else {
      const game = games.find((game) => game.players.length === 1)
      game.addPlayer({ id_player: socket.id, name: data })
      socket.join(game.id)
      io.to(game.id).emit('game-joined', game)
      console.log(socket.id)
    }
  })

  socket.on('add-piece', (idGame, piece) => {
    const game = games.find((game) => game.id === idGame)
    if (!game) return
    // Verificar que el que agregue la pieza sea el jugador que le toca
    if (socket.id !== game.players[game.turn].id_player) return
    game.turn = game.addPiece(piece)
    io.to(game.id).emit('piece-added', game)
  })

  socket.on('check-winner', (gameId) => {
    const game = games.find((game) => game.id === gameId)
    const winner = game.checkWinner({ board: game.board })
    console.log(winner)
    // Eliminar juego de la lista de juegos
    if (winner) {
      const index = games.findIndex((game) => game.id === gameId)
      games.splice(index, 1)
      console.log('Juego eliminado')
    }
    if (game.board.every((row) => row.every((cell) => cell !== 0))) {
      console.log('Empate')
      io.to(game.id).emit('tie')
      return
    }
    io.to(game.id).emit('winner-checked', winner)
  })

  socket.on('disconnect', () => {
    console.log('Client disconnected')
    // Eliminar jugador de la lista de jugadores
    const index = games.findIndex((game) => game.players.some((player) => player.id_player === socket.id))
    if (index > -1) {
      io.to(games[index].id).emit('player-disconnected')
      games.splice(index, 1)
    }
  })
}
)

server.listen(4000, () => {
  console.log('Server listening on http://localhost:4000')
})
