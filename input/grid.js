const fs = require('fs');
const turf = require('@turf/turf');

const gridWidth = 0.2;
const minimumPoints = 1;
const inputFile = './output/trees.geojson';
const outputFile = './output/grid.geojson';

// Create hotspots grid;
const createHotspotsGrid = async (hotspots) => {
  const envelope = await createEnvelope(hotspots);
  const grid = await createGrid(envelope, gridWidth);
  return await aggregate(grid, hotspots, minimumPoints);
};

// Calculate the bounding box of a set of points
const createEnvelope = async (hotspots) => {
  console.log('Calculate envelope');
  return turf.envelope(hotspots);
};

// Given a bounding box and a width in miles, return a hexgrid filling the space
// The default width is 15 miles
const createGrid = async (envelope, width) => {
  console.log('Generate grid');
  // must be in order: minX, minY, maxX, maxY ...
  // you have to pick these out from your envelope that you created previously
  const coords = envelope.geometry.coordinates;
  var bbox = [
    coords[0][0][0],
    coords[0][0][1],
    coords[0][2][0],
    coords[0][2][1]
  ];
  // makes the new hexgrid
  const grid = turf.squareGrid(bbox, width, {units: 'miles'});
  // Convert it a string and back to JSON because turf is weird
  return JSON.parse(JSON.stringify(grid));
};

// Spatially join the provided points to the hexgrid and tally the total for each
// Returns the hexagons that include the provided minimum number of points
const aggregate = async (grid, hotspots, minimum) => {
  // Run the spatial join
  console.log('Collecting hotspots into grids');
  var collected = turf.collect(grid, hotspots, 'source', 'hotspots');

  // Calculate totals
  console.log('Tallying totals');
  collected.features.forEach(c => {return c.properties.hotspots = (c.properties.hotspots || []).length;});

  // Return the result above our minimum
  console.log('Filter down to only grids with a significant number of hotspots');
  const qualified = collected.features.filter(d => {return d.properties.hotspots >= minimum;});
  console.log(`${qualified.length} grids qualified for display`);

  // Return the result
  return turf.featureCollection(qualified);
};

const main = async () => {
    const data = JSON.parse(fs.readFileSync(inputFile, 'utf8'));
    console.log("Reading in data");

    const output = await createHotspotsGrid(data);
    fs.writeFileSync(outputFile, JSON.stringify(output, null, 4), 'utf8');
};

main();
