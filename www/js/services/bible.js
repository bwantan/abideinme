angular.module('app.services').service('bible', function ($http, $q, $localstorage) {

    var _actualDevice = true;
    var _availVersions = {};
    var _languages = {};
    var _allverses;
    var _db;

    return (
    {
        initDB: initDB,
        addVerse: addVerse,
        updateVerse: updateVerse,
        addAllVerses: addAllVerses,
        deleteVerse: deleteVerse,
        getAllVerses: getAllVerses,
        getBibleVersion: getBibleVersion,
        getLanguage: getLanguage,
        getBooks: getBooks,
        findVerse: findVerse,
        loadChapter: loadChapter
    });

    function initDB (){
        _db = new PouchDB('bibleverse');
    }

    function addVerse(verse) {

        return $q.when(_db.post(verse));
    };

    function addAllVerses(verses) {
        return $q.when(_db.bulkDocs(verses));
    };

    function deleteVerse(verse) {
        return $q.when(_db.remove(verse));
    };

    function updateVerse(verse) {
        return $q.when(_db.put(verse));
    };

    function getAllVerses() {
        if (!_allverses) {
            return $q.when(_db.allDocs({ include_docs: true}))
                .then(function(docs) {

                    // Each row has a .doc object and we just want to send an
                    // array of birthday objects back to the calling controller,
                    // so let's map the array to contain just the .doc objects.
                    _allverses = docs.rows.map(function(row) {
                        row.doc.date = new Date(row.doc.date);
                        return row.doc;
                    });
                    // Listen for changes on the database.
                    _db.changes({ live: true, since: 'now', include_docs: true})
                        .on('change', onDatabaseChange);
                    return _allverses;
                });
        } else {
            // Return cached data as a promise
            return $q.when(_allverses);
        }
    };

    function onDatabaseChange(change) {
        var index = findIndex(_allverses, change.id);
        var verse = _allverses[index];

        if (change.deleted) {
            if (verse) {
                _allverses.splice(index, 1); // delete
            }
        } else {
            if (verse && verse._id === change.id) {
                _allverses[index] = change.doc; // update
            } else {
                _allverses.splice(index, 0, change.doc) // insert
            }
        }
    }

// Binary search, the array is by default sorted by _id.
    function findIndex(array, id) {
        var low = 0, high = array.length, mid;
        while (low < high) {
            mid = (low + high) >>> 1;
            array[mid]._id < id ? low = mid + 1 : high = mid
        }
        return low;
    }

    function getBibleVersion(){
        var deferred = $q.defer();

        $http.get('data/bible.json')
            .success(function(data) {
                _availVersions = data;
                deferred.resolve(data);
            })
            .error(function(data) {
                deferred.reject(data);
            });

        return deferred.promise;
    }

    function getLanguage(){
        var deferred = $q.defer();

        $http.get('data/languages.json')
            .success(function(data) {
                _languages = data;
                deferred.resolve(data);
            })
            .error(function(data) {
                deferred.reject(data);
            });

        return deferred.promise;
    }

    function getBooks(){
        var deferred = $q.defer();

        $http.get('data/books.json')
            .success(function(data) {
                _books = data;
                deferred.resolve(data);
            })
            .error(function(data) {
                deferred.reject(data);
            });

        return deferred.promise;
    }

    function findVerse(reference, book, chapter, verseStart, verseEnd, bibleVersion, language){
        return yourVersion(reference, book, chapter, verseStart, verseEnd, bibleVersion, language);
    }

    function loadChapter(reference, book, chapter, verseStart, verseEnd, bibleVersion, language){
        var api = "/bible";
        if (_actualDevice) {
            api = "https://www.bible.com/bible";
        }
        console.log(bibleVersion)
        bibleUrl = api + "/" + getBibleCode(bibleVersion, language) + "/" + book + "." + chapter;

        var request = $http({
            method: "GET",
            url: bibleUrl
        });

        return( request.then( function(response, status){

            var parser = new DOMParser()
                , doc = parser.parseFromString(response.data, "text/html");

            var returnText = "";

            if (response.status == 200)
            {
                var selectVerse = verseStart;

                for (var verse = 1; verse <= 500; verse++)
                {
                    var highlight = false;
                    var style = "verse v" + verse;

                    var verseFound = doc.getElementsByClassName(style);

                    if (verseFound.length == 0)
                    {
                        break;
                    }

                    if (verse == selectVerse)
                    {
                        highlight = true;
                    }

                    for(var i = 0, iMax = verseFound.length; i < iMax; i++)
                    {
                        var labelStyle = "label";

                        var labelFound = verseFound[i].getElementsByClassName(labelStyle);

                        if (highlight)
                        {
                            returnText = returnText + "<span class=selected>";
                            if (labelFound.length > 0)
                            {
                                returnText = returnText + labelFound[0].innerText + " ";
                            }

                            var contentStyle = "content";

                            var contentFound = verseFound[i].getElementsByClassName(contentStyle);

                            for(var j = 0, jMax = contentFound.length; j < jMax; j++)
                            {
                                returnText = returnText + contentFound[j].innerText + " ";
                            }
                            returnText = returnText + "</span>";
                        }
                        else
                        {
                            if (labelFound.length > 0)
                            {
                                returnText = returnText + labelFound[0].innerText + " ";
                            }

                            var contentStyle = "content";

                            var contentFound = verseFound[i].getElementsByClassName(contentStyle);

                            for(var j = 0, jMax = contentFound.length; j < jMax; j++)
                            {
                                returnText = returnText + contentFound[j].innerText + " ";
                            }
                        }
                    }

                    if (verse == selectVerse)
                    {
                        if (selectVerse < verseEnd)
                        {
                            selectVerse++;
                        }
                    }
                }
            }

            return returnText;

        }, handleError ) );
    }

    function getBibleCode(bibleVersion, language)
    {
        var code = 1;
        angular.forEach(_availVersions[language], function(text) {
            if (text.value == bibleVersion)
            {
                code = text.number;
            }
        });

        return code;
    }

    function yourVersion(reference, book, chapter, verseStart, verseEnd, bibleVersion, language)
    {
        var reference = "";
        var version = "";
        var api = "/bible";
        if (_actualDevice) {
            api = "https://www.bible.com/bible";
        }
        if (verseStart == 0)
        {
            bibleUrl = api + "/" + getBibleCode(bibleVersion, language) + "/" + book + "." + chapter;
        }
        else if (verseStart == verseEnd)
        {
            bibleUrl = api + "/" + getBibleCode(bibleVersion, language) + "/" + book + "." + chapter + "." + verseStart;
        }
        else{
            bibleUrl = api + "/" + getBibleCode(bibleVersion, language) + "/" + book + "." + chapter + "." + verseStart + "-" + verseEnd;
        }


        var request = $http({
            method: "GET",
            url: bibleUrl
        });


        return( request.then( function(response, status){

            var parser = new DOMParser()
                , doc = parser.parseFromString(response.data, "text/html");

            var returnText = "";

            if (response.status == 200)
            {
                if (verseStart == undefined)
                {

                    var versionFound = doc.getElementById("m_version_btn");
                    version = versionFound.innerText;

                    var titleFound = doc.getElementById("m_book_chap_btn");
                    reference = titleFound.innerText;

                    for (var verse = 1; verse <= 500; verse++)
                    {

                        var style = "verse v" + verse;

                        var verseFound = doc.getElementsByClassName(style);

                        if (verseFound.length == 0)
                        {
                            break;
                        }

                        for(var i = 0, iMax = verseFound.length; i < iMax; i++)
                        {
                            var labelStyle = "label";

                            var labelFound = verseFound[i].getElementsByClassName(labelStyle);

                            if (labelFound.length > 0)
                            {
                                returnText = returnText + labelFound[0].innerText + " ";
                            }

                            var contentStyle = "content";

                            var contentFound = verseFound[i].getElementsByClassName(contentStyle);

                            for(var j = 0, jMax = contentFound.length; j < jMax; j++)
                            {
                                returnText = returnText + contentFound[j].innerText + " ";
                            }

                        }
                    }
                }
                else
                {
                    var versionFound = doc.getElementById("m_version_btn");
                    version = versionFound.innerText;

                    var titleFound = doc.getElementById("m_book_chap_btn");
                    reference = titleFound.innerText;
                    var array1 = reference.split(" ");
                    var firsChar = array1[0];
                    switch(firsChar)
                    {
                        case "I":
                            reference = reference.replace(firsChar,1);
                            break;
                        case "II":
                            reference = reference.replace(firsChar,2);
                            break;
                        case "III":
                            reference = reference.replace(firsChar,3);
                            break;
                    }


                    for (var verse = verseStart; verse <= verseEnd; verse++)
                    {

                        var style = "verse v" + verse;

                        var verseFound = doc.getElementsByClassName(style);

                        for(var i = 0, iMax = verseFound.length; i < iMax; i++)
                        {
                            var labelStyle = "label";

                            var labelFound = verseFound[i].getElementsByClassName(labelStyle);

                            if (labelFound.length > 0)
                            {
                                returnText = returnText + labelFound[0].innerText + " ";
                            }

                            var contentStyle = "content";

                            var contentFound = verseFound[i].getElementsByClassName(contentStyle);

                            for(var j = 0, jMax = contentFound.length; j < jMax; j++)
                            {
                                returnText = returnText + contentFound[j].innerText + " ";
                            }
                        }
                    }
                }
                returnText = returnText.replace("#",'"');
            }

            return {
                version: version,
                reference: reference,
                passage: returnText
            };

        }, handleError ) );
    }

    function bibleGateway(reference, book, chapter, bibleVersion)
    {
        var api = "/bgw";
        if (_actualDevice) {
            api = "https://" + "www.biblegateway.com/passage";
        }
        reference = reference.replace(" ", "+");
        reference = reference.replace(":", "%3A");
        bibleUrl = api + "/?search=" + reference + "&version=" + bibleVersion;

        var request = $http({
            method: "GET",
            url: bibleUrl
        });

        return( request.then( function(response, status){
            var parser = new DOMParser()
                , doc = parser.parseFromString(response.data, "text/html");

            var returnText = "";
            var mapping = {
                "john":"John",
                "luke":"Luke",
                "matthew": "Matt"
            };

            if (response.status == 200)
            {
                var style = "chapter-1";
                var verseFound = doc.getElementsByClassName(style);

                if (verseFound.length > 0)
                {
                    returnText = verseFound[0].innerText;
                }

                for (var verse = 1; verse <= 500; verse++)
                {
                    var style = "text " + mapping[angular.lowercase(book)] + "-" + chapter + "-" + verse;

                    var verseFound = doc.getElementsByClassName(style);

                    if (verseFound.length == 0)
                    {
                        break;
                    }

                    for(var i = 0, max = verseFound.length; i < max; i++)
                    {

                        if (verseFound[i].innerHTML.indexOf("chapternum") > -1 || verseFound[i].innerHTML.indexOf("versenum") > -1)
                        {
                            returnText = returnText + verseFound[i].innerText + " ";
                        }
                    }
                }

            }

            return returnText;

        }, handleError ) );
    }


    function handleSuccess( response ) {

        return( response.data );

    }

    function handleError( response ) {

        // The API response from the server should be returned in a
        // nomralized format. However, if the request was not handled by the
        // server (or what not handles properly - ex. server error), then we
        // may have to normalize it on our end, as best we can.
        if (
            ! angular.isObject( response.data ) ||
            ! response.data.message
        ) {

            return( $q.reject( "An unknown error occurred." ) );

        }

        // Otherwise, use expected error message.
        return( $q.reject( response.data.message ) );

    }
})
