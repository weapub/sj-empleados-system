const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5001;
const DATA_DIR = path.join(__dirname, 'data');

function readJson(fileName, defaultValue) {
  const p = path.join(DATA_DIR, fileName);
  if (!fs.existsSync(p)) {
    return defaultValue !== undefined ? defaultValue : [];
  }
  try {
    const raw = fs.readFileSync(p, 'utf-8');
    return raw ? JSON.parse(raw) : (defaultValue !== undefined ? defaultValue : []);
  } catch (e) {
    console.error('Error leyendo', fileName, e);
    return defaultValue !== undefined ? defaultValue : [];
  }
}

function writeJson(fileName, data) {
  const p = path.join(DATA_DIR, fileName);
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(p, JSON.stringify(data, null, 2));
}

function todayStr() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function ensureSeed() {
  const products = readJson('products.json', []);
  if (!products || products.length === 0) {
    const seedProducts = [
      { id: 'P001', sku: 'AZUC-1K', nombre: 'Azúcar 1kg', unidad: 'kg', precio: 1200, activo: true },
      { id: 'P002', sku: 'YERB-1K', nombre: 'Yerba 1kg', unidad: 'kg', precio: 3200, activo: true },
      { id: 'P003', sku: 'ARRO-1K', nombre: 'Arroz 1kg', unidad: 'kg', precio: 1500, activo: true }
    ];
    writeJson('products.json', seedProducts);
  }
  const clients = readJson('clients.json', []);
  if (!clients || clients.length === 0) {
    const seedClients = [
      { id: 'C001', razonSocial: 'Almacen Don Pepe', cuit: '20-12345678-9', domicilio: 'Av. Siempreviva 742', lat: -31.534, lng: -68.523, zona: 'Centro', condicionPago: 'Contado', vendedorId: 'V001' },
      { id: 'C002', razonSocial: 'Super La Esquina', cuit: '20-87654321-0', domicilio: 'Calle San Martín 100', lat: -31.538, lng: -68.521, zona: 'Norte', condicionPago: '30 días', vendedorId: 'V002' }
    ];
    writeJson('clients.json', seedClients);
  }
  // Ensure other files exist
  ['orders.json', 'delivery_notes.json', 'payments.json', 'commissions.json'].forEach(f => {
    const val = readJson(f, []);
    if (!val || (Array.isArray(val) && val.length === 0)) {
      writeJson(f, []);
    }
  });
}

ensureSeed();

// Helpers
function nextNumber(prefix, collection) {
  const count = collection.length + 1;
  return `${prefix}-${String(count).padStart(5, '0')}`;
}

// Endpoints
app.get('/health', (req, res) => {
  res.json({ status: 'ok', date: new Date().toISOString() });
});

app.get('/productos', (req, res) => {
  const products = readJson('products.json', []);
  res.json(products);
});

app.get('/clientes', (req, res) => {
  const clients = readJson('clients.json', []);
  res.json(clients);
});

app.get('/pedidos', (req, res) => {
  const { fecha } = req.query;
  const orders = readJson('orders.json', []);
  const filtered = fecha ? orders.filter(o => o.fecha === fecha) : orders;
  res.json(filtered);
});

app.post('/pedidos', (req, res) => {
  try {
    const orders = readJson('orders.json', []);
    const products = readJson('products.json', []);
    const { clienteId, vendedorId, items, fecha, observaciones } = req.body;
    if (!clienteId || !vendedorId || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Datos inválidos: cliente, vendedor e items son requeridos.' });
    }
    const dateStr = fecha || todayStr();
    // Enriquecer items con precio del producto si no viene
    const enrichedItems = items.map(it => {
      const prod = products.find(p => p.id === it.productoId);
      const precio = it.precio != null ? it.precio : (prod ? prod.precio : 0);
      const descuento = it.descuento != null ? it.descuento : 0;
      return { productoId: it.productoId, cantidad: Number(it.cantidad || 0), precio, descuento };
    });
    const total = enrichedItems.reduce((acc, it) => acc + (it.precio * it.cantidad * (1 - (it.descuento || 0))), 0);
    const numero = nextNumber('P', orders);
    const order = {
      id: uuidv4(),
      numero,
      clienteId,
      vendedorId,
      items: enrichedItems,
      total,
      estado: 'Confirmado',
      fecha: dateStr,
      observaciones: observaciones || ''
    };
    orders.push(order);
    writeJson('orders.json', orders);
    res.status(201).json(order);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Error creando pedido' });
  }
});

app.get('/picking', (req, res) => {
  const { fecha } = req.query;
  if (!fecha) return res.status(400).json({ error: 'fecha requerida (YYYY-MM-DD)' });
  const orders = readJson('orders.json', []);
  const products = readJson('products.json', []);
  const target = orders.filter(o => o.fecha === fecha && ['Confirmado', 'Facturado'].includes(o.estado));
  const aggregate = {};
  target.forEach(o => {
    o.items.forEach(it => {
      aggregate[it.productoId] = (aggregate[it.productoId] || 0) + Number(it.cantidad || 0);
    });
  });
  const list = Object.entries(aggregate).map(([productoId, cantidadTotal]) => {
    const prod = products.find(p => p.id === productoId);
    return {
      productoId,
      sku: prod ? prod.sku : '',
      nombre: prod ? prod.nombre : '',
      cantidadTotal
    };
  });
  res.json({ fecha, items: list });
});

app.post('/remitos', (req, res) => {
  try {
    const { pedidoId } = req.body;
    if (!pedidoId) return res.status(400).json({ error: 'pedidoId requerido' });
    const orders = readJson('orders.json', []);
    const deliveryNotes = readJson('delivery_notes.json', []);
    const order = orders.find(o => o.id === pedidoId);
    if (!order) return res.status(404).json({ error: 'Pedido no encontrado' });
    const numero = nextNumber('R', deliveryNotes);
    const remito = {
      id: uuidv4(),
      numero,
      pedidoId: order.id,
      clienteId: order.clienteId,
      fecha: todayStr(),
      items: order.items,
      estadoEntrega: 'En Ruta',
      firmaUrl: '',
      fotoEntregaUrl: ''
    };
    deliveryNotes.push(remito);
    writeJson('delivery_notes.json', deliveryNotes);
    res.status(201).json(remito);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Error creando remito' });
  }
});

app.get('/remitos', (req, res) => {
  const { fecha } = req.query;
  const deliveryNotes = readJson('delivery_notes.json', []);
  const filtered = fecha ? deliveryNotes.filter(r => r.fecha === fecha) : deliveryNotes;
  res.json(filtered);
});

app.put('/entregas/:remitoId/estado', (req, res) => {
  try {
    const { remitoId } = req.params;
    const { estado, observaciones, latEntrega, lngEntrega } = req.body;
    const deliveryNotes = readJson('delivery_notes.json', []);
    const idx = deliveryNotes.findIndex(r => r.id === remitoId);
    if (idx === -1) return res.status(404).json({ error: 'Remito no encontrado' });
    deliveryNotes[idx].estadoEntrega = estado || deliveryNotes[idx].estadoEntrega;
    deliveryNotes[idx].observacionesEntrega = observaciones || '';
    if (latEntrega != null && lngEntrega != null) {
      deliveryNotes[idx].latEntrega = latEntrega;
      deliveryNotes[idx].lngEntrega = lngEntrega;
    }
    writeJson('delivery_notes.json', deliveryNotes);
    res.json(deliveryNotes[idx]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Error actualizando entrega' });
  }
});

app.post('/cobros', (req, res) => {
  try {
    const payments = readJson('payments.json', []);
    const { vendedorId, clienteId, fecha, monto, medioPago, remitosIds } = req.body;
    if (!vendedorId || !clienteId || !monto) {
      return res.status(400).json({ error: 'Datos inválidos: vendedorId, clienteId y monto son requeridos' });
    }
    const payment = {
      id: uuidv4(),
      vendedorId,
      clienteId,
      fecha: fecha || todayStr(),
      monto: Number(monto),
      medioPago: medioPago || 'efectivo',
      remitosIds: Array.isArray(remitosIds) ? remitosIds : []
    };
    payments.push(payment);
    writeJson('payments.json', payments);
    res.status(201).json(payment);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Error registrando cobro' });
  }
});

app.get('/cobros', (req, res) => {
  const { vendedorId, desde, hasta } = req.query;
  let payments = readJson('payments.json', []);
  if (vendedorId) payments = payments.filter(p => p.vendedorId === vendedorId);
  if (desde) payments = payments.filter(p => p.fecha >= desde);
  if (hasta) payments = payments.filter(p => p.fecha <= hasta);
  res.json(payments);
});

app.post('/comisiones/calcular', (req, res) => {
  try {
    const { vendedorId, desde, hasta } = req.query;
    if (!desde || !hasta || !vendedorId) {
      return res.status(400).json({ error: 'desde, hasta y vendedorId son requeridos' });
    }
    let payments = readJson('payments.json', []);
    payments = payments.filter(p => p.vendedorId === vendedorId && p.fecha >= desde && p.fecha <= hasta);
    const montoBaseCobrado = payments.reduce((acc, p) => acc + Number(p.monto || 0), 0);
    const porcentaje = 0.05;
    const montoComision = +(montoBaseCobrado * porcentaje).toFixed(2);
    const commissions = readJson('commissions.json', []);
    const record = {
      id: uuidv4(),
      vendedorId,
      periodoDesde: desde,
      periodoHasta: hasta,
      montoBaseCobrado,
      porcentaje,
      montoComision,
      estado: 'pendiente'
    };
    commissions.push(record);
    writeJson('commissions.json', commissions);
    res.json(record);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Error calculando comisiones' });
  }
});

app.listen(PORT, () => {
  console.log(`Wholesale backend escuchando en http://localhost:${PORT}`);
});