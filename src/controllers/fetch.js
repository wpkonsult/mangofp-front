/*globals RESOURCES:false */
import axios from 'axios';

const ROOT_URL = RESOURCES['adminUrl'];

async function fetchLabels() {
    const res = await axios.get(ROOT_URL + '/labels');
    if (!res || res.status !== 200) {
        throw new Error('Unable to read data');
    }

    if (!('labels' in res.data) || !Array.isArray(res.data.labels)) {
        console.log(JSON.stringify(res));
        throw new Error('No labels found in response');
    }

    const labels = [];
    res.data.labels.forEach(element => {
        labels.push({ id: element.id, name: element.name });
    });

    return labels;
}

export { fetchLabels };
