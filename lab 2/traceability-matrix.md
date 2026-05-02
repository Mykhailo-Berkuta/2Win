## Матриця трасовності

| Вимога | Use Case | Класи                                                        | Sequence                        |
|--------|----------|--------------------------------------------------------------|---------------------------------|
| KGLG-01  | UC-01    | Guest, User, AuthService                                         | SD-01 (Реєстрація користувача)                               |
| KGLG-02  | UC-02    | User, Match, PredictionService, PredictionResult, OddsEntry                | SD-02 (Перегляд прогнозу матчу)                              |
| KGLG-03  | UC-03    | Match, Team, MatchStats, StatsService, ApiClient                              | —                               |
| KGLG-04  | UC-04    | User, Recommendation, RecommendationEngine, Match, Team, OddsApiClient          | —                               |
| KGLG-05  | UC-05    | User, Bet, BettingHistoryService, AuthService        | — |
| KGLG-06 | UC-06    | User, NotificationSettings, NotificationService, Match, SportsStatsAPIClient | — |

## Розподіл завдань

* Всеволод Козирь: KGLG-01, KGLG-02
* Альбіна Жакун: KGLG-03, KGLG-04
* Михайло Беркута: KGLG-05, KGLG-06