const express = require('express');
const { Server: HttpServer } = require('http');
const { Server: SocketServer } = require('socket.io');
const { engine } = require('express-handlebars');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const cors = require('cors');

const compression = require('compression');

const MongoContainer = require('./models/containers/Mongodb.container');
const dbConfig = require('./db/db.config');
const envConfig = require('./config');
const initialProducts = require('./db/assets/initialProducts');
const passport = require('./middlewares/passport');
const routes = require('./routers/app.routers');
const args = require('./utils/minimist');
const clusterMode = require('./utils/clusterMode');
const logger = require('./middlewares/logger');

const productsDao = require('./models/daos/Products.dao');
const messagesDao = require('./models/daos/Messages.dao');

// const { createMessagesTable, createProductsTable } = require('./db/utils/createTables');

const app = express();
const httpServer = new HttpServer(app);
const io = new SocketServer(httpServer);

// // KNEX
// const productsDB = new SQLClient(dbConfig.sqlite, 'products');
// const messagesDB = new SQLClient(dbConfig.sqlite, 'messages');

app.engine('.hbs', engine({ extname: 'hbs' }));
app.set('view engine', '.hbs');
app.set('views', './views');

(async () => {
  try {
    const products = await productsDao.getAll();

    if (products.length === 0) {
      initialProducts.forEach(async (product) => {
        await productsDao.save(product);
      });
    }
  } catch (error) {
    logger.error(error);
  }
})();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(__dirname + '/public'));
app.use(cors());
app.use(
  session({
    name: 'user-session',
    secret: envConfig.SESSION_SECRET,
    cookie: {
      maxAge: 1000 * 60,
    },
    rolling: true,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: dbConfig.mongodb.uri,
      dbName: 'sessions',
      ttl: 60,
    }),
  })
);
app.use(passport.initialize());
app.use(passport.session());

// Socket events
io.on('connection', async (socket) => {
  console.log('nuevo cliente conectado');
  console.log(socket.id);

  const messages = await messagesDao.getAll();
  console.log(messages);
  socket.emit('messages', messages);

  const products = await productsDao.getAll();
  socket.emit('products', products);

  socket.on('new-message', async (data) => {
    await messagesDao.save(data);
    const updatedMessages = await messagesDao.getAll();
    io.emit('messages', updatedMessages);
  });

  socket.on('new-product', async (data) => {
    await productsDao.save(data);
    const updatedProducts = await productsDao.getAll();
    io.emit('products', updatedProducts);
  });
});

// Routes
app.use('/', routes);

if (clusterMode && process.isPrimary) {
  const cpus = os.cpus().length;
  for (let i = 0; i < cpus; i++) {
    cluster.fork();
  }
} else {
  // Listen
  httpServer.listen(args.port, () => {
    MongoContainer.connect().then(() => {
      console.log('Connected to DB!');
      console.log('Server running on port', args.port);
    });
  });
}
