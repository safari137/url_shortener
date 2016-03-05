var express         = require('express'),
    urlValidator    = require('valid-url'),
    mongoose        = require('mongoose'),
    autoIncrement   = require('mongoose-auto-increment'),
    app             = express();
    
    
// Database Setup
var connection = mongoose.connect('mongodb://localhost/url_shortener');

autoIncrement.initialize(connection);

var urlSchema = new mongoose.Schema({
    address: String
});

urlSchema.plugin(autoIncrement.plugin, 'Url');
var Url = connection.model('Url', urlSchema);


// Routes
        
app.get('/create/*', function(req, res) {
    var url = req.url.substring(8);
    var baseUrl = 'http://' + req.hostname + '/';
    
    var validatedUrl = urlValidator.isWebUri(url);
    
    if (validatedUrl === undefined) {
        res.send({'error': 'url invalid'});
        return;
    } 
    
    Url.find({address: url}, function(err, foundUrl) {
       if (err) throw err;
       
       if (!foundUrl.length) {
           
           var newUrl = new Url({address: url});
           
           newUrl.save(function(err, savedUrl) {
              if (err) throw err;
              
              res.send({orininal_url: url, short_url: baseUrl + savedUrl._id});
           });
       } else {
           foundUrl = foundUrl[0];
           res.send({ orininal_url: foundUrl.address, short_url: baseUrl + foundUrl._id });
       }
    });
});

app.get('/:id', function(req, res) {
    var id = req.params.id;
    
    Url.find({_id: id}, function(err, foundUrl) {
        if (err) throw err;
        
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