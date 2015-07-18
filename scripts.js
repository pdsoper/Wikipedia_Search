// scripts.js for Wikipedia search

$(document).ready(function() {

    // searchWikipedia('Delaware');
    // getPage('Delaware');
    // getAutoComplete('Dela');
    // wikiRandom();

    /* Event handlers */

    $( ".search-box" ).autocomplete({
        delay: 300,
        diabled: false,
        minLength: 2,
        select: function(event, ui) {
            searchWikipedia(ui.item.label);
        },
        source: function( request, response ) {
            $.ajax({
                /* See https://www.mediawiki.org/wiki/API:Opensearch */
                url: "https://en.wikipedia.org/w/api.php?" + jQuery.param({
                    "action": "opensearch",
                    "search": request.term,
                    "limit": 7,
                    "format": "json",
                }),
                dataType: "jsonp",
                type: "POST",
            })
            .done(function(data, textStatus, jqXHR) {
                console.log("HTTP Request Succeeded: " + jqXHR.status);
                // console.log(data);
                /* An array is returned  All but the first element are arrays.
                data[0] = search string, data[1][i] = autocompletion,
                data[2][i] = snippet, data[3][i] = canonical url */
                response(data[1]);
            })
            .fail(function(jqXHR, textStatus, errorThrown) {
                console.log("HTTP Request Failed");
                console.log(jqXHR);
                console.log(errorThrown);
                response([]);
            })
            .always(function() {
                /* ... */
            });
        }
    });

    $( '#search-form' ).submit(function(event) {
        var val = $( '.search-box' ).val();
        if (val.length === 0 ) {
            return;
        } else {
            $( ".search-box" ).autocomplete( 'close' );
            searchWikipedia(val);
        }
    });

    $( '.text-thing' ).click(function() { transitionToSearch(); });
    $( '.random-entry' ).click(function() { wikiRandom(); });
    $( '.x-clear' ).click(function() { transitionToStart(); });

        /* Use 'on' with an existing page element to bind events to selected elements that are dynmically added later. */

    $( '.results-div' ).on('mouseover', '.search-result', function(event) {
        $(this).removeClass('no-border').addClass('left-border');
    });

    $( '.results-div' ).on('mouseout', '.search-result', function(event) {
        $(this).removeClass('left-border').addClass('no-border');
    });

    $( '.results-div' ).on('click', '.search-result', function(event) {
          getPage( $(this).attr('id'));
    });

    /* View modifications */

    function transitionToSearch() {
        /* The example includes a funky animation for the x */
        $( '.top-space' ).removeClass('short-top').addClass('tall-top');
        $( '.start-div' ).removeClass('disp-block').addClass('disp-none');
        $( '.search-handle' ).removeClass('shown').addClass('hidden');
        $( '.text-thing' ).animate( { width: 300 }, 500, function() {
          $( '.x-clear' ).removeClass('hidden').addClass('shown');
          $( '.check-div' ).removeClass('disp-none').addClass('disp-block');
          $( '.search-box' ).removeClass('hidden').addClass('shown').focus();
       });
    }

    function transitionToStart() {
        /*  The example includes a funky animation for the x */
        $( '.search-box' ).autocomplete( 'close' );
        $( '.results-div' ).html('');
        $( '.top-space' ).removeClass('short-top').addClass('tall-top');
        $( '.search-box' ).val('');
        $( '.search-box' ).removeClass('shown').addClass('hidden');
        $( '.check-div' ).removeClass('disp-block').addClass('disp-none');
        $( '.x-clear' ).removeClass('shown').addClass('hidden');
        $( '.text-thing' ).animate( { width: 40 }, 500, function() {
          $( '.search-handle' ).removeClass('hidden').addClass('shown');
          $( '.start-div' ).removeClass('disp-none').addClass('disp-block');
        });
    }

    function writeResults(data) {
        $( '.top-space' ).removeClass('tall-top').addClass('short-top');
        $( '.results-div' ).html('');
        $( '.results-div' ).append(data.query.search
            .reduce(function(a,b) { return a + writeDiv(b); }, ''));
    }

    function writeDiv(item) {
        return '<div class="search-result no-border" id="' +
            item.title + '">\n' +
            '<h4>' + item.title + '</h4>\n' +
            '<p>' + stripHtml(item.snippet) + '</p>\n' +
            '</div>';
    }

    /* ajax calls */

    function searchWikipedia(searchStr) {
        /* Perform the search, return the results, and call writeDiv to display them */
        $.ajax({
            url: "https://en.wikipedia.org/w/api.php?" + jQuery.param({
                "action": "query",
                "list": "search",
                "srsearch": searchStr,
                "srlimit": 10,
                "format": "json",
                "continue": "",
            }),
            dataType: "jsonp",
            type: "POST",
        })
        .done(function(data, textStatus, jqXHR) {
            console.log("HTTP Request Succeeded: " + jqXHR.status);
            // console.log(data);
            // $('.json').append(makeJSONTable(data, "Results of Wikipedia search"));
            if (data.query.search.length === 0) {
                alert("No results found")
            } else {
                writeResults(data);
            }
        })
        .fail(function(jqXHR, textStatus, errorThrown) {
            console.log("HTTP Request Failed");
            console.log(jqXHR);
            console.log(errorThrown);
          })
          .always(function() {
              /* ... */
          });
    }

    function getPage(title) {
        /* Find the pageid, then call openPage to find the url and open it in a new window */
        $.ajax({
        url: "https://en.wikipedia.org/w/api.php?" + jQuery.param({
            "action": "query",
            "list": "pageswithprop",
            "pwprop": "title",
            "pwplimit": 10,
            "indexpageids": "",
            "pwppropname": title,
            "titles": title,
            "format": "json",
            }),
            dataType: "jsonp",
            type: "POST",
        })
        .done(function(data, textStatus, jqXHR) {
            console.log("HTTP Request Succeeded: " + jqXHR.status);
            // console.log(data);
            if (data.query.pageids.length > 1) {
                console.log("Pageids for ", title, " = ", data.query.pageids);
            }
            if (data.query.pageids.length > 0) {
                openPage(data.query.pageids[0]);
            }
            // $('#json').append(makeJSONTable(data, "Results of getPage"));
        })
        .fail(function(jqXHR, textStatus, errorThrown) {
            console.log("HTTP Request Failed");
            console.log(jqXHR);
            console.log(errorThrown);
        })
        .always(function() {
            /* ... */
        });
    }

    function openPage(pageid) {
        /* Find the url of the page, then open it in a new wwindow */
       $.ajax({
          url: "https://en.wikipedia.org/w/api.php?" + jQuery.param({
              "action": "query",
              "prop": "info",
              "inprop": "url",
              "pageids": pageid,
              "format": "json",
          }),
          dataType: "jsonp",
          type: "POST",
        })
        .done(function(data, textStatus, jqXHR) {
            console.log("HTTP Request Succeeded: " + jqXHR.status);
            // console.log(data);
            // $('#json').append(makeJSONTable(data, "Results of openPage"));
            var url = data.query.pages[pageid].canonicalurl
            window.open(url);
        })
        .fail(function(jqXHR, textStatus, errorThrown) {
            console.log("HTTP Request Failed");
            console.log(jqXHR);
            console.log(errorThrown);
        })
        .always(function() {
            /* ... */
        });
    }

    function wikiRandom() {
        /* Find a random page, then call openPage to open it in a new window */
        $.ajax({
          url: "https://en.wikipedia.org/w/api.php?" + jQuery.param({
              "action": "query",
              "list": "random",
              "rnnamespace": 0,
              "rnlimit": 1,
              "format": "json",
          }),
          dataType: "jsonp",
          type: "POST",
        })
        .done(function(data, textStatus, jqXHR) {
            console.log("HTTP Request Succeeded: " + jqXHR.status);
            console.log(data);
            // $('#json').append(makeJSONTable(data, "Results of Wikipedia random page"));
            openPage(data.query.random[0].id);
        })
        .fail(function(jqXHR, textStatus, errorThrown) {
            console.log("HTTP Request Failed");
            console.log(jqXHR);
            console.log(errorThrown);
        })
        .always(function() {
            /* ... */
        });
    }

    /* Utility functions */

    function stripHtml(str) {
      return $('<div/>').html(str).text();
    }

});
