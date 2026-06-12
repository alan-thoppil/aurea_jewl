import fs from 'fs';

function main() {
  const schemaPath = 'c:/Users/ALAN TOM/Documents/acadeni_int/aurea_jewl/database/schema.sql';
  let schema = '';
  
  try {
    schema = fs.readFileSync(schemaPath, 'utf8');
  } catch (e) {
    // If UTF-8 fails, try UTF-16
    schema = fs.readFileSync(schemaPath, 'utf16le');
  }

  // Find customers table definition
  const lines = schema.split('\n');
  let inCustomers = false;
  let customersDef = [];

  for (const line of lines) {
    if (line.toLowerCase().includes('create table') && line.toLowerCase().includes('customers')) {
      inCustomers = true;
    }
    if (inCustomers) {
      customersDef.push(line);
      if (line.trim().startsWith(');')) {
        inCustomers = false;
      }
    }
  }

  console.log('Customers Table Definition in schema.sql:');
  console.log(customersDef.join('\n'));

  // Also search for any constraints or indexes containing customers_phone_key or customers and phone
  console.log('\nSearching for customers_phone_key or similar constraints:');
  for (const line of lines) {
    if (line.toLowerCase().includes('customers_phone_key') || 
        (line.toLowerCase().includes('customers') && line.toLowerCase().includes('phone') && line.toLowerCase().includes('unique'))) {
      console.log(line);
    }
  }
}

main();
