require('dotenv').config();
const mongoose = require('mongoose');

// Cargar esquemas desde modelos existentes
const UserModel = require('../models/User');
const EmployeeModel = require('../models/Employee');
const AttendanceModel = require('../models/Attendance');
const DisciplinaryModel = require('../models/Disciplinary');
const EmployeeAccountModel = require('../models/EmployeeAccount');
const EmployeeAccountTxModel = require('../models/EmployeeAccountTransaction');
const EmployeeEventModel = require('../models/EmployeeEvent');
const PayrollReceiptModel = require('../models/PayrollReceipt');
const PresentismoRecipientModel = require('../models/PresentismoRecipient');

const schemas = {
  User: UserModel.schema,
  Employee: EmployeeModel.schema,
  Attendance: AttendanceModel.schema,
  Disciplinary: DisciplinaryModel.schema,
  EmployeeAccount: EmployeeAccountModel.schema,
  EmployeeAccountTransaction: EmployeeAccountTxModel.schema,
  EmployeeEvent: EmployeeEventModel.schema,
  PayrollReceipt: PayrollReceiptModel.schema,
  PresentismoRecipient: PresentismoRecipientModel.schema,
};

async function main() {
  const baseUri = process.env.MONGO_URI || 'mongodb://localhost:27017';
  const srcDbName = process.env.SRC_DB || 'test';
  const dstDbName = process.env.DST_DB || 'empleados_db';

  // Conectar al cluster (una vez) y obtener conexiones a ambas bases
  await mongoose.connect(baseUri, { serverSelectionTimeoutMS: 6000, connectTimeoutMS: 6000 });
  const connDefault = mongoose.connection;
  const connSrc = connDefault.useDb(srcDbName, { useCache: true });
  const connDst = connDefault.useDb(dstDbName, { useCache: true });

  const results = {};
  for (const [name, schema] of Object.entries(schemas)) {
    const SrcModel = connSrc.model(name, schema);
    const DstModel = connDst.model(name, schema);
    const [srcCount, dstCount] = await Promise.all([SrcModel.countDocuments(), DstModel.countDocuments()]);
    results[name] = { [srcDbName]: srcCount, [dstDbName]: dstCount };
  }

  console.log('[DB COUNTS]', JSON.stringify({ baseUri, srcDbName, dstDbName, results }, null, 2));
  await mongoose.disconnect();
}

main().catch(async (e) => {
  console.error('[ERROR] checkDbCounts:', e.message);
  try { await mongoose.disconnect(); } catch (_) {}
  process.exit(1);
});