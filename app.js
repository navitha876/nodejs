const express = require('express');
const serveIndex = require('serve-index');
// const cron = require("node-cron");//Module for scheduling
var bodyParser = require('body-parser');// This is a node.js middleware for handling JSON, Raw, Text and URL encoded form data.
var mysql2 = require('mysql2');
const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
var cors = require('cors');//CORS is shorthand for Cross-Origin Resource Sharing. It is a mechanism to allow or restrict requested resources on a web server depend on where the HTTP request was initiated.
app.use(cors());
// mysql database connection
var connection = mysql2.createConnection({
  host: "localhost",
  user: "root",
  password: "root",
  database: "s3iot",
  port:"3306",
  insecureAuth : true
});
connection.connect((err) => {
  if (err) {
    console.log("Error occurred", err);
  } else {
    console.log("Connected to database");
  }
});



app.use((req, res, next) => {
  console.log('Time: ', Date.now());
  next();
});

app.use('/request-type', (req, res, next) => {
  console.log('Request type: ', req.method);
  next();
});

app.use('/public', express.static('public'));
app.use('/public', serveIndex('public'));

app.get('/', (req, res) => {
  res.send('Successful response.');
});

app.listen(8000, () => console.log('Example app is listening on port 8000.'));


app.get('/s3iot/:login', (req, res) => {
  console.log("Get Login Based On ID ");
  var output = {};
  var Prod_ID = req.query.LoignName;
  console.log(req.query);
  var Prod_I = req.query.Pswd;
  var sql = `CALL s3iot.login(?,?)`;
  console.log(Prod_I);
  connection.query(sql, [Prod_ID,Prod_I], (err, rows) => {
    if (err) {
      console.error('Error executing query: ', err);
      res.status(500).json({ error: 'Error executing query' });
      return;
    }
    if (rows.length === 0) {
      res.status(404).json({ error: 'Record not found' });
    } else {
      res.json(rows[0]);
      console.log(rows[0])
    }
  });
});
app.get('/s3iot/inventory/:materials', (req, res) => {
  console.log("All Components");
  var output={};
  var sql = `select * from s3iot.inventory`;
  connection.query(sql, [], (err, results) => {
    if (err) {
      console.error('Error executing query: ', err);
      res.status(500).json({ error: 'Error executing query' });
      return;
    }
    if (results.length === 0) {
      res.status(404).json({ error: 'Record not found' });
    } else {
      // res.json(results[0]);
      var string = JSON.stringify(results);
    var json = JSON.parse(string);
    var res2 = [];
    res2.push(results);
    output.results = res2;
    console.log(res2);
    res.send(output);
    }
  });
});

app.get('/s3iot/products/:id', (req, res) => {
  console.log("Based on Projects display product list");
  var output={};
  var prod_Id = req.query.prod_Id;
  var sql = `select * from s3iot.products where ProductId=?`;
  console.log(req);
  connection.query(sql, [prod_Id], (err, results) => {
    if (err) {
      console.error('Error executing query: ', err);
      res.status(500).json({ error: 'Error executing query' });
      return;
    }
    if (results.length === 0) {
      res.status(404).json({ error: 'Record not found' });
    } else {
      var string = JSON.stringify(results);
    var json = JSON.parse(string);
    var res2 = [];
    res2.push(results);
    output.results = res2;
    console.log(res2);
    res.send(output);
    }
  });
});
app.put('/s3iot/component/:update', function (req, res) {
  console.log("componentupdate");
  var Qty = req.body.Qty;
  var Cost = req.body.Cost;
  var ID= req.body.ID;
  var sql = `UPDATE s3iot.inventory SET Qty = ?, Cost = ?,created_at = CURRENT_TIMESTAMP WHERE ID = ?`;
  connection.query(sql, [Qty, Cost, ID], (error, results, fields) => {
    if (error)
      throw error;
      else {
        res.status(200).json({ error: 'Updated' });
        }
  }); 
});

app.get('/s3iot/projects/:All', (req, res) => {
  console.log("All Products");
  var output={};
  var sql = `SELECT * FROM s3iot.projects`;
  connection.query(sql, [], (err, results) => {
    if (err) {
      console.error('Error executing query: ', err);
      res.status(500).json({ error: 'Error executing query' });
      return;
    }
    if (results.length === 0) {
      res.status(404).json({ error: 'Record not found' });
    } else {
      var string = JSON.stringify(results);
    var json = JSON.parse(string);
    var res2 = [];
    res2.push(results);
    output.results = res2;
    console.log(res2);
    res.send(output);
    }
  });
});


app.get('/s3iot/productid/:bomlist', (req, res) => {
  console.log("Based on Projects display Components list");
  var output={};
  var ProductId = req.query.ProductId;
  var sql = `SELECT s1.ProductId, s1.Rqty,s2.ComName,s2.Value,s2.Package,s2.PartNumber,s2.Mgf,s2.Cost FROM  s3iot.products s1, s3iot.inventory s2 WHERE s1.ComId = s2.ComId and s1.ProductId=?`;
  console.log(req);
  connection.query(sql, [ProductId], (err, results) => {
    if (err) {
      console.error('Error executing query: ', err);
      res.status(500).json({ error: 'Error executing query' });
      return;
    }
    if (results.length === 0) {
      res.status(404).json({ error: 'Record not found' });
    } else {
      var string = JSON.stringify(results);
    var json = JSON.parse(string);
    var res2 = [];
    res2.push(results);
    output.results = res2;
    console.log(res2);
    res.send(output);
    }
  });
});

app.post('/s3iot/addproducts', (req, res) => {
  console.log("Insert products list");
  var output={};
  var ProductId = req.body.ProductId;
  var ProductName= req.body.ProductName;
  var sql = `insert into s3iot.projects (ProductId, ProductName) values(?,?)`;
  console.log(req);
  connection.query(sql, [ProductId,ProductName], (err, results) => {
    if (err) {
      console.error('Error executing query: ', err);
      res.status(500).json({ error: 'Error executing query' });
      return;
    }
    if (results.length === 0) {
      res.status(404).json({ error: 'Record not found' });
    } else {
    res.status(200).json({ error: 'Inserted' });
    }
  });
});

app.post('/s3iot/add/:components', (req, res) => {
  console.log("Insert Components list");
  var output={};
  var ComId = req.body.ComId;
  var ComName= req.body.ComName;
  var Value=req.body.Value;
  var Mgf= req.body.Mgf;
  var RoHs= req.body.RoHs;
  var Package= req.body.Package;
  var PartNumber= req.body.PartNumber;
  var Purchase=req.body.Purchase;
  var Qty= req.body.Qty;
  var Cost=req.body.Cost;
  var sql = `insert into s3iot.inventory (ComId, ComName, Value, Mgf, RoHs, Package, PartNumber, Purchase, Qty, Cost) values(?,?,?,?,?,?,?,?,?,?)`;
  // console.log(req);
  connection.query(sql, [ComId, ComName, Value, Mgf, RoHs, Package, PartNumber, Purchase, Qty, Cost], (err, results) => {
    if (err) {
      console.error('Error executing query: ', err);
      res.status(500).json({ error: 'Error executing query' });
      return;
    }
    if (results.length === 0) {
      res.status(404).json({ error: 'Record not found' });
    } else {
    res.status(200).json({ error: 'Inserted' });
    }
  });
});

app.post('/s3iot/components/:add', (req, res) => {
  console.log("Insert products Components list");
  var output={};
  var ComId = req.body.ComId;
  var Rqty= req.body.Rqty;
  var ProductId=req.body.ProductId;
  var sql = `insert into s3iot.products (ComId,Rqty,ProductId) values(?,?,?)`;
  // console.log(req);
  connection.query(sql, [ComId,Rqty,ProductId], (err, results) => {
    if (err) {
      console.error('Error executing query: ', err);
      res.status(500).json({ error: 'Error executing query' });
      return;
    }
    if (results.length === 0) {
      res.status(404).json({ error: 'Record not found' });
    } else {
    res.status(200).json({ error: 'Inserted' });
    }
  });
});

module.exports = app;
