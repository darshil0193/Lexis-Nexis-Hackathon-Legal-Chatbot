var express = require('express');
var router = express.Router();
var https = require('https');
var request = require('request');
var q = require('q');
var rp = require('request-promise');
var _ = require('lodash');

function keywords(sentence) {

    var dfd = q.defer();

    var k_e = require("keyword-extractor");
    var fs = require("fs");


//var  = "List case's for Judge Lucy Koh in 2014 at Raleigh in murder of a cat killing property kill";


    var result = k_e.extract(sentence, {
        language: "english",
        remove_digits: false,
        return_changed_case: false,
        remove_duplicates: false
    });

    var result_String = "";
    for (var i = 0; i < result.length; i++) {
        result_String += result[i] + " ";
    }

    dfd.resolve(result);
    return dfd.promise;

}


function reject(result) {
    var dfd = q.defer();
    var pos_op;
    var newResult = [];
    var async = require("async");
    var fs = require("fs");
    var word = result;
    var txtFile = "C:/Users/darsh/WebstormProjects/node-express-project/trashwords.txt";
    fs.readFile(txtFile, 'utf8', function (err, data) {
        if (err) {
            return console.log(err);
        }
        var array_trashwords = data.split("\r\n");

        for (var i = 0; i < result.length; ++i) {
            if (!array_trashwords.includes(result[i].toLowerCase())) {
                newResult.push(result[i]);
            }
        }
        dfd.resolve(newResult);
    });

    return dfd.promise;
    // fs.readFile(txtFile, 'utf8', function (err,data) {
    //   if (err) {
    //       return console.log(err);
    //     }
    //     var array_trashwords = data.split("\r\n");

    //     async.series([
    //       function(callback) {
    //         var i;
    //         for(i = 0; i < result.length; i++) {
    //           if(!array_trashwords.includes(result[i].toLowerCase())) {
    //             newResult.push(result[i]);
    //           }
    //         }
    //         if (i == result.length) {
    //           callback();
    //         }
    //       },
    //       function(callback) {
    //         pos_op=pos_extractor(newResult);

    //        // console.log("NEW RESULT : " + newResult);
    //       }

    //     ], function(err) {
    //       if(err) {
    //         callback(err);
    //       }
    //     });
    // });
    // return pos_op;
}


function pos_extractor(newResult) {
    var noun = [];
    var verb_noun = [];
    var result_String = "";
    for (var i = 0; i < newResult.length; i++) {
        result_String += newResult[i] + " ";
    }
    console.log(result_String);
    var pos = require('pos');
    var words = new pos.Lexer().lex(result_String);
    var tagger = new pos.Tagger();
    var taggedWords = tagger.tag(words);
    for (i in taggedWords) {
        var taggedWord = taggedWords[i];
        var word = taggedWord[0];
        var tag = taggedWord[1];
        if (["NNP", "NNPS", "CD"].includes(tag)) {
            noun.push(word);
        }
        if (["NN", "NNS", "VBG", "VBP", "VBN", "VBZ"].includes(tag)) {
            verb_noun.push(word);
        }


    }
    var final_array = [noun, verb_noun];
    // console.log(fial_array);
    // console.log("Nouns : "+noun);
    // console.log("Verbs/Nouns : "+verb_noun);
    return (final_array);
}


/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', {title: 'Express'});
});

router.post('/postData2', function (req, res, next) {
    res.send(req.body);
});

router.route('/postData').post(function (req, res, next) {

    res.setHeader('Access-Control-Allow-Origin', '*');

    // request({
    //     headers: {
    //         "x-api-key":"XV7Ijo8auq2IXAI7tZ08F5pGNUo6gAO92D5nN0v0"
    //     },
    //     uri: 'https://8rc0ymmdo5.execute-api.us-east-2.amazonaws.com/dev/auto-classifier/LNLP-general-usltL1',
    //     body: req.body,
    //     method: 'POST'
    // }, function(error, response, body){
    //     if(!error && response.statusCode === 200) {
    //         console.log(body);
    //     }
    // });

    // request.post('https://8rc0ymmdo5.execute-api.us-east-2.amazonaws.com/dev/auto-classifier/LNLP-general-usltL1', {json:req.body}, function(error, response,body) {
    //   if(!error && response.statusCode === 200) {
    //     console.log(body);
    //   }
    // });


    var dfd = q.defer();
    var proper_nouns = [];

    keywords(req.body.userInput).then(function (data) {
        return reject(data).then(function (newResult) {
            return pos_extractor(newResult);
        });
    }).then(function (final_keywords) {
        proper_nouns = final_keywords[0];
        var promises = [];
        for (var i = 0; i < final_keywords[1].length; ++i) {
            // var options = {
            //     url: 'https://8rc0ymmdo5.execute-api.us-east-2.amazonaws.com/dev/auto-classifier/LNLP-general-usltL1',
            //     headers: {
            //         "x-api-key":"XV7Ijo8auq2IXAI7tZ08F5pGNUo6gAO92D5nN0v0"
            //     },
            //     body: req.body,
            //     json: true,
            //     method: 'POST'
            // };

            var options = {
                uri: 'https://8rc0ymmdo5.execute-api.us-east-2.amazonaws.com/dev/auto-classifier/LNLP-general-usltL1',
                headers: {
                    "x-api-key": "XV7Ijo8auq2IXAI7tZ08F5pGNUo6gAO92D5nN0v0"
                },
                body: {input_text: final_keywords[1][i]},
                json: true,
                method: 'POST'
            };

            var this_promise = rp(options).then(function (parsedBody) {
                return parsedBody;
            }).catch(function (err) {
                return err;
            });


            promises.push(this_promise);
        }


        return q.all(promises).then(function (data) {
            var unique_classifications = _.uniqBy(data, 'classification');
            var final_response = [];
            if(unique_classifications.length === 0) {
              final_response[0] = [undefined].concat(proper_nouns);
            }
            var temp_array = [];
            for (var i = 0; i < unique_classifications.length; ++i) {
                temp_array.push(unique_classifications[i].classification);
            }
            return [temp_array, proper_nouns];
        });


    }).then(function(final_response) {
        res.send(final_response);
    });

    // var options = {
    //     url: 'https://8rc0ymmdo5.execute-api.us-east-2.amazonaws.com/dev/auto-classifier/LNLP-general-usltL1',
    //     headers: {
    //         "x-api-key":"XV7Ijo8auq2IXAI7tZ08F5pGNUo6gAO92D5nN0v0"
    //     },
    //     body: req.body,
    //     json: true,
    //     method: 'POST'
    // };

    // var callback = function(error, response, body) {
    //   if(!error && response.statusCode === 200) {
    //     console.log(body);
    //   }
    // };

    // request(options, callback);
});

module.exports = router;


// keyword --> reject --> pos_extractor -->
// pos_extractor --> reject --> keyword --> request