CREATE TABLE IF NOT EXISTS tb_out (
    id_out UUID PRIMARY KEY,
    id_dompet UUID REFERENCES tb_dompet(id_dompet) ON DELETE CASCADE,
    tgl_out DATE NOT NULL,
    jumlah NUMERIC(18,2) NOT NULL,
    ket_out VARCHAR(100),
    created_at TIMESTAMP,
    updated_at TIMESTAMP
    );