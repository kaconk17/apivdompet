const moment = require('moment');

const {pool} = require('../config/connection');

const {
  empty, isEmpty
} = require('../helpers/validations');

const {
  errorMessage, successMessage, status,
}  = require('../helpers/status');

const { v4:uuidv4} = require('uuid');

/**
   * Create A User
   * @param {object} req
   * @param {object} res
   * @returns {object} reflection object
   */
const createIn = async (req, res) => {
  const {
    id_dompet, jumlah, tgl, keterangan
  } = req.body;
  const { user_id } = req.user;
  if (isEmpty(id_dompet) || isEmpty(tgl)) {
      errorMessage.error = 'ID dompet, tanggal, jumlah tidak boleh kosong';
      return res.status(status.bad).send(errorMessage);
    }
    if (empty(jumlah)) {
        errorMessage.error = 'ID dompet, tanggal, jumlah tidak boleh kosong';
      return res.status(status.bad).send(errorMessage);
    }

    var jum = parseFloat(jumlah);
  const created_on = moment(new Date());
  const finddompetQuery = 'SELECT * FROM tb_dompet WHERE id_dompet = $1 AND id_user = $2';
  const id = uuidv4();
  const createInQuery = `INSERT INTO
      tb_in (id_in, id_dompet, tgl_in, jumlah, ket_in, created_at)
      VALUES($1, $2, $3, $4, $5, $6)
      returning *`;
  const addSaldoQuery = 'update tb_dompet set saldo = saldo + t1.jumlah from (select id_dompet ,jumlah from tb_in where id_in = $1 ) as t1 where tb_dompet.id_dompet  = t1.id_dompet returning *';
  const values = [
    id,
    id_dompet,
    tgl,
    jum,
    keterangan,
    created_on,
  ];
  try {
      const { rows } = await pool.query(finddompetQuery, [id_dompet, user_id]); 
    const dbResponse = rows[0];
    if (!dbResponse) {
      errorMessage.error = 'Dompet tidak ditemukan';
      return res.status(status.notfound).send(errorMessage);
    }
    const response = await pool.query(createInQuery, values);
    const Response = response.rows[0];
    await pool.query(addSaldoQuery, [Response.id_in]);

    successMessage.data = Response;
    return res.status(status.created).send(successMessage);
    
  } catch (error) {
    errorMessage.error = 'Create pemasukan gagal';
    return res.status(status.error).send(errorMessage);
  }
};

/**
   * Signin
   * @param {object} req
   * @param {object} res
   * @returns {object} user object
   */

const getAllIn = async (req, res) => {
    const { dompetId } = req.params;
  const { user_id } = req.user;
 const {tgl1, tgl2} = req.body;

 if (isEmpty(tgl1) || isEmpty(tgl2)) {
    errorMessage.error = 'Periode tanggal tidak boleh kosong';
    return res.status(status.bad).send(errorMessage);
  }
  const getDompetQuery = 'SELECT * FROM tb_dompet WHERE id_user = $1 AND id_dompet = $2';

  const getInQuery = 'SELECT * FROM tb_in WHERE id_dompet = $1 AND tgl_in BETWEEN $1 AND $2 ORDER BY tgl_in DESC';

  const values = [
        dompetId,
        tgl1,
        tgl2
  ];
  try {
    const { rows } = await pool.query(getDompetQuery, [user_id, dompetId]);
    const dbResponse = rows[0];
    if (!dbResponse) {
        errorMessage.error = 'Dompet tidak ditemukan';
        return res.status(status.notfound).send(errorMessage);
      }
      const { res } = await pool.query(getInQuery, values);
    const Response = res;

      successMessage.data = Response;
      return res.status(status.success).send(successMessage);
  } catch (error) {
    errorMessage.error = 'Operation was not successful';
    return res.status(status.error).send(errorMessage);
  }
};

const getIn = async (req, res) => {
    const {id_in} = req.body;
    const { user_id } = req.user;
    if (isEmpty(id_in)) {
        errorMessage.error = 'ID tidak boleh kosong';
        return res.status(status.bad).send(errorMessage);
      }
    const getInQuery = 'SELECT * FROM tb_in WHERE id_in = $1';
    try {
      const { rows } = await pool.query(getInQuery, [id_in]);
      const inResponse = rows[0];
      if (!inResponse) {
          errorMessage.error = 'ID tidak valid';
          return res.status(status.notfound).send(errorMessage);
        }
        var id_dompet = inResponse.id_dompet;
        const getDompetQuery = 'SELECT * FROM tb_dompet WHERE id_user = $1 AND id_dompet = $2';
        const { res } = await pool.query(getDompetQuery, [user_id, id_dompet]);
        const dbResponse = res[0];
        if (!dbResponse) {
            errorMessage.error = 'ID tidak valid';
            return res.status(status.notfound).send(errorMessage);
          }
        successMessage.data = inResponse;
        return res.status(status.success).send(successMessage);
    } catch (error) {
      errorMessage.error = 'Operation was not successful';
      return res.status(status.error).send(errorMessage);
    }
  };
module.exports = {
  createIn,
  getAllIn,
  getIn,
};