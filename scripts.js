// scripts.js for Wikipedia search

$(document).ready(function() {

  getNews();

  function getNews() {
    $.ajax({
        url: "http://www.freecodecamp.com/stories/hotStories",
        type: "GET",
    })
    .done(function(data, textStatus, jqXHR) {
      console.log("HTTP Request Succeeded: " + jqXHR.status);
      console.log(data);
      $('#json').append(makeJSONTable(data, "Results of FCC news query"));
      var divStr = data
      .map(function(a) { return writeDiv(a); })
      .reduce(function(a,b) { return a + b; });
      $('.grid').append(divStr);
    })
    .fail(function(jqXHR, textStatus, errorThrown) {
      console.log("HTTP Request Failed");
      console.log(jqXHR);
      console.log(errorThrown);
    })
    .always(function() {
      //data|jqXHR, textStatus, jqXHR|errorThrown
    });
  }

  function makeJSONTable(obj, heading) {
    // This creates a nested table of JSON data. Use Bootstrap, if available.  If not, use css
    var bootstrap_enabled = (typeof $().modal == 'function');
    if (!bootstrap_enabled) {
      $('table').css("border-collapse", "collapse");
      $('th, td').css("border", "1px solid black");
    }
    var tableBody = "";
    if (heading !== undefined) {
      tableBody += '<h4>' + heading + '</h4>';
    }
    tableBody += '<table class="table table-striped table-bordered">\n';
    $.each(obj, function(k, v) {
      tableBody += "<tr><td>" + k + "</td><td>";
      if (typeof v !== "object") {
        tableBody += v;
      } else {
        tableBody += makeJSONTable(v);
      }
    });
    tableBody += '</td></tr></table>';
    return tableBody; 
  }




});