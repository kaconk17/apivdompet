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
const createDompet = async (req, res) => {
  const {
    nama_dompet,
  } = req.body;

  const created_on = moment(new Date());
  if (empty(nama_dompet)) {
    errorMessage.error = 'Nama dompet tidak boleh kosong';
    return res.status(status.bad).send(errorMessage);
  }

  const id = uuidv4();
  const {user_id} = req.user;
  const createDompetQuery = `INSERT INTO
      tb_dompet(id_dompet, id_user, nama_dompet, saldo, created_at)
      VALUES($1, $2, $3, $4, $5)
      returning *`;
  const values = [
    id,
    user_id,
    nama_dompet,
    0,
    created_on,
  ];

  try {
    const { rows } = await pool.query(createDompetQuery, values);
    const dbResponse = rows[0];
    successMessage.data = dbResponse;
    return res.status(status.created).send(successMessage);
  } catch (error) {
    errorMessage.error = 'Create dompet gagal';
    return res.status(status.error).send(errorMessage);
  }
};

/**
   * Signin
   * @param {object} req
   * @param {object} res
   * @returns {object} user object
   */

const getAllDompet = async (req, res) => {
  const { user_id } = req.user;
 
  const getDompetQuery = 'SELECT * FROM tb_dompet WHERE id_user = $1 ORDER BY nama_dompet ASC';
  try {
    const { rows } = await pool.query(getDompetQuery, [user_id]);
    const dbResponse = rows;
    if (dbResponse[0] === undefined) {
        errorMessage.error = 'Anda belum punya dompet';
        return res.status(status.notfound).send(errorMessage);
      }
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
    const finddompetQuery = 'SELECT * FROM tb_dompet WHERE id_dompet = $1 AND id_user = $2';
    const updateDompet = `UPDATE tb_dompet
          SET nama_dompet = $1, updated_at = $2 WHERE id_user = $3 AND id_dompet = $4 returning *`;
    try {
      const { rows } = await pool.query(finddompetQuery, [dompetId, user_id]);
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

  const getHistory = async (req, res) => {
    const { dompetId } = req.params;
  const { user_id } = req.user;
 const {tgl1, tgl2} = req.body;

 if (isEmpty(dompetId)) {
    errorMessage.error = 'ID dompet tidak valid';
    return res.status(status.bad).send(errorMessage);
  }
 if (isEmpty(tgl1) || isEmpty(tgl2)) {
    errorMessage.error = 'Periode tanggal tidak boleh kosong';
    return res.status(status.bad).send(errorMessage);
  }
  const getDompetQuery = 'SELECT * FROM tb_dompet WHERE id_user = $1 AND id_dompet = $2';

  const getallQuery = "SELECT id_dompet, tgl_in as tgl, ket_in as ket, jumlah as jumlah, 'IN' as jenis FROM tb_in WHERE id_dompet = $1 AND tgl_in BETWEEN $2 AND $3  UNION ALL SELECT id_dompet, tgl_out as tgl, ket_out as ket, jumlah as jumlah, 'OUT' as jenis FROM tb_out WHERE id_dompet = $1 AND tgl_out BETWEEN $2 AND $3 ORDER BY tgl ASC";

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
    
    const {rows} = await pool.query(getallQuery, values);
    const Response = rows;

      successMessage.data = Response;
      return res.status(status.success).send(successMessage);
  } catch (error) {
    errorMessage.error = 'Operation was not successful';
    return res.status(status.error).send(errorMessage);
  }
};


module.exports = {
  createDompet,
  getAllDompet,
  getDompet,
  updateDompet,
  deleteDompet,
  getHistory,
};