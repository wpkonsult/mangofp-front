import dateFormat from 'dateformat';

export function getFormattedDate(dateIsoString) {
    const now = new Date(2021, 11, 30);
    var dateFormatStr = now.toLocaleDateString();
    dateFormatStr = dateFormatStr.replace('30', 'dd');
    dateFormatStr = dateFormatStr.replace('12', 'mm');
    dateFormatStr = dateFormatStr.replace('2021', 'yyyy');
    const paramDate = new Date(dateIsoString.replace(/-/g, '/'));
    return dateFormat(paramDate, dateFormatStr);
}
