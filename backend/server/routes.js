const { MongoClient } = require("mongodb");
const ObjectId = require("mongodb").ObjectId;
const cors = require("cors");

const express = require("express");

const app = express();
app.use(cors());
