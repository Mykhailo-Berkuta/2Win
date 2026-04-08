import React from 'react';

const betHistory = [
  { id: '1', date: '2024-05-20 14:30', event: 'Реал Мадрид - Боруссія Д', selection: 'П1', odds: 1.65, stake: 500, payout: 825, status: 'win' },
  { id: '2', date: '2024-05-19 21:00', event: 'Манчестер Сіті - Вест Гем', selection: 'ТБ 2.5', odds: 1.40, stake: 1000, payout: 0, status: 'loss' },
  { id: '3', date: '2024-05-21 19:45', event: 'Олімпіакос - Фіорентина', selection: 'X', odds: 3.20, stake: 200, payout: 0, status: 'pending' },
];

const ResponsiveBetHistory = () => {
  const getStatusClasses = (status) => {
    switch (status) {
      case 'win': return 'bg-green-100 text-green-700';
      case 'loss': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'win': return 'Виграш';
      case 'loss': return 'Програш';
      default: return 'Очікується';
    }
  };

  return (
    <div className="p-4 max-w-6xl mx-auto font-sans">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center md:text-left">Історія ставок</h2>

      {/* --- МОБИЛЬНЫЙ ВИД: Карточки --- */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {betHistory.map((bet) => (
          <div key={bet.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs text-gray-400">{bet.date}</span>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${getStatusClasses(bet.status)}`}>
                {getStatusLabel(bet.status)}
              </span>
            </div>
            
            <div className="space-y-1 mb-4">
              <div className="text-base font-bold text-gray-900 leading-tight">{bet.event}</div>
              <div className="text-sm text-blue-600 font-medium">Вибір: {bet.selection} (кф. {bet.odds})</div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-4 border-t border-gray-50">
              <div>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider">Сума</p>
                <p className="font-bold text-gray-800">{bet.stake} ₴</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-gray-400 uppercase tracking-wider">Виплата</p>
                <p className={`font-bold ${bet.status === 'win' ? 'text-green-600' : 'text-gray-800'}`}>
                  {bet.status === 'pending' ? '—' : `${bet.payout} ₴`}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* --- ДЕСКТОПНЫЙ ВИД: Таблица --- */}
      <div className="hidden md:block overflow-hidden bg-white rounded-2xl shadow-sm border border-gray-100">
        <table className="w-full text-left">
          <thead className="bg-gray-50/50">
            <tr>
              <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase">Дата</th>
              <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase">Подія та вибір</th>
              <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase text-center">Коеф.</th>
              <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase text-center">Ставка</th>
              <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase text-center">Виплата</th>
              <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase text-right">Статус</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {betHistory.map((bet) => (
              <tr key={bet.id} className="hover:bg-blue-50/30 transition-all cursor-default">
                <td className="px-6 py-5 text-sm text-gray-400 whitespace-nowrap">{bet.date}</td>
                <td className="px-6 py-5">
                  <div className="text-sm font-bold text-gray-800">{bet.event}</div>
                  <div className="text-xs text-blue-500 font-medium mt-0.5">{bet.selection}</div>
                </td>
                <td className="px-6 py-5 text-center font-mono text-sm font-semibold">{bet.odds.toFixed(2)}</td>
                <td className="px-6 py-5 text-center text-sm font-bold text-gray-700">{bet.stake} ₴</td>
                <td className={`px-6 py-5 text-center text-sm font-black ${bet.status === 'win' ? 'text-green-600' : 'text-gray-400'}`}>
                  {bet.status === 'pending' ? '—' : `${bet.payout} ₴`}
                </td>
                <td className="px-6 py-5 text-right">
                  <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter ${getStatusClasses(bet.status)}`}>
                    {getStatusLabel(bet.status)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ResponsiveBetHistory;