import React from 'react';

const betHistory = [
  { id: '1', date: '2024-05-20 14:30', event: 'Реал Мадрид - Боруссія Д', selection: 'П1', odds: 1.65, stake: 500, payout: 825, status: 'win' },
  { id: '2', date: '2024-05-19 21:00', event: 'Манчестер Сіті - Вест Гем', selection: 'ТБ 2.5', odds: 1.40, stake: 1000, payout: 0, status: 'loss' },
  { id: '3', date: '2024-05-21 19:45', event: 'Олімпіакос - Фіорентина', selection: 'X', odds: 3.20, stake: 200, payout: 0, status: 'pending' },
];

const BetHistoryTable = () => {
  const getStatusStyle = (status) => {
    switch (status) {
      case 'win': return 'bg-green-100 text-green-700 border-green-200';
      case 'loss': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'win': return 'Виграш';
      case 'loss': return 'Програш';
      default: return 'В очікуванні';
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-4">
      <div className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-xl font-bold text-gray-800">Історія ставок</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100 text-gray-600 uppercase text-xs font-semibold">
                <th className="px-6 py-3">Дата</th>
                <th className="px-6 py-3">Подія / Вибір</th>
                <th className="px-6 py-3 text-center">Коеф.</th>
                <th className="px-6 py-3 text-center">Сума (₴)</th>
                <th className="px-6 py-3 text-center">Виплата (₴)</th>
                <th className="px-6 py-3 text-right">Статус</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-sm">
              {betHistory.map((bet) => (
                <tr key={bet.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-gray-500 whitespace-nowrap">{bet.date}</td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{bet.event}</div>
                    <div className="text-gray-500 text-xs">{bet.selection}</div>
                  </td>
                  <td className="px-6 py-4 text-center font-mono">{bet.odds.toFixed(2)}</td>
                  <td className="px-6 py-4 text-center">{bet.stake}</td>
                  <td className={`px-6 py-4 text-center font-bold ${bet.status === 'win' ? 'text-green-600' : 'text-gray-900'}`}>
                    {bet.status === 'pending' ? '-' : bet.payout}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusStyle(bet.status)}`}>
                      {getStatusLabel(bet.status)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BetHistoryTable;