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
  if (isEmpty(id_dompet) || isEmpty(jumlah) || isEmpty(tgl)) {
    errorMessage.error = 'ID dompet, tanggal, jumlah tidak boleh kosong';
    return res.status(status.bad).send(errorMessage);
  }
  const created_on = moment(new Date());
  const finddompetQuery = 'SELECT * FROM tb_dompet WHERE id_dompet = $1';

  if (empty(id_dompet)) {
    errorMessage.error = 'Id dompet tidak boleh kosong';
    return res.status(status.bad).send(errorMessage);
  }
  const finddompetQuery = 'SELECT * FROM tb_dompet WHERE id_dompet = $1 AND id_user = $2';
  const id = uuidv4();
  const createInQuery = `INSERT INTO
      tb_in (id_in, id_dompet, tgl_in, jumlah, ket_in, created_at)
      VALUES($1, $2, $3, $4, $5, $6)
      returning *`;
  const addSaldoQuery = 'UPDATE tb_dompet SET saldo = $1 WHERE id_dompet = $2';
  const values = [
    id,
    id_dompet,
    tgl,
    jumlah,
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
    var saldo = dbResponse.saldo;
    const { rows } = await pool.query(createInQuery, values);
    const dbResponse = rows[0];
    var jumlahIn = dbResponse.jumlah;
    var total = saldo + jumlahIn;
    const { rows } = await pool.query(addSaldoQuery, [total, id_dompet]);
    successMessage.data = dbResponse;
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
      const { rows } = await pool.query(getInQuery, values);
    const dbResponse = rows;

      successMessage.data = dbResponse;
      return res.status(status.success).send(successMessage);
  } catch (error) {
    errorMessage.error = 'Operation was not successful';
    return res.status(status.error).send(errorMessage);
  }
};

const getDompet = async (req, res) => {
    const {id_dompet} = req.body;
    const { user_id } = req.user;
   
    const getDompetQuery = 'SELECT * FROM tb_dompet WHERE id_user = $1 AND id_dompet = $2';
    try {
      const { rows } = await pool.query(getDompetQuery, [user_id, id_dompet]);
      const dbResponse = rows[0];
      if (!dbResponse) {
          errorMessage.error = 'Dompet tidak ditemukan';
          return res.status(status.notfound).send(errorMessage);
        }
        successMessage.data = dbResponse;
        return res.status(status.success).send(successMessage);
    } catch (error) {
      errorMessage.error = 'Operation was not successful';
      return res.status(status.error).send(errorMessage);
    }
  };

  const updateDompet = async (req, res) => {
    const { dompetId } = req.params;
    const { nama_dompet } = req.body;
  
    const { user_id } = req.user;
    if (empty(dompetId)) {
      errorMessage.error = 'ID dompet belum ada';
      return res.status(status.bad).send(errorMessage);
    }
    const finddompetQuery = 'SELECT * FROM tb_dompet WHERE id_dompet = $1';
    const updateDompet = `UPDATE tb_dompet
          SET nama_dompet = $1, updated_at = $2 WHERE id_user = $3 AND id_dompet = $4 returning *`;
    try {
      const { rows } = await pool.query(finddompetQuery, [dompetId]);
      const dbResponse = rows[0];
      if (!dbResponse) {
        errorMessage.error = 'Dompet tidak ditemukan';
        return res.status(status.notfound).send(errorMessage);
      }
      const update_on = moment(new Date());
      const values = [
        nama_dompet,
        update_on,
        user_id,
        dompetId,
      ];
      const response = await pool.query(updateDompet, values);
      const dbResult = response.rows[0];
      
      successMessage.data = dbResult;
      return res.status(status.success).send(successMessage);
    } catch (error) {
      errorMessage.error = 'Operation was not successful';
      return res.status(status.error).send(errorMessage);
    }
  };

  const deleteDompet = async (req, res) => {
    const { dompetId } = req.params;
    const { user_id } = req.user;
    const deleteDompetQuery = 'DELETE FROM tb_dompet WHERE id_dompet = $1 AND id_user = $2 returning *';
    try {
      const { rows } = await pool.query(deleteDompetQuery, [dompetId, user_id]);
      const dbResponse = rows[0];
      if (!dbResponse) {
        errorMessage.error = 'Dompet tidak ditemukan';
        return res.status(status.notfound).send(errorMessage);
      }
      successMessage.data = {};
      successMessage.data.message = 'Hapus dompet berhasil';
      return res.status(status.success).send(successMessage);
    } catch (error) {
      return res.status(status.error).send(error);
    }
  };


module.exports = {
  createDompet,
  getAllDompet,
  getDompet,
  updateDompet,
  deleteDompet,
};