const config = {
    user: 'root',
    password: 'admin',
    server: 'DESKTOP-N2NARG1',
    database: 'session2',
    options: {
        trustServerCertificate: true,
        trustedConnection: false,
        enableArithAbort: true,
        instancename: 'SQLEXPRESS',
        encrypt: false,
    },
    port: 1433
};

export default config;

