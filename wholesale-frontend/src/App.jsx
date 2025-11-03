import React, { useEffect, useMemo, useState } from 'react';
import './App.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

async function api(path, opts = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...opts,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status}`);
  }
  return res.json();
}

function Section({ title, children }) {
  return (
    <section style={{ border: '1px solid #ddd', borderRadius: 8, padding: 16, marginBottom: 16 }}>
      <h2 style={{ marginTop: 0 }}>{title}</h2>
      {children}
    </section>
  );
}

export default function App() {
  const [productos, setProductos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [fecha, setFecha] = useState(() => new Date().toISOString().slice(0, 10));
  const [pedidos, setPedidos] = useState([]);
  const [picking, setPicking] = useState([]);
  const [remitos, setRemitos] = useState([]);
  const [mensaje, setMensaje] = useState('');

  const [pedidoForm, setPedidoForm] = useState({ clienteId: '', vendedorId: 'V001', items: [] });
  const [nuevoItem, setNuevoItem] = useState({ productoId: '', cantidad: 1 });

  const apiBase = useMemo(() => API_URL, []);

  useEffect(() => {
    const init = async () => {
      try {
        const [prods, clis] = await Promise.all([
          api('/productos'),
          api('/clientes'),
        ]);
        setProductos(prods);
        setClientes(clis);
      } catch (e) {
        console.error(e);
        setMensaje('Error cargando datos iniciales');
      }
    };
    init();
  }, []);

  const cargarPedidos = async () => {
    try {
      const data = await api(`/pedidos?fecha=${fecha}`);
      setPedidos(data);
    } catch (e) {
      console.error(e);
      setMensaje('Error cargando pedidos');
    }
  };

  const cargarRemitos = async () => {
    try {
      const data = await api(`/remitos?fecha=${fecha}`);
      setRemitos(data);
    } catch (e) {
      console.error(e);
      setMensaje('Error cargando remitos');
    }
  };

  const generarPicking = async () => {
    try {
      const data = await api(`/picking?fecha=${fecha}`);
      setPicking(data.items || []);
    } catch (e) {
      console.error(e);
      setMensaje('Error generando picking');
    }
  };

  const agregarItem = () => {
    if (!nuevoItem.productoId) return;
    setPedidoForm(prev => ({ ...prev, items: [...prev.items, { productoId: nuevoItem.productoId, cantidad: Number(nuevoItem.cantidad || 1) }] }));
    setNuevoItem({ productoId: '', cantidad: 1 });
  };

  const crearPedido = async () => {
    try {
      if (!pedidoForm.clienteId || pedidoForm.items.length === 0) {
        setMensaje('Completa cliente y al menos un ítem');
        return;
      }
      const created = await api('/pedidos', { method: 'POST', body: JSON.stringify(pedidoForm) });
      setMensaje(`Pedido creado: ${created.numero}`);
      await cargarPedidos();
      await generarPicking();
    } catch (e) {
      console.error(e);
      setMensaje('Error creando pedido');
    }
  };

  const crearRemito = async (pedidoId) => {
    try {
      const created = await api('/remitos', { method: 'POST', body: JSON.stringify({ pedidoId }) });
      setMensaje(`Remito creado: ${created.numero}`);
      await cargarRemitos();
    } catch (e) {
      console.error(e);
      setMensaje('Error creando remito');
    }
  };

  const marcarEntregado = async (remitoId) => {
    try {
      const pos = await new Promise((resolve, reject) => {
        if (!navigator.geolocation) return resolve({ coords: { latitude: null, longitude: null } });
        navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 5000 });
      });
      const lat = pos?.coords?.latitude ?? null;
      const lng = pos?.coords?.longitude ?? null;
      const updated = await api(`/entregas/${remitoId}/estado`, { method: 'PUT', body: JSON.stringify({ estado: 'Entregado', latEntrega: lat, lngEntrega: lng }) });
      setMensaje(`Entrega actualizada: ${updated.estadoEntrega}`);
      await cargarRemitos();
    } catch (e) {
      console.error(e);
      setMensaje('Error marcando entrega');
    }
  };

  const registrarCobro = async (payload) => {
    try {
      const created = await api('/cobros', { method: 'POST', body: JSON.stringify(payload) });
      setMensaje(`Cobro registrado: $${created.monto}`);
    } catch (e) {
      console.error(e);
      setMensaje('Error registrando cobro');
    }
  };

  const calcularComision = async ({ vendedorId, desde, hasta }) => {
    try {
      const record = await api(`/comisiones/calcular?vendedorId=${encodeURIComponent(vendedorId)}&desde=${encodeURIComponent(desde)}&hasta=${encodeURIComponent(hasta)}`);
      setMensaje(`Comisión 5%: $${record.montoComision} (base $${record.montoBaseCobrado})`);
    } catch (e) {
      console.error(e);
      setMensaje('Error calculando comisión');
    }
  };

  useEffect(() => {
    cargarPedidos();
    cargarRemitos();
    generarPicking();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fecha]);

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: 24 }}>
      <h1>Mayorista – Flujo básico</h1>
      <p style={{ color: '#555' }}>Backend: <code>{apiBase}</code></p>
      {mensaje && <p style={{ background: '#f6f6f6', border: '1px solid #ddd', padding: 8 }}>{mensaje}</p>}

      <Section title="Datos iniciales">
        <div style={{ display: 'flex', gap: 24 }}>
          <div style={{ flex: 1 }}>
            <h3>Productos</h3>
            <ul>
              {productos.map(p => (
                <li key={p.id}>{p.sku} – {p.nombre} (${p.precio})</li>
              ))}
            </ul>
          </div>
          <div style={{ flex: 1 }}>
            <h3>Clientes</h3>
            <ul>
              {clientes.map(c => (
                <li key={c.id}>{c.razonSocial} – {c.domicilio} (<a href={`https://maps.google.com/?q=${c.lat},${c.lng}`} target="_blank" rel="noreferrer">mapa</a>)</li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      <Section title="Nuevo Pedido (Preventista)">
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <label>
            Cliente:
            <select value={pedidoForm.clienteId} onChange={e => setPedidoForm(prev => ({ ...prev, clienteId: e.target.value }))}>
              <option value="">Seleccionar...</option>
              {clientes.map(c => <option key={c.id} value={c.id}>{c.razonSocial}</option>)}
            </select>
          </label>
          <label>
            Vendedor:
            <input value={pedidoForm.vendedorId} onChange={e => setPedidoForm(prev => ({ ...prev, vendedorId: e.target.value }))} />
          </label>
        </div>
        <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
          <label>
            Producto:
            <select value={nuevoItem.productoId} onChange={e => setNuevoItem(prev => ({ ...prev, productoId: e.target.value }))}>
              <option value="">Seleccionar...</option>
              {productos.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
            </select>
          </label>
          <label>
            Cantidad:
            <input type="number" min={1} value={nuevoItem.cantidad} onChange={e => setNuevoItem(prev => ({ ...prev, cantidad: e.target.value }))} />
          </label>
          <button onClick={agregarItem}>Agregar ítem</button>
        </div>
        <div style={{ marginTop: 8 }}>
          <strong>Items:</strong>
          <ul>
            {pedidoForm.items.map((it, idx) => (
              <li key={`${it.productoId}-${idx}`}>{productos.find(p => p.id === it.productoId)?.nombre} x {it.cantidad}</li>
            ))}
          </ul>
        </div>
        <button onClick={crearPedido}>Crear Pedido</button>
      </Section>

      <Section title="Picking (Depósito)">
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <label>
            Fecha:
            <input type="date" value={fecha} onChange={e => setFecha(e.target.value)} />
          </label>
          <button onClick={generarPicking}>Actualizar Picking</button>
        </div>
        <table style={{ width: '100%', marginTop: 8 }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left' }}>SKU</th>
              <th style={{ textAlign: 'left' }}>Producto</th>
              <th style={{ textAlign: 'right' }}>Cantidad Total</th>
            </tr>
          </thead>
          <tbody>
            {picking.map(item => (
              <tr key={item.productoId}>
                <td>{item.sku}</td>
                <td>{item.nombre}</td>
                <td style={{ textAlign: 'right' }}>{item.cantidadTotal}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>

      <Section title="Remitos y Entregas (Repartidor)">
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <button onClick={cargarPedidos}>Refrescar Pedidos</button>
          <button onClick={cargarRemitos}>Refrescar Remitos</button>
        </div>
        <div style={{ display: 'flex', gap: 24, marginTop: 8 }}>
          <div style={{ flex: 1 }}>
            <h3>Pedidos del día</h3>
            <ul>
              {pedidos.map(p => (
                <li key={p.id}>
                  {p.numero} – cliente {p.clienteId} – items {p.items.length}
                  <button style={{ marginLeft: 8 }} onClick={() => crearRemito(p.id)}>Crear remito</button>
                </li>
              ))}
            </ul>
          </div>
          <div style={{ flex: 1 }}>
            <h3>Remitos</h3>
            <ul>
              {remitos.map(r => (
                <li key={r.id}>
                  {r.numero} – estado {r.estadoEntrega} – <a href={`https://maps.google.com/?q=${clientes.find(c => c.id === r.clienteId)?.lat},${clientes.find(c => c.id === r.clienteId)?.lng}`} target="_blank" rel="noreferrer">mapa</a>
                  {r.estadoEntrega !== 'Entregado' && (
                    <button style={{ marginLeft: 8 }} onClick={() => marcarEntregado(r.id)}>Marcar entregado</button>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      <CobrosYComisiones clientes={clientes} onRegistrarCobro={registrarCobro} onCalcularComision={calcularComision} />
    </div>
  );
}

function CobrosYComisiones({ clientes, onRegistrarCobro, onCalcularComision }) {
  const [vendedorId, setVendedorId] = useState('V001');
  const [clienteId, setClienteId] = useState('');
  const [monto, setMonto] = useState('');
  const [medioPago, setMedioPago] = useState('efectivo');
  const [desde, setDesde] = useState(() => new Date());
  const [hasta, setHasta] = useState(() => new Date());

  const desdeStr = useMemo(() => new Date(desde).toISOString().slice(0, 10), [desde]);
  const hastaStr = useMemo(() => new Date(hasta).toISOString().slice(0, 10), [hasta]);

  return (
    <Section title="Cobros y Comisión (Preventista)">
      <div style={{ display: 'flex', gap: 24 }}>
        <div style={{ flex: 1 }}>
          <h3>Registrar Cobro</h3>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <label>
              Vendedor:
              <input value={vendedorId} onChange={e => setVendedorId(e.target.value)} />
            </label>
            <label>
              Cliente:
              <select value={clienteId} onChange={e => setClienteId(e.target.value)}>
                <option value="">Seleccionar...</option>
                {clientes.map(c => <option key={c.id} value={c.id}>{c.razonSocial}</option>)}
              </select>
            </label>
            <label>
              Monto:
              <input type="number" min={0} step="0.01" value={monto} onChange={e => setMonto(e.target.value)} />
            </label>
            <label>
              Medio:
              <select value={medioPago} onChange={e => setMedioPago(e.target.value)}>
                <option value="efectivo">Efectivo</option>
                <option value="transferencia">Transferencia</option>
                <option value="QR">QR</option>
                <option value="cheque">Cheque</option>
              </select>
            </label>
            <button onClick={() => onRegistrarCobro({ vendedorId, clienteId, monto: Number(monto), medioPago })}>Registrar</button>
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <h3>Calcular Comisión (5%)</h3>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <label>
              Vendedor:
              <input value={vendedorId} onChange={e => setVendedorId(e.target.value)} />
            </label>
            <label>
              Desde:
              <input type="date" value={desdeStr} onChange={e => setDesde(e.target.value)} />
            </label>
            <label>
              Hasta:
              <input type="date" value={hastaStr} onChange={e => setHasta(e.target.value)} />
            </label>
            <button onClick={() => onCalcularComision({ vendedorId, desde: desdeStr, hasta: hastaStr })}>Calcular</button>
          </div>
        </div>
      </div>
    </Section>
  );
}
