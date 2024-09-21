const crypto = require('crypto');
const {ec} = require('elliptic');
const express = require('express');

const ecInstance = new ec('secp256k1');

const app = express();

app.use(express.json())
