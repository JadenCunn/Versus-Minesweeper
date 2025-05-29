const expess = require("express");
const cors = require("cors");
const gameRoutes = require('./routes/gameRoutes')
const roomRoutes = require('./routes/roomRoutes')

const app = express();
const HTTP_PORT = 8000;

app.use(cors())
app.use(express.json())
app.use('/api/game', gameRoutes)
app.use('/api/rooms', roomRoutes)

app.get('/', (req,res) => {
    res.send('Minesweeper Racing API is running');
})


app.listen(HTTP_PORT, () => {
    console.log(`Server listening on port: ${HTTP_PORT}`)
})
