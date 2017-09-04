
// Month string to month number
function monthToInt(m) {
    if (m == "Enero")       return 00;
    if (m == "Febrero")     return 01;
    if (m == "Marzo")       return 02;
    if (m == "Abril")       return 03;
    if (m == "Mayo")        return 04;
    if (m == "Junio")       return 05;
    if (m == "Julio")       return 06;
    if (m == "Agosto")      return 07;
    if (m == "Septiembre")  return 08;
    if (m == "Octubre")     return 09;
    if (m == "Noviembre")   return 10;
    if (m == "Diciembre")   return 11;
    return 13;
}

// Convert month and Year to date 
function stringToDate(month, year) {
    let d = new Date(year, month, 01,00,00,00,00);
    d.toISOString().slice(0, 10);
    return d;
}

// Convert import to right float number
function strAmountToFloat(m) {
    let y = m.replace(/\./g, '').replace(/\,/g, '.');
    y = parseFloat(y);
    return y;
}

// module exports
module.exports = {
    monthToInt : monthToInt,
    stringToDate: stringToDate,
    strAmountToFloat: strAmountToFloat
}