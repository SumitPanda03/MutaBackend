const mongoose = require('mongoose');

const apiUsageSchema = new mongoose.Schema({
    endpoint: String,
    method: String,
    calls: Number,
    lastCalled: Date
  });
  
  
  const ApiUsage = mongoose.model('ApiUsage', apiUsageSchema);

  module.exports = {
    ApiUsage
  }