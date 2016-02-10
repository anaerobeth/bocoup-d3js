// We are going to continue using our World Bank data.
// In this exercise we are going to use d3 scales to color our table.

// ==== Code from previous exercise ====
var viewer = d3.select("#visuals");
var headers = ["Country Name", "Region", "Income Group", "Population"];

var table = viewer.append('table')
.classed('countries', true);

var headings = table.append("tr")
.classed("headings", true);

headings.selectAll("td")
  .data(headers, String)
  .enter()
    .append("td")
    .text(String);

var regions, regionScale;
d3.json("../assets/countrydata.json", function(error, data) {

  if (error) {
    console.log(JSON.stringify(error));
  }

  var rows = table.selectAll("tr.country")
    .data(data, function(country) {
      return country.name;
    });

  var newRows = rows.enter()
      .append("tr")
      .classed("country", true);

  newRows.append("td").text(function(country) {
    return country.name;
  });
  newRows.append("td").text(function(country) {
    return country.region;
  });
  newRows.append("td").text(function(country) {
    return country.incomeGroup;
  });
  newRows.append("td").text(function(country) {
    if (country.population) {
      return d3.format(",0")(country.population[country.population.length - 1].value);
    } else {
      return "";
    }
  });

  // ==== End code from previous exercise ====


  // Task 1:
  // Find the unique set of regions and save them
  // under regions.
  //
  // regions = [...?]
  regions = [];
  data.forEach(function(country) {
    if (regions.indexOf(country.region) === -1 &&
      country.region &&
      country.region.length > 0) {
      regions.push(country.region);
    }
  });


  // Task 2
  // Define a color scale on app that will color the rows
  // by the region they belong to. The domain should be the unique
  // set of regions available, and the color should be
  // #1f77b4 #ff7f0e #2ca02c #d62728 #9467bd #8c564b #e377c2 #7f7f7f #bcbd22 #17becf
  //
  // regionScale = ?
  regionScale = d3.scale.ordinal()
    .domain(regions)
    .range(["#1f77b4","#ff7f0e","#2ca02c","#d62728","#9467bd","#8c564b","#e377c2","#7f7f7f","#bcbd22","#17becf"]);

  // Task 3
  // Update our table rows to have a background color based on the scale above.
  newRows.style('background-color', function(country) {
    return regionScale(country.region);
  });

});