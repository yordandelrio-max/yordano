
import React from 'react';
import { Store } from '../types';
import { MapPin, Phone, Clock, ShoppingBag } from 'lucide-react';

interface StoreCardProps {
  store: Store;
  onSelect: (store: Store) => void;
  isSelected: boolean;
}

const StoreCard: React.FC<StoreCardProps> = ({ store, onSelect, isSelected }) => {
  return (
    <div 
      onClick={() => onSelect(store)}
      className={`p-4 rounded-xl border transition-all cursor-pointer ${
        isSelected 
          ? 'bg-blue-50 border-blue-500 shadow-md ring-1 ring-blue-500' 
          : 'bg-white border-gray-100 hover:border-blue-300 hover:shadow-sm'
      }`}
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-bold text-gray-900 line-clamp-1">{store.name}</h3>
        <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
          {store.category}
        </span>
      </div>
      
      <div className="space-y-1.5 text-sm text-gray-600">
        <div className="flex items-start gap-2">
          <MapPin size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
          <span className="line-clamp-2">{store.address}</span>
        </div>
        <div className="flex items-center gap-2">
          <Phone size={16} className="text-gray-400 flex-shrink-0" />
          <span>{store.phone}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock size={16} className="text-gray-400 flex-shrink-0" />
          <span>{store.hours}</span>
        </div>
      </div>
      
      <button className="mt-3 w-full py-1.5 px-3 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
        <ShoppingBag size={14} />
        View Shop
      </button>
    </div>
  );
};

export default StoreCard;
