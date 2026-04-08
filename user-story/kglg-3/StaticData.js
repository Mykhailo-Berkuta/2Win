const teamStatsTemplate = {
 teamName: "Назва команди", // Напр. "Liverpool"
 league: "Ліга", // Напр. "Premier League"
 matchesPlayed: 0, // Кількість зіграних матчів
 wins: 0, // Перемоги
 losses: 0, // Поразки
 draws: 0, // Нічиї
 goalsScored: 0, // Забиті голи
 goalsConceded: 0, // Пропущені голи
 last5Matches: [], // Форма команди (останні 5 матчів)
 rating: 0 // Підрахований рейтинг у %
};

// Приклад функції, яка описує, що саме потрібно відобразити
function describeRequiredStats() {
 console.log("Необхідно відображати такі дані для кожної команди:");

 Object.keys(teamStatsTemplate).forEach(key => {
 console.log(`- ${key}`);
 });
}

// Запуск опису
describeRequiredStats();