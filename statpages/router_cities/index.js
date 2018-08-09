'use strict';

const { moscowTemplates } = require('./moscow');
const { nnTemplates } = require('./nn');
const { spbTemplates } = require('./spb');
const { loadTemplate } = require('/p/pancake/utils/index.js');
const logger = require('/p/pancake/logger/index.js')(module);

const citiesTemplate = {
  'moscow': moscowTemplates,
  'spb': spbTemplates,
  'nn': nnTemplates,
};

async function loadCitiesStatPages(citiesTemplateDict) {
  const citiesKeyList = Object.keys(citiesTemplateDict);
  for (let templateDictKey of citiesKeyList) {
    let templateDict = citiesTemplateDict[templateDictKey];
    let pages = Object.keys(templateDict);
    for (let page of pages) {
      if (typeof templateDict[page] === 'object') {
        try {
          await loadTemplate({
            name: `${templateDict.key+templateDict[page].name}`,
            path: `${templateDict.dir + templateDict[page].name}`
          });
        } catch (e) {
          logger.error('Error load template ', templateDict.key + templateDict[page].name);
        }
      }
    }
  }
}

loadCitiesStatPages(citiesTemplate);

module.exports = {
  citiesTemplate
};