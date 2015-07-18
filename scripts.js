// scripts.js for Wikipedia search

$(document).ready(function() {

    // searchWikipedia('Delaware');
    // getPage('Delaware');
    // getAutoComplete('Dela');
    // wikiRandom();

    $( '.auto-check' ).prop('checked', false);

    $( '.text-thing' ).click(function() { transitionToSearch(); });
    $( '.random-entry' ).click(function() { wikiRandom(); });
    $( '.x-clear' ).click(function() { transitionToStart(); });

    /* Use 'on' with an existing page element to bind events to selected
    elements that are dynmically added later. */

    $( '.results-div' ).on('mouseover', '.search-result', function(event) {
        $(this).removeClass('no-border').addClass('left-border');
    });

    $( '.results-div' ).on('mouseout', '.search-result', function(event) {
        $(this).removeClass('left-border').addClass('no-border');
    });

    $( '.results-div' ).on('click', '.search-result', function(event) {
          getPage( $(this).attr('id'));
    });

    $( '.search-box' ).keypress(function(event) {
        if ( event.which === 13 ) {
            var val = $( '.search-box' ).val();
            if (val.length === 0 ) {
                return;
            } else {
                searchWikipedia(val);
            }
        }
    });

    $( "#autocomplete" ).autocomplete({
        source: function( request, response ) {
            response( getAutoComplete(request.term) );
        }
    });

    $( '#autocomplete' ).keyup(function(event) {
        if ($( '.auto-check' ).prop('checked')) {
            var val = $( '#autocomplete ' ).val();
            if (val.length >= 2) {
                console.log(getAutoComplete(val));
            }
        }
    });

    function transitionToSearch() {
        /* Remove the random page option
        Remove the handle of the magnifyng glass (visiblity)
        Stretch the box to its final length
        Add the x used to clear the box
        Move the focus to the search box.
        Add the autocompete checkbox
        The example includes a funky animation for the x */
        $( '.top-space' ).height('200px');
        $( '.start-div' ).removeClass('shown').addClass('hidden');
        $( '.search-handle' ).removeClass('shown').addClass('hidden');
        $( '.text-thing' ).animate( { width: 300 }, 500, function() {
          $( '.x-clear' ).removeClass('hidden').addClass('shown');
          $( '.check-div' ).removeClass('disp-none').addClass('disp-block');
          $( '.search-box' ).removeClass('hidden').addClass('shown').focus();
       });
    }

    function transitionToStart() {
        /*  Remove the automcomplete option,
        Clear and hide the search box
        Hide and disable the x
        Shrink the text-thing to a circle
        Show the handle of the magnifying glass
        The example includes a funky animation for the x \(clear) */
        $( '.results-div' ).html('');
        $( '.top-space' ).height('200px');
        $( '.search-box' ).val('');
        $( '.search-box' ).removeClass('shown').addClass('hidden');
        $( '.check-div' ).removeClass('disp-block').addClass('disp-none');
        $( '.x-clear' ).removeClass('shown').addClass('hidden');
        $( '.text-thing' ).animate( { width: 40 }, 500, function() {
          $( '.search-handle' ).removeClass('hidden').addClass('shown');
          $( '.start-div' ).removeClass('hidden').addClass('shown');
        });
    }

    /* ajax calls */

    function searchWikipedia(searchStr) {
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
            console.log(data);
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

    function writeResults(data) {
        $( '.top-space' ).height('20px');
        $( '.results-div' ).html('');
        $( '.results-div' ).append(data.query.search
            .reduce(function(a,b) { return a + writeDiv(b); }, ''));
    }

      function writeDiv(item) {
          return '<div class="search-result no-border" id="' + item.title + '">\n' +
              '<h4>' + item.title + '</h4>\n' +
              '<p>' + stripHtml(item.snippet) + '</p>\n' +
              '</div>';
      }

    function stripHtml(str) {
      return $('<div/>').html(str).text();
    }

    function getPage(title) {
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
          console.log(data);
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
            console.log(data);
            // $('#json').append(makeJSONTable(data, "Results of openPage"));
            var url = data.query.pages[pageid].canonicalurl
            console.log(url);
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

    function getAutoComplete(searchStr) {
        /* See https://www.mediawiki.org/wiki/API:Opensearch */
        $.ajax({
          url: "https://en.wikipedia.org/w/api.php?" + jQuery.param({
              "action": "opensearch",
              "search": searchStr,
              "limit": 7,
              "format": "json",
          }),
          dataType: "jsonp",
          type: "POST",
        })
        .done(function(data, textStatus, jqXHR) {
            console.log("HTTP Request Succeeded: " + jqXHR.status);
            console.log(data);
            /* An array. is returned  All but the first element are arrays
            data[0] = search string
            data[1][i] = autocompletion
            data[2][i] = snippet
            data[3][i] = canonical url
            */
            return [data[1], data[3]];
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

    function makeJSONTable(obj, heading) {
      /* This returns HTML for a nested table of JSON data.
      Use Bootstrap, if available.  If not, use css */
      var bootstrap_enabled = (typeof $().modal === 'function');
      var tableBody = "";
      var headerBackground = "white"
      if (heading !== undefined) {
        if (bootstrap_enabled) {
          headerBackground = "#e0ffe0";
        }
        tableBody += '<h4 style="background-color:' + headerBackground +
          ';color:black;margin:0">' + heading + '</h4>';
      }
      if (obj === null) {
        return tableBody;
      }
      if (bootstrap_enabled) {
       tableBody += '<table class="table table-striped table-bordered">\n<tbody>\n';
      } else {
        tableBody += '<table style="background-color:white;color:black;border-collapse:collapse">\n';
      }
      $.each(obj, function(k, v) {
        if (bootstrap_enabled) {
          tableBody += '<tr><td>' + k + '</td><td>';
        } else {
          tableBody += '<tr style="background-color:white;color:black;border:1px solid black">'
                    +  '<td style="background-color:white;color:black;border:1px solid black">'
                    + k + '</td><td>';
        }
        if (typeof v !== "object") {
          tableBody += v;
        } else {
          tableBody += makeJSONTable(v);
        }
      });
      tableBody += '</td></tr>\n</tbody>\n</table>';
      return tableBody;
    }

});
