// In this exercise we are going to use some data from the World Bank about
// the nations of the world. In our data, we have an object for every country
// that contains its name, region, income group, country code as well as
// various indicators per year. Note that not all years are present.
//
// We are going to create a standard HTML Table using d3. You can read more
// about tables here:
// https://developer.mozilla.org/en-US/docs/Web/HTML/Element/table

// Task 1:

// define the table headers. They should be:
// - Country Name
// - Region
// - Income Group
// - Population
//
// They should all go into an array under a variable called 'headers'.
var headers = ["Country Name", "Region", "Income Group", "Population"];


// Task 2:
// You have access to a selection called "viewer". You can use it as your
// root element from which to make selections and so on.
// Create a new table element inside the viewer selection that has the
// class name 'countries'.
var viewer = d3.select("#visuals");
var table = viewer.append('table')
    .classed('countries', true);

// Task 3:
// create a row in the table that has the class name 'headings'
var headings = table.append("tr")
  .classed("headings", true);

// Task 4:
// Fill in the headings row with cells that contain our headers.
// You'll need to make a selection for all the td elements under headings
// and then bind headers to it as our data.
// What should be your key function? Does it matter in this case?
// How do you set the content of the td element?
headings.selectAll("td")
  .data(headers, String)
  .enter()
    .append("td")
    .text(String);

d3.json("../assets/countrydata.json", function(error, data) {

    if (error) {
      console.log(JSON.stringify(error));
    }

    // Task 5:
    // create rows for every country and fill in the data!
    // You'll probably need to inspect the data to know exactly what the
    // properties are called that contain the values you're looking for.
    // To do this, create a new variable called rows that will be your data binding
    // between the table, new tr elements with the classname 'country'.
    //
    // Hint:
    // If you need to see what the data looks like, you can always run
    // console.log(data) to see it!
    //
    // var rows = ?

    var rows = table.selectAll("tr.country")
      .data(data, function(country) {
        return country.name;
      });

    // Task 6:
    // create an enter selection for the country data rows in a variable called
    // newRows. You should make sure to append a row with the class name country.
    // var newRows = ?
    var newRows = rows.enter()
        .append("tr")
        .classed("country", true);

    // Task 7:
    // For Now, append 4 td elements to newRows for the 4 different headings
    // that we have.
    //
    // Note the population field has many values for many years. You want
    // to get the last value we have and populate your table with that.
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

    // Task 8:
    // Format the values in the population column to look like 23,000,000 rather
    // than 23000000. You probably want to look up the d3.format function now!
  });