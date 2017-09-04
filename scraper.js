const Xray = require('x-ray');
const logger = require('winston')
const Promise = require("bluebird");
const utils = require('./scraper-utils.js');
const mongoose = require('mongoose');

mongoose.Promise = require('bluebird');
// mongoose.set('debug', true);

//Throttle the requests to n requests per ms milliseconds.
const x = Xray().throttle(10, 1000).concurrency(1);
const url = "http://www.cdeluruguay.gob.ar/datagov/proveedoresContratados.php";

function updateProvider(updatedProvider, options){
    return mongoose.model('Provider').findOneAndUpdate({
        cuil: updatedProvider.cuil
    }, updatedProvider, options).exec();
}

function updateCategory(updatedCategory, provider, options){
    return new Promise((resolve, reject) => {
        mongoose.model('Category').findOneAndUpdate({
            category: updatedCategory.category
        }, updatedCategory, options, (err, category) => {
            if (err){
                return reject(err);
            }
            return resolve({category: category, provider: provider});
        });
    });
}

function updatePurchaseOrder(updatedPurchaseOrder, options){
    return  mongoose.model('PurchaseOrder').findOneAndUpdate(
            updatedPurchaseOrder, updatedPurchaseOrder, options).exec();
}

function updateYear(updatedYear, options){
    return mongoose.model('Year').findOneAndUpdate({
            year: updatedYear.year
        }, updatedYear, options).exec();
}

function processYears(url, year){
    x(url, 'body tr.textoTabla', [{
        year: 'td', // año
        total_amount: 'td:nth-of-type(4)', // importe de ese proveedor en ese año
        href: 'td:nth-of-type(8) a@href' // a@href a VER POR PROVEEDORES
    }])
    ((err, mappedYears) => {
        if (err) {
            logger.error(err);
            return;
        }
        logger.debug('Number of years to process: [%s]', mappedYears.length);
        mappedYears.map(i => processYear(i, year));
    })
}
function processYear(mappedYear, year) {
    if (year && mappedYear.year != year)
        return;
    logger.debug('Processing year [%s]', mappedYear.year);
    logger.debug("scrapping [%s]", mappedYear.href);
    x(mappedYear.href, 'body tr.textoTabla', [{
        cuil: 'td', // cuil proveedor
        grant_title: 'td:nth-of-type(2)', // nombre de fantasia del proveedor
        total_contrats: 'td:nth-of-type(4)', // cantidad de contrataciones en ese año
        href: 'td:nth-of-type(8) a@href' // a@href a VER POR RUBROS
    }])((err, mappedProviders) => {
        if (err) {
            logger.error(err);
            return;
        }
        
        logger.debug('Number of providers to process: [%s]', mappedProviders.length);
        mappedProviders.map(processProvider, {
            year: mappedYear.year,
            total_amount: mappedYear.total_amount
        });
    });
}

function processProvider(mappedProvider) {
    var parentObject = this;
    logger.debug('Processing provider [%s]', mappedProvider.grant_title);
    logger.debug('Scraping [%s]', mappedProvider.href);
    x(mappedProvider.href, 'body tr.textoTabla', [{
        cod: 'td', //codigo del rubro
        category: 'td:nth-of-type(2)', //nombre del rubro
        href: 'td:nth-of-type(7) a@href' //a@href a MESES
    }])((err, mappedCategories) => {
        if (err){
            logger.error(err);
            return
        }
        
        logger.debug('Number of categories to process: [%s]', mappedCategories.length);
        mappedCategories.map(processCategory, {
            provider: mappedProvider,
            year: parentObject.year,
            total_amount: parentObject.total_amount
        });
    })
};

function processCategory(mappedCategory) {
    var parentObject = this;
    logger.debug('Processing category [%s]', mappedCategory.cod);
    logger.debug('Scraping [%s]', mappedCategory.href);
    x(mappedCategory.href, 'body tr.textoTabla', [{
        month: 'td', // mes
        numberOfContracts: 'td:nth-of-type(2)', // cantidad de contratos
        import: 'td:nth-of-type(4)' // importe para ese mes
    }])((err, mappedMonths) => {
        if (err){
            logger.error(err);
            return;
        }

        logger.debug('Number of months to process [%s]', mappedMonths.length);
        mappedMonths.map(normalize, {
            category: mappedCategory,
            provider: parentObject.provider,
            year: parentObject.year,
            total_amount: parentObject.total_amount
        });
    })
};

function normalize(o) {
    let parentObject = this;
    let year = parseInt(parentObject.year); // año
    logger.info('Processing [%d] - [%s] - [%s] - [%s]', year, o.month, parentObject.provider.grant_title, parentObject.category.cod);
    let childObject = {
        year: year, //year
        cuil: parentObject.provider.cuil, //proveedor
        grant_title: parentObject.provider.grant_title, //proveedor
        total_amount: parentObject.total_amount, //importe de ese proveedor en UN AÑO
        total_contrats: parentObject.provider.total_contrats, //cantidas de contrataciones en UN AÑO
        cod: parentObject.category.cod, //codigo del rubro
        category: parentObject.category.category, //nombre del rubro (reparticion)
        month: o.month, //mes
        numberOfContracts: o.numberOfContracts, //cantidad de contratos para ese mes
        import: o.import //importe en ese mes
    };

    let mongoOptions = {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true
    };
      
    let monthNumber = utils.monthToInt(childObject.month);
    let newDate = utils.stringToDate(monthNumber, childObject.year);
    let partialImport = parseFloat(utils.strAmountToFloat(childObject.import)); // importe de un proveedor en un cierto mes
    let totalImport = parseFloat(utils.strAmountToFloat(childObject.total_amount)); // importe total para el años correspondiente a esta fila

    updateProvider({
        cuil: childObject.cuil,
        grant_title: childObject.grant_title
    }, mongoOptions)
    .then(provider => {
        return updateCategory({
            cod: childObject.cod,
            category: childObject.category
        }, provider, mongoOptions);
    })
    .then((results) => {
        let Purchase = {
            year: childObject.year,
            month: monthNumber,
            date: newDate,
            numberOfContracts: childObject.numberOfContracts,
            import: partialImport,
            fk_Provider: results.provider._id,
            fk_Category: results.category._id
        };
        return updatePurchaseOrder(Purchase, mongoOptions);
    })
    .then(purchaseOrder => {
        return updateYear({
            year: childObject.year,
            total_contrats: childObject.total_contrats,
            totalAmount: totalImport
        }, mongoOptions);
    })
    .catch(err => {
        logger.error(err);
    });
};

function start(year) {
    logger.info("Start scraping...");
    processYears(url, year);
    return;
};

// module export
module.exports = {
    start: start
}
