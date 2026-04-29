## Матриця трасовності

| Вимога | Use Case | Класи                                                        | Sequence                        |
|--------|----------|--------------------------------------------------------------|---------------------------------|
| KGLG-01  | UC-01 (Реєстрація), UC-02 (Підтвердження повноліття), UC-03 (Автентифікація)    | Guest, User, AuthService                                        | —                               |
| KGLG-02  | UC-04 (Перегляд сторінки матчу), UC-05 (Прогноз результату), UC-06 (Коефіцієнти)    | User, Match, PredictionService, PredictionResult, OddsEntry                | SD-01 (Перегляд прогнозу матчу)                               |
| KGLG-03  | UC-07    | Match, Team, MatchStats, StatsService, ApiClient                              | —                               |
| KGLG-04  | UC-08    | User, Recommendation, RecommendationEngine, Match, Team, OddsApiClient          | —                               |
| KGLG-05  | UC-09    | User, Bet, BettingHistoryService, AuthService        | —  |
| KGLG-06 | UC-10    | User, NotificationSettings, NotificationService, Match, SportsStatsAPIClient | —  |

## Розподіл завдань

* **Всеволод Козирь:** KGLG-01, KGLG-02
* **Альбіна Жакун:** KGLG-03, KGLG-04
* **Михайло Беркута:** KGLG-05, KGLG-06

