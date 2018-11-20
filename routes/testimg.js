var express = require('express');
var router = express.Router();
var con = require('../lib/connection.js');
var multer  = require('multer');

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/')
    },
    filename: function (req, file, cb) {

        cb(null, Date.now() + file.originalname)
    }
});

var upload = multer({ storage: storage });

router.get('/', function (req, res, next) {
    con.query("SELECT * FROM testimg WHERE img_id = '17'", function (err, rows, fields) {
        if(err) throw err;
        var image = rows;
        res.render('testimg', {image: image});
    });

});

router.post('/', upload.array('carPhoto', 10), function (req, res) {
    // console.log(req.files[0].filename);
    var query = "INSERT INTO `testimg` (`img_id`, `ad_id`, `img_path`) VALUES";

    var i = 0;
    req.files.forEach(function () {
        console.log(req.files[0].filename);
        if (i > 0){
            query += ',';
        }
        query += ` (NULL, '1', '${req.files[i].filename}')`;
        i++;
    });

    con.query(query,
        function (err) { if (err) throw err;
    });
    res.redirect('/')
});

module.exports = router;