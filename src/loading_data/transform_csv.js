const fs = require('fs');
const csv = require('csv-parser');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

// Define input and output file paths
const inputFile = './car_listings.csv';
const outputFile = './transformed_car_listings.csv';

// Define CSV writer
const csvWriter = createCsvWriter({
  path: outputFile,
  header: [
    { id: 'id', title: 'ID' },
    { id: 'title', title: 'Title' },
    { id: 'price', title: 'Price' },
    { id: 'url', title: 'URL' },
    { id: 'summary', title: 'Summary' },
    { id: 'description', title: 'Description' },
    { id: 'imageCount', title: 'ImageCount' },
    { id: 'imageUrl', title: 'ImageURL' }
  ]
});

// Array to store transformed data
const transformedData = [];

// Read and transform CSV data
fs.createReadStream(inputFile)
  .pipe(csv())
  .on('data', (row) => {
    // Transform the data
    const transformedRow = {
      id: row.ID || '',
      title: row.Title || '',
      price: row.Price || '',
      url: row.URL || '',
      summary: row.MapAndAttrs || '',
      description: row.PostingBody || '',
      imageCount: row.ImageCount || '0',
      imageUrl: row.ImageFileName || ''
    };
    
    transformedData.push(transformedRow);
  })
  .on('end', () => {
    // Write transformed data to output file
    csvWriter.writeRecords(transformedData)
      .then(() => {
        console.log(`Transformation complete. ${transformedData.length} records processed.`);
      });
  });
