"use strict";
var fs = require('fs');
var path = require('path');

module.exports = function(fileName) {
  let dirName = path.dirname(fileName);

  let contents = fs.readFileSync(fileName, 'utf-8');
  let newContents = contents;

  let templateUrls =  getTemplateUrls(contents);
  templateUrls.forEach( el => {
    let templateFileName = path.join(dirName, el.templatePath);
    let templateContents = fs.readFileSync(templateFileName, 'utf-8');
    newContents = newContents.replace(el.templateUrl, "template: '" + templateContents.replace(/[\r\n ]+/g,' ').replace(/'/g, "\\'") + "'");
  });

  let styleUrls = getStyleUrls(contents);
  styleUrls.forEach( el => {
    let styleContents = el.stylePaths.map(stylePath => {
      let styleFileName = path.join(dirName, stylePath);
      return "'" + fs.readFileSync(styleFileName, 'utf-8').replace(/[\r\n]+/g,' ').replace(/'/g, "\'") + "'";
    });
    newContents = newContents.replace(el.styleUrls, `styles: [${styleContents.join(',')}]`);
  });

  return newContents;
};

/**
 * parse contents and returns templateUrls in contents
 * e.g. [{templateUrl: 'templateUrl: "A"', templatePath: 'A'}, ...]
 * It also handles multiple occurences
 */
function getTemplateUrls(contents) {
  let TEMPLATE_URL_RE = /templateUrl\s*:\s*['"`](.*?)['"`]/gm;
  let matches, templateUrls = [];

  while(matches = TEMPLATE_URL_RE.exec(contents) ) {
    templateUrls.push({
      templateUrl: matches[0],
      templatePath: matches[1]
    })
  }
  return templateUrls;
}

/**
 * parse contents and returns styleUrls in contents
 * e.g. [{styleUrls: 'styleUrls: ["A"]', stylePaths: ['A']}, ...]
 * It also handles multiple occurences
 */
function getStyleUrls(contents) {
  let STYLE_URLS_RE = /styleUrls\s*:\s*(\[[^](.[^]*?)\])/gm;
  let matches, styleUrls = [];

  while(matches = STYLE_URLS_RE.exec(contents) ) {
    styleUrls.push({
      styleUrls: matches[0],
      stylePaths: matches[1]
        .replace(/^\[/,'')
        .replace(/\]$/,'')
        .replace(/\s/g,'')
        .replace(/['"`](.*?)['"`]/g, '$1')
        .split(',')
    })
  }
  return styleUrls;
}
