const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {
//Viewing one stock: GET request to /api/stock-prices/
test('?stock=GOOG', function(done) {
    chai
        .request(server)
        .keepOpen()
        .get('/api/stock-prices/?stock=GOOG')
        .end(function (err, res) {
            assert.equal(res.status, 200)
            assert.containsAllKeys(res.body, ['stockData'])
            assert.containsAllKeys(res.body.stockData, ['stock', 'price', 'likes'])
            assert.equal(res.body.stockData.stock, 'GOOG')
            done()
        })
})
//Viewing one stock and liking it: GET request to /api/stock-prices/
let initialLikes
test('?stock=GOOG&like=true', function(done) {
    chai
        .request(server)
        .keepOpen()
        .get('/api/stock-prices/?stock=GOOG&like=true')
        .end(function (err, res) {
            assert.equal(res.status, 200)
            assert.containsAllKeys(res.body, ['stockData'])
            assert.containsAllKeys(res.body.stockData, ['stock', 'price', 'likes'])
            assert.equal(res.body.stockData.stock, 'GOOG')

            // Store the like count for comparison in the next test
            initialLikes = res.body.stockData.likes;
            assert.isNumber(initialLikes); // Ensure it's a number

            done()
        })
})
//Viewing the same stock and liking it again: GET request to /api/stock-prices/
test('?stock=GOOG&like=true', function(done) {
    chai
        .request(server)
        .keepOpen()
        .get('/api/stock-prices/?stock=GOOG&like=true')
        .end(function (err, res) {
            assert.equal(res.status, 200)
            assert.containsAllKeys(res.body, ['stockData'])
            assert.containsAllKeys(res.body.stockData, ['stock', 'price', 'likes'])
            assert.equal(res.body.stockData.stock, 'GOOG')

            // Compare likes to see if they increased or stayed the same
            const newLikes = res.body.stockData.likes;
            assert.isNumber(newLikes);

            // Expect the like count to stay the same if duplicate likes are prevented
            assert.equal(newLikes, initialLikes); 

            done()
        })
})
//Viewing two stocks: GET request to /api/stock-prices/
let initial_rel_likes
test('?stock=GOOG&stock=MSFT', function(done) {
    chai
        .request(server)
        .keepOpen()
        .get('/api/stock-prices/?stock=GOOG&stock=MSFT')
        .end(function (err, res) {
            assert.equal(res.status, 200)
            assert.containsAllKeys(res.body, ['stockData'])
            // Validate first stock
            assert.containsAllKeys(res.body.stockData[0], ['stock', 'price', 'rel_likes']);
            assert.isString(res.body.stockData[0].stock);
            // Validate second stock
            assert.containsAllKeys(res.body.stockData[1], ['stock', 'price', 'rel_likes']);
            assert.isString(res.body.stockData[1].stock);

            // save rel_likes for comparison
            initial_rel_likes = res.body.stockData[0].rel_likes;
            assert.isNumber(initial_rel_likes);

            done()
        })
})
//Viewing two stocks and liking them: GET request to /api/stock-prices/
test('?stock=GOOG&stock=MSFT&like=true', function(done) {
    chai
        .request(server)
        .keepOpen()
        .get('/api/stock-prices/?stock=GOOG&stock=MSFT&like=true')
        .end(function (err, res) {
            assert.equal(res.status, 200)
            assert.containsAllKeys(res.body, ['stockData'])
            // Validate first stock
            assert.containsAllKeys(res.body.stockData[0], ['stock', 'price', 'rel_likes']);
            assert.isString(res.body.stockData[0].stock);
            // Validate second stock
            assert.containsAllKeys(res.body.stockData[1], ['stock', 'price', 'rel_likes']);
            assert.isString(res.body.stockData[1].stock);

            // Compare rel_likes to see if they increased or stayed the same
            const new_rel_likes = res.body.stockData[0].rel_likes;
            assert.isNumber(new_rel_likes);

            // Expect the rel_like to be be the same for testing because stocks have already been liked
            assert.equal(initial_rel_likes, new_rel_likes);

            done()
        })
})
});
