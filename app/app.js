"use strict";

const express = require('express'),
    bent = require('bent'),
    fs = require('fs').promises;

async function main() {
    const app = express()
    const port = 3000

    // Lookup Supervisor config
    const suconfig = await bent({'Authorization': `Bearer: ${process.env.SUPERVISOR_TOKEN}`}, 'json')('http://supervisor/addons/self/info');

    // Lookup Add-on config
    const aoconfig = JSON.parse(await fs.readFile('/data/options.json', 'utf8'));

    if (suconfig.data.ingress === true) {
        app.listen(suconfig.data.ingress_port, () => {
            console.log(`Example app listening on port ${port}`)
        });
    }

    app.get('/', async (req, res) => {
        const read_state = await bent({'Authorization': `Bearer: ${process.env.SUPERVISOR_TOKEN}`}, 'json')(`http://supervisor/core/api/states/${aoconfig.read_sensor}`);
        const write_state = await bent({ 'Authorization': `Bearer: ${process.env.SUPERVISOR_TOKEN}` }, 'json')(`http://supervisor/core/api/states/${aoconfig.write_sensor}`);
        res.send(`Input state: ${read_state.state}\nOutput state: ${write_state.state}`);
//        res.send(`Bearer: ${process.env.SUPERVISOR_TOKEN}`);
    })

    // Configure service
    setInterval(async function() {
        const state = await bent({'Authorization': `Bearer: ${process.env.SUPERVISOR_TOKEN}`}, 'json')(`http://supervisor/core/api/states/${aoconfig.read_sensor}`);
        let new_state = Object.assign({}, state);
        new_state.state = state.state.split('').reverse().join('');
        await bent('POST', {'Authorization': `Bearer: ${process.env.SUPERVISOR_TOKEN}`}, 'json', 200, 201)(`http://supervisor/core/api/states/${aoconfig.write_sensor}`, new_state);
    }, aoconfig.poll_interval * 1000);

}

main();
