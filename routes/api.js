'use strict';
require('dotenv').config();
const mongoose = require('mongoose'); // For MongoDB
const bcrypt = require('bcryptjs'); // For hashing IP Addresses


// Schema setup
const stockSchema = new mongoose.Schema({
  ip: { type: String, required: true },
  likes: { type: [String], default: [] }
})

const Stock = mongoose.model('IpAddress', stockSchema)

const getStock = async (stock) => {
  const response = await fetch(`https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${stock}/quote`)
  const { symbol, latestPrice } = await response.json()
  return { symbol, latestPrice }
}

//Hash IP
const hashIP = async (ip) => {
  const salt = await bcrypt.genSalt(8);
  const hash = await bcrypt.hash(ip, salt);
  return hash
}

//Create stock
const createStock = async (stock, like, ip) => {
  const hashedIP = await hashIP(ip)
  const newStock = new Stock({
    symbol: stock,
    like: like ? [hashedIP] : []
  })
  
  const savedStock = await newStock.save();
  return savedStock;
}

//Find stock
const findStock = async (stock) => {
  return await Stock.findOne({symbol: stock})
}

//Save stock
saveStock = async (stock, like, ip) => {
  const foundStock = await findStock(stock);
  if(!foundStock) {
    const savedStock = await createStock(stock, like, ip);
    return savedStock
  } else {

    //If user likes a stock, compare ip to all ips 
    if ( like ){
      //If ip exists in likes, return the stock
      foundStock.likes.forEach(async (hashedIP) => {
        if(bcrypt.compare(ip, hashedIP)){
          return foundStock
        }
      })
      //If ip does not exist, add the new ip to likes
      const hash = await hashIP(ip)
      foundStock.likes.push(hash)
      return await foundStock.save()
    }
  }
}

module.exports = function (app) {

  app.route('/api/stock-prices')
    .get(async function (req, res){
      const { stock, like } = req.query 

      // If stock does not exist
      if(!stock){
        res.json({stockDate: { likes: like ? 1 : 0}})
        return
      }

      // If query has multiple stocks
      if(Array.isArray(stock)){
        let stockArray = []
        stock.forEach(async (stock) => {
          const { symbol, latestPrice } = await getStock(stock)
          stockArray.push({stock: symbol, price: parseInt(latestPrice)})
        })
        res.json({stockData: stockArray})
      } 

      // If query has one stock
      else {
        const { symbol, latestPrice } = await getStock(stock)
        res.json({stockData: {
          stock: symbol,
          price: latestPrice,
        }})
      }
    });
    
};
