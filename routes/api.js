'use strict';
const mongoose = require('mongoose'); // For MongoDB
const bcrypt = require('bcryptjs'); // For hashing IP Addresses

module.exports = function (app) {

  app.route('/api/stock-prices')
    .get(async function (req, res){
      const { stock } = req.query 
      if(Array.isArray(stock)){
        let stockArray = []
        stock.forEach(async (stock) => {
          const response = await fetch(`https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${stock}/quote`)
          const stockInfo = await response.json()
          const { symbol, latestPrice } = stockInfo
          stockArray.push({stock: symbol, price: latestPrice})
        })
        res.json({stockData: stockArray})
      } else {
        const response = await fetch(`https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${stock}/quote`)
        const stockInfo = await response.json()
        console.log(stockInfo.latestPrice)
        res.json({stockData: {
          stock: stockInfo.symbol,
          price: stockInfo.latestPrice,
        }})
      }
    });
    
};
