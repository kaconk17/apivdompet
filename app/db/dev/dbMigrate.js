const {pool} = require('../../config/connection');


pool.on('connect',()=>{
    console.log('berhasil koneksi ke DB');
});

const createUserTable = ()=>{
    const userCreateQuery = 'CREATE TABLE IF NOT EXISTS tb_users (id UUID PRIMARY KEY,nama VARCHAR(100) NOT NULL,email VARCHAR(100) UNIQUE NOT NULL,password VARCHAR(100) NOT NULL,created_at TIMESTAMP,updated_at TIMESTAMP)';

    pool.query(userCreateQuery)
    .then((res)=>{
        console.log(res);
        pool.end();
    })
    .catch((err)=>{
        console.log(err);
        pool.end();
    });
};

const createDompetTable = ()=>{
    const dompetCreateQuery = 'CREATE TABLE IF NOT EXISTS tb_dompet (id_dompet UUID PRIMARY KEY,id_user UUID REFERENCES tb_users(id) ON DELETE CASCADE,nama_dompet VARCHAR(50) NOT NULL,saldo NUMERIC(18,2) NOT NULL,created_at TIMESTAMP,updated_at TIMESTAMP)';

    pool.query(dompetCreateQuery)
    .then((res)=>{
        console.log(res);
        pool.end();
    })
    .catch((err)=>{
        console.log(err);
        pool.end();
    });
};

const createInTable = ()=>{
    const inCreateQuery = 'CREATE TABLE IF NOT EXISTS tb_in (id_in UUID PRIMARY KEY,id_dompet UUID REFERENCES tb_dompet(id_dompet) ON DELETE CASCADE,tgl_in DATE NOT NULL,jumlah NUMERIC(18,2) NOT NULL,ket_in VARCHAR(100),created_at TIMESTAMP,updated_at TIMESTAMP)';

    pool.query(inCreateQuery)
    .then((res)=>{
        console.log(res);
        pool.end();
    })
    .catch((err)=>{
        console.log(err);
        pool.end();
    });
};

const createOutTable = ()=>{
    const outCreateQuery = 'CREATE TABLE IF NOT EXISTS tb_out (id_out UUID PRIMARY KEY,id_dompet UUID REFERENCES tb_dompet(id_dompet) ON DELETE CASCADE,tgl_out DATE NOT NULL,jumlah NUMERIC(18,2) NOT NULL,ket_out VARCHAR(100),created_at TIMESTAMP,updated_at TIMESTAMP)';

    pool.query(outCreateQuery)
    .then((res)=>{
        console.log(res);
        pool.end();
    })
    .catch((err)=>{
        console.log(err);
        pool.end();
    });
};

const dropUserTable = () =>{
    const userDropQuery = 'DROP TABLE IF EXISTS tb_users';
    pool.query(userDropQuery)
    .then((res)=>{
        console.log(res);
        pool.end();
    })
    .catch((err)=>{
        console.log(err);
        pool.end();
    });
};

const dropDompetTable = () =>{
    const dompetDropQuery = 'DROP TABLE IF EXISTS tb_dompet';
    pool.query(dompetDropQuery)
    .then((res)=>{
        console.log(res);
        pool.end();
    })
    .catch((err)=>{
        console.log(err);
        pool.end();
    });
};

const dropInTable = () =>{
    const inDropQuery = 'DROP TABLE IF EXISTS tb_in';
    pool.query(inDropQuery)
    .then((res)=>{
        console.log(res);
        pool.end();
    })
    .catch((err)=>{
        console.log(err);
        pool.end();
    });
};

const dropOutTable = () =>{
    const outDropQuery = 'DROP TABLE IF EXISTS tb_out';
    pool.query(outDropQuery)
    .then((res)=>{
        console.log(res);
        pool.end();
    })
    .catch((err)=>{
        console.log(err);
        pool.end();
    });
};

const createAllTable = () => {
    createUserTable();
    createDompetTable();
    createInTable();
    createOutTable();
};

const dropAllTable = ()=>{
    dropUserTable();
    dropDompetTable();
    dropInTable();
    dropOutTable();
};

pool.on('remove', ()=>{
    console.log('client removed');
    process.exit(0);
});

module.exports = {
    createAllTable,
    dropAllTable,
};

require('make-runnable');