#!/usr/bin/env node
'use strict';

var fs = require('fs');
var path = require('path');
var glob = require("glob");
var mkdirp = require('mkdirp');

var argv = require('yargs')
  .usage('Usage: $0 [options] <glob files>')
  .command('glob files', 'files to process in expression of glob. e.g. "**/*.js", NOTE: please quote it')
  .demand(1)
  .example('$0 --outDir=./dist "test/**/*.ts"')
  .options({
    o: { alias: 'outDir', type: 'string', demand: false, default: "dist", describe: 'output directory that template urls are converted.'}
  })
  .help('h', 'help')
  .argv;

var ng2inline = require(__dirname + '/../index.js');
var outDir = argv.outDir;
var globStr = argv._[0];
var baseDir = globStr.match(/([^\*]+)\*/)[1].replace(/\/$/,'');

glob(globStr, function (error, fileNames) {
  fileNames.forEach(fileName => {
    let outputPath = fileName.replace(baseDir, outDir);
    let newContents = ng2inline(fileName);
    mkdirp(path.dirname(outputPath), function (err) {
      if (err) {
        console.error(err);
      }
      fs.writeFileSync(outputPath, newContents);
    });
  });
});