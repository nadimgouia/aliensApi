var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');
var app = express();
var mongoose = require('mongoose');
var alien = require('./alien');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
var port = process.env.PORT || 8090;
var router = express.Router();

mongoose.connect('mongodb://localhost:27017/extrabook', function(err, db) {
    if(!err) {
      console.log("We are connected");
    }else {
        console.log(err.message);
    }
});

// Middle Route 

router.use(function (req, res, next) {
    // do logging 
    // do authentication 
    console.log('Logging of request will be done here');
    next(); // make sure we go to the next routes and don't stop here
});


router.route('/aliens').post(function (req, res) {
    console.log("in add");

    var al = new alien();
    al.fullName = req.body.fullName;
    al.email = req.body.email;
    al.famille = req.body.famille;
    al.nouriture = req.body.nouriture;
    al.race = req.body.race;
    al.age = req.body.age;
    al.password = req.body.password;
    al.userImage = req.body.userImage;
    // al.friends.push(req.body.newFriend);

    al.save(function (err) {
        if (err) {
            res.send({ success : false })
        }
        console.log("added");
        res.send({ message: 'compte créer avec succée !', success : true })
    })

});


router.route('/aliens/friends/:alien_id').put(function (req, res) {

    alien.findById(req.params.alien_id, function (err, al) {
        if (err) {
            res.json({ message: 'erreur d\'ajout !', success : false});
        }
        al.friends.push(req.body.newFriend);

        al.save(function (err) {
            if (err)
                res.json({ message: 'erreur d\'ajout !', success : false});
            else
                res.json({ message: 'amis ajouté avec succee !', success : true});
        });

    });
});

router.route('/aliens/auth/').post(function(req, res){


    alien.find({'email' : req.body.email, 'password' : req.body.password}, function(err, aliens){
        if (err)
                res.json([]);
            else{
                res.json(aliens);
            }
     });


});

router.route('/aliens/friends/:alien_id').delete(function (req, res) {

    alien.findById(req.params.alien_id, function (err, al) {
        if (err) {
            res.json({ message: 'erreur d\'ajout !', success : false});
        }
        al.friends.pull(req.body.friendToDelete);
        al.save(function (err) {
            if (err)
                res.json({ message: 'erreur d\'ajout !', success : false});
            else
                res.json({ message: 'amis retirer avec succee !', success : true});
        });

    });
});

router.route('/aliens/:alien_id/search/:alien_name').get(function (req, res) {

    alien.find({'fullName' : new RegExp(req.params.alien_name, 'i')}, function(err, aliens){
        if (err) {res.send(err);}
        res.json(aliens);
     }).where("_id").nin(req.params.alien_id);

});



router.route('/aliens/friends/:alien_id').get(function (req, res) {

    var alien_id =  req.params.alien_id;
    alien.findById(alien_id, function (err, al) {
        if (err) {
            res.send(err);
        }
        var friends = [];

        var friendsCollection = al.friends;
        
        if(friendsCollection) {
            
            const start = async () => {
                await asyncForEach(friendsCollection, async (element) => {
                  await alien.findById(element, function (err, friend) {
                    if (err) {
                        res.send(err);
                    }
                    if(friend._id != alien_id)
                        friends.push(friend);
                });
                })
                res.json(friends);
            }
              start()

        }
    });
});

async function asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
      await callback(array[index], index, array)
    }
  }
  

router.route('/aliens/:alien_id').get(function (req, res) {

    alien.find(function (err, aliens) {
        if (err) {
            res.send(err);
        }
        res.send(aliens);
    }).where("_id").nin(req.params.alien_id);

}); 

router.route('/alien/:alien_id').get(function (req, res) {

    alien.findById(req.params.alien_id, function (err, al) {
        if (err)
            res.send(err);
        res.json(al);
    });
});



router.route('/aliens/:alien_id').put(function (req, res) {

    alien.findById(req.params.alien_id, function (err, al) {
        if (err) {
            res.send(err);
        }
        al.fullName = req.body.fullName;
        al.email = req.body.email;
        al.famille = req.body.famille;
        al.nouriture = req.body.nouriture;
        al.race = req.body.race;
        al.age = req.body.age;
        al.password = req.body.password;
        al.userImage = req.body.userImage;
        al.save(function (err) {
            if (err) {
                res.send({ success : false })
            }
            console.log("updated");
            res.send({ message: 'compte modifié avec succée !', success : true })
        });

    });
});

router.route('/aliens/:alien_id').delete(function (req, res) {

    console.log( req.params.alien_id);
    alien.findOneAndRemove({ _id : req.params.alien_id}).then((al) => {
        if (!al) {
            res.json({ message: 'alien not found', error : 404 });
        }
        res.json({ message: 'Successfully deleted' });

    }).catch((e) => {
        console.log(e.message);
    })
});


app.use(cors());
app.use('/api', router);
app.listen(port);
console.log('REST API is runnning at ' + port);