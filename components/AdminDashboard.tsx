
import React, { useState, useEffect } from 'react';
import { Store, AdminUser } from '../types';
import { storeService } from '../services/storeService';
import { authService } from '../services/authService';
import { geocodeAddress } from '../services/geminiService';
import { CATEGORIES } from '../constants';
import { Plus, Edit, Trash2, ArrowLeft, LogOut, Save, MapPin, Search, Loader2, Users, UserPlus, Shield } from 'lucide-react';

interface AdminDashboardProps {
  stores: Store[];
  onUpdate: () => void;
  onLogout: () => void;
  onBack: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ stores, onUpdate, onLogout, onBack }) => {
  const [activeTab, setActiveTab] = useState<'stores' | 'admins'>('stores');
  const [isEditing, setIsEditing] = useState(false);
  const [currentStore, setCurrentStore] = useState<Partial<Store> | null>(null);
  const [isGeocoding, setIsGeocoding] = useState(false);
  
  // Admin account management states
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [showAddAdmin, setShowAddAdmin] = useState(false);
  const [newAdmin, setNewAdmin] = useState<AdminUser>({ username: '', password: '', email: '' });

  useEffect(() => {
    setAdminUsers(authService.getAdmins());
  }, []);

  const handleAddNewStore = () => {
    setCurrentStore({
      id: Date.now().toString(),
      name: '',
      address: '',
      phone: '',
      hours: '09:00 - 20:00',
      category: CATEGORIES[0], // Usa la primera categoría disponible ('Alimento Seco')
      lat: 40.4168,
      lng: -3.7038
    });
    setIsEditing(true);
  };

  const handleEditStore = (store: Store) => {
    setCurrentStore(store);
    setIsEditing(true);
  };

  const handleDeleteStore = (id: string) => {
    if (window.confirm('¿Está seguro de que desea eliminar permanentemente esta tienda?')) {
      storeService.deleteStore(id);
      // Notificar al componente padre para que refresque la lista de tiendas
      onUpdate();
    }
  };

  const handleSmartGeocode = async () => {
    if (!currentStore?.address) return;
    setIsGeocoding(true);
    try {
      const result = await geocodeAddress(currentStore.address);
      setCurrentStore(prev => ({
        ...prev,
        address: result.formattedAddress,
        lat: result.lat,
        lng: result.lng
      }));
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsGeocoding(false);
    }
  };

  const handleSaveStore = () => {
    if (!currentStore?.name || !currentStore?.address) {
      alert('Nombre y dirección son requeridos');
      return;
    }
    storeService.saveStore(currentStore as Store);
    setIsEditing(false);
    setCurrentStore(null);
    onUpdate();
  };

  const handleAddAdmin = () => {
    try {
      if (!newAdmin.username || !newAdmin.password || !newAdmin.email) {
        alert("Todos los campos son obligatorios");
        return;
      }
      authService.addAdmin(newAdmin);
      setAdminUsers(authService.getAdmins());
      setNewAdmin({ username: '', password: '', email: '' });
      setShowAddAdmin(false);
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleDeleteAdmin = (username: string) => {
    if (window.confirm(`¿Desea eliminar el usuario admin: ${username}?`)) {
      try {
        authService.deleteAdmin(username);
        setAdminUsers(authService.getAdmins());
      } catch (e: any) {
        alert(e.message);
      }
    }
  };

  const renderStoreManagement = () => (
    isEditing ? (
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50">
          <h2 className="text-lg font-bold text-gray-800">
            {currentStore?.id ? 'Editar Tienda' : 'Nueva Tienda'}
          </h2>
          <button onClick={() => setIsEditing(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
            Cancelar
          </button>
        </div>
        
        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nombre de la Tienda</label>
              <input 
                type="text" 
                value={currentStore?.name} 
                onChange={e => setCurrentStore({...currentStore, name: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                placeholder="Ej. Mi Tienda Principal"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Dirección Completa</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={currentStore?.address} 
                  onChange={e => setCurrentStore({...currentStore, address: e.target.value})}
                  className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  placeholder="Calle, Número, Ciudad"
                />
                <button 
                  onClick={handleSmartGeocode}
                  disabled={isGeocoding}
                  className="flex items-center justify-center gap-2 px-4 bg-gray-800 text-white rounded-xl hover:bg-black disabled:opacity-50 transition-all text-sm font-medium whitespace-nowrap"
                >
                  {isGeocoding ? <Loader2 className="animate-spin" size={18} /> : <Search size={18} />}
                  Geolocalizar
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Latitud</label>
                <input 
                  type="number" step="any"
                  value={currentStore?.lat} 
                  onChange={e => setCurrentStore({...currentStore, lat: parseFloat(e.target.value)})}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Longitud</label>
                <input 
                  type="number" step="any"
                  value={currentStore?.lng} 
                  onChange={e => setCurrentStore({...currentStore, lng: parseFloat(e.target.value)})}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none"
                />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Categoría</label>
              <select 
                value={currentStore?.category} 
                onChange={e => setCurrentStore({...currentStore, category: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none appearance-none bg-white"
              >
                {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Teléfono</label>
              <input 
                type="text" value={currentStore?.phone} 
                onChange={e => setCurrentStore({...currentStore, phone: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Horario</label>
              <input 
                type="text" value={currentStore?.hours} 
                onChange={e => setCurrentStore({...currentStore, hours: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none"
              />
            </div>
          </div>
        </div>

        <div className="p-6 bg-gray-50 flex items-center justify-end gap-3 border-t border-gray-100">
          <button 
            onClick={() => setIsEditing(false)}
            className="px-6 py-2.5 text-gray-600 font-semibold hover:bg-gray-200 rounded-xl transition-all"
          >
            Descartar
          </button>
          <button 
            onClick={handleSaveStore}
            className="flex items-center gap-2 px-8 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg transition-all"
          >
            <Save size={20} />
            Guardar Tienda
          </button>
        </div>
      </div>
    ) : (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Gestión de Tiendas</h2>
            <p className="text-gray-500">Hay {stores.length} puntos de venta registrados.</p>
          </div>
          <button 
            onClick={handleAddNewStore}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-xl shadow-blue-100 transition-all"
          >
            <Plus size={20} />
            Nueva Tienda
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Tienda</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Categoría</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {stores.map(store => (
                <tr key={store.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-gray-900">{store.name}</div>
                    <div className="text-sm text-gray-500">{store.address}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-blue-50 text-blue-600 text-[10px] font-bold uppercase rounded-md">
                      {store.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => handleEditStore(store)} 
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                        title="Editar tienda"
                      >
                        <Edit size={18} />
                      </button>
                      <button 
                        onClick={() => handleDeleteStore(store.id)} 
                        className="p-2 text-red-400 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all"
                        title="Eliminar tienda"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {stores.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center text-gray-400">
                    No hay tiendas disponibles.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    )
  );

  const renderAdminManagement = () => (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Cuentas de Administración</h2>
          <p className="text-gray-500">Administre quién tiene acceso al panel de control.</p>
        </div>
        {!showAddAdmin && (
          <button 
            onClick={() => setShowAddAdmin(true)}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-black transition-all shadow-xl shadow-gray-200"
          >
            <UserPlus size={20} />
            Nuevo Administrador
          </button>
        )}
      </div>

      {showAddAdmin && (
        <div className="bg-gray-50 p-6 rounded-2xl border-2 border-dashed border-gray-200 animate-in fade-in slide-in-from-top-4">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-gray-900">Crear Nueva Cuenta</h3>
            <button onClick={() => setShowAddAdmin(false)} className="text-gray-400 hover:text-gray-600 text-sm">Cancelar</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input 
              type="text" placeholder="Usuario" value={newAdmin.username}
              onChange={e => setNewAdmin({...newAdmin, username: e.target.value})}
              className="px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
            />
            <input 
              type="email" placeholder="Email" value={newAdmin.email}
              onChange={e => setNewAdmin({...newAdmin, email: e.target.value})}
              className="px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
            />
            <input 
              type="password" placeholder="Contraseña" value={newAdmin.password}
              onChange={e => setNewAdmin({...newAdmin, password: e.target.value})}
              className="px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
            />
          </div>
          <button 
            onClick={handleAddAdmin}
            className="mt-6 px-8 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
          >
            Crear Cuenta
          </button>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Usuario</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {adminUsers.map(admin => (
              <tr key={admin.username} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 flex items-center gap-3">
                  <div className="p-2 bg-gray-100 rounded-lg text-gray-500">
                    <Shield size={16} />
                  </div>
                  <span className="font-bold text-gray-900">{admin.username}</span>
                </td>
                <td className="px-6 py-4 text-gray-600 text-sm">
                  {admin.email}
                </td>
                <td className="px-6 py-4 text-right">
                  <button 
                    onClick={() => handleDeleteAdmin(admin.username)}
                    disabled={adminUsers.length <= 1}
                    className="p-2 text-red-400 hover:text-red-700 hover:bg-red-50 disabled:opacity-30 rounded-lg transition-all"
                    title="Eliminar administrador"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors">
              <ArrowLeft size={20} />
            </button>
            <div className="hidden md:flex items-center gap-1">
              <button 
                onClick={() => setActiveTab('stores')}
                className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'stores' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-100'}`}
              >
                Tiendas
              </button>
              <button 
                onClick={() => setActiveTab('admins')}
                className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'admins' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-100'}`}
              >
                Administradores
              </button>
            </div>
          </div>
          <button 
            onClick={onLogout}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-lg transition-all"
          >
            <LogOut size={18} />
            Salir
          </button>
        </div>
        {/* Mobile Tabs */}
        <div className="md:hidden flex border-t border-gray-100">
          <button 
            onClick={() => setActiveTab('stores')}
            className={`flex-1 py-3 text-sm font-bold text-center ${activeTab === 'stores' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-400'}`}
          >
            Tiendas
          </button>
          <button 
            onClick={() => setActiveTab('admins')}
            className={`flex-1 py-3 text-sm font-bold text-center ${activeTab === 'admins' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-400'}`}
          >
            Admins
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 pt-8">
        {activeTab === 'stores' ? renderStoreManagement() : renderAdminManagement()}
      </main>
    </div>
  );
};

export default AdminDashboard;
