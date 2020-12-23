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

  const getInQuery = 'SELECT * FROM tb_in WHERE id_dompet = $1 AND tgl_in BETWEEN $2 AND $3 ORDER BY tgl_in DESC';

  const values = [
        dompetId,
        tgl1,
        tgl2
  ];
  try {
    const response = await pool.query(getDompetQuery, [user_id, dompetId]);
    const dbResponse = response.rows[0];
    if (!dbResponse) {
        errorMessage.error = 'Dompet tidak ditemukan';
        return res.status(status.notfound).send(errorMessage);
      }
    const {rows} = await pool.query(getInQuery, values);
    const Response = rows;

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
        const response = await pool.query(getDompetQuery, [user_id, id_dompet]);
        const dbResponse = response.rows[0];
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

  const updateIn = async (req, res) => {
    const { inId } = req.params;
    const { tgl_in, jumlah_in, ket_in } = req.body;
  
    const { user_id } = req.user;
    if (empty(tgl_in, jumlah_in)) {
      errorMessage.error = 'Tanggal & jumlah tidak boleh kosong';
      return res.status(status.bad).send(errorMessage);
    }
    const finddompetQuery = 'SELECT a.id_in , a.tgl_in , a.jumlah , b.saldo, b.id_user FROM tb_in a JOIN tb_dompet b on a.id_dompet = b.id_dompet WHERE a.id_in = $1';
    const updateInQuery = `UPDATE tb_in
          SET tgl_in = $1, jumlah = $2, ket_in = $3, updated_at = $4 WHERE id_in = $5 returning *`;
    
    const addSaldoQuery = 'update tb_dompet set saldo = $1, updated_at = $2 where id_dompet  = $3 returning *';
    
    try {
      const { rows } = await pool.query(finddompetQuery, [inId]);
      const dbResponse = rows[0];
      if (!dbResponse) {
        errorMessage.error = 'Dompet tidak ditemukan';
        return res.status(status.notfound).send(errorMessage);
      }
      if (dbResponse.id_user != user_id) {
        errorMessage.error = 'Dompet tidak ditemukan';
        return res.status(status.notfound).send(errorMessage);
      }
      
      var saldo = parseFloat(dbResponse.saldo);
      var in_awal = parseFloat(dbResponse.jumlah);
      var jumlah = parseFloat(jumlah_in);
      var newsaldo = (saldo - in_awal) + jumlah;
      if (newsaldo < 0) {
        errorMessage.error = 'Jumlah saldo tidak mencukupi';
        return res.status(status.notfound).send(errorMessage);
      }

      const update_on = moment(new Date());
      const values = [
        tgl_in,
        jumlah,
        ket_in,
        update_on,
        inId,
      ];
      const response = await pool.query(updateInQuery, values);
      const dbResult = response.rows[0];
      await pool.query(addSaldoQuery,[newsaldo, update_on, dbResult.id_dompet]);

      successMessage.data = dbResult;
      return res.status(status.success).send(successMessage);
    } catch (error) {
      errorMessage.error = 'Operation was not successful';
      return res.status(status.error).send(errorMessage);
    }
  };
  const deleteIn = async (req, res) => {
    const { inId } = req.params;
    const { user_id } = req.user;
    const finddompetQuery = 'SELECT a.id_in , a.tgl_in , a.jumlah , b.saldo, b.id_user FROM tb_in a JOIN tb_dompet b on a.id_dompet = b.id_dompet WHERE a.id_in = $1';
    const deleteInQuery = 'DELETE FROM tb_in WHERE id_in = $1 returning *';
    const addSaldoQuery = 'update tb_dompet set saldo = $1, updated_at = $2 where id_dompet  = $3 returning *';
    try {
      const { rows } = await pool.query(finddompetQuery, [inId]);
      const dbResponse = rows[0];
      if (!dbResponse) {
        errorMessage.error = 'Dompet tidak ditemukan';
        return res.status(status.notfound).send(errorMessage);
      }
      if (dbResponse.id_user != user_id) {
        errorMessage.error = 'Dompet tidak ditemukan';
        return res.status(status.notfound).send(errorMessage);
      }
      var saldo = parseFloat(dbResponse.saldo);
      var in_awal = parseFloat(dbResponse.jumlah);
      var newsaldo = saldo - in_awal;
      if (newsaldo < 0) {
          errorMessage.error = 'Saldo tidak mencukupi';
          return res.status(status.notfound).send(errorMessage);
        }
        const update_on = moment(new Date());
        const response = await pool.query(deleteInQuery, [inId]);
        const dbResult = response.rows[0];
     
      await pool.query(addSaldoQuery,[newsaldo, update_on, dbResult.id_dompet]);

      successMessage.data = {};
      successMessage.data.message = 'Hapus pemasukan berhasil';
      return res.status(status.success).send(successMessage);
    } catch (error) {
      return res.status(status.error).send(error);
    }
  };
module.exports = {
  createIn,
  getAllIn,
  getIn,
  updateIn,
  deleteIn,
};