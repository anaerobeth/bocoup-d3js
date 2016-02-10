var body = d3.select(document.body);

// Task 1:
// Above we've defined a selection called "body". It references the
// actual body of our document.
// Change its background color to "khaki" using the `style` function.
body.style('background-color', 'khaki')

// Task 2:
// Now, find a div inside the body that as the id "visuals". Save it to the
// 'viewer' variable, then find a span inside that visuals div.
// Change its content to say "FOUND IT!" using the `text` function
var viewer = body.select('#visuals');
var span = viewer.select('span').text('FOUND IT!');

// Task 3:
// Append a new div to the "viewer" selection using the `append` class and then
// append three divs to that container with the class name "item" assigned
// to each. Save that selection to the variable 'items_container'.
// Look up how to set the class attribute on an item in the d3 documentation
// or slide material!
var items_container = viewer.append('div')
items_container.append('div').attr('class', 'item');
items_container.append('div').attr('class', 'item');
items_container.append('div').attr('class', 'item');
// or use .classed('item', true)

// Task 4:
// Find all the divs with the class name "item" using the `selectAll` function
// and change their content to say "<b>ITEM DIV</b> using the `html` function"
var item_divs = d3.selectAll('.item').html("<b>ITEM DIV</b> using the `html` function");

// Task 5:
// If you look at the index.html file, you'll notice there's a list element in
// our viewer, listing a few animals. Find the one that says 'Dogs' and change
// it to 'Birds'. How would you find it?
var dogs_li = d3.select('li:nth-child(2)').text('Birds');

// Task 5:
// Find all our animal list li elements and set an attribute on them called
// name. Set that attribute to "animal"
var animal_lis = d3.selectAll('li').attr('name', 'animal');

// Task 6:
// Find the input on the page and change its value to your name. Which function
// will you use to set that content? Hint, you may want to look this up in the
// d3 documentation.
var input = d3.select('input').attr('value', 'beth');
// or use property('beth')
