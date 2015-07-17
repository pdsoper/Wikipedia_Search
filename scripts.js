// scripts.js for Wikipedia search

$(document).ready(function() {

  getPage('Delaware');
  // openPage('7930');

// My API (POST https://en.wikipedia.org/w/api.php)

  function getWikipedia(searchStr) {
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
        $('#json').append(makeJSONTable(data, "Results of Wikipedia search"));
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

// /w/api.php?action=query&list=pageswithprop&format=json&pwppropname=Delaware&pwpprop=title&pwplimit=10&pwpdir=ascending&indexpageids=&titles=Delaware
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
        $('#json').append(makeJSONTable(data, "Results of getPage"));
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
        $('#json').append(makeJSONTable(data, "Results of oepnPage"));
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


  function getAutoComplete(searcgStr) {
    // Per http://www.labnol.org/internet/tools/using-wikipedia-api-demo-source-code-example/3076/
    // The actual documentation is at https://www.mediawiki.org/wiki/API:Opensearch
    $.ajax({
      url: "https://en.wikipedia.org/w/api.php?" + jQuery.param({
          "action": "opensearch",
          "search": searchStr,
          "limit": 5,
          "redirects": "return",
          "format": "json",
          "warningsaserror": false,
      }),
      dataType: "jsonp",
      type: "POST",
    })
    .done(function(data, textStatus, jqXHR) {
        console.log("HTTP Request Succeeded: " + jqXHR.status);
        console.log(data);
        $('#json').append(makeJSONTable(data, "Results of Wikipedia search"));
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

  function makeJSONTable(obj, heading) {
    /* This returns HTML for a nested table of JSON data.
    Use Bootstrap, if available.  If not, use css */
    var bootstrap_enabled = (typeof $().modal === 'function');
    var tableBody = "";
    if (heading !== undefined) {
      tableBody += '<h4 style="background-color:white;color:black">' + heading + '</h4>';
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
