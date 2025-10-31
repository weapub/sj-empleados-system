const Employee = require('../models/Employee');
const EmployeeAccount = require('../models/EmployeeAccount');
const EmployeeAccountTransaction = require('../models/EmployeeAccountTransaction');

// Util: obtener o crear cuenta
async function getOrCreateAccount(employeeId) {
  let account = await EmployeeAccount.findOne({ employee: employeeId });
  if (!account) {
    account = new EmployeeAccount({ employee: employeeId, balance: 0, weeklyDeductionAmount: 0 });
    await account.save();
  }
  return account;
}

// GET /api/account/employee/:employeeId
exports.getAccountByEmployee = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const employee = await Employee.findById(employeeId);
    if (!employee) return res.status(404).json({ msg: 'Empleado no encontrado' });

    const account = await getOrCreateAccount(employeeId);
    const transactions = await EmployeeAccountTransaction.find({ employee: employeeId }).sort({ date: -1 });

    res.json({ account, transactions });
  } catch (error) {
    console.error('[Account] getAccountByEmployee error:', error);
    res.status(500).json({ msg: 'Error en el servidor' });
  }
};

// PUT /api/account/employee/:employeeId/weekly-deduction
exports.updateWeeklyDeduction = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { weeklyDeductionAmount } = req.body;
    const amountNum = Number(weeklyDeductionAmount) || 0;

    const employee = await Employee.findById(employeeId);
    if (!employee) return res.status(404).json({ msg: 'Empleado no encontrado' });

    const account = await getOrCreateAccount(employeeId);
    account.weeklyDeductionAmount = Math.max(0, amountNum);
    account.lastUpdated = Date.now();
    await account.save();

    res.json({ msg: 'Deducción semanal actualizada', account });
  } catch (error) {
    console.error('[Account] updateWeeklyDeduction error:', error);
    res.status(500).json({ msg: 'Error en el servidor' });
  }
};

// POST /api/account/purchase
exports.addPurchase = async (req, res) => {
  try {
    const { employeeId, amount, description, date } = req.body;
    const employee = await Employee.findById(employeeId);
    if (!employee) return res.status(404).json({ msg: 'Empleado no encontrado' });

    const amountNum = Number(amount);
    if (!amountNum || amountNum <= 0) return res.status(400).json({ msg: 'Monto inválido' });

    const account = await getOrCreateAccount(employeeId);
    let txDate = date ? new Date(date) : undefined;
    if (txDate && isNaN(txDate.getTime())) txDate = undefined;
    const tx = new EmployeeAccountTransaction({ employee: employeeId, type: 'purchase', amount: amountNum, description, date: txDate });
    await tx.save();

    account.balance = (account.balance || 0) + amountNum;
    account.lastUpdated = Date.now();
    await account.save();

    res.status(201).json({ msg: 'Compra registrada', account, transaction: tx });
  } catch (error) {
    console.error('[Account] addPurchase error:', error);
    res.status(500).json({ msg: 'Error en el servidor' });
  }
};

// POST /api/account/payment
exports.addPayment = async (req, res) => {
  try {
    const { employeeId, amount, description, date } = req.body;
    const employee = await Employee.findById(employeeId);
    if (!employee) return res.status(404).json({ msg: 'Empleado no encontrado' });

    const amountNum = Number(amount);
    if (!amountNum || amountNum <= 0) return res.status(400).json({ msg: 'Monto inválido' });

    const account = await getOrCreateAccount(employeeId);
    let txDate = date ? new Date(date) : undefined;
    if (txDate && isNaN(txDate.getTime())) txDate = undefined;
    const tx = new EmployeeAccountTransaction({ employee: employeeId, type: 'payment', amount: amountNum, description, date: txDate });
    await tx.save();

    account.balance = Math.max(0, (account.balance || 0) - amountNum);
    account.lastUpdated = Date.now();
    await account.save();

    res.status(201).json({ msg: 'Pago registrado', account, transaction: tx });
  } catch (error) {
    console.error('[Account] addPayment error:', error);
    res.status(500).json({ msg: 'Error en el servidor' });
  }
};

// Utilizado por nómina: registrar deducción automática
exports.applyPayrollDeduction = async (employeeId, period, baseNet) => {
  try {
    const account = await getOrCreateAccount(employeeId);
    const toDeduct = Math.min(account.weeklyDeductionAmount || 0, account.balance || 0);
    const applied = Math.max(0, toDeduct);
    if (applied > 0) {
      const tx = new EmployeeAccountTransaction({
        employee: employeeId,
        type: 'payroll_deduction',
        amount: applied,
        description: `Deducción automática periodo ${period}`
      });
      await tx.save();

      account.balance = Math.max(0, (account.balance || 0) - applied);
      account.lastUpdated = Date.now();
      await account.save();
    }
    const netAfter = Math.max(0, (Number(baseNet) || 0) - applied);
    return { applied, netAfter };
  } catch (error) {
    console.error('[Account] applyPayrollDeduction error:', error);
    // Si falla, no aplicar deducción y devolver neto base
    return { applied: 0, netAfter: Number(baseNet) || 0 };
  }
};