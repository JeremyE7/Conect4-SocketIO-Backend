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
    io.to(game.id).emit('winner-checked', winner)
  })

  socket.on('disconnect', () => {
    console.log('Client disconnected')
  })
}
)

io.on('disconnect', () => {
  console.log('Client disconnected')
})

server.listen(4000, () => {
  console.log('Server listening on http://localhost:4000')
})
