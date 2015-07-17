// scripts.js for Wikipedia search

$(document).ready(function() {

  // searchWikipedia('Delaware');
  // getPage('Delaware');
  // getAutoComplete('Dela');
  // wikiRandom();

  $( '#icon-div' ).click(function() { transitionToSearch(); });
  $( '.random-entry' ).click(function() { wikiRandom(); });

  function transitionToSearch() {
    /* Replace the magnifier with a round text box, stretch the box to its
    final length, add the x to clear the box, and add the autocompete checkbox
    The example includes a funky animation for the x (clear) */
  }

  function transitionToStart() {
    /*  If the x in the search box is pressed, remove the automcomplete option,
    clear the box, remove the x, shrink the box to a circle, then replace it by
    the magnifying glass.  The example includes a funky animation for the x \(clear) */
  }

  /* ajax calls */

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
        // $('#json').append(makeJSONTable(data, "Results of Wikipedia search"));
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
          "limit": 5,
          "format": "json",
      }),
      dataType: "jsonp",
      type: "POST",
    })
    .done(function(data, textStatus, jqXHR) {
        console.log("HTTP Request Succeeded: " + jqXHR.status);
        console.log(data);
        // $('#json').append(makeJSONTable(data, "Results of opensearch"));

        /* Retuned value is an array.  All but the first element are arrays
        data[0] = search string
        data[1][i] = autocompletion
        data[2][i] = snippet
        data[3][i] = canonical url
        */
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
    if (heading !== undefined) {
      tableBody += '<h4 style="background-color:#e0ffe0;color:black;margin:0">' + heading + '</h4>';
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
