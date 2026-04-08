function calculateTeamRating(team) {
 const totalMatches = team.wins + team.losses + team.draws;

 // Якщо команда не зіграла жодного матчу – рейтинг 0
 if (totalMatches === 0) return 0;

 // Основний рейтинг: відсоток перемог
 let winRate = (team.wins / totalMatches) * 100;

 // Додаткові коефіцієнти (опціонально)
 let goalFactor = (team.goalsScored - team.goalsConceded) * 0.2; 
 let formFactor = team.last5MatchesScore * 0.5; 
 // last5MatchesScore — наприклад: W=3, D=1, L=0

 // Підсумковий рейтинг
 let rating = winRate + goalFactor + formFactor;

 // Обмеження в межах 0–100
 return Math.max(0, Math.min(100, rating));
}

// Формування рейтингу для всіх команд
function generateRatings(teams) {
 return teams.map(team => ({
 name: team.name,
 rating: calculateTeamRating(team)
 }));
}

// Сортування команд за рейтингом (від найкращих)
function sortTeamsByRating(ratedTeams) {
 return ratedTeams.sort((a, b) => b.rating - a.rating);
}