let hostname, http, port, version;
import AuditLoggerService from './AuditLoggerService';
import EmailSendService from './EmailSendService';
import moment from 'moment';


const httpPost = ({ body, ...options }) => new Promise((resolve, reject) => {
    const req = http.request({
        method: 'POST',
        ...options,
    }, res => {

        const chunks = [];
        res.on('data', data => chunks.push(data));
        res.on('end', () => {
            let body = Buffer.concat(chunks);
            switch (res.headers['content-type']) {
                case 'application/json':
                    body = JSON.parse(body);
                    break;
                default:

            };
            const statusCode = res.statusCode;
            if (statusCode >= 200 && res.statusCode <= 299) {
                resolve(body);
            } else {
                console.error('Invalid response', body.toString());
                reject(body.toString());
            }
        });



    });
    req.on('error', error => {
        console.error('Log error', error);
        reject(error);
    });
    if (body) {
        req.write(body);
    }
    req.end();
});


const init = (_path, _version) => {
    if (_path.startsWith('https://')) {
        http = require('https');
    } else {
        http = require('http');
    }
    const cmpt = _path.replace(/http(s*):\/\//, '').split(':');
    hostname = cmpt[0];
    port = cmpt[1] || 8080;
    version = _version;


};
const logger = ({ object, action, payload, userId, date = Date.now() }) => {
    console.log({ object, action, payload, userId, date });
    return;
    try {
        httpPost({
            hostname,
            port,
            path: '/' + version + '/log',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                object, action, payload, userId, date
            })
        });

    } catch (e) {
        console.error('logger error', e);
    }

};

const toHkTime = t => moment.utc(t).add(8, 'hr').clone();


export {
    AuditLoggerService,
    EmailSendService,
    toHkTime,
    logger,
    init
};

