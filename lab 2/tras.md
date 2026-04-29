## Матриця трасовності

| Вимога | Use Case | Класи                                                        | Sequence                        |
|--------|----------|--------------------------------------------------------------|---------------------------------|
| KGLG-01  | UC-01    | `User`, `AuthService`                                        | —                               |
| KGLG-02  | UC-02    | `Match`, `PredictionService`, `OddsAPIClient`                | —                               |
| KGLG-03  | UC-03    | `Team`, `StatsService`, `Match`                              | —                               |
| KGLG-04  | UC-04    | `User`, `UserPreferences`, `RecommendationService`           | —                               |
| KGLG-05  | UC-05    | `User`, `Bet`, `BettingHistoryService`, `AuthService`        | SD-01 (Перегляд історії ставок) |
| KGLG-06  | UC-06    | `User`, `NotificationSettings`, `NotificationService`,       | SD-02 (Сповіщення про матч)     |
|        |          | `Match`, `SportsStatsAPIClient`                              |                                 |

## Розподіл завдань

* **Всеволод Козирь:** FR-01, FR-02
* **Альбіна Жакун:** FR-03, FR-04
* **Михайло Беркута:** FR-05, FR-06

