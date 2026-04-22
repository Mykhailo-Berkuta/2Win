/*Зроби функцію, яка буде рахувати кількість матчів у цей час для кожного часу та виводити результат у консоль*/
function countMatchesByTime(matches) {
    const counts = {};
    
    matches.forEach(match => {
        const time = match.time;
        // Якщо час вже є в об'єкті, додаємо 1, якщо немає — створюємо з одиницею
        counts[time] = (counts[time] || 0) + 1;
    });
    
    return counts;
}

/* Твоя функція для виводу в консоль */
function logMatchCountsByTime(matches) {
    const timeCounts = countMatchesByTime(matches);
    
    for (const time in timeCounts) {
        console.log(`Час: ${time}, Кількість матчів: ${timeCounts[time]}`);
    }       
}   

/* Приклад використання */
const matches = [
    { time: '19:00', teams: 'Team A vs Team B' },
    { time: '19:00', teams: 'Team C vs Team D' },
    { time: '20:00', teams: 'Team E vs Team F' },
    { time: '21:00', teams: 'Team G vs Team H' },
    { time: '21:00', teams: 'Team I vs Team J' },
    { time: '21:00', teams: 'Team K vs Team L' },
];

logMatchCountsByTime(matches);