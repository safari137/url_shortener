var express         = require('express'),
    urlValidator    = require('valid-url'),
    mongoose        = require('mongoose'),
    autoIncrement   = require('mongoose-auto-increment'),
    urlParser       = require('url'),
    app             = express();
    
    app.set('view engine', 'ejs');
    
// Database Setup
var connection = mongoose.connect(process.env.MONGOLAB_URI);

autoIncrement.initialize(connection);

var urlSchema = new mongoose.Schema({
    address: String
});

urlSchema.plugin(autoIncrement.plugin, 'Url');
var Url = connection.model('Url', urlSchema);


// Routes

app.get('/', function(req, res) {
   res.render('home'); 
});
        
app.get('/create/*', function(req, res) {
    var url = req.url.substring(8);
    var baseUrl = 'https://' + req.hostname + '/';
    
    checkUrlValidation(url, function(result) {
       if (!result) {
           res.send({'error': 'url is invalid'});
           return;
       } 
       
       findOrCreateUrl(url, function(newUrlPath) {
           res.send({orininal_url: url, short_url: baseUrl + newUrlPath});
       });
    });
});

app.get('/:id', function(req, res) {
    var id = req.params.id;
    
    Url.find({_id: id}, function(err, foundUrl) {
        if (err) { console.log(err); return; }
        
        if (!foundUrl.length) {
            res.send({'error': 'Invalid shortcut'});
            return;
        }
        
        res.redirect(foundUrl[0].address);
    });
});


// Listen

app.listen(process.env.PORT, function() {
    console.log('server started...');
});


// Validate Url

function checkUrlValidation(url, callback) {
    var validatedUrl = urlValidator.isWebUri(url);
    
    if (validatedUrl === undefined)
        return false;
        
    var http = require('http');
    var urlObj = urlParser.parse(url);
    var options = { method: 'HEAD', host: urlObj.hostname, port: 80, path: urlObj.pathname }; 

    var req = http.request(options, (res) => {
        callback(true);
    });
    
    req.on('error', (e) => {
        callback(false);
    });

    req.end();
}

// Find or Create URL in DB

function findOrCreateUrl(url, callback) {
    var newUrlPath = undefined;
    
    Url.find({address: url}, function(err, foundUrl) {
       if (err) throw err;
       
       if (!foundUrl.length) {
           var newUrl = new Url({address: url});
                   
           newUrl.save(function(err, savedUrl) {
              if (err) throw err;
              newUrlPath = savedUrl._id;
              callback(newUrlPath)
           });
       } else {
           newUrlPath = foundUrl[0]._id;
           callback(newUrlPath);
       }
    });
}