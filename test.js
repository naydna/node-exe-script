let cli = require('./lib/command-line');

cli.setParameters({ '-i': 'Text data in JSON format'});
cli.setParameters({ '-h': 'Help context' });
cli.setDescription(`
Extract fields from the input JSON data

Usage: test -i [input data]
`);

cli.commandLine((args) => {
  console.log('Fired!');
  if (!args['-i']) throw new Error('No input data specified.');
  return `The input data file is ${args['-i']}`;
});