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
const createOut = async (req, res) => {
  const {
    id_dompet, jumlah, tgl_out, ket_out
  } = req.body;
  const { user_id } = req.user;
  if (isEmpty(id_dompet) || isEmpty(tgl_out)) {
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
  const createOutQuery = `INSERT INTO
      tb_out (id_out, id_dompet, tgl_out, jumlah, ket_out, created_at)
      VALUES($1, $2, $3, $4, $5, $6)
      returning *`;
  const addSaldoQuery = 'update tb_dompet set saldo = $1, updated_at = $2 where id_dompet  = $3 returning *';
  const values = [
    id,
    id_dompet,
    tgl_out,
    jum,
    ket_out,
    created_on,
  ];
  try {
      const { rows } = await pool.query(finddompetQuery, [id_dompet, user_id]); 
    const dbResponse = rows[0];
    if (!dbResponse) {
      errorMessage.error = 'Dompet tidak ditemukan';
      return res.status(status.notfound).send(errorMessage);
    }
    var saldo = parseFloat(dbResponse.saldo);
    var newsaldo = saldo - jum;
    if (newsaldo < 0) {
        errorMessage.error = 'Saldo tidak mencukupi';
      return res.status(status.notfound).send(errorMessage);
    }
    const response = await pool.query(createOutQuery, values);
    const Response = response.rows[0];
    await pool.query(addSaldoQuery, [newsaldo, created_on, id_dompet]);

    successMessage.data = Response;
    return res.status(status.created).send(successMessage);
    
  } catch (error) {
    errorMessage.error = 'Create pengeluaran gagal';
    return res.status(status.error).send(errorMessage);
  }
};

/**
   * Signin
   * @param {object} req
   * @param {object} res
   * @returns {object} user object
   */

const getAllOut = async (req, res) => {
    //const { dompetId } = req.params;
  const { user_id } = req.user;
 const {tgl1, tgl2, dompetid} = req.query;

 if (isEmpty(tgl1) || isEmpty(tgl2)) {
    errorMessage.error = 'Periode tanggal tidak boleh kosong';
    return res.status(status.bad).send(errorMessage);
  }
  const getDompetQuery = 'SELECT * FROM tb_dompet WHERE id_user = $1 AND id_dompet = $2';

  const getOutQuery = 'SELECT * FROM tb_out WHERE id_dompet = $1 AND tgl_out BETWEEN $2 AND $3 ORDER BY tgl_out DESC';

  const values = [
        dompetid,
        tgl1,
        tgl2
  ];
  try {
    const response = await pool.query(getDompetQuery, [user_id, dompetid]);
    const dbResponse = response.rows[0];
    if (!dbResponse) {
        errorMessage.error = 'Dompet tidak ditemukan';
        return res.status(status.notfound).send(errorMessage);
      }
    
    const {rows} = await pool.query(getOutQuery, values);
    const Response = rows;

      successMessage.data = Response;
      return res.status(status.success).send(successMessage);
  } catch (error) {
    errorMessage.error = 'Operation was not successful';
    return res.status(status.error).send(errorMessage);
  }
};

const getOut = async (req, res) => {
    const {outId} = req.params;
    const { user_id } = req.user;
    if (isEmpty(outId)) {
        errorMessage.error = 'ID tidak boleh kosong';
        return res.status(status.bad).send(errorMessage);
      }
    const getOutQuery = 'SELECT * FROM tb_out WHERE id_out = $1';
    try {
      const { rows } = await pool.query(getOutQuery, [outId]);
      const outResponse = rows[0];
      if (!outResponse) {
          errorMessage.error = 'ID tidak valid';
          return res.status(status.notfound).send(errorMessage);
        }
        var id_dompet = outResponse.id_dompet;
        const getDompetQuery = 'SELECT * FROM tb_dompet WHERE id_user = $1 AND id_dompet = $2';
        const response = await pool.query(getDompetQuery, [user_id, id_dompet]);
        const dbResponse = response.rows[0];
        if (!dbResponse) {
            errorMessage.error = 'ID tidak valid';
            return res.status(status.notfound).send(errorMessage);
          }
        successMessage.data = outResponse;
        return res.status(status.success).send(successMessage);
    } catch (error) {
      errorMessage.error = 'Operation was not successful';
      return res.status(status.error).send(errorMessage);
    }
  };

  const updateOut = async (req, res) => {
    const { outId } = req.params;
    const { tgl_out, jumlah, ket_out } = req.body;
  
    const { user_id } = req.user;
    if (empty(tgl_out, jumlah)) {
      errorMessage.error = 'Tanggal & jumlah tidak boleh kosong';
      return res.status(status.bad).send(errorMessage);
    }
    const finddompetQuery = 'SELECT a.id_out , a.tgl_out , a.jumlah , b.saldo, b.id_user FROM tb_out a JOIN tb_dompet b on a.id_dompet = b.id_dompet WHERE a.id_out = $1';
    const updateOutQuery = `UPDATE tb_out
          SET tgl_out = $1, jumlah = $2, ket_out = $3, updated_at = $4 WHERE id_out = $5 returning *`;
    
    const addSaldoQuery = 'update tb_dompet set saldo = $1, updated_at = $2 where id_dompet  = $3 returning *';
    
    try {
      const { rows } = await pool.query(finddompetQuery, [outId]);
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
      var out_awal = parseFloat(dbResponse.jumlah);
      var jum = parseFloat(jumlah);
      var newsaldo = (saldo + out_awal) - jum;
      if (newsaldo < 0) {
        errorMessage.error = 'Jumlah saldo tidak mencukupi';
        return res.status(status.notfound).send(errorMessage);
      }

      const update_on = moment(new Date());
      const values = [
        tgl_out,
        jum,
        ket_out,
        update_on,
        outId,
      ];
      const response = await pool.query(updateOutQuery, values);
      const dbResult = response.rows[0];
      await pool.query(addSaldoQuery,[newsaldo, update_on, dbResult.id_dompet]);

      successMessage.data = dbResult;
      return res.status(status.success).send(successMessage);
    } catch (error) {
      errorMessage.error = 'Operation was not successful';
      return res.status(status.error).send(errorMessage);
    }
  };
  const deleteOut = async (req, res) => {
    const { outId } = req.params;
    const { user_id } = req.user;
    const finddompetQuery = 'SELECT a.id_out , a.tgl_out , a.jumlah , b.saldo, b.id_user, a.id_dompet FROM tb_out a JOIN tb_dompet b on a.id_dompet = b.id_dompet WHERE a.id_out = $1';
    const deleteOutQuery = 'DELETE FROM tb_out WHERE id_out = $1 returning *';
    const addSaldoQuery = 'update tb_dompet set saldo = $1, updated_at = $2 where id_dompet  = $3 returning *';
    try {
      const { rows } = await pool.query(finddompetQuery, [outId]);
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
      var out_awal = parseFloat(dbResponse.jumlah);
      var newsaldo = saldo + out_awal;
      if (newsaldo < 0) {
          errorMessage.error = 'Saldo tidak mencukupi';
          return res.status(status.notfound).send(errorMessage);
        }
        const update_on = moment(new Date());
        await pool.query(deleteOutQuery, [outId]);
        
     
        const response = await pool.query(addSaldoQuery,[newsaldo, update_on, dbResponse.id_dompet]);
        const result = response.rows[0];

      successMessage.data = result;
      //successMessage.data.message = 'Hapus pengeluaran berhasil';
      return res.status(status.success).send(successMessage);
    } catch (error) {
      return res.status(status.error).send(error);
    }
  };
module.exports = {
  createOut,
  getAllOut,
  getOut,
  updateOut,
  deleteOut,
};