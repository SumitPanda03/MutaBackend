const {ApiUsage} = require('../models/apiUsage')

const trackApiUsage = async (req, res, next) => {
  const endpoint = req.path;
  const method = req.method;

  try {
    await ApiUsage.findOneAndUpdate(
      { endpoint, method },
      { 
        $inc: { calls: 1 },
        $set: { lastCalled: new Date() }
      },
      { upsert: true, new: true }
    );
  } catch (error) {
    console.error('Error tracking API usage:', error);
  }

  next();
};

module.exports = trackApiUsage;