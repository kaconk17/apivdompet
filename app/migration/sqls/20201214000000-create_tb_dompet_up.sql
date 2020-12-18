CREATE TABLE IF NOT EXISTS tb_dompet (
    id_dompet UUID PRIMARY KEY,
    id_user UUID REFERENCES tb_users(id) ON DELETE CASCADE,
    nama_dompet VARCHAR(50) NOT NULL,
    saldo NUMERIC(18,2) NOT NULL,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
    );