CREATE TABLE IF NOT EXISTS tb_in (
    id_in UUID PRIMARY KEY,
    id_dompet UUID REFERENCES tb_dompet(id_dompet) ON DELETE CASCADE,
    tgl_in DATE NOT NULL,
    jumlah NUMERIC(18,2) NOT NULL,
    ket_in VARCHAR(100),
    created_at TIMESTAMP,
    updated_at TIMESTAMP
    );