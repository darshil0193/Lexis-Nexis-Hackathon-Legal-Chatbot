var userPopup = $('#User-Popup0')[0];
var count = 0;
var cnt=0;
var enterNumber = 1;

var categoryqueries = [];
var normalqueries = [];

//DICTIONARY DATA

var greet_words = [ "hello", "hi", "greetings", "sup", "what's up"];
var rep_words = ["hey", "howdy", "good morning", " hello!", "ssup-buddy","watzappp"];
var query_exploit=["Can you be more specific?","Could you be more specific?", "I'm sorry, I don't understand! please use simple words!I am still learning"];
var query_penitrate_init=["anything else you want to add to the existing search?"];
var query_penitrate_final=["Is it", "what you are looking for?"];
var confirm =['affirmative','yes'];
var decline =['no'];
var thankyou=['thanks', 'great', 'done'];

//DICTIONARY DATA ENDS



userPopup.addEventListener('keydown', function(e){
   if(e.keyCode === 13) {
       updateView();
   }
});

var updateView = function() {

    greet();

    var botPopUp = $('#Bot-Popup' + count.toString())[0];
    botPopUp.style.visibility = 'visible';
    var rowSelector = $('#row' + count.toString());
    var rowSelectorClone = rowSelector.clone();

    var currentRow = rowSelector[0];

    var nextRow = rowSelectorClone[0];
    count++;
    nextRow.id = 'row' + count.toString();
    nextRow.children['User-Popup' + (count-1).toString()].id = 'User-Popup' + count.toString();
    nextRow.children['User-Popup' + count.toString()].children['user-input'].value = '';
    nextRow.children['Bot-Popup' + (count-1).toString()].id = 'Bot-Popup' + count.toString();
    nextRow.children['Bot-Popup' + count.toString()].children['bot-input'].value = '';


    var mainFrame = $('#main-frame')[0];

    rowSelectorClone.appendTo(mainFrame);

    currentRow.children['User-Popup' + (count-1).toString()].children['user-input'].disabled=true;

    rowSelectorClone.children()[3].style.visibility = 'hidden';

    userPopup = $('#User-Popup' + count.toString())[0];

    userPopup.addEventListener('keydown', function(e){
        if(e.keyCode === 13) {
            makeCalls();
            updateView();
        }
    });
};

var makeNormalQueries = function(properNouns) {
    for(var i=0; i<properNouns.length; ++i) {
        var object = {
            query_string: {
                'default_field': '_all',
                "query": properNouns[i]
            }
        };
        normalqueries.push(object);
    }
};

var names = [];

var successCallBackDBSearch = function(data) {
    for(var i=0; i<data.hits.hits.length; ++i) {
        names.push(data.hits.hits[i]._source.name.$t);
    }
    for(i=0; i<names.length; ++i) {
        $('#Bot-Popup'+(count-1).toString())[0].children['bot-input'].value += (names[i] + '\r\n');
    }
};

var successCallBackKeywordExtraction = function(data) {
    var categories = data[0];
    var properNouns = data[1];

    makeNormalQueries(properNouns);

    var promises = [];
    for(var i=0; i<categories.length; ++i) {
        var myObject = {
            query: {
                bool: {
                    must: normalqueries.concat([{term: {"classification.keyword":categories[i]}}]),
                    must_not:[],
                    should:[]
                }
            }
        };

        var temp = new Promise(function(resolve, reject){
            $.ajax({
                type: 'POST',
                url: 'http://192.168.43.136:9200/final2/data/_search?',
                dataType: 'json',
                data: JSON.stringify(myObject),
                success: successCallBackDBSearch
            });
        });

        promises.push(temp);
    }

    Promise.all(promises);
};

var makeCalls = function() {
    $.ajax({
        type: 'POST',
        url: 'http://localhost:3000/postData',
        data: {'userInput': $('#User-Popup' + count.toString())[0].children['user-input'].value},
        success: successCallBackKeywordExtraction
    });
};

var greet=function() {
    var input=$('#User-Popup0')[0].children['user-input'].value;
    var flag=0;
    for(var i=0;i<greet_words.length;i++)
    {
        console.log(greet_words[i]);
        if(input.toLowerCase()===greet_words[i])
        {
            flag=1;
            break;
        }
    }
    if(flag=='1')
    {
        var reply= rep_words[Math.floor(Math.random() * 5)];
    }

    $('#Bot-Popup0')[0].children['bot-input'].value = reply+"! How can I help you"
};



// var successCallBack = function(data) {
//     console.log(data);
// };
//
// var makeCalls = function() {
//     var promise = new Promise;
//     $.ajax({
//         type: 'POST',
//         url: 'http://localhost:3000/postData',
//         data: {'userInput': $('#User-Popup' + (count-1).toString())[0].children['user-input'].value},
//     })
// };
//
//
// var makeareply=function()
// {
//     var confirmation_flag='false';
//     var show_flag='false';
//     var q_exists='false';
//     while(show_flag='false') {
//         if(cnt==0)
//         {
//             var jxhr = $.ajax({
//                 type: 'POST',
//                 url: 'http://localhost:3000/postData',
//                 data: {'userInput': $('#User-Popup' + (count-1).toString())[0].children['user-input'].value},
//             })
//
//             jxhr.done(function(data) {
//                 console.log(data);
//                 cnt++;
//                 return data;
//             }).done(function (data) {
//                 console.log(data);
//             });
//         }
//         var result_query = '';
//         if (result_query != 'null' || q_exists=='true') {
//             q_exists = 'true';
//             //add more queries narrow down the search.
//             var reply = query_penitrate_init[0];
//             //get input again.
//             if (decline.indexOf(input) > -1) {
//                 //var reply = query_penitrate[0] + result_query + query_penitrate[1];
//                 if (confirmation_flag || confirm.indexOf(input) > -1) {
//                     var confirmation_flag = 'true';
//                     // get the latest input after this
//                     if (confirm.indexOf(input) > -1) {
//                         show_flag = true;
//                         // GIVE FINAL OUTPUT
//                     }
//                     else {
//                         var reply = query_exploit[Math.floor(Math.random() * 3)];
//                         //ask again.
//                     }
//                 }
//                 else {
//                     var reply = query_exploit[Math.floor(Math.random() * 3)];
//                 }
//             }
//             else
//             {
//                 continue;
//             }
//         }
//         else
//         {
//             var reply = query_exploit[Math.floor(Math.random() * 3)];
//         }
//         cnt++;
//         // call the input function, find keywords
//         //insert query related keywords in result query.
//         // result  query is the resultant of db.
//     }
// };