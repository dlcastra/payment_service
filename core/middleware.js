const express = require("express");

const {app_express} = require("../core/settings")

// Middlewares
const app = app_express.use(express.json());

// EXPORT
module.exports = {app}