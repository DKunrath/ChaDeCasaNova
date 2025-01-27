import React, { useEffect, useState } from 'react';
import { Gift, ChevronLeft, ChevronRight } from 'lucide-react';
import { Toaster, toast } from 'react-hot-toast';
import { supabase } from './lib/supabase';

interface GiftItem {
  id: string;
  name: string;
  selected: boolean;
  selected_by: string | null;
}

const ITEMS_PER_PAGE = 10;

function App() {
  const [gifts, setGifts] = useState<GiftItem[]>([]);
  const [newGift, setNewGift] = useState('');
  const [selectedGift, setSelectedGift] = useState<GiftItem | null>(null);
  const [name, setName] = useState('');
  const [availablePage, setAvailablePage] = useState(1);
  const [selectedPage, setSelectedPage] = useState(1);

  useEffect(() => {
    fetchGifts();
  }, []);

  async function fetchGifts() {
    const { data, error } = await supabase
      .from('gifts')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      toast.error('Erro ao carregar presentes');
      return;
    }

    setGifts(data || []);
  }

  async function addGift(e: React.FormEvent) {
    e.preventDefault();
    if (!newGift.trim()) return;

    const { error } = await supabase
      .from('gifts')
      .insert([{ name: newGift }]);

    if (error) {
      toast.error('Erro ao adicionar presente');
      return;
    }

    toast.success('Presente adicionado!');
    setNewGift('');
    fetchGifts();
  }

  async function selectGift(gift: GiftItem) {
    if (!name.trim()) {
      toast.error('Por favor, insira seu nome');
      return;
    }

    const { error } = await supabase
      .from('gifts')
      .update({ selected: true, selected_by: name })
      .eq('id', gift.id);

    if (error) {
      toast.error('Erro ao selecionar presente');
      return;
    }

    toast.success('Presente selecionado com sucesso!');
    setSelectedGift(null);
    setName('');
    fetchGifts();
  }

  const availableGifts = gifts.filter(gift => !gift.selected);
  const selectedGifts = gifts.filter(gift => gift.selected);

  const paginatedAvailableGifts = availableGifts.slice(
    (availablePage - 1) * ITEMS_PER_PAGE,
    availablePage * ITEMS_PER_PAGE
  );

  const paginatedSelectedGifts = selectedGifts.slice(
    (selectedPage - 1) * ITEMS_PER_PAGE,
    selectedPage * ITEMS_PER_PAGE
  );

  const totalAvailablePages = Math.ceil(availableGifts.length / ITEMS_PER_PAGE);
  const totalSelectedPages = Math.ceil(selectedGifts.length / ITEMS_PER_PAGE);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 py-12 px-4">
      <Toaster position="top-right" />
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <Gift className="w-16 h-16 mx-auto text-purple-600 mb-4" />
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Lista de Presentes</h1>
          <p className="text-gray-600">Chá de Casa Nova</p>
        </div>

        <form onSubmit={addGift} className="mb-12">
          <div className="flex gap-2">
            <input
              type="text"
              value={newGift}
              onChange={(e) => setNewGift(e.target.value)}
              placeholder="Adicionar novo presente..."
              className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button
              type="submit"
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Adicionar
            </button>
          </div>
        </form>

        <div className="space-y-8">
          <div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Presentes Disponíveis</h2>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="space-y-4 mb-4">
                {paginatedAvailableGifts.map(gift => (
                  <div
                    key={gift.id}
                    className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50"
                  >
                    <span className="text-gray-700">{gift.name}</span>
                    <button
                      onClick={() => setSelectedGift(gift)}
                      className="px-4 py-2 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                    >
                      Quero dar este presente
                    </button>
                  </div>
                ))}
                {paginatedAvailableGifts.length === 0 && (
                  <p className="text-gray-500 text-center py-4">Nenhum presente disponível</p>
                )}
              </div>
              {totalAvailablePages > 1 && (
                <div className="flex items-center justify-center gap-4 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => setAvailablePage(p => Math.max(1, p - 1))}
                    disabled={availablePage === 1}
                    className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <span className="text-sm text-gray-600">
                    Página {availablePage} de {totalAvailablePages}
                  </span>
                  <button
                    onClick={() => setAvailablePage(p => Math.min(totalAvailablePages, p + 1))}
                    disabled={availablePage === totalAvailablePages}
                    className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Presentes Selecionados</h2>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="space-y-4 mb-4">
                {paginatedSelectedGifts.map(gift => (
                  <div
                    key={gift.id}
                    className="flex items-center justify-between p-4 border border-gray-100 rounded-lg bg-gray-50"
                  >
                    <span className="text-gray-700">{gift.name}</span>
                    <span className="text-sm text-gray-500">Selecionado por: {gift.selected_by}</span>
                  </div>
                ))}
                {paginatedSelectedGifts.length === 0 && (
                  <p className="text-gray-500 text-center py-4">Nenhum presente selecionado ainda</p>
                )}
              </div>
              {totalSelectedPages > 1 && (
                <div className="flex items-center justify-center gap-4 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => setSelectedPage(p => Math.max(1, p - 1))}
                    disabled={selectedPage === 1}
                    className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <span className="text-sm text-gray-600">
                    Página {selectedPage} de {totalSelectedPages}
                  </span>
                  <button
                    onClick={() => setSelectedPage(p => Math.min(totalSelectedPages, p + 1))}
                    disabled={selectedPage === totalSelectedPages}
                    className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {selectedGift && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-semibold mb-4">Confirmar Presente</h3>
            <p className="text-gray-600 mb-4">
              Você está selecionando: <strong>{selectedGift.name}</strong>
            </p>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Seu nome"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 mb-4 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setSelectedGift(null)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancelar
              </button>
              <button
                onClick={() => selectGift(selectedGift)}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;