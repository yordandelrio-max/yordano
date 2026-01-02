
import React, { useState, useEffect, useMemo } from 'react';
import { Store, AppRoute, Location } from './types';
import { storeService } from './services/storeService';
import { authService } from './services/authService';
import { DEFAULT_CENTER, CATEGORIES } from './constants';
import MapView from './components/MapView';
import StoreCard from './components/StoreCard';
import AdminDashboard from './components/AdminDashboard';
import { Search, Map as MapIcon, ShieldCheck, LogOut, Menu, X, Filter, Info } from 'lucide-react';

// Separate Login Component to follow Rules of Hooks
interface LoginProps {
  onLoginSuccess: () => void;
  onBackToHome: () => void;
  onForgotInfo: () => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess, onBackToHome, onForgotInfo }) => {
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (authService.authenticate(user, pass)) {
      onLoginSuccess();
    } else {
      alert('Credenciales inválidas. Por favor intente nuevamente.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 relative">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
        <div className="flex justify-center mb-6">
          <div className="p-3 bg-blue-100 rounded-full text-blue-600">
            <ShieldCheck size={32} />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-8">Acceso Panel Admin</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Usuario</label>
            <input 
              type="text" value={user} onChange={e => setUser(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              placeholder="Nombre de usuario"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
            <input 
              type="password" value={pass} onChange={e => setPass(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              placeholder="********"
              required
            />
          </div>
          <button type="submit" className="w-full py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-lg">
            Iniciar Sesión
          </button>
          
          <div className="text-center">
            <button 
              type="button" 
              onClick={onForgotInfo}
              className="text-xs text-blue-600 hover:underline font-medium"
            >
              ¿Olvidó su contraseña?
            </button>
          </div>

          <button 
            type="button" 
            onClick={onBackToHome}
            className="w-full py-2 text-gray-500 text-sm font-medium hover:text-gray-800 transition-colors border-t border-gray-100 pt-4"
          >
            Volver al Mapa
          </button>
        </form>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [stores, setStores] = useState<Store[]>([]);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [route, setRoute] = useState<AppRoute>(AppRoute.HOME);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [mapCenter, setMapCenter] = useState<Location>(DEFAULT_CENTER);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showForgotInfo, setShowForgotInfo] = useState(false);

  useEffect(() => {
    setStores(storeService.getStores());
  }, []);

  const filteredStores = useMemo(() => {
    return stores.filter(store => {
      const matchesSearch = store.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          store.address.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === 'All' || store.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [stores, searchQuery, categoryFilter]);

  const handleSelectStore = (store: Store) => {
    setSelectedStore(store);
    setMapCenter({ lat: store.lat, lng: store.lng });
    if (window.innerWidth < 768) {
      setIsMobileMenuOpen(false);
    }
  };

  const handleUseLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        setMapCenter({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
      }, (err) => {
        alert("Could not access your location. Please check permissions.");
      });
    }
  };

  const handleLogout = () => {
    setIsAdminAuthenticated(false);
    setRoute(AppRoute.HOME);
  };

  if (route === AppRoute.ADMIN_LOGIN) {
    return (
      <>
        <Login 
          onLoginSuccess={() => {
            setIsAdminAuthenticated(true);
            setRoute(AppRoute.ADMIN_DASHBOARD);
          }}
          onBackToHome={() => setRoute(AppRoute.HOME)}
          onForgotInfo={() => setShowForgotInfo(true)}
        />
        {showForgotInfo && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
              <div className="flex items-center gap-3 text-blue-600 mb-4">
                <Info size={24} />
                <h3 className="font-bold text-lg text-gray-900">Recuperar Acceso</h3>
              </div>
              <p className="text-sm text-gray-600 mb-6">
                Para recuperar sus credenciales de administración, por favor póngase en contacto con el administrador del sistema:
              </p>
              <div className="space-y-3 bg-gray-50 p-4 rounded-xl border border-gray-100 mb-6 text-sm">
                <div>
                  <span className="block text-[10px] uppercase font-bold text-gray-400">Nombre</span>
                  <p className="font-semibold text-gray-800">Yordan del Rio</p>
                </div>
                <div>
                  <span className="block text-[10px] uppercase font-bold text-gray-400">Email</span>
                  <a href="mailto:ydelrio@tribu.cl" className="text-blue-600 hover:underline">ydelrio@tribu.cl</a>
                </div>
                <div>
                  <span className="block text-[10px] uppercase font-bold text-gray-400">Teléfono</span>
                  <a href="tel:+56993136266" className="text-blue-600 hover:underline">+569 9313 6266</a>
                </div>
              </div>
              <button 
                onClick={() => setShowForgotInfo(false)}
                className="w-full py-2 bg-gray-900 text-white font-bold rounded-lg hover:bg-black transition-colors"
              >
                Entendido
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  if (route === AppRoute.ADMIN_DASHBOARD && isAdminAuthenticated) {
    return (
      <AdminDashboard 
        stores={stores} 
        onUpdate={() => setStores(storeService.getStores())}
        onLogout={handleLogout}
        onBack={() => setRoute(AppRoute.HOME)}
      />
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shadow-sm z-50">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-blue-600 rounded-lg text-white">
            <MapIcon size={20} />
          </div>
          <span className="text-xl font-bold text-gray-900 tracking-tight">GeoFinder<span className="text-blue-600">Pro</span></span>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={() => setRoute(isAdminAuthenticated ? AppRoute.ADMIN_DASHBOARD : AppRoute.ADMIN_LOGIN)}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
          >
            <ShieldCheck size={18} />
            <span className="hidden sm:inline">{isAdminAuthenticated ? 'Panel Admin' : 'Acceso Admin'}</span>
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 flex overflow-hidden flex-col md:flex-row">
        {/* Sidebar / List View */}
        <aside className={`${isMobileMenuOpen ? 'flex' : 'hidden'} md:flex flex-col w-full md:w-[400px] h-full bg-white border-r border-gray-200 z-40`}>
          <div className="p-4 border-b border-gray-100 bg-white sticky top-0 z-10">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Buscar por nombre o dirección..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-xl border-transparent focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm"
              />
            </div>
            
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
              <button 
                onClick={() => setCategoryFilter('All')}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  categoryFilter === 'All' ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Todos
              </button>
              {CATEGORIES.map(cat => (
                <button 
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    categoryFilter === cat ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <button 
              onClick={handleUseLocation}
              className="mt-3 w-full flex items-center justify-center gap-2 py-2 px-4 bg-blue-50 text-blue-600 rounded-lg text-sm font-semibold hover:bg-blue-100 transition-colors"
            >
              <MapIcon size={16} />
              Tiendas Cercanas
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar">
            {filteredStores.length > 0 ? (
              filteredStores.map(store => (
                <StoreCard 
                  key={store.id} 
                  store={store} 
                  onSelect={handleSelectStore}
                  isSelected={selectedStore?.id === store.id}
                />
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-40 text-gray-400">
                <Search size={32} className="mb-2 opacity-20" />
                <p>No se encontraron tiendas</p>
              </div>
            )}
          </div>
        </aside>

        {/* Map View */}
        <section className="flex-1 relative bg-gray-200">
          <MapView 
            stores={filteredStores} 
            selectedStore={selectedStore} 
            onMarkerClick={handleSelectStore}
            center={mapCenter}
          />
          
          {/* Mobile Search Toggle */}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden absolute top-4 left-4 z-[999] p-3 bg-white rounded-full shadow-lg text-blue-600"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Filter size={24} />}
          </button>
        </section>
      </main>
    </div>
  );
};

export default App;
